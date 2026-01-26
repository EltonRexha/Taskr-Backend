import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { TaskQueryDto } from './dto/query-tasks.dto';
import { PaginatedService } from 'src/common/services/pagination.service';
import { DatabaseService } from 'src/database/database.service';
import {
  TaskLabel,
  TaskUrgency,
  ScrumTaskStatus,
  ProjectType,
} from 'src/generated/prisma/enums';
import { Prisma, User } from 'src/generated/prisma/client';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  /**
   * Standard select configuration for task metadata.
   * Includes all task type metadata (Scrum, Kanban, etc.)
   *
   * @future When adding Kanban support, add:
   * ```typescript
   * kanbanTask: {
   *   select: {
   *     id: true,
   *     status: true,
   *   },
   * }
   * ```
   */
  private readonly TASK_METADATA_SELECT = {
    scrumTask: {
      select: {
        id: true,
        status: true,
      },
    },
    // Future: Add kanbanTask here
  } as const;

  /**
   * Standard select configuration for tasks with all necessary fields.
   * Use this across all queries to maintain consistency.
   */
  private readonly TASK_SELECT = {
    id: true,
    description: true,
    label: true,
    priority: true,
    startDate: true,
    dueDate: true,
    createdAt: true,
    updatedAt: true,
    Project: {
      select: {
        id: true,
        name: true,
      },
    },
    ...this.TASK_METADATA_SELECT,
  } satisfies Prisma.TaskSelect;

  constructor(
    private readonly paginationService: PaginatedService,
    private readonly prisma: DatabaseService,
  ) {}

  create() {
    return 'This action adds a new task';
  }

  async findAll(user: User, taskQueryDto: TaskQueryDto) {
    try {
      const { skip, take, page } =
        this.paginationService.getPagination(taskQueryDto);
      const {
        description,
        projectName,
        label,
        priority,
        projectId,
        startDate,
        startDateGte,
        dueDate,
        dueDateLte,
        status,
        type,
      } = taskQueryDto;

      // Validate and normalize inputs
      const taskLabel = this.validateTaskLabel(label);
      const taskPriority = this.validateTaskPriority(priority);
      const projectType = this.validateProjectType(type);
      const taskStatus = this.validateScrumTaskStatus(status);

      // Build reusable where clause
      const whereClause: Prisma.TaskWhereInput = {
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
          ProjectType: projectType,
        },
        startDate: startDate
          ? startDate
          : startDateGte
            ? { gte: startDateGte }
            : undefined,
        dueDate: dueDate
          ? dueDate
          : dueDateLte
            ? { lte: dueDateLte }
            : undefined,
        ...this.buildStatusFilter(taskStatus),
      };

      // Fetch tasks and count in parallel for better performance
      const [tasks, tasksCount] = await Promise.all([
        this.prisma.task.findMany({
          where: whereClause,
          select: this.TASK_SELECT,
          skip,
          take,
        }),
        this.prisma.task.count({ where: whereClause }),
      ]);

      const transformedTasks = tasks.map((task) => ({
        ...task,
        metaData: this.getTaskMetadata(task),
      }));

      return {
        data: transformedTasks,
        meta: this.paginationService.getMeta(tasksCount, page, take),
      };
    } catch (error) {
      this.logger.error('Failed to fetch tasks', error);

      // Re-throw validation errors
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to fetch tasks');
    }
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

  /**
   * Builds the where clause for filtering tasks by status.
   * Handles different task types (Scrum, Kanban, etc.)
   *
   * @param status - The validated status to filter by
   * @returns Prisma where clause for task status filtering, or undefined if no status
   *
   * @future When adding Kanban support, update to:
   * ```typescript
   * return {
   *   OR: [
   *     { scrumTask: { status: scrumStatus } },
   *     { kanbanTask: { status: kanbanStatus } },
   *   ],
   * };
   * ```
   */
  private buildStatusFilter(status?: ScrumTaskStatus) {
    if (!status) return undefined;

    return {
      scrumTask: {
        status: status,
      },
    };

    // Future: When Kanban is added, replace with OR condition
  }

  /**
   * Transforms a task's relation data into a unified metadata structure.
   *
   * Currently handles Scrum task metadata. When the task has a scrumTask relation,
   * it extracts the metadata and adds a type identifier.
   *
   * @param task - The task object with potential scrumTask or kanbanTask relations
   * @returns Metadata object with id, status, and type, or null if no metadata exists
   *
   * @future To add Kanban support, extend the function:
   * ```typescript
   * if (task.kanbanTask) {
   *   return { ...task.kanbanTask, type: 'KANBAN' as const };
   * }
   * ```
   */
  private getTaskMetadata(task: {
    scrumTask?: { id: string; status: ScrumTaskStatus } | null;
    // Future: kanbanTask?: { id: string; status: KanbanTaskStatus } | null;
  }) {
    if (task.scrumTask) {
      return {
        ...task.scrumTask,
        type: 'SCRUM' as const,
      };
    }

    // Future: Check kanbanTask here

    return null;
  }

  /**
   * Validates and normalizes a task label string.
   *
   * @param label - The label string to validate
   * @returns Normalized TaskLabel enum value, or undefined if no label provided
   * @throws BadRequestException if the label is invalid
   */
  private validateTaskLabel(label?: string): TaskLabel | undefined {
    if (!label) return undefined;

    const normalized = label.toUpperCase();
    if (!Object.values(TaskLabel).includes(normalized as TaskLabel)) {
      throw new BadRequestException(
        `Invalid task label: ${label}. Valid values are: ${Object.values(TaskLabel).join(', ')}`,
      );
    }

    return normalized as TaskLabel;
  }

  /**
   * Validates and normalizes a task priority string.
   *
   * @param priority - The priority string to validate
   * @returns Normalized TaskUrgency enum value, or undefined if no priority provided
   * @throws BadRequestException if the priority is invalid
   */
  private validateTaskPriority(priority?: string): TaskUrgency | undefined {
    if (!priority) return undefined;

    const normalized = priority.toUpperCase();
    if (!Object.values(TaskUrgency).includes(normalized as TaskUrgency)) {
      throw new BadRequestException(
        `Invalid task priority: ${priority}. Valid values are: ${Object.values(TaskUrgency).join(', ')}`,
      );
    }

    return normalized as TaskUrgency;
  }

  /**
   * Validates and normalizes a project type string.
   *
   * @param type - The project type string to validate
   * @returns Normalized ProjectType enum value, or undefined if no type provided
   * @throws BadRequestException if the project type is invalid
   */
  private validateProjectType(type?: string): ProjectType | undefined {
    if (!type) return undefined;

    const normalized = type.toUpperCase();
    if (!Object.values(ProjectType).includes(normalized as ProjectType)) {
      throw new BadRequestException(
        `Invalid project type: ${type}. Valid values are: ${Object.values(ProjectType).join(', ')}`,
      );
    }

    return normalized as ProjectType;
  }

  /**
   * Validates and normalizes a scrum task status string.
   *
   * @param status - The status string to validate
   * @returns Normalized ScrumTaskStatus enum value, or undefined if no status provided
   * @throws BadRequestException if the status is invalid
   */
  private validateScrumTaskStatus(
    status?: string,
  ): ScrumTaskStatus | undefined {
    if (!status) return undefined;

    const normalized = status.toUpperCase();
    if (
      !Object.values(ScrumTaskStatus).includes(normalized as ScrumTaskStatus)
    ) {
      throw new BadRequestException(
        `Invalid task status: ${status}. Valid values are: ${Object.values(ScrumTaskStatus).join(', ')}`,
      );
    }

    return normalized as ScrumTaskStatus;
  }
}
