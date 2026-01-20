import { Injectable } from '@nestjs/common';
import { User } from '@clerk/backend';
import { DatabaseService } from 'src/database/database.service';
import { PaginatedService } from 'src/common/services/pagination.service';
import { ProjectQueryDto } from './dto/query-projects.dto';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: DatabaseService,
    private readonly paginationService: PaginatedService,
  ) {}

  create() {
    return 'This action adds a new project';
  }

  async findAll(clerkUser: User, projectQueryDto: ProjectQueryDto) {
    const { skip, take } =
      this.paginationService.getPagination(projectQueryDto);

    const { project_name: projectName } = projectQueryDto;

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

  update(id: number) {
    return `This action updates a #${id} project`;
  }

  remove(id: number) {
    return `This action removes a #${id} project`;
  }
}
