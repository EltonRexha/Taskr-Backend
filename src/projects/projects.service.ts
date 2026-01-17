import { Injectable } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { User } from '@clerk/backend';
import { DatabaseService } from 'src/database/database.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PaginatedService } from 'src/common/services/pagination.service';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: DatabaseService,
    private readonly paginationService: PaginatedService,
  ) {}

  create(createProjectDto: CreateProjectDto) {
    return 'This action adds a new project';
  }

  async findAll(clerkUser: User, paginationDto: PaginationDto) {
    const { skip, take } = this.paginationService.getPagination(paginationDto);

    try {
      const projects = await this.prisma.project.findMany({
        where: { userClerkId: clerkUser.id },
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
