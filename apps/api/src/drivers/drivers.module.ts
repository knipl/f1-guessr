import { Module } from '@nestjs/common';
import { DriversController } from './drivers.controller';
import { DriversService } from './drivers.service';
import { OpenF1Service } from '../openf1/openf1.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [DriversController],
  providers: [DriversService, OpenF1Service, PrismaService]
})
export class DriversModule {}
