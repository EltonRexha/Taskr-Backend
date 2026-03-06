import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
  UseInterceptors,
  Post,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import type { Request } from 'express';
import { ProjectQueryDto } from './dto/query/query-projects.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ProjectsResponseDto } from './dto/response/projects-response.dto';
import {
  CanCreate,
  CanList,
} from 'src/casl/decorators/check-abilities.decorator';
import { CustomCacheInterceptor } from 'src/common/interceptors/custom-cache.interceptor';
import type { User } from 'prisma/generated/prisma/client';
import { ProjectResponseDto } from './dto/response';
import { CreateProjectDto } from './dto/input/create-project.dto';

@ApiTags('Projects')
@ApiBearerAuth()
@Controller('projects')
@UseInterceptors(CustomCacheInterceptor)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @CanCreate('PROJECT')
  @ApiCreatedResponse({ type: ProjectResponseDto })
  async create(@Req() req: Request, @Body() body: CreateProjectDto) {
    const project = await this.projectsService.create(req.user, body);
    return {
      id: project.id,
      name: project.name,
      projectType: project.projectType,
      members: project.projectMembers.map((m) => ({
        userClerkId: m.userClerkId,
        role: m.role,
      })),
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  }

  @Get()
  @CanList('PROJECT')
  @ApiOkResponse({ type: ProjectsResponseDto })
  async findAll(
    @Req() req: Request & { user: User },
    @Query() query: ProjectQueryDto,
  ) {
    const projects = await this.projectsService.findAll(req.user, query);
    return {
      projects: projects.data,
      metadata: projects.meta,
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
