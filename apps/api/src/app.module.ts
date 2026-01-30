import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { GroupsModule } from './groups/groups.module';
import { RacesModule } from './races/races.module';
import { VotesModule } from './votes/votes.module';
import { AdminModule } from './admin/admin.module';

@Module({
  controllers: [HealthController],
  imports: [GroupsModule, RacesModule, VotesModule, AdminModule]
})
export class AppModule {}
