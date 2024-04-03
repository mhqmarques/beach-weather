import { ForecastPoint, StormGlassClient } from '@src/clients/stormGlassClient';
import { InternalError } from '@src/util/errors/internal-error';

export enum BeachPosition {
  S = 'S',
  E = 'E',
  W = 'W',
  N = 'N',
}

export interface Beach {
  name: string;
  position: BeachPosition;
  lat: number;
  lng: number;
  user: string;
}

export interface BeachForecast extends Omit<Beach, 'user'>, ForecastPoint {}

export interface TimeForecast {
  time: string;
  forecast: BeachForecast[];
}

export class ForecastProcessingInternalError extends InternalError {
  constructor(message: string) {
    super(`Unexpected error during the forecast processing: ${message}`);
  }
}

export class ForecastService {
  constructor(protected stormGlass = new StormGlassClient()) {}

  public async processForecastForBeaches(
    beaches: Beach[]
  ): Promise<TimeForecast[]> {
    const pointsWithCorrectSources: BeachForecast[] = [];

    try {
      for (const beach of beaches) {
        const { lat, lng } = beach;
        const points = await this.stormGlass.fetchPoints(lat, lng);
        const enrichedBeachData = this.enrichedBeachData(points, beach);
        pointsWithCorrectSources.push(...enrichedBeachData);
      }
      return this.mapForecastByTime(pointsWithCorrectSources);
    } catch (error) {
      const err = error as Error;
      throw new ForecastProcessingInternalError(err.message);
    }
  }

  private mapForecastByTime(forecast: BeachForecast[]): TimeForecast[] {
    const forecastByTime: TimeForecast[] = [];
    for (const point of forecast) {
      const timePoint = forecastByTime.find((f) => f.time === point.time);
      if (timePoint) {
        timePoint.forecast.push(point);
      } else {
        forecastByTime.push({
          time: point.time,
          forecast: [point],
        });
      }
    }
    return forecastByTime;
  }

  private enrichedBeachData(
    points: ForecastPoint[],
    beach: Beach
  ): BeachForecast[] {
    const { lat, lng, name, position } = beach;
    return points.map((point) => ({
      ...point,
      lat,
      lng,
      name,
      position,
      rating: 1,
    }));
  }
}
