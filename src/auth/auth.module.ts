import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { AuthGuard } from './guards/auth.guard';
import { ClerkModule } from 'src/clerk/clerk.module';
import { AbilitiesGuard } from './guards/abilities.guard';
import { CaslAbilityFactory } from './factories/casl-ability.factory';

@Module({
  imports: [UsersModule, ClerkModule],
  providers: [AbilitiesGuard, AuthGuard, CaslAbilityFactory],
  exports: [AuthGuard, AbilitiesGuard, CaslAbilityFactory],
})
export class AuthModule {}
