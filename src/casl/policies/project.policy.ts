import {
  AbilityBuilderType,
  AbilityContext,
  Action,
  TypedAbilityBuilder,
} from '../types/casl.types';
import { BasePolicy } from './base.policy';

export class ProjectPolicy extends BasePolicy {
  define(builder: AbilityBuilderType, context: AbilityContext): void {
    const { can } = builder as unknown as TypedAbilityBuilder;

    // Global admins can do everything
    if (this.isGlobalAdmin(context)) {
      this.grantFullAccess(builder, 'PROJECT');
      return;
    }

    // All authenticated users can list and view public projects
    this.grantReadOnly(builder, 'PROJECT');

    // All authenticated users can create projects
    can(Action.CREATE, 'PROJECT');

    const { projectMembers } = context;
    if (!projectMembers || projectMembers.length === 0) {
      return;
    }

    // Get project IDs by role using helper functions
    const adminProjectIds = this.getAdminProjectIds(context);
    const memberProjectIds = this.getMemberProjectIds(context);

    // Grant admin permissions
    if (this.hasAdminProjects(context)) {
      can(Action.UPDATE, 'PROJECT', { id: { in: adminProjectIds } });
      can(Action.DELETE, 'PROJECT', { id: { in: adminProjectIds } });
      can(Action.ARCHIVE, 'PROJECT', { id: { in: adminProjectIds } });
      can(Action.RESTORE, 'PROJECT', { id: { in: adminProjectIds } });
      can(Action.EXPORT, 'PROJECT', { id: { in: adminProjectIds } });

      can(Action.INVITE, 'PROJECT', { id: { in: adminProjectIds } });
      can(Action.REMOVE_MEMBER, 'PROJECT_MEMBER', {
        projectId: { in: adminProjectIds },
      });
      can(Action.UPDATE_MEMBER_ROLE, 'PROJECT_MEMBER', {
        projectId: { in: adminProjectIds },
      });
    }

    // Grant member permissions
    if (this.hasMemberProjects(context)) {
      can(Action.VIEW, 'PROJECT', { id: { in: memberProjectIds } });
      can(Action.EXPORT, 'PROJECT', { id: { in: memberProjectIds } });
    }
  }
}
