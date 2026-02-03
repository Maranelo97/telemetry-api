import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TelemetryService } from './telemetry.service';
import { TelemetryController } from './telemetry.controller';
import { TelemetryGateway } from './telemetry-gateway/telemetry.gateway';
import { Vehicle } from './entities/vehicle.entity';
import { Telemetry } from './entities/telemetry.entity';
import { Biometrics } from './entities/biometrics.entity';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vehicle, Telemetry, Biometrics]),
    HttpModule,
  ],
  providers: [TelemetryService, TelemetryGateway],
  controllers: [TelemetryController],
})
export class TelemetryModule {}
