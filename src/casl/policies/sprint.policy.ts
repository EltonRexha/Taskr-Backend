import { BasePolicy } from './base.policy';
import {
  AbilityBuilderType,
  AbilityContext,
  Action,
  TypedAbilityBuilder,
} from '../types/casl.types';

export class SprintPolicy extends BasePolicy {
  define(builder: AbilityBuilderType, context: AbilityContext): void {
    const { can } = builder as unknown as TypedAbilityBuilder;

    if (this.isGlobalAdmin(context)) {
      this.grantFullAccess(builder, 'SPRINT');
      return;
    }

    if (!this.hasProjectMembers(context)) {
      return;
    }

    // Get project IDs by role using helper functions
    const adminProjectIds = this.getAdminProjectIds(context);
    const memberProjectIds = this.getMemberProjectIds(context);
    const allAccessibleProjectIds = this.getAllAccessibleProjectIds(context);

    // All roles can view sprints in their projects
    can(Action.VIEW, 'SPRINT', {
      scrumProject: { id: { in: allAccessibleProjectIds } },
      // Future: add kanbanProject check here
    });
    can(Action.LIST, 'SPRINT', {
      scrumProject: { id: { in: allAccessibleProjectIds } },
    });
    can(Action.READ, 'SPRINT', {
      scrumProject: { id: { in: allAccessibleProjectIds } },
    });

    // Admin permissions
    if (this.hasAdminProjects(context)) {
      can(Action.CREATE, 'SPRINT', {
        scrumProject: { id: { in: adminProjectIds } },
      });
      can(Action.UPDATE, 'SPRINT', {
        scrumProject: { id: { in: adminProjectIds } },
      });
      can(Action.DELETE, 'SPRINT', {
        scrumProject: { id: { in: adminProjectIds } },
      });
      can(Action.ARCHIVE, 'SPRINT', {
        scrumProject: { id: { in: adminProjectIds } },
      });
      can(Action.RESTORE, 'SPRINT', {
        scrumProject: { id: { in: adminProjectIds } },
      });
    }

    // Member permissions
    if (this.hasMemberProjects(context)) {
      can(Action.CREATE, 'SPRINT', {
        scrumProject: { id: { in: memberProjectIds } },
      });
      can(Action.UPDATE, 'SPRINT', {
        scrumProject: { id: { in: memberProjectIds } },
      });
    }
  }
}
