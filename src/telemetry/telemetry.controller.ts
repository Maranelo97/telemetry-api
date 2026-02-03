import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { TelemetryService } from './telemetry.service';
import { EngineModelType } from './entities/vehicle.entity';

@Controller('telemetry')
export class TelemetryController {
  constructor(private readonly telemetryService: TelemetryService) {}

  @Get('fleet')
  async getFleetStatus() {
    return await this.telemetryService.getAllVehiclesStatus();
  }

  @Get('status/:unitId')
  async getStatus(@Param('unitId') unitId: string) {
    // Este método del service ya dispara el WebSocket y graba en Postgres
    return await this.telemetryService.getUnifiedData(unitId);
  }
  @Post('register')
  async registerVehicle(
    @Body()
    vehicleData: {
      unitId: string;
      name: string;
      modelEngine: EngineModelType;
    },
  ) {
    return await this.telemetryService.createVehicle(vehicleData);
  }
}
