import 'reflect-metadata';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Calculation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('float')
  num1!: number;

  @Column('float')
  num2!: number;

  @Column()
  operator!: string;

  @Column()
  result!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
