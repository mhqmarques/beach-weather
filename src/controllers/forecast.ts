import { Controller, Get } from '@overnightjs/core';
import { Beach } from '@src/models/beach';
import { ForecastService } from '@src/services/forecastService';
import { Request, Response } from 'express';

const forecast = new ForecastService();
@Controller('forecast')
export class ForecastController {
  @Get('')
  public async getForecastForLoggedUser(
    _: Request,
    res: Response
  ): Promise<void> {
    try {
      const beaches = await Beach.find({});
      const forecastForBeaches =
        await forecast.processForecastForBeaches(beaches);
      res.status(200).send(forecastForBeaches);
    } catch (error) {
      // console.error(error);
      res.status(500).send(JSON.stringify({ error: 'Something went wrong' }));
    }
  }
}
