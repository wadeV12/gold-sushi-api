import { Module } from '@nestjs/common';
import { pgDataSource } from './datasource';
// import { databaseProviders } from './database.provider';

@Module({
  imports: [pgDataSource],
  providers: [],
  exports: [],
})
export class DatabaseModule {}
