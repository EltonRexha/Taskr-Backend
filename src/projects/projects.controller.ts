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
  BadRequestException,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { DatabaseService } from 'src/database/database.service';
import type { Request } from 'express';
import { SprintStatus } from '../../prisma/generated/prisma/enums';
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
  CanView,
} from 'src/casl/decorators/check-abilities.decorator';
import { CustomCacheInterceptor } from 'src/common/interceptors/custom-cache.interceptor';
import type { User } from 'prisma/generated/prisma/client';
import { ProjectResponseDto, SprintsResponseDto } from './dto/response';
import { CreateProjectDto } from './dto/input/create-project.dto';
import { RedisCacheService } from 'src/redis/redis.service';

@ApiTags('Projects')
@ApiBearerAuth()
@Controller('projects')
@UseInterceptors(CustomCacheInterceptor)
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly databaseService: DatabaseService,
    private readonly Redis: RedisCacheService,
  ) {}

  @Post()
  @CanCreate('PROJECT')
  @ApiCreatedResponse({ type: ProjectResponseDto })
  async create(@Req() req: Request, @Body() body: CreateProjectDto) {
    await this.Redis.deleteByPattern(`*GET/projects*:${req.user.clerkId}`);
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
  @CanView('PROJECT', (req) =>
    Array.isArray(req.params['id']) ? req.params['id'][0] : req.params['id'],
  )
  @ApiOkResponse({ type: ProjectResponseDto })
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string) {
    return this.projectsService.update(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectsService.remove(+id);
  }

  @Get(':id/sprints')
  @CanView('PROJECT', (req) =>
    Array.isArray(req.params['id']) ? req.params['id'][0] : req.params['id'],
  )
  @ApiOkResponse({ type: SprintsResponseDto })
  async getActiveSprints(@Param('id') id: string) {
    const project = await this.databaseService.project.findUnique({
      where: { id },
      include: { scrumProject: true },
    });

    if (!project) {
      throw new BadRequestException('Project not found');
    }

    if (!project.scrumProject) {
      return { sprints: [] };
    }

    const sprints = await this.databaseService.sprint.findMany({
      where: {
        scrumProjectId: project.scrumProject.id,
        sprintStatus: SprintStatus.DUE,
      },
    });

    return {
      sprints: sprints.map((sprint) => ({
        id: sprint.id,
        title: sprint.title,
        startDate: sprint.startDate.toISOString(),
        dueDate: sprint.dueDate.toISOString(),
        sprintStatus: sprint.sprintStatus,
      })),
    };
  }
}
