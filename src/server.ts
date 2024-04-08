import './util/module-alias';

import { BeachesController } from './controllers/beaches';
import { ForecastController } from './controllers/forecast';
import { Server } from '@overnightjs/core';
import * as database from '@src/database';
import bodyParser from 'body-parser';
import { Application } from 'express';

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
  }

  private setupControllers(): void {
    const forecastController = new ForecastController();
    const beachesController = new BeachesController();
    this.addControllers([forecastController, beachesController]);
  }

  private async setupDatabase(): Promise<void> {
    await database.connect();
  }

  public async close(): Promise<void> {
    await database.close();
  }

  public getApp(): Application {
    return this.app;
  }
}
