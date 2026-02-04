import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import type { Request } from 'express';
import { ProjectQueryDto } from './dto/query-projects.dto';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ProjectsResponseDto } from './dto/response-project.dto';
import { CheckAbilities } from 'src/auth/decorators/check-abilities.decorator';

@ApiTags('Projects')
@ApiBearerAuth()
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create() {
    return this.projectsService.create();
  }

  @Get()
  @ApiOkResponse({ type: ProjectsResponseDto })
  async findAll(@Req() req: Request, @Query() query: ProjectQueryDto) {
    const projects = await this.projectsService.findAll(req.user, query);
    return {
      projects: projects.data,
      meta: projects.meta,
    };
  }

  @Get(':id')
  @CheckAbilities('delete', 'project', (req) => req.params.id)
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string) {
    return this.projectsService.update(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectsService.remove(+id);
  }
}
