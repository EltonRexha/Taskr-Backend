// src/casl/decorators/check-abilities.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { Action, SubjectsFields } from '../types/casl.types';
import { Request } from 'express';

/**
 * Interface for ability check configuration
 */
export interface AbilityCheck {
  action: Action;
  subject: SubjectsFields;
  /**
   * Optional function to extract the resource ID from the request
   * Can extract from params, body, query, headers, etc.
   *
   * @example
   * getResourceId: (req) => req.params.id
   * getResourceId: (req) => req.body.taskId
   * getResourceId: (req) => req.query.id
   * getResourceId: (req) => req.headers['x-task-id']
   */
  getResourceId?: (req: Request) => string | undefined;
}

export const CHECK_ABILITY = 'check_ability';

/**
 * Decorator to check abilities before executing a route handler
 *
 * @example
 * // Simple class-level check
 * @CheckAbilities({ action: Action.CREATE, subject: 'TASK' })
 *
 * @example
 * // Instance-level check from params
 * @CheckAbilities({
 *   action: Action.UPDATE,
 *   subject: 'TASK',
 *   getResourceId: (req) => req.params.id
 * })
 *
 * @example
 * // Instance-level check from body
 * @CheckAbilities({
 *   action: Action.UPDATE,
 *   subject: 'TASK',
 *   getResourceId: (req) => req.body.taskId
 * })
 *
 * @example
 * // Instance-level check from query
 * @CheckAbilities({
 *   action: Action.DELETE,
 *   subject: 'TASK',
 *   getResourceId: (req) => req.query.taskId as string
 * })
 */
const CheckAbilities = ({ action, subject, getResourceId }: AbilityCheck) => {
  return SetMetadata(CHECK_ABILITY, {
    action,
    subject,
    getResourceId,
  });
};

/**
 * Shorthand decorators for common operations
 */

// Class-level (no resource instance)
export const CanCreate = (subject: SubjectsFields) =>
  CheckAbilities({ action: Action.CREATE, subject });

export const CanList = (subject: SubjectsFields) =>
  CheckAbilities({ action: Action.LIST, subject });

// Instance-level with flexible ID extraction
export const CanRead = (
  subject: SubjectsFields,
  getResourceId?: (req: Request) => string | undefined,
) => CheckAbilities({ action: Action.READ, subject, getResourceId });

export const CanUpdate = (
  subject: SubjectsFields,
  getResourceId: (req: Request) => string | undefined,
) =>
  CheckAbilities({
    action: Action.UPDATE,
    subject,
    getResourceId,
  });

export const CanDelete = (
  subject: SubjectsFields,
  getResourceId?: (req: Request) => string | undefined,
) => CheckAbilities({ action: Action.DELETE, subject, getResourceId });

export const CanManage = (
  subject: SubjectsFields,
  getResourceId?: (req: Request) => string | undefined,
) => CheckAbilities({ action: Action.MANAGE, subject, getResourceId });

export const CanView = (
  subject: SubjectsFields,
  getResourceId?: (req: Request) => string | undefined,
) => CheckAbilities({ action: Action.VIEW, subject, getResourceId });

/**
 * Common ID extractors - reusable functions
 */
export const fromParams =
  (paramName: string = 'id') =>
  (req: Request) =>
    req.params[paramName];

export const fromBody =
  (fieldName: string) =>
  (req: Request): unknown => {
    if (
      typeof req.body === 'object' &&
      req.body !== null &&
      fieldName in req.body
    ) {
      return (req.body as Record<string, unknown>)[fieldName];
    }

    return undefined;
  };

export const fromQuery = (queryName: string) => (req: Request) =>
  req.query[queryName] as string;

export const fromHeader = (headerName: string) => (req: Request) =>
  req.headers[headerName] as string;
