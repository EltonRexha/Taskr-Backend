// src/casl/policies/base.policy.ts
import {
  AbilityBuilderType,
  Policy,
  AbilityContext,
  Action,
  SubjectsFields,
} from '../types/casl.types';

/**
 * Base policy with common permission patterns
 * Other policies can extend this for shared functionality
 */
export abstract class BasePolicy implements Policy {
  abstract define(builder: AbilityBuilderType, context: AbilityContext): void;

  /**
   * Grant read-only access to a subject
   */
  protected grantReadOnly(
    builder: AbilityBuilderType,
    subject: SubjectsFields,
  ) {
    const subjects = Array.isArray(subject) ? subject : [subject];
    subjects.forEach((s) => {
      builder.can(Action.LIST, s);
      builder.can(Action.VIEW, s);
      builder.can(Action.READ, s);
    });
  }

  /**
   * Grant full CRUD access to a subject
   */
  protected grantFullAccess(
    builder: AbilityBuilderType,
    subject: SubjectsFields,
  ) {
    const subjects = Array.isArray(subject) ? subject : [subject];
    subjects.forEach((s) => {
      builder.can(Action.MANAGE, s);
    });
  }

  /**
   * Grant create access
   */
  protected grantCreate(builder: AbilityBuilderType, subject: SubjectsFields) {
    const subjects = Array.isArray(subject) ? subject : [subject];
    subjects.forEach((s) => {
      builder.can(Action.CREATE, s);
    });
  }

  /**
   * Check if user is global admin
   */
  protected isGlobalAdmin(context: AbilityContext): boolean {
    return context.user.role === 'ADMIN';
  }

  /**
   * Check if user is project admin
   */
  protected isProjectAdmin(context: AbilityContext): boolean {
    return context.projectMember?.role === 'ADMIN';
  }

  /**
   * Check if user is project member
   */
  protected isProjectMember(context: AbilityContext): boolean {
    return context.projectMember?.role === 'MEMBER';
  }

  /**
   * Check if user has any project role
   */
  protected hasProjectAccess(context: AbilityContext): boolean {
    return !!context.projectMember;
  }
}
