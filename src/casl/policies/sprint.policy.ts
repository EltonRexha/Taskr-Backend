import { BasePolicy } from './base.policy';
import {
  AbilityBuilderType,
  AbilityContext,
  Action,
} from '../types/casl.types';

export class SprintPolicy extends BasePolicy {
  define(builder: AbilityBuilderType, context: AbilityContext): void {
    const { can } = builder;

    if (this.isGlobalAdmin(context)) {
      this.grantFullAccess(builder, 'SPRINT');
      return;
    }

    if (!this.hasProjectAccess(context)) {
      return;
    }

    const projectMember = context.projectMember!;

    // Both admins and members can view sprints
    can(Action.VIEW, 'SPRINT', { projectId: projectMember.projectId });
    can(Action.LIST, 'SPRINT', { projectId: projectMember.projectId });
    can(Action.READ, 'SPRINT', { projectId: projectMember.projectId });

    if (this.isProjectAdmin(context)) {
      // Admins can manage sprints
      can(Action.CREATE, 'SPRINT', {
        projectId: projectMember.projectId,
      });
      can(Action.UPDATE, 'SPRINT', {
        projectId: projectMember.projectId,
      });
      can(Action.DELETE, 'SPRINT', {
        projectId: projectMember.projectId,
      });
      can(Action.ARCHIVE, 'SPRINT', {
        projectId: projectMember.projectId,
      });
      can(Action.RESTORE, 'SPRINT', {
        projectId: projectMember.projectId,
      });
    }

    if (this.isProjectMember(context)) {
      // Members can create sprints but not delete/archive
      can(Action.CREATE, 'SPRINT', {
        projectId: projectMember.projectId,
      });
      can(Action.UPDATE, 'SPRINT', {
        projectId: projectMember.projectId,
        creatorId: context.user.clerkId,
      });
    }
  }
}
