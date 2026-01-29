import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { GroupsModule } from './groups/groups.module';

@Module({
  controllers: [HealthController],
  imports: [GroupsModule]
})
export class AppModule {}
