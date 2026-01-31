import { Injectable } from '@nestjs/common';
import { OpenF1Service } from '../openf1/openf1.service';

export interface DriverInfo {
  name: string;
  number: number;
  team: string | null;
}

@Injectable()
export class DriversService {
  constructor(private readonly openF1Service: OpenF1Service) {}

  async listDrivers() {
    return this.openF1Service.fetchDrivers();
  }
}
