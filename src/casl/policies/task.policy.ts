// src/casl/policies/task.policy.ts
import { BasePolicy } from './base.policy';
import {
  AbilityBuilderType,
  AbilityContext,
  Action,
} from '../types/casl.types';

export class TaskPolicy extends BasePolicy {
  define(builder: AbilityBuilderType, context: AbilityContext): void {
    const { can, cannot } = builder;

    // Global admins can do everything
    if (this.isGlobalAdmin(context)) {
      this.grantFullAccess(builder, 'TASK');
      return;
    }

    // Non-project members cannot access tasks
    if (!this.hasProjectAccess(context)) {
      return;
    }

    const projectMember = context.projectMember!;
    const userId = context.user.clerkId;

    // Project admins have full control
    if (this.isProjectAdmin(context)) {
      can(Action.MANAGE, 'TASK', { projectId: projectMember.projectId });
      can(Action.ASSIGN, 'TASK', { projectId: projectMember.projectId });
      can(Action.APPROVE, 'TASK', { projectId: projectMember.projectId });
      can(Action.ARCHIVE, 'TASK', { projectId: projectMember.projectId });
      can(Action.RESTORE, 'TASK', { projectId: projectMember.projectId });
      return;
    }

    // Regular members
    if (this.isProjectMember(context)) {
      // Can view all tasks in their project
      can(Action.VIEW, 'TASK', { projectId: projectMember.projectId });
      can(Action.LIST, 'TASK', { projectId: projectMember.projectId });
      can(Action.READ, 'TASK', { projectId: projectMember.projectId });

      // Can create new tasks
      can(Action.CREATE, 'TASK', { projectId: projectMember.projectId });

      // Can update tasks they created
      can(Action.UPDATE, 'TASK', {
        projectId: projectMember.projectId,
        creatorId: userId,
      });

      // Can update tasks assigned to them (but not delete)
      can(Action.UPDATE, 'TASK', {
        projectId: projectMember.projectId,
        assigneeId: userId,
      });

      // Can delete only tasks they created (and not archived)
      can(Action.DELETE, 'TASK', {
        projectId: projectMember.projectId,
        creatorId: userId,
        status: { $ne: 'ARCHIVED' },
      });

      // Can assign tasks to other project members
      can(Action.ASSIGN, 'TASK', { projectId: projectMember.projectId });

      // Can comment on all tasks
      can(Action.COMMENT, 'TASK', { projectId: projectMember.projectId });

      // Cannot archive or restore (admin only)
      cannot(Action.ARCHIVE, 'TASK');
      cannot(Action.RESTORE, 'TASK');

      // Cannot approve (admin only)
      cannot(Action.APPROVE, 'TASK');
    }
  }
}
