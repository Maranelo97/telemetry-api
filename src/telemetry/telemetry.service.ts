import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { EngineModelType, Vehicle } from './entities/vehicle.entity';
import { Telemetry } from './entities/telemetry.entity';
import { Biometrics } from './entities/biometrics.entity';
import { TelemetryGateway } from './telemetry-gateway/telemetry.gateway';
import { getOscillatedValue } from './utils/oscilatorsValues';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TelemetryService implements OnModuleInit {
  constructor(
    @InjectRepository(Vehicle) private vehicleRepo: Repository<Vehicle>,
    @InjectRepository(Telemetry) private telemetryRepo: Repository<Telemetry>,
    @InjectRepository(Biometrics)
    private biometricsRepo: Repository<Biometrics>,
    private readonly httpService: HttpService,
    private readonly gateway: TelemetryGateway,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    setInterval(async () => {
      const vehicles = await this.vehicleRepo.find();
      for (const v of vehicles) {
        await this.getUnifiedData(v.unitId);
      }
      console.log(`🛰️ Fleet Sync: ${vehicles.length} units updated.`);
    }, 10000);
  }

  async getUnifiedData(unitId: string) {
    // 2. OBTENER DATOS REALES (Ejemplo con OpenWeather)
    // Usamos coordenadas fijas por ahora, luego vendrán de Smartcar
    const weather = await this.getRealWeather(-34.6037, -58.3816);

    // 3. CONSTRUIR EL PAYLOAD (Cumpliendo tus interfaces)
    const payload = {
      id: unitId,
      name: 'Vanguard Interceptor',
      status: 'OPTIMAL',
      metrics: {
        fuel: getOscillatedValue(40, 45, 0.01), // Casi real
        temp: weather.temp + 55, // Temp ambiente + motor
        speed: getOscillatedValue(80, 120, 0.5),
        rpm: getOscillatedValue(2500, 4000, 0.8),
      },
      biometrics: {
        attentionLevel: getOscillatedValue(85, 98, 0.05),
        blinkRate: Math.round(getOscillatedValue(12, 18, 0.1)),
        cervicalLoad: getOscillatedValue(7.0, 7.5, 0.02),
      },
      location: { lat: -34.6037, lng: -58.3816 },
    };

    // 4. GUARDAR EN REDIS (TTL de 2 segundos para no saturar APIs)

    // 5. PERSISTIR EN POSTGRES (Asíncrono para no bloquear)
    this.persistToPostgres(unitId, payload);

    // 6. DISPARAR WEBSOCKET
    this.gateway.sendUpdate(unitId, payload);

    return payload;
  }

  private async getRealWeather(lat: number, lon: number) {
    try {
      // Necesitarás tu API KEY de OpenWeather
      const apiKey = '9fe3148cbefa91228b0ee214359ff8e7';
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
      const { data } = await firstValueFrom(this.httpService.get(url));
      return { temp: data.main.temp };
    } catch (e) {
      return { temp: 20, e }; // Fallback si la API falla
    }
  }

  private async persistToPostgres(unitId: string, data: any) {
    try {
      // 1. Verificamos si el vehículo existe
      let vehicle = await this.vehicleRepo.findOne({ where: { unitId } });

      if (!vehicle) {
        console.log(`⚠️ Vehicle ${unitId} not found. Creating it now...`);
        vehicle = await this.vehicleRepo.save({
          unitId,
          name: 'Vanguard Interceptor',
          modelEngine: 'generic',
          status: data.status || 'OPTIMAL',
          powerLevel: 100,
          lastLat: data.location.lat,
          lastLng: data.location.lng,
        });
      } else {
        // 2. SI YA EXISTE: Actualizamos su ubicación y estado actual en la tabla maestra
        // Esto es lo que hacía que antes vieras "null" en el fleet
        await this.vehicleRepo.update(unitId, {
          lastLat: data.location.lat,
          lastLng: data.location.lng,
          status: data.status || 'OPTIMAL',
        });
      }

      // 3. Guardamos los LOGS históricos (lo que crece con el tiempo para las gráficas)
      await Promise.all([
        this.telemetryRepo.save({
          type: 'engine_temp',
          value: data.metrics.temp,
          vehicle: { unitId },
        }),
        this.biometricsRepo.save({
          driverId: data.biometrics.driverId || 'DRIVER-01',
          attentionLevel: data.biometrics.attentionLevel,
          avgHRV: data.biometrics.avgHRV || 65,
          blinkRate: data.biometrics.blinkRate,
          cervicalLoad: data.biometrics.cervicalLoad,
          stressZone: data.biometrics.stressZone || 'OPTIMAL',
          gForce: data.biometrics.gForce || { x: 0, y: 0 },
          vehicle: { unitId },
        }),
      ]);
    } catch (error) {
      console.error('❌ Error persisting to Postgres:', error.message);
    }
  }

  async getAllVehiclesStatus() {
    const vehicles = await this.vehicleRepo.find();

    return await Promise.all(
      vehicles.map(async (v) => {
        // 1. Buscamos el objeto vivo en Redis

        // Si no hay nada en Redis, devolvemos el vehículo base
        return {
          ...v,
          currentMetrics: null,
        };
      }),
    );
  }

  async createVehicle(data: {
    unitId: string;
    name: string;
    modelEngine: EngineModelType;
  }) {
    const existing = await this.vehicleRepo.findOne({
      where: { unitId: data.unitId },
    });
    if (existing) return existing;

    // Usamos el "data" que ya viene con el tipo correcto desde el controlador
    const newVehicle = this.vehicleRepo.create({
      unitId: data.unitId,
      name: data.name,
      modelEngine: data.modelEngine, // Ahora TS está feliz porque coinciden los tipos
      status: 'OPTIMAL',
      powerLevel: 100,
    });

    const savedVehicle = await this.vehicleRepo.save(newVehicle);
    await this.getUnifiedData(savedVehicle.unitId);

    return savedVehicle;
  }
}
