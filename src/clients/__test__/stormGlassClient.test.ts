import { StormGlassClient } from '@src/clients/stormGlassClient';
import stormglass_normalized_response_3_hours from '@test/fixtures/stormglass_normalized_response_3_hours.json';
import stormglass_weather_3_hours from '@test/fixtures/stormglass_weather_3_hours.json';
import axios from 'axios';

jest.mock('axios');

describe('StormGlass Client', () => {
  const mockedAxios = axios as jest.Mocked<typeof axios>;

  it('should return the normalezed forecast from the StormGlass service', async () => {
    const lat = -33.792726;
    const lng = 151.289824;

    mockedAxios.get.mockResolvedValue({ data: stormglass_weather_3_hours });

    const stormGlass = new StormGlassClient(mockedAxios);
    const response = await stormGlass.fetchPoints(lat, lng);
    expect(response).toEqual(stormglass_normalized_response_3_hours);
  });

  it('should exclude incomplete data points', async () => {
    const lat = -33.792726;
    const lng = 151.289824;
    const incompleteResponse = {
      hours: [
        {
          windDirection: {
            noaa: 300,
          },
          time: '2024-03-23T00:00:00+00:00',
        },
      ],
    };

    mockedAxios.get.mockResolvedValue({ data: incompleteResponse });

    const stormGlass = new StormGlassClient(mockedAxios);
    const response = await stormGlass.fetchPoints(lat, lng);
    expect(response).toEqual([]);
  });

  it('should get a generic error from StormGlass service when the request fail before reaching the service', async () => {
    const lat = -33.792726;
    const lng = 151.289824;

    mockedAxios.get.mockRejectedValue(new Error('Network Error'));

    const stormGlass = new StormGlassClient(mockedAxios);

    await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
      'Unexpected error when trying to communicate to StormGlass: Network Error'
    );
  });

  it('should get an StormGlassResponseError when the StormGlass service responds with error', async () => {
    const lat = -33.792726;
    const lng = 151.289824;

    mockedAxios.get.mockRejectedValue({
      response: {
        status: 429,
        data: { errors: ['Rate Limit reached'] },
      },
    });

    const stormGlass = new StormGlassClient(mockedAxios);

    await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
      'Unexpected error returned by the StormGlass service: Error: {"errors":["Rate Limit reached"]} Code: 429'
    );
  });
});
