// src/casl/guards/abilities.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  UnauthorizedException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CaslAbilityFactory } from '../factories/casl-ability.factory';
import {
  AbilityCheck,
  CHECK_ABILITY,
} from '../decorators/check-abilities.decorator';
import { DatabaseService } from 'src/database/database.service';
import { ProjectMember, User } from 'prisma/generated/prisma/client';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from 'src/auth/decorators/public.decorator';
import { subject } from '@casl/ability';
import { SubjectsFields } from '../types/casl.types';

/**
 * Guard to check CASL abilities before allowing access to routes
 *
 * Features:
 * - Validates user authentication
 * - Fetches project membership context
 * - Creates user-specific ability
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
   */
  private getSubjectType(subject: SubjectsFields): string {
    // CASL adds __caslSubjectType__ property to Model types
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
    return (subject as any).__caslSubjectType__;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const publicCheck = this.reflector.get<boolean>(
      IS_PUBLIC_KEY,
      context.getHandler(),
    );

    console.log({ publicCheck });

    if (publicCheck) {
      return true;
    }

    const abilityCheck = this.reflector.get<AbilityCheck>(
      CHECK_ABILITY,
      context.getHandler(),
    );

    const subjectName = this.getSubjectType(abilityCheck.subject);

    if (!abilityCheck) {
      throw new Error(
        'Ability check not found in route handler, if you intended to not use abilities then mark it with @Public to ignore checks',
      );
    }

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

    try {
      const projectId = abilityCheck.getProjectId
        ? await Promise.resolve(abilityCheck.getProjectId(request))
        : undefined;

      let projectMember: ProjectMember | null = null;

      if (projectId) {
        projectMember = await this.getProjectMember(user.clerkId, projectId);
      }

      const ability = this.caslAbilityFactory.createForUser(
        user,
        projectMember,
        projectId,
      );

      request.ability = ability;

      let canPerform: boolean;

      if (abilityCheck.getSubject) {
        try {
          const fetchedSubject = await Promise.resolve(
            abilityCheck.getSubject(request),
          );

          if (!fetchedSubject) {
            throw new ForbiddenException('Resource not found');
          }

          canPerform = ability.can(
            abilityCheck.action,
            subject(subjectName, fetchedSubject) as SubjectsFields,
          );
        } catch (error) {
          this.logger.error('Error fetching subject for ability check:', error);
          throw new InternalServerErrorException(
            'Error validating permissions',
          );
        }
      } else {
        canPerform = ability.can(abilityCheck.action, abilityCheck.subject);
      }

      if (!canPerform) {
        const errorMessage = this.buildErrorMessage(
          abilityCheck,
          user,
          projectId,
          projectMember,
        );

        this.logger.warn(
          `Permission denied: User ${user.clerkId} ` +
            `(role: ${user.role}, project role: ${projectMember?.role ?? 'none'}) ` +
            `attempted to ${abilityCheck.action} ${subjectName} ` +
            `in project ${projectId ?? 'none'}`,
        );

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
   * Fetch project member with caching consideration
   */
  private async getProjectMember(
    userClerkId: string,
    projectId: string,
  ): Promise<ProjectMember | null> {
    try {
      return await this.prisma.projectMember.findUnique({
        where: {
          userClerkId_projectId: {
            projectId,
            userClerkId,
          },
        },
      });
    } catch (error) {
      this.logger.error(
        `Error fetching project member for user ${userClerkId} in project ${projectId}:`,
        error,
      );
      return null;
    }
  }

  /**
   * Build a user-friendly error message
   */
  private buildErrorMessage(
    abilityCheck: AbilityCheck,
    user: User,
    projectId?: string,
    projectMember?: ProjectMember | null,
  ): string {
    const action = abilityCheck.action;
    const subject = this.getSubjectType(abilityCheck.subject);

    // Base message
    let message = `You do not have permission to ${action} ${subject}`;

    if (projectId && !projectMember) {
      message += `. You are not a member of this project`;
    } else if (projectId && projectMember) {
      message += ` in this project. Your role (${projectMember.role}) does not permit this action`;
    } else if (user.role !== 'ADMIN') {
      message += `. This action may require higher privileges`;
    }

    return message;
  }
}
