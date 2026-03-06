import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { PaginatedService } from 'src/common/services/pagination.service';
import { ProjectQueryDto } from './dto/query/query-projects.dto';
import { User } from 'prisma/generated/prisma/client';
import { CreateProjectDto } from './dto/input/create-project.dto';
import { ProjectMemberRole } from 'prisma/generated/prisma/enums';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly paginationService: PaginatedService,
  ) {}

  async findAll(user: User, projectQueryDto: ProjectQueryDto) {
    const { skip, take, page } =
      this.paginationService.getPagination(projectQueryDto);

    const { project_name, project_name_like } = projectQueryDto;

    const projects = await this.databaseService.project.findMany({
      where: {
        projectMembers: {
          some: {
            userClerkId: user.clerkId,
          },
        },
        ...(project_name
          ? {
              name: {
                equals: project_name,
                mode: 'insensitive',
              },
            }
          : project_name_like && {
              name: {
                contains: project_name_like,
                mode: 'insensitive',
              },
            }),
      },
      select: {
        id: true,
        name: true,
        projectType: true,
        createdAt: true,
        updatedAt: true,
      },
      skip,
      take,
    });
    const projectsCount = await this.databaseService.project.count();

    return {
      data: projects,
      meta: this.paginationService.getMeta(projectsCount, page, take),
    };
  }

  async create(user: User, createProjectDto: CreateProjectDto) {
    const existingProject = await this.databaseService.project.findUnique({
      where: {
        name: createProjectDto.name,
      },
    });

    if (existingProject) {
      throw new BadRequestException('Project with this name already exists');
    }

    if (createProjectDto.type === 'SCRUM') {
      return this.createScrumProject(user, createProjectDto);
    }

    // For KANBAN and other project types, implement creation logic here
    throw new BadRequestException('Unsupported project type');
  }

  private async createScrumProject(
    user: User,
    createProjectDto: CreateProjectDto,
  ) {
    // ensure name uniqueness before opening transaction
    const existing = await this.databaseService.project.findUnique({
      where: { name: createProjectDto.name },
    });
    if (existing) {
      throw new BadRequestException('Project with this name already exists');
    }

    return this.databaseService.$transaction(async (transaction) => {
      // resolve invite emails to users; ignore those which don't exist and the owner's emailF
      const inviteEmails =
        createProjectDto.invites
          ?.map((invite) => invite.email)
          .filter((email) => email !== user.email) || [];

      const invitedUsers: User[] = await transaction.user.findMany({
        where: { email: { in: inviteEmails } },
      });

      const project = await transaction.project.create({
        data: {
          author: {
            connect: {
              clerkId: user.clerkId,
            },
          },
          name: createProjectDto.name,
          projectType: 'SCRUM',
          scrumProject: {
            create: {
              backlog: {
                create: {},
              },
            },
          },
          projectMembers: {
            create: [
              {
                user: {
                  connect: { clerkId: user.clerkId },
                },
                role: ProjectMemberRole.ADMIN,
              },
              ...invitedUsers.map((u) => {
                const invite = createProjectDto.invites.find(
                  (i) => i.email === u.email,
                )!;
                return {
                  user: { connect: { clerkId: u.clerkId } },
                  role: invite.role,
                };
              }),
            ],
          },
        },
        include: {
          projectMembers: {
            select: {
              userClerkId: true,
              role: true,
            },
          },
        },
      });

      return project;
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} project`;
  }

  update(id: number) {
    return `This action updates a #${id} project`;
  }

  remove(id: number) {
    return `This action removes a #${id} project`;
  }
}
