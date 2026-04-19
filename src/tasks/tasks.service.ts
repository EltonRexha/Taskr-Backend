import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { TaskQueryDto } from './dto/query/query-tasks.dto';
import { CreateTaskDto } from './dto/input/create-task.dto';
import { DatabaseService } from 'src/database/database.service';
import {
  ScrumTaskStatus,
  ProjectType,
  SprintStatus,
} from '../../prisma/generated/prisma/enums';
import { Prisma, User } from '../../prisma/generated/prisma/client';
import { PaginatedService } from 'src/common/services/pagination.service';
import { keysToCamel } from 'src/common/utils/snake-to-camel.util';
import { Project } from 'prisma/generated/prisma/browser';

type SortOrder = 'asc' | 'desc';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  private readonly sortByFields = [
    'created_at',
    'updated_at',
    'due_date',
    'start_date',
    'priority',
    'type',
  ] as const;

  private readonly TASK_METADATA_SELECT = {
    scrumTask: {
      select: {
        id: true,
        status: true,
      },
    },
  } as const;

  private readonly TASK_SELECT = {
    id: true,
    description: true,
    label: true,
    priority: true,
    startDate: true,
    dueDate: true,
    title: true,
    createdAt: true,
    updatedAt: true,
    project: {
      select: {
        id: true,
        name: true,
      },
    },
    assignedTo: {
      select: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            profileImage: true,
          },
        },
      },
    },
    ...this.TASK_METADATA_SELECT,
  } satisfies Prisma.TaskSelect;

  constructor(
    private readonly paginationService: PaginatedService,
    private readonly databaseService: DatabaseService,
  ) {}

  async create(user: User, createTaskDto: CreateTaskDto) {
    const {
      title,
      description,
      label,
      priority,
      projectId,
      startDate,
      dueDate,
      status = ScrumTaskStatus.TODO,
      assignedTo,
      sprintId,
    } = createTaskDto;

    // Verify user is a project member
    const projectMember = await this.databaseService.projectMember.findFirst({
      where: {
        projectId,
        userClerkId: user.clerkId,
      },
    });

    if (!projectMember) {
      throw new BadRequestException('You are not a member of this project');
    }

    // Get the project's scrum project info
    const project = await this.databaseService.project.findUnique({
      where: { id: projectId },
      include: { scrumProject: { include: { backlog: true } } },
    });

    if (!project) {
      throw new BadRequestException('Project not found');
    }

    // Verify sprint exists for Scrum projects
    if (project.projectType === ProjectType.SCRUM) {
      if (!sprintId) {
        throw new BadRequestException('Sprint ID is required for Scrum projects');
      }
      const sprint = await this.databaseService.sprint.findFirst({
        where: {
          id: sprintId,
          scrumProjectId: project.scrumProject?.id,
        },
      });
      if (!sprint) {
        throw new BadRequestException('Sprint not found or does not belong to this project');
      }
    }

    // Check if assigned users are project members
    let assigneeConnections: { id: string }[] = [];
    if (assignedTo && assignedTo.length > 0) {
      const validMembers = await this.databaseService.projectMember.findMany({
        where: {
          projectId,
          userClerkId: { in: assignedTo },
        },
      });

      if (validMembers.length !== assignedTo.length) {
        throw new BadRequestException(
          'Some assigned users are not project members',
        );
      }

      assigneeConnections = validMembers.map((m) => ({ id: m.id }));
    }

    // Create the task with scrumTask metadata
    const task = await this.databaseService.task.create({
      data: {
        title,
        description,
        label,
        priority,
        projectId,
        userClerkId: user.clerkId,
        startDate: new Date(startDate),
        dueDate: new Date(dueDate),
        assignedTo:
          assigneeConnections.length > 0
            ? { connect: assigneeConnections }
            : undefined,
        scrumTask:
          project.projectType === ProjectType.SCRUM
            ? {
                create: {
                  status,
                  backlogId: project.scrumProject?.backlog?.id,
                  sprintId,
                },
              }
            : undefined,
      },
      select: this.TASK_SELECT,
    });

    return {
      ...task,
      metaData: this.getTaskMetadata(task),
    };
  }

  async findAll(user: User, taskQueryDto: TaskQueryDto) {
    try {
      const { skip, take, page } =
        this.paginationService.getPagination(taskQueryDto);

      const {
        description,
        title,
        project_name,
        label,
        priority,
        project_id,
        start_date,
        start_date_gte,
        start_date_lte,
        due_date,
        due_date_lte,
        status,
        type,
        sort_by,
        active,
      } = taskQueryDto;

      const sortByField = this.validateSortBy(sort_by);

      const whereClause: Prisma.TaskWhereInput = {
        AND: {
          description: description
            ? { contains: description, mode: 'insensitive' }
            : undefined,
          title: title ? { contains: title, mode: 'insensitive' } : undefined,
          label,
          priority,
          project: {
            id: project_id,
            name: project_name
              ? { contains: project_name, mode: 'insensitive' }
              : undefined,
            projectMembers: {
              some: {
                userClerkId: user.clerkId,
              },
            },
            projectType: type,
          },
          startDate: start_date
            ? start_date
            : start_date_gte
              ? { gte: start_date_gte }
              : start_date_lte
                ? { lte: start_date_lte }
                : undefined,
          dueDate: due_date
            ? due_date
            : due_date_lte
              ? { lte: due_date_lte }
              : undefined,

          scrumTask: this.buildScrumTaskFilter(status, active),
        },
      };

      const [tasks, tasksCount] = await Promise.all([
        this.databaseService.task.findMany({
          where: whereClause,
          select: this.TASK_SELECT,
          skip,
          take,
          orderBy: keysToCamel(sortByField || {}),
        }),
        this.databaseService.task.count({ where: whereClause }),
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

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to fetch tasks');
    }
  }

  private buildScrumTaskFilter(
    status?: ScrumTaskStatus,
    active?: boolean,
  ): Prisma.TaskWhereInput['scrumTask'] | undefined {
    if (!status && !active) return undefined;

    const now = new Date();

    const isFilter: Prisma.ScrumTaskWhereInput = {};

    if (status) {
      isFilter.status = status;
    }

    if (active) {
      isFilter.sprint = {
        is: {
          startDate: { lte: now },
          sprintStatus: SprintStatus.DUE,
        },
      };
    }

    return {
      isNot: null,
      is: isFilter,
    };
  }

  async getTasksSummary(user: User, projectId: string) {
    const project = await this.databaseService.project.findFirst({
      where: {
        id: projectId,
        projectMembers: {
          some: {
            userClerkId: user.clerkId,
          },
        },
      },
      include: {
        projectMembers: true,
      },
    });

    if (!project) {
      throw new BadRequestException('Project not found');
    }

    if (project.projectType === ProjectType.SCRUM) {
      return await this.getScrumTasksSummary(project);
    }
  }

  private async getScrumTasksSummary(
    project: Project & { projectMembers: { id: string }[] },
  ) {
    const tasks = await this.databaseService.task.findMany({
      where: {
        projectId: project.id,
        scrumTask: {
          isNot: null,
        },
      },
      select: {
        dueDate: true,
        scrumTask: {
          select: {
            status: true,
          },
        },
      },
    });

    const now = new Date();

    const baseSummary = Object.values(ScrumTaskStatus).reduce(
      (acc, status) => {
        acc[status] = 0;
        return acc;
      },
      {} as Record<ScrumTaskStatus, number>,
    );

    let overdueTasks = 0;

    for (const task of tasks) {
      const status = task.scrumTask?.status;
      if (!status) continue;

      const isOverdue = task.dueDate < now && status !== ScrumTaskStatus.DONE;

      if (isOverdue) {
        overdueTasks += 1;
        continue;
      }

      baseSummary[status] += 1;
    }

    return {
      ...baseSummary,
      overdueTasks,
      memberCount: project.projectMembers.length,
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

  private getTaskMetadata(task: {
    scrumTask?: { id: string; status: ScrumTaskStatus } | null;
  }) {
    if (task.scrumTask) {
      return {
        ...task.scrumTask,
        type: 'SCRUM' as const,
      };
    }

    return null;
  }

  private validateSortBy(sortByItems?: string[]):
    | Array<{
        [key in (typeof this.sortByFields)[number]]?: SortOrder;
      }>
    | undefined {
    if (!sortByItems || sortByItems.length === 0) return undefined;

    return sortByItems.map((item) => {
      const [rawField, rawOrder = 'asc'] = item.split(':');

      const order = rawOrder.toLowerCase() as SortOrder;

      if (
        !this.sortByFields.includes(
          rawField as (typeof this.sortByFields)[number],
        )
      ) {
        throw new BadRequestException(
          `Invalid sort field: ${rawField}. Valid values are: ${this.sortByFields.join(
            ', ',
          )}`,
        );
      }

      if (!['asc', 'desc'].includes(order)) {
        throw new BadRequestException(
          `Invalid sort order: ${rawOrder}. Valid values are: asc, desc`,
        );
      }

      return {
        [rawField]: order,
      } as {
        [key in (typeof this.sortByFields)[number]]: SortOrder;
      };
    });
  }
}
