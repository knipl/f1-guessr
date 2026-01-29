import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthUser } from '../auth/jwt';
import { GroupsService } from './groups.service';

@Controller()
@UseGuards(AuthGuard)
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get('/groups')
  async listGroups(@CurrentUser() user: AuthUser) {
    return this.groupsService.listGroupsForUser(user.id);
  }

  @Post('/invites/:token/join')
  async joinGroup(@CurrentUser() user: AuthUser, @Param('token') token: string) {
    return this.groupsService.joinByInvite(user.id, token);
  }
}
