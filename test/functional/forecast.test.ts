import { Beach, Position } from '@src/models/beach';
import { User } from '@src/models/user';
import { AuthService } from '@src/services/authService';
import apiForecastResponse1BeacheFixuture from '@test/fixtures/api_forecast_response_1_beach.json';
import stormGlassWeather3HoursFixture from '@test/fixtures/stormglass_weather_3_hours.json';
import nock from 'nock';

describe('Beach functional test', () => {
  const defaultUser = {
    name: 'Don Corleone',
    email: 'corleone@mail.com',
    password: '1234',
  };
  let token: string;
  beforeEach(async () => {
    await Beach.deleteMany({});
    await User.deleteMany({});
    const user = await new User(defaultUser).save();
    const defaultBeach = {
      lat: -33.79276,
      lng: 151.289824,
      name: 'Manly',
      position: Position.E,
      user: user.id,
    };
    await new Beach(defaultBeach).save();
    token = AuthService.generateToken(user.toJSON());
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
    const { body, status } = await globalThis.testRequest
      .get('/forecast')
      .set({ 'x-access-token': token });
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

    const { status } = await globalThis.testRequest
      .get('/forecast')
      .set({ 'x-access-token': token });
    expect(status).toBe(500);
  });
});
