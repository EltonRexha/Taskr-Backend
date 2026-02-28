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
import {
  CanList,
  CanUpdate,
} from 'src/casl/decorators/check-abilities.decorator';

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
  @CanList('PROJECT')
  @ApiOkResponse({ type: TasksResponseDto })
  async findAll(@Req() req: Request, @Query() query: TaskQueryDto) {
    const tasks = await this.tasksService.findAll(req.user, query);

    return {
      tasks: tasks.data,
      metadata: tasks.meta,
    };
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
