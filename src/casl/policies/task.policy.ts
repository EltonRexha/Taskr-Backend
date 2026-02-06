import { BasePolicy } from './base.policy';
import {
  AbilityBuilderType,
  AbilityContext,
  Action,
  TypedAbilityBuilder,
} from '../types/casl.types';

export class TaskPolicy extends BasePolicy {
  define(builder: AbilityBuilderType, context: AbilityContext): void {
    // 1. Cast to our custom TypedAbilityBuilder for strict field checking
    const { can, cannot } = builder as unknown as TypedAbilityBuilder;

    const userId = context.user.clerkId;

    // Global admins can do everything
    if (this.isGlobalAdmin(context)) {
      this.grantFullAccess(builder, 'TASK');
      return;
    }

    // Safety check: if user isn't in any projects, they get no task permissions
    if (!this.hasProjectMembers(context)) {
      return;
    }

    // Helper IDs from BasePolicy
    const adminProjectIds = this.getAdminProjectIds(context);
    const memberProjectIds = this.getMemberProjectIds(context);
    const allAccessibleProjectIds = this.getAllAccessibleProjectIds(context);

    // --- READ PERMISSIONS ---
    // All roles can view tasks in any project they belong to
    can([Action.VIEW, Action.LIST, Action.READ], 'TASK', {
      projectId: { in: allAccessibleProjectIds },
    });

    // --- ADMIN PERMISSIONS ---
    if (this.hasAdminProjects(context)) {
      can(
        [
          Action.MANAGE,
          Action.ASSIGN,
          Action.APPROVE,
          Action.ARCHIVE,
          Action.RESTORE,
        ],
        'TASK',
        {
          projectId: { in: adminProjectIds },
        },
      );
    }

    // --- MEMBER PERMISSIONS ---
    if (this.hasMemberProjects(context)) {
      // 1. Can create new tasks in member projects
      can(Action.CREATE, 'TASK', {
        projectId: { in: memberProjectIds },
      });

      can(Action.UPDATE, 'TASK', {
        projectId: { in: memberProjectIds },
        author: { is: { clerkId: { equals: userId } } },
      });

      // 3. Can update tasks ASSIGNED to them
      can(Action.UPDATE, 'TASK', {
        projectId: { in: memberProjectIds },
        assignedTo: {
          some: {
            user: { is: { clerkId: { equals: userId } } },
          },
        },
      });

      // 4. Can delete ONLY tasks they created
      can(Action.DELETE, 'TASK', {
        projectId: { in: memberProjectIds },
        author: { is: { clerkId: { equals: userId } } },
      });

      // 5. General project participation
      can([Action.ASSIGN, Action.COMMENT], 'TASK', {
        projectId: { in: memberProjectIds },
      });

      // 6. Explicit Restrictions (Members cannot do these even if they created the task)
      cannot([Action.ARCHIVE, Action.RESTORE, Action.APPROVE], 'TASK');
    }
  }
}
