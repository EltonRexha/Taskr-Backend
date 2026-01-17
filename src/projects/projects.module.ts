import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { ClerkModule } from 'src/clerk/clerk.module';
import { UsersModule } from 'src/users/users.module';
import { PaginatedService } from 'src/common/services/pagination.service';

@Module({
  imports: [ClerkModule, UsersModule],
  controllers: [ProjectsController],
  providers: [ProjectsService, PaginatedService],
})
export class ProjectsModule {}
