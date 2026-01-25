import { User } from 'src/generated/prisma/client';

declare global {
  namespace Express {
    interface Request {
      user: User;
    }
  }
}

export {};
