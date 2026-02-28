import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AppAbility } from '../types/casl.types';
import { Request } from 'express';

/**
 * Parameter decorator to inject the current user's ability into route handlers
 *
 * @example
 * async getTasks(@CurrentAbility() ability: AppAbility) {
 *   const tasks = await this.taskService.findAll();
 *   return tasks.filter(task => ability.can(Action.READ, task));
 * }
 */
export const CurrentAbility = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AppAbility | undefined => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.ability;
  },
);
