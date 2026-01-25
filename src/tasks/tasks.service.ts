import { Injectable } from '@nestjs/common';
import { TaskQueryDto } from './dto/query-tasks.dto';
import { PaginatedService } from 'src/common/services/pagination.service';
import { DatabaseService } from 'src/database/database.service';
import { TaskLabel, TaskUrgency } from 'src/generated/prisma/enums';
import { User } from 'src/generated/prisma/client';

const TASK_LABELS: TaskLabel[] = [
  'BUG',
  'TASK',
  'FEATURE',
  'REFACTOR',
  'CHORE',
  'SPIKE',
  'TECH_DEBT',
];

const TASK_URGENCIES: TaskUrgency[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

@Injectable()
export class TasksService {
  constructor(
    private readonly paginationService: PaginatedService,
    private readonly prisma: DatabaseService,
  ) {}

  create() {
    return 'This action adds a new task';
  }

  async findAll(user: User, taskQueryDto: TaskQueryDto) {
    const { skip, take } = this.paginationService.getPagination(taskQueryDto);
    const {
      description,
      projectName,
      label,
      priority,
      projectId,
      startDate,
      startDateGte,
    } = taskQueryDto;

    // Validate and normalize label
    const taskLabel = this.findEnumValue(TASK_LABELS, label);
    if (label && !taskLabel) {
      return this.emptyResult(skip, take);
    }

    // Validate and normalize priority
    const taskPriority = this.findEnumValue(TASK_URGENCIES, priority);
    if (priority && !taskPriority) {
      return this.emptyResult(skip, take);
    }

    const tasks = await this.prisma.task.findMany({
      where: {
        description: description
          ? { contains: description, mode: 'insensitive' }
          : undefined,
        label: taskLabel,
        priority: taskPriority,
        Project: {
          id: projectId,
          name: projectName
            ? { contains: projectName, mode: 'insensitive' }
            : undefined,
          ProjectMembers: {
            some: {
              userClerkId: user.clerkId,
            },
          },
        },
        startDate: startDate
          ? startDate
          : startDateGte
            ? { gte: startDateGte }
            : undefined,
      },
      include: {
        Project: true,
      },
      skip,
      take,
    });

    return {
      data: tasks,
      meta: this.paginationService.getMeta(tasks.length, skip, take),
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} task`;
  }

  update(id: number) {
    return `This action updates a #${id} task`;
  }

  remove(id: number) {
    return `This action removes a #${id} task`;
  }

  private findEnumValue<T extends string>(
    enumValues: T[],
    value: string | undefined,
  ): T | undefined {
    if (!value) return undefined;
    return enumValues.find(
      (enumVal) => enumVal.toLowerCase() === value.toLowerCase(),
    );
  }
  private emptyResult(skip: number, take: number) {
    return {
      data: [],
      meta: this.paginationService.getMeta(0, skip, take),
    };
  }
}
