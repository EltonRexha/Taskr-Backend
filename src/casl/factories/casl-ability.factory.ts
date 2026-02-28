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
import { ProjectPolicy, TaskPolicy, SprintPolicy } from '../policies/index';
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
    this.policies = [new ProjectPolicy(), new TaskPolicy(), new SprintPolicy()];
  }

  /**
   * Create ability instance for a user
   * @param user - The authenticated user
   */
  createForUser(user: User, projectMembers?: ProjectMember[]): AppAbility {
    const builder = new AbilityBuilder<AppAbility>(createPrismaAbility);

    const context: AbilityContext = {
      user,
      projectMembers,
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

    const ability = builder.build();

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
    projectMembers?: ProjectMember[],
  ): boolean {
    const ability = this.createForUser(user, projectMembers);
    return ability.can(action, subject);
  }
}
