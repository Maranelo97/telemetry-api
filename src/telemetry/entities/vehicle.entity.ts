import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { Telemetry } from './telemetry.entity';
import { Biometrics } from './biometrics.entity';


export type EngineModelType = 'generic' | 'mazda' | 'truck';

@Entity('vehicles')
export class Vehicle {
  @PrimaryColumn()
  unitId: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: ['generic', 'mazda', 'truck'],
    default: 'generic'
  })
  modelEngine: EngineModelType;

  @Column({ default: 'OPTIMAL' })
  status: string;

  @Column('float', { default: 0 })
  powerLevel: number;

  //Location Data
  @Column('float', { nullable: true })
  lastLat: number;

  @Column('float', { nullable: true })
  lastLng: number;

  @OneToMany(() => Telemetry, (t) => t.vehicle)
  telemetryHistory: Telemetry[];

  @OneToMany(() => Biometrics, (b) => b.vehicle)
  biometricsHistory: Biometrics[];
}
