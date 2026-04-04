import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';

export const typeOrmAsyncConfig: TypeOrmModuleAsyncOptions = {
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const host = configService.get('POSTGRES_HOST', 'localhost');
    const port = configService.get('POSTGRES_PORT', '5432');
    const username = configService.get('POSTGRES_USER', 'postgres');
    const password = configService.get('POSTGRES_PASSWORD', 'your_password');
    const database = configService.get('POSTGRES_DB', 'my_project_db');

    return {
      type: 'postgres',
      host,
      port: parseInt(port, 10),
      username,
      password,
      database,
      autoLoadEntities: true,
      synchronize: true,
    };
  },
};
