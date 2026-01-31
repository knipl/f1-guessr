import { DriversService } from './drivers.service';

const openF1Mock = {
  fetchDrivers: jest.fn().mockResolvedValue([{ name: 'Verstappen', number: 1, team: 'Red Bull' }])
};

describe('DriversService', () => {
  const service = new DriversService(openF1Mock as any);

  it('returns drivers from OpenF1', async () => {
    const drivers = await service.listDrivers();

    expect(drivers).toEqual([{ name: 'Verstappen', number: 1, team: 'Red Bull' }]);
  });
});
