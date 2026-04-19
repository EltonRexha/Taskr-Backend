import { ExecutionContext, Injectable } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { Request } from 'express';

@Injectable()
export class CustomCacheInterceptor extends CacheInterceptor {
  protected isRequestCacheable(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    // Only cache GET requests
    return request.method === 'GET';
  }

  trackBy(context: ExecutionContext): string | undefined {
    const request = context.switchToHttp().getRequest<Request>();

    // Only generate cache key for GET requests
    if (request.method !== 'GET') {
      return undefined;
    }

    // Cache per user
    const userId = request.user?.clerkId;
    return `${request.method}${request.url}:${userId ?? 'public'}`;
  }
}
