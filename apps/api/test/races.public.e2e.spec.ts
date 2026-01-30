import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { RacesController } from '../src/races/races.controller';
import { RacesService } from '../src/races/races.service';

const describeE2E = process.env.RUN_E2E === 'true' ? describe : describe.skip;

const racesServiceMock = {
  getNextRace: jest.fn().mockResolvedValue({ id: 'race-1', name: 'Next GP' })
};

describeE2E('RacesController public (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [RacesController],
      providers: [{ provide: RacesService, useValue: racesServiceMock }]
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /races/next is public', async () => {
    await request(app.getHttpServer()).get('/races/next').expect(200);
  });
});
