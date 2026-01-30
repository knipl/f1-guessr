import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RacesController } from './races.controller';
import { RacesService } from './races.service';
import { OpenF1Service } from '../openf1/openf1.service';

@Module({
  controllers: [RacesController],
  providers: [RacesService, PrismaService, OpenF1Service]
})
export class RacesModule {}
