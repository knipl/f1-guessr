import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RacesController } from './races.controller';
import { RacesService } from './races.service';

@Module({
  controllers: [RacesController],
  providers: [RacesService, PrismaService]
})
export class RacesModule {}
