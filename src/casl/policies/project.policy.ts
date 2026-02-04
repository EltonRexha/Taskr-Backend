// src/casl/policies/project.policy.ts
import {
  AbilityBuilderType,
  AbilityContext,
  Action,
} from '../types/casl.types';
import { BasePolicy } from './base.policy';

export class ProjectPolicy extends BasePolicy {
  define(builder: AbilityBuilderType, context: AbilityContext): void {
    const { can } = builder;

    // Global admins can do everything
    if (this.isGlobalAdmin(context)) {
      this.grantFullAccess(builder, 'PROJECT');
      return;
    }

    // All authenticated users can list and view public projects
    this.grantReadOnly(builder, 'PROJECT');

    // All authenticated users can create projects
    can(Action.CREATE, 'PROJECT');

    // Project-specific permissions
    if (this.hasProjectAccess(context)) {
      const projectMember = context.projectMember!;

      // Project admins
      if (this.isProjectAdmin(context)) {
        can(Action.UPDATE, 'PROJECT', { id: projectMember.projectId });
        can(Action.DELETE, 'PROJECT', { id: projectMember.projectId });
        can(Action.ARCHIVE, 'PROJECT', { id: projectMember.projectId });
        can(Action.RESTORE, 'PROJECT', { id: projectMember.projectId });
        can(Action.EXPORT, 'PROJECT', { id: projectMember.projectId });

        // Member management
        can(Action.INVITE, 'PROJECT', { id: projectMember.projectId });
        can(Action.REMOVE_MEMBER, 'PROJECT_MEMBER', {
          projectId: projectMember.projectId,
        });
        can(Action.UPDATE_MEMBER_ROLE, 'PROJECT_MEMBER', {
          projectId: projectMember.projectId,
        });
      }

      // Regular members can view and export
      if (this.isProjectMember(context)) {
        can(Action.VIEW, 'PROJECT', { id: projectMember.projectId });
        can(Action.EXPORT, 'PROJECT', { id: projectMember.projectId });
      }
    }
  }
}
