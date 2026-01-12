import { Module } from '@nestjs/common';
import { ClerkService } from './clerk.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  providers: [ClerkService],
  imports: [UsersModule],
  exports: [ClerkService]
})
export class ClerkModule { }
