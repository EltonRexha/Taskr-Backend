// src/casl/types/casl.types.ts
import { PureAbility, AbilityBuilder } from '@casl/ability';
import {
  User,
  ProjectMember,
  Task,
  Project,
  Sprint,
  Epic,
  Prisma,
} from 'prisma/generated/prisma/client';
import { PrismaQuery, Subjects } from '@casl/prisma';

/**
 * All possible actions in the system
 * Organized by category for clarity
 */
export enum Action {
  // Read operations
  READ = 'read',
  LIST = 'list',
  VIEW = 'view',

  // Write operations
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',

  // Special operations
  MANAGE = 'manage', // All operations
  ARCHIVE = 'archive',
  RESTORE = 'restore',

  // Project-specific
  INVITE = 'invite',
  REMOVE_MEMBER = 'remove_member',
  UPDATE_MEMBER_ROLE = 'update_member_role',

  // Task-specific
  ASSIGN = 'assign',
  APPROVE = 'approve',
  COMMENT = 'comment',

  // Data operations
  EXPORT = 'export',
  IMPORT = 'import',
}

/**
 * All subjects (resources) in the system
 */
export type SubjectsFields = Subjects<{
  USER: User;
  PROJECT: Project;
  PROJECT_MEMBER: ProjectMember;
  TASK: Task;
  SPRINT: Sprint;
  EPIC: Epic;
}>;

export type PrismaSubjects =
  | User
  | Project
  | Task
  | Sprint
  | Epic
  | ProjectMember;

/**
 * Main ability type
 * Uses tuple format [Action, Subjects] that CASL expects
 */
export type AppAbility = PureAbility<[Action, SubjectsFields], PrismaQuery>;

/**
 * Ability builder type helper
 */
export type AbilityBuilderType = AbilityBuilder<AppAbility>;

/**
 * Context for ability checks
 */
export interface AbilityContext {
  user: User;
  projectMembers?: ProjectMember[];
}

/**
 * Policy interface that all policies must implement
 */
export interface Policy {
  define(builder: AbilityBuilderType, context: AbilityContext): void;
}

export type SubjectsMap = {
  USER: Prisma.UserWhereInput;
  PROJECT: Prisma.ProjectWhereInput;
  PROJECT_MEMBER: Prisma.ProjectMemberWhereInput;
  TASK: Prisma.TaskWhereInput;
  SPRINT: Prisma.SprintWhereInput;
  EPIC: Prisma.EpicWhereInput;
  all: any;
};

/**
 * The Fixed Interface
 * We use RuleBuilder<AppAbility> as the return type to satisfy the extension
 */
export interface TypedAbilityBuilder extends AbilityBuilder<AppAbility> {
  can<S extends keyof SubjectsMap>(
    this: void,
    action: Action | Action[],
    subject: S,
    conditions?: SubjectsMap[S],
  ): ReturnType<AbilityBuilder<AppAbility>['can']>;

  cannot<S extends keyof SubjectsMap>(
    this: void,
    action: Action | Action[],
    subject: S,
    conditions?: SubjectsMap[S],
  ): ReturnType<AbilityBuilder<AppAbility>['cannot']>;
}
