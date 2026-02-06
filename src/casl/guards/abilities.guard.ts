// src/casl/guards/abilities.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  UnauthorizedException,
  Logger,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CaslAbilityFactory } from '../factories/casl-ability.factory';
import {
  AbilityCheck,
  CHECK_ABILITY,
} from '../decorators/check-abilities.decorator';
import { DatabaseService } from 'src/database/database.service';
import { Project, ProjectMember, User } from 'prisma/generated/prisma/client';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from 'src/auth/decorators/public.decorator';
import { subject } from '@casl/ability';
import { SubjectsFields, PrismaSubjects, Action } from '../types/casl.types';

/**
 * Guard to check CASL abilities before allowing access to routes
 *
 * Features:
 * - Validates user authentication
 * - Fetches project membership context
 * - Creates user-specific ability
 * - Fetches subjects for instance-level checks
 * - Performs permission checks (including field-level)
 * - Attaches ability to request for use in handlers
 * - Comprehensive error handling and logging
 */
@Injectable()
export class AbilitiesGuard implements CanActivate {
  private readonly logger = new Logger(AbilitiesGuard.name);

  constructor(
    private reflector: Reflector,
    private prisma: DatabaseService,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}

  /**
   * Extract subject type string from SubjectsFields
   * @throws InternalServerErrorException if subject type is invalid
   */
  private getSubjectType(subjectOrInstance: SubjectsFields): string {
    // If it's already a string, return it
    if (typeof subjectOrInstance === 'string') {
      return subjectOrInstance;
    }

    // CASL adds __caslSubjectType__ property to subject instances
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const subjectType = (subjectOrInstance as any).__caslSubjectType__;

    if (!subjectType || typeof subjectType !== 'string') {
      this.logger.error('Invalid subject type - missing __caslSubjectType__', {
        subject: subjectOrInstance,
      });
      throw new InternalServerErrorException(
        'Invalid permission configuration',
      );
    }

    return subjectType;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is marked as public
    const publicCheck = this.reflector.get<boolean>(
      IS_PUBLIC_KEY,
      context.getHandler(),
    );

    if (publicCheck) {
      return true;
    }

    // Get ability check configuration from decorator
    const abilityCheck = this.reflector.get<AbilityCheck>(
      CHECK_ABILITY,
      context.getHandler(),
    );

    if (!abilityCheck) {
      throw new Error(
        'Ability check not found in route handler. If you intended to not use abilities then mark it with @Public() to ignore checks',
      );
    }

    const subjectName = this.getSubjectType(abilityCheck.subject);

    const request = context.switchToHttp().getRequest<Request>();
    const user: User | undefined = request.user;

    if (!user) {
      this.logger.warn(
        `Unauthenticated access attempt to ${context.getHandler().name}`,
      );
      throw new UnauthorizedException(
        'You must be authenticated to access this resource',
      );
    }

    let projectMembers: ProjectMember[] = [];

    // Fetch the subject from database
    let fetchedSubject: {
      subject: PrismaSubjects;
      project: Project | null;
    } | null = null;

    if (abilityCheck.getResourceId) {
      const resourceId = abilityCheck.getResourceId(request);
      if (resourceId) {
        fetchedSubject = await this.fetchSubject(subjectName, resourceId);
      }
    }

    if (!fetchedSubject) {
      throw new ForbiddenException('Resource not found');
    }

    // Fetch user's project memberships
    if (
      abilityCheck.action === Action.LIST ||
      !fetchedSubject ||
      !fetchedSubject.project?.id
    ) {
      projectMembers = await this.getProjectMembersByUser(user.clerkId);
    } else {
      const projectMember = await this.getProjectMember(
        user.clerkId,
        fetchedSubject.project.id,
      );
      if (projectMember) {
        projectMembers = [projectMember];
      }
    }

    try {
      // Create ability for this user
      const ability = this.caslAbilityFactory.createForUser(
        user,
        projectMembers,
      );

      // Attach ability to request for use in handlers
      request.ability = ability;

      let canPerform: boolean;

      // If getResourceId is specified, fetch the subject instance
      if (abilityCheck.getResourceId) {
        try {
          // Extract resource ID using the provided callback
          const resourceId = abilityCheck.getResourceId(request);

          if (!resourceId) {
            throw new BadRequestException('Resource ID not found in request');
          }

          // Check permission on the specific resource instance
          canPerform = ability.can(
            abilityCheck.action,
            subject(subjectName, fetchedSubject.subject) as SubjectsFields,
          );
        } catch (error) {
          // Re-throw ForbiddenException and BadRequestException as-is
          if (
            error instanceof ForbiddenException ||
            error instanceof BadRequestException
          ) {
            throw error;
          }

          this.logger.error('Error fetching subject for ability check:', error);
          throw new InternalServerErrorException(
            'Error validating permissions',
          );
        }
      } else {
        // Class-level check (no specific resource instance)
        canPerform = ability.can(abilityCheck.action, abilityCheck.subject);
      }

      if (!canPerform) {
        const errorMessage = this.buildErrorMessage(abilityCheck, subjectName);

        this.logger.warn('Authorization denied', {
          userId: user.clerkId,
          action: abilityCheck.action,
          subject: subjectName,
          route: context.getHandler().name,
        });

        throw new ForbiddenException(errorMessage);
      }

      // Log successful authorization in development
      if (process.env.NODE_ENV === 'development') {
        this.logger.debug(
          `Permission granted: ${user.clerkId} can ${abilityCheck.action} ${subjectName}`,
        );
      }

      return true;
    } catch (error) {
      // Re-throw known exceptions
      if (
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      // Log unexpected errors
      this.logger.error('Unexpected error in AbilitiesGuard:', error);
      throw new InternalServerErrorException(
        'An error occurred while checking permissions',
      );
    }
  }

  /**
   * Fetch subject from database based on type
   * Only fetches fields needed for permission checks
   * @throws Error if database query fails
   */
  private async fetchSubject(
    subjectType: string,
    id: string,
  ): Promise<{ subject: PrismaSubjects; project: Project | null } | null> {
    try {
      let subject: PrismaSubjects | null = null;
      let project: Project | null = null;

      switch (subjectType) {
        case 'TASK': {
          const task = await this.prisma.task.findUnique({
            where: { id },
            include: {
              author: true,
              project: true,
            },
          });
          subject = task;
          // Accessing project via the synced include
          project = task?.project || null;
          break;
        }

        case 'PROJECT': {
          subject = await this.prisma.project.findUnique({
            where: { id },
          });
          project = subject as Project;
          break;
        }

        case 'SPRINT': {
          const sprint = await this.prisma.sprint.findUnique({
            where: { id },
            include: {
              scrumProject: {
                include: {
                  projects: true,
                },
              },
            },
          });
          subject = sprint;
          project = sprint?.scrumProject?.projects || null;
          break;
        }

        case 'PROJECT_MEMBER': {
          const projectMember = await this.prisma.projectMember.findUnique({
            where: { id },
            include: {
              project: true,
            },
          });

          subject = projectMember;
          project = projectMember?.project || null;
          break;
        }

        default:
          this.logger.error(`Unknown subject type: ${subjectType}`);
          throw new InternalServerErrorException(
            'Invalid permission configuration',
          );
      }

      if (!subject) return null;

      return { subject, project };
    } catch (error) {
      this.logger.error(`Error fetching ${subjectType} with id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Fetch project members for a user
   * @throws InternalServerErrorException if database query fails
   */
  private async getProjectMembersByUser(
    userClerkId: string,
  ): Promise<ProjectMember[]> {
    try {
      return await this.prisma.projectMember.findMany({
        where: {
          userClerkId: userClerkId,
        },
      });
    } catch (error) {
      this.logger.error(
        `Error fetching project members for user ${userClerkId}:`,
        error,
      );
      throw new InternalServerErrorException('Unable to verify permissions');
    }
  }

  private async getProjectMember(
    userClerkId: string,
    projectId: string,
  ): Promise<ProjectMember | null> {
    try {
      return await this.prisma.projectMember.findUnique({
        where: {
          userClerkId_projectId: {
            userClerkId,
            projectId,
          },
        },
      });
    } catch (error) {
      this.logger.error(
        `Error fetching project members for user ${userClerkId}:`,
        error,
      );
      throw new InternalServerErrorException('Unable to verify permissions');
    }
  }

  /**
   * Build a user-friendly error message based on context
   * Provides helpful feedback about why permission was denied
   */
  private buildErrorMessage(
    abilityCheck: AbilityCheck,
    subjectName: string,
  ): string {
    const action = abilityCheck.action;

    // Map technical actions to user-friendly verbs
    const actionMap: Record<string, string> = {
      create: 'create',
      read: 'view',
      update: 'modify',
      delete: 'delete',
      manage: 'manage',
      list: 'list',
      view: 'view',
      archive: 'archive',
      restore: 'restore',
      invite: 'invite members to',
      remove_member: 'remove members from',
      update_member_role: 'update member roles in',
      assign: 'assign',
      approve: 'approve',
      comment: 'comment on',
      export: 'export',
      import: 'import',
    };

    const friendlyAction = actionMap[action] || action;
    const friendlySubject = subjectName.toLowerCase().replace('_', ' ');

    return `You do not have permission to ${friendlyAction} this ${friendlySubject}`;
  }
}
