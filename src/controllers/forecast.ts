import { BaseController } from '.';
import { ClassMiddleware, Controller, Get } from '@overnightjs/core';
import logger from '@src/logger';
import { authMiddleware } from '@src/middlewares/authMiddleware';
import { Beach } from '@src/models/beach';
import { ForecastService } from '@src/services/forecastService';
import { Request, Response } from 'express';

const forecast = new ForecastService();
@Controller('forecast')
@ClassMiddleware(authMiddleware)
export class ForecastController extends BaseController {
  @Get('')
  public async getForecastForLoggedUser(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const beaches = await Beach.find({ user: req.decoded?.id });
      const forecastForBeaches =
        await forecast.processForecastForBeaches(beaches);
      res.status(200).send(forecastForBeaches);
    } catch (error) {
      logger.error(error);
      this.sendErrorResponse(res, {
        code: 500,
        message: 'Something went wrong',
      });
    }
  }
}
