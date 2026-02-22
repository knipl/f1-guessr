import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { RaceStatus, SessionType } from '@prisma/client';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthUser } from '../auth/jwt';
import { AdminService } from './admin.service';

interface ResultBody {
  positions: string[];
}

interface SessionBody {
  type: SessionType;
  startTime: string;
}

interface RaceBody {
  season: number;
  round: number;
  name: string;
  circuit: string;
  q1StartTime: string;
  raceStartTime: string;
  status?: RaceStatus;
}

interface RaceUpdateBody {
  season?: number;
  round?: number;
  name?: string;
  circuit?: string;
  q1StartTime?: string;
  raceStartTime?: string;
  status?: RaceStatus;
}

interface GroupBody {
  name: string;
}

@Controller('admin')
@UseGuards(AuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('races/:raceId/results')
  setResults(
    @CurrentUser() user: AuthUser,
    @Param('raceId') raceId: string,
    @Body() body: ResultBody
  ) {
    return this.adminService.setRaceResults(raceId, body.positions, user.email);
  }

  @Get('races')
  listRaces(@CurrentUser() user: AuthUser) {
    return this.adminService.listRaces(user.email);
  }

  @Post('races')
  createRace(@CurrentUser() user: AuthUser, @Body() body: RaceBody) {
    return this.adminService.createRace(body, user.email);
  }

  @Patch('races/:raceId')
  updateRace(
    @CurrentUser() user: AuthUser,
    @Param('raceId') raceId: string,
    @Body() body: RaceUpdateBody
  ) {
    return this.adminService.updateRace(raceId, body, user.email);
  }

  @Delete('races/:raceId')
  deleteRace(@CurrentUser() user: AuthUser, @Param('raceId') raceId: string) {
    return this.adminService.deleteRace(raceId, user.email);
  }

  @Post('groups/:groupId/invites')
  createInvite(@CurrentUser() user: AuthUser, @Param('groupId') groupId: string) {
    return this.adminService.createGroupInvite(groupId, user.email);
  }

  @Post('groups')
  createGroup(@CurrentUser() user: AuthUser, @Body() body: GroupBody) {
    return this.adminService.createGroup(body.name, user.id, user.email, user.email);
  }

  @Post('races/:raceId/sessions')
  setSession(
    @CurrentUser() user: AuthUser,
    @Param('raceId') raceId: string,
    @Body() body: SessionBody
  ) {
    return this.adminService.setRaceSession(raceId, body.type, body.startTime, user.email);
  }

  @Get('races/:raceId/sessions')
  listSessions(@CurrentUser() user: AuthUser, @Param('raceId') raceId: string) {
    return this.adminService.listRaceSessions(raceId, user.email);
  }
}
