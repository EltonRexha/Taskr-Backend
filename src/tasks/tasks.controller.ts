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
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { TasksResponseDto } from './dto/response.task.dto';
import { AbilitiesGuard } from 'src/casl/guards/abilities.guard';
import { CheckAbilities } from 'src/casl/decorators/check-abilities.decorator';
import { Action } from 'src/casl/types/casl.types';

@ApiTags('Tasks')
@ApiBearerAuth()
@UseGuards(AbilitiesGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create() {
    return this.tasksService.create();
  }

  @Get()
  @ApiOkResponse({ type: TasksResponseDto })
  async findAll(@Req() req: Request, @Query() query: TaskQueryDto) {
    const tasks = await this.tasksService.findAll(req.user, query);

    return {
      tasks: tasks.data,
      metadata: tasks.meta,
    };
  }

  @CheckAbilities(Action.READ, 'TASK')
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
