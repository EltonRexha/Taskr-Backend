import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ClerkService } from './clerk.service';
import { Request } from 'express';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(private clerkService: ClerkService) {}

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
      const user = await this.clerkService.getUser(session.sub);
      request.user = user;

      if (user.banned) {
        throw new UnauthorizedException('User is banned');
      }

      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
