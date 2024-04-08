import { Beach, BeachPosition } from '@src/models/beach';
import nock from 'nock';
import stormGlassWeather3HoursFixture from '@test/fixtures/stormglass_weather_3_hours.json';
import apiForecastResponse1BeacheFixuture from '@test/fixtures/api_forecast_response_1_beach.json';

describe('Beach functional test', () => {
  beforeEach(async () => {
    await Beach.deleteMany({});
    const defaultBeach = {
      lat: -33.79276,
      lng: 151.289824,
      name: 'Manly',
      position: BeachPosition.E,
    };
    const beach = new Beach(defaultBeach);
    await beach.save();
  });
  it('should return a forecast with just a few times', async () => {
    nock('https://api.stormglass.io:443', {
      encodedQueryParams: true,
      reqheaders: {
        Authorization: (): boolean => true,
      },
    })
      .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
      .get('/v2/weather/point')
      .query({
        lat: '-33.79276',
        lng: '151.289824',
        params: /(.*)/,
        source: 'noaa',
      })
      .reply(200, stormGlassWeather3HoursFixture);
    const { body, status } = await globalThis.testRequest.get('/forecast');
    expect(status).toBe(200);
    expect(body).toEqual(apiForecastResponse1BeacheFixuture);
  });
  it('Should return status 500 if something goes wrong during the processing', async () => {
    nock('https://api.stormglass.io:443', {
      encodedQueryParams: true,
      reqheaders: {
        Authorization: (): boolean => true,
      },
    })
      .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
      .get('/v2/weather/point')
      .query({
        lat: '-33.79276',
        lng: '151.289824',
        params: /(.*)/,
        source: 'noaa',
      })
      .replyWithError('Something went wrong');

    const { status } = await globalThis.testRequest.get('/forecast');
    expect(status).toBe(500);
  });
});
