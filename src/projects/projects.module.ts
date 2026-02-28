import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { PaginatedService } from 'src/common/services/pagination.service';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { ClerkModule } from 'src/clerk/clerk.module';

@Module({
  imports: [UsersModule, ClerkModule, AuthModule],
  controllers: [ProjectsController],
  providers: [ProjectsService, PaginatedService],
})
export class ProjectsModule {}
