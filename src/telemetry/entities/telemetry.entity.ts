import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, Index } from 'typeorm';
import { Vehicle } from './vehicle.entity';

@Entity('telemetry_logs')
export class Telemetry {
  @PrimaryGeneratedColumn()
  id: number;

  @Index() // Para que las gráficas de D3 carguen rápido
  @Column()
  type: string;

  @Column('float')
  value: number;

  @CreateDateColumn()
  timestamp: Date;

  @ManyToOne(() => Vehicle, (v) => v.telemetryHistory, { onDelete: 'CASCADE' })
  vehicle: Vehicle;
}