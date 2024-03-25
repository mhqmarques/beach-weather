import { StormGlassClient } from '@src/clients/stormGlassClient';
import stormglass_normalized_response_3_hours from '@test/fixtures/stormglass_normalized_response_3_hours.json';
import stormglass_weather_3_hours from '@test/fixtures/stormglass_weather_3_hours.json';
import axios from 'axios';

jest.mock('axios');

describe('StormGlass Client', () => {
  it('should return the normalezed forecast from the StormGlass service', async () => {
    const lat = -33.792726;
    const lng = 151.289824;

    axios.get = jest.fn().mockReturnValue({ data: stormglass_weather_3_hours });

    const stormGlass = new StormGlassClient(axios);
    const response = await stormGlass.fetchPoints(lat, lng);
    expect(response).toEqual(stormglass_normalized_response_3_hours);
  });
});
