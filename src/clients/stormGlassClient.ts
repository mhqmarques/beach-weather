import { InternalError } from '@src/util/errors/internal-error';
import { AxiosStatic } from 'axios';
import config, { IConfig } from 'config';

export interface StormGlassPointSource {
  [key: string]: number;
}

export interface StormGlassPoint {
  readonly time: string;
  readonly swellDirection: StormGlassPointSource;
  readonly swellHeight: StormGlassPointSource;
  readonly swellPeriod: StormGlassPointSource;
  readonly waveDirection: StormGlassPointSource;
  readonly waveHeight: StormGlassPointSource;
  readonly windDirection: StormGlassPointSource;
  readonly windSpeed: StormGlassPointSource;
}

export interface StormGlassForecastResponse {
  hours: StormGlassPoint[];
}

export interface ForecastPoint {
  time: string;
  swellDirection: number;
  swellHeight: number;
  swellPeriod: number;
  waveDirection: number;
  waveHeight: number;
  windDirection: number;
  windSpeed: number;
}

const StormGlassResourceConfig: IConfig = config.get(
  'App.resources.StormGlass'
);

export class ClientRequestError extends InternalError {
  constructor(message: string) {
    const internalMessage =
      'Unexpected error when trying to communicate to StormGlass';
    super(`${internalMessage}: ${message}`);
  }
}

export class StormGlassResponseError extends InternalError {
  constructor(message: string) {
    const internalMessage =
      'Unexpected error returned by the StormGlass service';
    super(`${internalMessage}: ${message}`);
  }
}

export class StormGlassClient {
  constructor(protected resquestService: AxiosStatic) {}

  readonly stormGlassAPIParams =
    'swellDirection,swellHeight,swellPeriod,waveDirection,waveHeight,windDirection,windSpeed';
  readonly stormGlassAPISource = 'noaa';

  public async fetchPoints(lat: number, lng: number): Promise<ForecastPoint[]> {
    try {
      const response =
        await this.resquestService.get<StormGlassForecastResponse>(
          `${StormGlassResourceConfig.get('apiUrl')}/weather/point?lat=${lat}&lng=${lng}&params=${this.stormGlassAPIParams}&source=${this.stormGlassAPISource}`,
          {
            headers: {
              Authorization: StormGlassResourceConfig.get('apiToken'),
            },
          }
        );
      return this.normalizedResponse(response.data);
    } catch (error) {
      const err = error as any;
      if (err?.response && err?.response?.status) {
        throw new StormGlassResponseError(
          `Error: ${JSON.stringify(err.response.data)} Code: ${err.response.status}`
        );
      }
      throw new ClientRequestError(err.message);
    }
  }

  // check the necessity of move this method to a specific class (cohesive)
  private normalizedResponse(
    points: StormGlassForecastResponse
  ): ForecastPoint[] {
    return points.hours.filter(this.isValidPoint.bind(this)).map((point) => ({
      time: point.time,
      swellDirection: point.swellDirection[this.stormGlassAPISource],
      swellHeight: point.swellHeight[this.stormGlassAPISource],
      swellPeriod: point.swellPeriod[this.stormGlassAPISource],
      waveDirection: point.waveDirection[this.stormGlassAPISource],
      waveHeight: point.waveHeight[this.stormGlassAPISource],
      windDirection: point.windDirection[this.stormGlassAPISource],
      windSpeed: point.windSpeed[this.stormGlassAPISource],
    }));
  }

  // check the necessity of move this method to a specific class (cohesive
  private isValidPoint(point: Partial<StormGlassPoint>): boolean {
    return !!(
      point.time &&
      point.swellDirection?.[this.stormGlassAPISource] &&
      point.swellHeight?.[this.stormGlassAPISource] &&
      point.swellPeriod?.[this.stormGlassAPISource] &&
      point.waveDirection?.[this.stormGlassAPISource] &&
      point.waveHeight?.[this.stormGlassAPISource] &&
      point.windDirection?.[this.stormGlassAPISource] &&
      point.windSpeed?.[this.stormGlassAPISource]
    );
  }
}
