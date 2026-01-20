import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { PaginatedService } from 'src/common/services/pagination.service';
import { ClerkModule } from 'src/clerk/clerk.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [ClerkModule, UsersModule],
  controllers: [TasksController],
  providers: [TasksService, PaginatedService],
})
export class TasksModule {}
