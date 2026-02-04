// src/casl/factories/casl-ability.factory.ts
import { Injectable, Logger } from '@nestjs/common';
import { AbilityBuilder } from '@casl/ability';
import {
  AppAbility,
  AbilityContext,
  Policy,
  Action,
  SubjectsFields,
} from '../types/casl.types';
import {
  ProjectPolicy,
  TaskPolicy,
  SprintPolicy,
  EpicPolicy,
} from '../policies/index';
import { ProjectMember, User } from 'prisma/generated/prisma/client';
import { createPrismaAbility } from '@casl/prisma';

/**
 * Factory for creating user-specific CASL abilities
 * Uses policy-based approach for maintainability
 */
@Injectable()
export class CaslAbilityFactory {
  private readonly logger = new Logger(CaslAbilityFactory.name);
  private readonly policies: Policy[];

  constructor() {
    // Register all policies
    this.policies = [
      new ProjectPolicy(),
      new TaskPolicy(),
      new SprintPolicy(),
      new EpicPolicy(),
    ];
  }

  /**
   * Create ability instance for a user
   * @param user - The authenticated user
   * @param projectMember - Optional project membership context
   * @param projectId - Optional project ID for context
   */
  createForUser(
    user: User,
    projectMember?: ProjectMember | null,
    projectId?: string,
  ): AppAbility {
    const builder = new AbilityBuilder<AppAbility>(createPrismaAbility);

    const context: AbilityContext = {
      user,
      projectMember: projectMember ?? null,
      projectId,
    };

    // Apply all policies
    for (const policy of this.policies) {
      try {
        policy.define(builder, context);
      } catch (error) {
        this.logger.error(
          `Error applying policy ${policy.constructor.name}:`,
          error,
        );
      }
    }

    console.log('building');
    const ability = builder.build();

    // Log ability creation in development
    if (process.env.NODE_ENV === 'development') {
      this.logger.debug(
        `Created ability for user ${user.clerkId} ` +
          `(global role: ${user.role}, ` +
          `project role: ${projectMember?.role ?? 'none'}, ` +
          `project: ${projectId ?? 'none'})`,
      );
    }

    return ability;
  }

  /**
   * Check if user can perform action on subject without creating full ability
   * Useful for quick permission checks
   */
  canUserPerform(
    user: User,
    action: Action,
    subject: SubjectsFields,
    projectMember?: ProjectMember | null,
  ): boolean {
    const ability = this.createForUser(user, projectMember);
    return ability.can(action, subject);
  }
}
