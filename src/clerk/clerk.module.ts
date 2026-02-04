import { Module } from '@nestjs/common';
import { ClerkService } from './clerk.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [UsersModule],
  providers: [ClerkService],
  exports: [ClerkService],
})
export class ClerkModule {}
