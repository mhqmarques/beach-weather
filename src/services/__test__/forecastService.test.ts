import {
  ForecastProcessingInternalError,
  ForecastService,
} from '../forecastService';
import { StormGlassClient } from '@src/clients/stormGlassClient';
import { Beach, BeachPosition } from '@src/models/beach';
import stormGlassNormalizedResponseFixture from '@test/fixtures/stormglass_normalized_response_3_hours.json';

jest.mock('@src/clients/stormGlassClient');

describe('Forecast Service', () => {
  const mockedStormGlassClient =
    new StormGlassClient() as jest.Mocked<StormGlassClient>;

  it('Shoud return the forecast for a list of beaches', async () => {
    mockedStormGlassClient.fetchPoints.mockResolvedValue(
      stormGlassNormalizedResponseFixture
    );

    const beachesExample: Beach[] = [
      {
        lat: -33.792726,
        lng: 151.289824,
        name: 'Manly',
        position: BeachPosition.E,
        user: 'some-id',
      },
    ];

    const expectedResponse = [
      {
        time: '2024-03-23T00:00:00+00:00',
        forecast: [
          {
            lat: -33.792726,
            lng: 151.289824,
            name: 'Manly',
            position: 'E',
            rating: 1,
            swellDirection: 185.07,
            swellHeight: 0.43,
            swellPeriod: 4.93,
            time: '2024-03-23T00:00:00+00:00',
            waveDirection: 219.84,
            waveHeight: 0.76,
            windDirection: 264.71,
            windSpeed: 6.8,
          },
        ],
      },
      {
        time: '2024-03-23T01:00:00+00:00',
        forecast: [
          {
            lat: -33.792726,
            lng: 151.289824,
            name: 'Manly',
            position: 'E',
            rating: 1,
            swellDirection: 185.57,
            swellHeight: 0.41,
            swellPeriod: 4.96,
            time: '2024-03-23T01:00:00+00:00',
            waveDirection: 222.75,
            waveHeight: 0.75,
            windDirection: 265.04,
            windSpeed: 6.72,
          },
        ],
      },
    ];

    const forecast = new ForecastService(mockedStormGlassClient);
    const beachesWithRating =
      await forecast.processForecastForBeaches(beachesExample);

    expect(beachesWithRating).toEqual(expectedResponse);
  });

  it('Should return an empty list when the beaches array is empty', async () => {
    const forecast = new ForecastService();
    const response = await forecast.processForecastForBeaches([]);
    expect(response).toEqual([]);
  });

  it('Should throw internal processing error when something goes wrong during the rating process', async () => {
    const beachesExample: Beach[] = [
      {
        lat: -33.792726,
        lng: 151.289824,
        name: 'Manly',
        position: BeachPosition.E,
        user: 'some-id',
      },
    ];

    mockedStormGlassClient.fetchPoints.mockRejectedValue('Error fetching data');
    const forecast = new ForecastService(mockedStormGlassClient);
    await expect(
      forecast.processForecastForBeaches(beachesExample)
    ).rejects.toThrow(ForecastProcessingInternalError);
  });
});
