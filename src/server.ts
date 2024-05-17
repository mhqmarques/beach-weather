import './util/module-alias';

import { ExitedStatus } from '.';
import { BeachesController } from './controllers/beaches';
import { ForecastController } from './controllers/forecast';
import { UsersController } from './controllers/users';
import logger from './logger';
import { Server } from '@overnightjs/core';
import * as database from '@src/database';
import bodyParser from 'body-parser';
import cors from 'cors';
import { Application } from 'express';
import pinoHttp from 'pino-http';
export class SetupServer extends Server {
  constructor(private port = 3000) {
    super();
  }

  public async initServer(): Promise<void> {
    this.setupExpress();
    this.setupControllers();
    await this.setupDatabase();
  }

  private setupExpress(): void {
    this.app.use(bodyParser.json());
    this.app.use(
      cors({
        origin: '*',
      })
    );
    if (globalThis.nodeEnv === 'production') {
      this.app.use(pinoHttp());
    }
  }

  private setupControllers(): void {
    const forecastController = new ForecastController();
    const beachesController = new BeachesController();
    const usersController = new UsersController();
    this.addControllers([
      forecastController,
      beachesController,
      usersController,
    ]);
  }

  private async setupDatabase(): Promise<void> {
    await database.connect();
  }

  public getApp(): Application {
    return this.app;
  }

  public async close(): Promise<void> {
    await database.close();
  }

  public listen(): void {
    process.on('unhandledRejection', (promise, reason) => {
      logger.error(
        `App exiting due to an unhandled promise: ${promise} and reason: ${reason}`
      );
      throw reason;
    });

    process.on('uncaughtException', (error) => {
      logger.error(`App exiting due to an uncaught exception: ${error}`);
      process.exit(ExitedStatus.Failure);
    });
  }

  public start(): void {
    this.app.listen(this.port, () => {
      logger.info(
        `Server listening on port ${this.port} running in ${process.env.NODE_ENV} environment`
      );
    });
  }
}
