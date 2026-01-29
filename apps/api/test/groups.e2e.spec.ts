import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { GroupsController } from '../src/groups/groups.controller';
import { GroupsService } from '../src/groups/groups.service';
import { AuthGuard } from '../src/auth/auth.guard';

const groupsServiceMock = {
  listGroupsForUser: jest.fn().mockResolvedValue([{ id: 'g1', name: 'Friends' }])
};

const authGuardMock = {
  canActivate: jest.fn((context) => {
    const request = context.switchToHttp().getRequest();
    request.user = { id: 'user-1' };
    return true;
  })
};

const describeE2E = process.env.RUN_E2E === 'true' ? describe : describe.skip;

describeE2E('GroupsController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [GroupsController],
      providers: [
        { provide: GroupsService, useValue: groupsServiceMock },
        { provide: AuthGuard, useValue: authGuardMock }
      ]
    })
      .overrideGuard(AuthGuard)
      .useValue(authGuardMock)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /groups returns groups', async () => {
    await request(app.getHttpServer()).get('/groups').expect(200).expect([
      { id: 'g1', name: 'Friends' }
    ]);
  });
});
