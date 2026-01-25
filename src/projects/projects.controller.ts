import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { UseGuards } from '@nestjs/common';
import { ClerkAuthGuard } from 'src/clerk/clerk-auth.guard';
import type { Request } from 'express';
import { ProjectQueryDto } from './dto/query-projects.dto';

@UseGuards(ClerkAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create() {
    return this.projectsService.create();
  }

  @Get()
  async findAll(@Req() req: Request, @Query() query: ProjectQueryDto) {
    const projects = await this.projectsService.findAll(req.user, query);
    return {
      projects: projects.data.map((project) => ({
        id: project.id,
        name: project.name,
        projectType: project.ProjectType,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      })),
      meta: projects.meta,
    };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string) {
    return this.projectsService.update(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectsService.remove(+id);
  }
}
