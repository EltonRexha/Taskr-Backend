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
  UseInterceptors,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import type { Request } from 'express';
import { ProjectQueryDto } from './dto/query-projects.dto';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ProjectsResponseDto } from './dto/response-project.dto';
import { CanList } from 'src/casl/decorators/check-abilities.decorator';
import { CustomCacheInterceptor } from 'src/common/interceptors/custom-cache.interceptor';

@ApiTags('Projects')
@ApiBearerAuth()
@Controller('projects')
@UseInterceptors(CustomCacheInterceptor)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create() {
    return this.projectsService.create();
  }

  @Get()
  @CanList('PROJECT')
  @ApiOkResponse({ type: ProjectsResponseDto })
  async findAll(@Req() req: Request, @Query() query: ProjectQueryDto) {
    const projects = await this.projectsService.findAll(req.user, query);
    return {
      projects: projects.data,
      metadata: projects.meta,
    };
  }

  @Get(':id')
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
