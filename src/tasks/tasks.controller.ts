import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TaskQueryDto } from './dto/query/query-tasks.dto';
import type { Request } from 'express';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { TasksResponseDto } from './dto/response/tasks-response.dto';
import type { User } from 'prisma/generated/prisma/client';
import {
  CanList,
  CanUpdate,
} from 'src/casl/decorators/check-abilities.decorator';
import { CustomCacheInterceptor } from 'src/common/interceptors/custom-cache.interceptor';
import { TaskSummaryResponseDto } from './dto/response/task-summary-response.dto';
import { TaskSummaryQueryDto } from './dto/query/task-summary-query.dto';

@ApiTags('Tasks')
@ApiBearerAuth()
@UseInterceptors(CustomCacheInterceptor)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create() {
    return this.tasksService.create();
  }

  @Get()
  @CanList('TASK')
  @ApiOkResponse({ type: TasksResponseDto })
  async findAll(
    @Req() req: Request & { user: User },
    @Query() query: TaskQueryDto,
  ) {
    const tasks = await this.tasksService.findAll(req.user, query);

    return {
      tasks: tasks.data,
      metadata: tasks.meta,
    };
  }

  @Get('summary')
  @CanList('TASK')
  @ApiOkResponse({ type: TaskSummaryResponseDto })
  async getTasksSummary(
    @Req() req: Request & { user: User },
    @Query() query: TaskSummaryQueryDto,
  ) {
    return this.tasksService.getTasksSummary(req.user, query.projectId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(+id);
  }

  @CanUpdate('TASK', (req) => req.params.id)
  @Patch(':id')
  update(@Param('id') id: string) {
    return this.tasksService.update(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tasksService.remove(+id);
  }
}
