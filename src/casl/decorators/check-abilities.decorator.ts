import { SetMetadata } from '@nestjs/common';
import { Action, PrismaSubjects, SubjectsFields } from '../types/casl.types';
import { Request } from 'express';

/**
 * Interface for ability check configuration
 */
export interface AbilityCheck {
  action: Action;
  subject: SubjectsFields;
  /**
   * Optional function to extract project ID from request
   * Can be sync or async
   */
  getProjectId?: (req: Request) => string | Promise<string>;
  /**
   * Optional function to get the subject instance for field-level checks
   * For example, to check if user can update a specific task
   */
  getSubject?: (req: Request) => PrismaSubjects;
}

export const CHECK_ABILITY = 'check_ability';

/**
 * Decorator to check abilities before executing a route handler
 *
 * @example
 * // Simple check
 * @CheckAbilities(Action.CREATE, Subject.TASK)
 *
 * @example
 * // With project context from params
 * @CheckAbilities(
 *   Action.UPDATE,
 *   Subject.TASK,
 *   (req) => req.params.projectId
 * )
 *
 * @example
 * // With subject instance for field-level checks
 * @CheckAbilities(
 *   Action.UPDATE,
 *   Subject.TASK,
 *   (req) => req.params.projectId,
 *   async (req) => {
 *     const taskService = req.app.get(TaskService);
 *     return taskService.findOne(req.params.taskId);
 *   }
 * )
 */
export const CheckAbilities = (
  action: Action,
  subject: SubjectsFields,
  getProjectId?: (req: Request) => string | Promise<string>,
  getSubject?: (req: Request) => PrismaSubjects,
) => {
  return SetMetadata(CHECK_ABILITY, {
    action,
    subject,
    getProjectId,
    getSubject,
  } as AbilityCheck);
};

/**
 * Shorthand decorators for common operations
 */
export const CanCreate = (
  subject: SubjectsFields,
  getProjectId?: (req: Request) => string | Promise<string>,
) => CheckAbilities(Action.CREATE, subject, getProjectId);

export const CanRead = (
  subject: SubjectsFields,
  getProjectId?: (req: Request) => string | Promise<string>,
) => CheckAbilities(Action.READ, subject, getProjectId);

export const CanUpdate = (
  subject: SubjectsFields,
  getProjectId?: (req: Request) => string | Promise<string>,
  getSubject?: (req: Request) => PrismaSubjects,
) => CheckAbilities(Action.UPDATE, subject, getProjectId, getSubject);

export const CanDelete = (
  subject: SubjectsFields,
  getProjectId?: (req: Request) => string | Promise<string>,
  getSubject?: (req: Request) => PrismaSubjects,
) => CheckAbilities(Action.DELETE, subject, getProjectId, getSubject);

export const CanManage = (
  subject: SubjectsFields,
  getProjectId?: (req: Request) => string | Promise<string>,
) => CheckAbilities(Action.MANAGE, subject, getProjectId);
