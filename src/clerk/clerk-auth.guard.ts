import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ClerkService } from './clerk.service';
import { Request } from 'express';
import { UsersService } from '../users/users.service';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(
    private clerkService: ClerkService,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest<Request>();
    const authorizationHeader = request.headers['authorization'];

    if (!authorizationHeader) {
      throw new UnauthorizedException('No authorization header provided');
    }

    const token = authorizationHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const session = await this.clerkService.getSession(token);

      //Check if the user was registered on our database through our webhook
      const dbUser = await this.usersService.findOne(session.sub);
      if (!dbUser) {
        throw new UnauthorizedException('User not found in database', {
          description: 'Please try again later',
        });
      }

      request.user = dbUser;

      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
