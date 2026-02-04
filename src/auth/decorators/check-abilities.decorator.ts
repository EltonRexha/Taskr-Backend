import { SetMetadata } from '@nestjs/common';
import { Request } from 'express';
import { Actions, Subjects } from '../factories/casl-ability.factory';

export interface AbilityCheck {
  action: Actions;
  subject: Subjects;
  getProjectId?: (req: Request) => string | Promise<string>;
}

export const CHECK_ABILITY = 'check_ability';

export const CheckAbilities = (
  action: Actions,
  subject: Subjects,
  getProjectId?: (req: Request) => string | Promise<string>,
) => {
  return SetMetadata(CHECK_ABILITY, {
    action,
    subject,
    getProjectId,
  } as AbilityCheck);
};
