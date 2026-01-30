import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VotesController } from './votes.controller';
import { VotesService } from './votes.service';

@Module({
  controllers: [VotesController],
  providers: [VotesService, PrismaService]
})
export class VotesModule {}
