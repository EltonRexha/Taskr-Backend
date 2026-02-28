import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { ClerkModule } from 'src/clerk/clerk.module';
import { AbilitiesGuard } from './guards/abilities.guard';
import { CaslAbilityFactory } from './factories/casl-ability.factory';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [RedisModule, UsersModule, ClerkModule],
  providers: [AbilitiesGuard, CaslAbilityFactory],
  exports: [AbilitiesGuard, CaslAbilityFactory],
})
export class CaslModule {}
