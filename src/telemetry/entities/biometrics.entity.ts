import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Vehicle } from './vehicle.entity';

@Entity('biometrics_logs')
export class Biometrics {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  driverId: string;

  @Column('float', { nullable: true }) // Agregamos nullable
  attentionLevel: number;

  @Column('float', { nullable: true }) 
  avgHRV: number;

  @Column('float', { nullable: true })
  blinkRate: number;

  @Column({ nullable: true })
  stressZone: string; 

  @Column('float', { nullable: true })
  cervicalLoad: number;

  @Column('jsonb', { nullable: true })
  gForce: { x: number; y: number };

  @CreateDateColumn()
  timestamp: Date;

  @ManyToOne(() => Vehicle, (v) => v.biometricsHistory)
  vehicle: Vehicle;
}