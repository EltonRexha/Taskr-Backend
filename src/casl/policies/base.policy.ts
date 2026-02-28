// src/casl/policies/base.policy.ts
import {
  AbilityBuilderType,
  Policy,
  AbilityContext,
  Action,
  SubjectsFields,
} from '../types/casl.types';
import { ProjectMember } from 'prisma/generated/prisma/client';

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
  protected isProjectAdmin(projectMember: ProjectMember): boolean {
    return projectMember.role === 'ADMIN';
  }

  /**
   * Check if user is project viewer
   */
  protected isProjectViewer(projectMember: ProjectMember): boolean {
    return projectMember.role === 'VIEWER';
  }

  /**
   * Check if user is project member
   */
  protected isProjectMember(projectMember: ProjectMember): boolean {
    return projectMember.role === 'MEMBER';
  }

  /**
   * Check if user has any project role
   */
  protected hasProjectMembers(context: AbilityContext): boolean {
    return !!context.projectMembers;
  }

  /**
   * Get project IDs where user has admin role
   */
  protected getAdminProjectIds(context: AbilityContext): string[] {
    if (!context.projectMembers) return [];
    return context.projectMembers
      .filter((pm) => this.isProjectAdmin(pm))
      .map((pm) => pm.projectId);
  }

  /**
   * Get project IDs where user has member role
   */
  protected getMemberProjectIds(context: AbilityContext): string[] {
    if (!context.projectMembers) return [];
    return context.projectMembers
      .filter((pm) => this.isProjectMember(pm))
      .map((pm) => pm.projectId);
  }

  /**
   * Get project IDs where user has viewer role
   */
  protected getViewerProjectIds(context: AbilityContext): string[] {
    if (!context.projectMembers) return [];
    return context.projectMembers
      .filter((pm) => this.isProjectViewer(pm))
      .map((pm) => pm.projectId);
  }

  /**
   * Check if user has admin projects
   */
  protected hasAdminProjects(context: AbilityContext): boolean {
    return this.getAdminProjectIds(context).length > 0;
  }

  /**
   * Check if user has member projects
   */
  protected hasMemberProjects(context: AbilityContext): boolean {
    return this.getMemberProjectIds(context).length > 0;
  }

  /**
   * Check if user has viewer projects
   */
  protected hasViewerProjects(context: AbilityContext): boolean {
    return this.getViewerProjectIds(context).length > 0;
  }

  /**
   * Get all project IDs where user has any role (admin, member, or viewer)
   */
  protected getAllAccessibleProjectIds(context: AbilityContext): string[] {
    const adminProjectIds = this.getAdminProjectIds(context);
    const memberProjectIds = this.getMemberProjectIds(context);
    const viewerProjectIds = this.getViewerProjectIds(context);

    return [...adminProjectIds, ...memberProjectIds, ...viewerProjectIds];
  }
}
