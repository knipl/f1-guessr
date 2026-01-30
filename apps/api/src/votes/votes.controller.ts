import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthUser } from '../auth/jwt';
import { VotesService } from './votes.service';

interface VoteBody {
  raceId: string;
  groupId: string;
  ranking: string[];
}

@Controller('votes')
@UseGuards(AuthGuard)
export class VotesController {
  constructor(private readonly votesService: VotesService) {}

  @Get('me')
  getMyVote(
    @CurrentUser() user: AuthUser,
    @Query('raceId') raceId: string,
    @Query('groupId') groupId: string
  ) {
    return this.votesService.getVote(user.id, raceId, groupId);
  }

  @Post()
  submitVote(@CurrentUser() user: AuthUser, @Body() body: VoteBody) {
    return this.votesService.submitVote(user.id, body.raceId, body.groupId, body.ranking);
  }
}
