import { Module } from '@nestjs/common';
import { ClerkService } from './clerk.service';
import { UsersModule } from 'src/users/users.module';
import { ClerkAuthGuard } from './clerk-auth.guard';

@Module({
  providers: [ClerkService, ClerkAuthGuard],
  imports: [UsersModule],
  exports: [ClerkService, ClerkAuthGuard],
})
export class ClerkModule {}
