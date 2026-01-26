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
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TaskQueryDto } from './dto/query-tasks.dto';
import type { Request } from 'express';
import { ClerkAuthGuard } from 'src/clerk/clerk-auth.guard';

@UseGuards(ClerkAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create() {
    return this.tasksService.create();
  }

  @Get()
  async findAll(@Req() req: Request, @Query() query: TaskQueryDto) {
    const tasks = await this.tasksService.findAll(req.user, query);

    return {
      tasks: tasks.data.map((data) => ({
        id: data.id,
        description: data.description,
        label: data.label,
        priority: data.priority,
        dueDate: data.dueDate,
        project: {
          id: data.Project.id,
          name: data.Project.name,
        },
        ...(data.metaData && {
          metaData: {
            id: data.metaData.id,
            status: data.metaData.status,
            type: data.metaData.type,
          },
        }),
        startDate: data.startDate,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      })),
      meta: tasks.meta,
    };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string) {
    return this.tasksService.update(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tasksService.remove(+id);
  }
}
