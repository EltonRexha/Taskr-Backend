import { User } from 'prisma/generated/prisma/client';
import { AppAbility } from 'src/casl/types/casl.types';

declare global {
  namespace Express {
    interface Request {
      user: User;
      ability?: AppAbility;
    }
  }
}

export {};
