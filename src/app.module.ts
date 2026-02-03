import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TelemetryModule } from './telemetry/telemetry.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        // Usamos la URL completa porque Neon ya incluye SSL y parámetros en ella
        url: config.get<string>('DATABASE_URL'), 
        autoLoadEntities: true,
        synchronize: true, // ¡Ojo! En producción real se usan migraciones, pero para este proyecto está perfecto
        ssl: {
          rejectUnauthorized: false, // Esto permite la conexión segura con Neon
        },
      }),
    }),
    TelemetryModule,
  ],
})
export class AppModule {}