import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthUser } from '../auth/jwt';
import { AdminService } from './admin.service';

interface ResultBody {
  positions: string[];
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
}
