// src/casl/casl-ability.factory.ts
import { Injectable } from '@nestjs/common';
import { AbilityBuilder, PureAbility, AbilityClass } from '@casl/ability';
import { ProjectMember, User } from 'prisma/generated/prisma/client';

export type Actions =
  | 'manage'
  | 'list'
  | 'view'
  | 'create'
  | 'update'
  | 'delete'
  | 'archive'
  | 'restore'
  | 'invite'
  | 'assign'
  | 'approve'
  | 'export';
export type Subjects = 'task' | 'project' | 'sprint' | 'epic' | 'all';

export type AppAbility = PureAbility<[Actions, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: User, projectMember?: ProjectMember) {
    const { can, build } = new AbilityBuilder<AppAbility>(
      PureAbility as AbilityClass<AppAbility>,
    );

    // Global admin can do everything
    if (user.role === 'ADMIN') {
      can('manage', 'all');
      return build();
    }

    can('list', 'all');
    can('create', 'all');

    if (projectMember) {
      can('view', 'all');

      switch (projectMember.role) {
        case 'ADMIN':
          can('manage', 'sprint');
          can('manage', 'task');
          can('manage', 'epic');
          can('manage', 'project');
          break;
        case 'MEMBER':
          can('create', 'sprint');
          can('create', 'task');
          can('create', 'epic');
          can('assign', 'epic');
          can('assign', 'task');
          break;
      }
    }

    return build();
  }
}
