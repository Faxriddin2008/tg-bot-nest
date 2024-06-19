import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { TelegrafModule } from 'nestjs-telegraf';
import * as LocalSession from 'telegraf-session-local';
import { TG_TOKEN } from './config';
import { AppUpdate } from './app.update';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { TaskEntity } from './task.entity';
const sessions = new LocalSession({ database: 'session_db.json' });

@Module({
  imports: [
    TelegrafModule.forRoot({
      middlewares: [sessions.middleware()],
      token: TG_TOKEN,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      database: 'todo-app-tg-bot',
      username: 'postgres',
      password: '@Fede2008',
      entities: [join(__dirname, '**', '*.entity.{ts,js}')],
      migrations: [join(__dirname, '**', '*.migration.{ts,js}')],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([TaskEntity]),
  ],
  providers: [AppService, AppUpdate],
})
export class AppModule {}
