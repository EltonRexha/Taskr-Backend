import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { ClerkModule } from 'src/clerk/clerk.module';
import { AbilitiesGuard } from './guards/abilities.guard';
import { CaslAbilityFactory } from './factories/casl-ability.factory';

@Module({
  imports: [UsersModule, ClerkModule],
  providers: [AbilitiesGuard, CaslAbilityFactory],
  exports: [AbilitiesGuard, CaslAbilityFactory],
})
export class CaslModule {}
