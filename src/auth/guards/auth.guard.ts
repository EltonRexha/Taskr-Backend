import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  HttpException,
} from '@nestjs/common';
import { ClerkService } from '../../clerk/clerk.service';
import { Request } from 'express';
import { UsersService } from '../../users/users.service';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private clerkService: ClerkService,
    private usersService: UsersService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    //Check if its a public route
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

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
        throw new UnauthorizedException('User not found');
      }

      request.user = dbUser;

      return true;
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }

      throw new UnauthorizedException('Invalid token');
    }
  }
}
