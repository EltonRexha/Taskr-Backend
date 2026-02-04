// src/guards/abilities.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CaslAbilityFactory } from '../factories/casl-ability.factory';
import {
  AbilityCheck,
  CHECK_ABILITY,
} from '../decorators/check-abilities.decorator';
import { DatabaseService } from 'src/database/database.service';
import { Request } from 'express';
import { ProjectMember } from 'prisma/generated/prisma/client';

@Injectable()
export class AbilitiesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: DatabaseService,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const abilityCheck = this.reflector.get<AbilityCheck>(
      CHECK_ABILITY,
      context.getHandler(),
    );

    if (!abilityCheck) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user;

    // Controller tells us how to get projectId
    const projectId = abilityCheck.getProjectId
      ? await abilityCheck.getProjectId(request)
      : undefined;

    let projectMember: ProjectMember | null = null;

    if (projectId) {
      // Get user's project membership
      projectMember = await this.prisma.projectMember.findFirst({
        where: {
          projectId,
          userClerkId: user.clerkId,
        },
      });
    }

    console.log({ abilityCheck });

    // Create CASL ability for this user in this project
    const ability = this.caslAbilityFactory.createForUser(
      user,
      projectMember ?? undefined,
    );

    // Check permission using CASL
    if (!ability.can(abilityCheck.action, abilityCheck.subject)) {
      throw new ForbiddenException(
        `You cannot ${abilityCheck.action} ${abilityCheck.subject}`,
      );
    }

    return true;
  }
}
