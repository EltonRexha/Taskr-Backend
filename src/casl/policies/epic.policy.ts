import { BasePolicy } from './base.policy';
import {
  AbilityBuilderType,
  AbilityContext,
  Action,
} from '../types/casl.types';

export class EpicPolicy extends BasePolicy {
  define(builder: AbilityBuilderType, context: AbilityContext): void {
    const { can } = builder;

    if (this.isGlobalAdmin(context)) {
      this.grantFullAccess(builder, 'EPIC');
      return;
    }

    if (!this.hasProjectAccess(context)) {
      return;
    }

    const projectMember = context.projectMember!;

    // Both admins and members can view epics
    can(Action.VIEW, 'EPIC', { projectId: projectMember.projectId });
    can(Action.LIST, 'EPIC', { projectId: projectMember.projectId });
    can(Action.READ, 'EPIC', { projectId: projectMember.projectId });

    if (this.isProjectAdmin(context)) {
      // Admins can manage epics
      can(Action.MANAGE, 'EPIC', { projectId: projectMember.projectId });
      can(Action.ARCHIVE, 'EPIC', { projectId: projectMember.projectId });
      can(Action.RESTORE, 'EPIC', { projectId: projectMember.projectId });
    }

    if (this.isProjectMember(context)) {
      // Members can create and update epics
      can(Action.CREATE, 'EPIC', { projectId: projectMember.projectId });
      can(Action.UPDATE, 'EPIC', {
        projectId: projectMember.projectId,
        creatorId: context.user.clerkId,
      });
      can(Action.ASSIGN, 'EPIC', { projectId: projectMember.projectId });
    }
  }
}
