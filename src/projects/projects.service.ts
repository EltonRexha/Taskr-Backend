import { Injectable } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { User } from '@clerk/backend';
import { DatabaseService } from 'src/database/database.service';
import { PaginatedService } from 'src/common/services/pagination.service';
import { ProjectQueryDto } from './dto/project.query.dto';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: DatabaseService,
    private readonly paginationService: PaginatedService,
  ) {}

  create(createProjectDto: CreateProjectDto) {
    return 'This action adds a new project';
  }

  async findAll(clerkUser: User, projectQueryDto: ProjectQueryDto) {
    const { skip, take } =
      this.paginationService.getPagination(projectQueryDto);

    const { project_name: projectName } = projectQueryDto;
    console.log({ projectName });

    try {
      const projects = await this.prisma.project.findMany({
        where: {
          userClerkId: clerkUser.id,
          ...(projectName && {
            name: {
              contains: projectName,
              mode: 'insensitive',
            },
          }),
        },
        skip,
        take,
      });
      return projects;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to fetch projects: ${message}`);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} project`;
  }

  update(id: number, updateProjectDto: UpdateProjectDto) {
    return `This action updates a #${id} project`;
  }

  remove(id: number) {
    return `This action removes a #${id} project`;
  }
}
