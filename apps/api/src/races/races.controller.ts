import { Controller, Get, Param, Query } from '@nestjs/common';
import { RacesService } from './races.service';

@Controller('races')
export class RacesController {
  constructor(private readonly racesService: RacesService) {}

  @Get()
  listRaces() {
    return this.racesService.listRaces();
  }

  @Get('next')
  getNextRace() {
    return this.racesService.getNextRace();
  }


  @Get(':raceId/results')
  getResults(@Param('raceId') raceId: string, @Query('groupId') groupId: string) {
    return this.racesService.getGroupResults(raceId, groupId);
  }

  @Get('standings')
  getStandings(@Query('groupId') groupId: string) {
    return this.racesService.getSeasonStandings(groupId);
  }
}
