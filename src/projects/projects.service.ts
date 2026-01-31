import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { PaginatedService } from 'src/common/services/pagination.service';
import { ProjectQueryDto } from './dto/query-projects.dto';
import { User } from 'prisma/generated/prisma/client';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: DatabaseService,
    private readonly paginationService: PaginatedService,
  ) {}

  create() {
    return 'This action adds a new project';
  }

  async findAll(user: User, projectQueryDto: ProjectQueryDto) {
    const { skip, take, page } =
      this.paginationService.getPagination(projectQueryDto);

    const { projectName } = projectQueryDto;

    const projects = await this.prisma.project.findMany({
      where: {
        userClerkId: user.clerkId,
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
    const projectsCount = await this.prisma.project.count();

    return {
      data: projects,
      meta: this.paginationService.getMeta(projectsCount, page, take),
    };
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
