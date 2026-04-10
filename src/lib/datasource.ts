import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Calculation } from '../entities/Calculation';
import path from 'path';

const dbPath = path.join(process.cwd(), 'database.sqlite');

let AppDataSource: DataSource | null = null;

export async function getDataSource(): Promise<DataSource> {
  if (AppDataSource && AppDataSource.isInitialized) {
    return AppDataSource;
  }

  AppDataSource = new DataSource({
    type: 'better-sqlite3',
    database: dbPath,
    synchronize: true,
    logging: false,
    entities: [Calculation],
  });

  await AppDataSource.initialize();
  return AppDataSource;
}
