import { Beach, Position } from '@src/models/beach';
import { Rating } from '../rating';

describe('Rating Service', () => {
  const defaultBeach: Beach = {
    lat: -33.792726,
    lng: 151.289824,
    name: 'Manly',
    position: Position.E,
    user: 'some-id',
  };

  const defaultRating = new Rating(defaultBeach);

  describe('Calculate rating for a given point', () => {
    const defaultPoint = {
      swellDirection: 110,
      swellHeight: 0.1,
      swellPeriod: 5,
      time: 'test',
      waveDirection: 110,
      waveHeight: 0.1,
      windDirection: 100,
      windSpeed: 100,
    };

    it('Should get rating 1 for a poor point', () => {
      const rating = defaultRating.getRatingForPoint(defaultPoint);
      expect(rating).toBe(1);
    });
    it('should get a rating of 1 for an ok point', () => {
      const pointData = {
        swellHeight: 0.4,
      };
      // using spread operator for cloning objects instead of Object.assign
      const point = { ...defaultPoint, ...pointData };

      const rating = defaultRating.getRatingForPoint(point);
      expect(rating).toBe(1);
    });

    it('should get a rating of 3 for a point with offshore winds and a half overhead height', () => {
      const point = {
        ...defaultPoint,
        ...{
          swellHeight: 0.7,
          windDirection: 250,
        },
      };
      const rating = defaultRating.getRatingForPoint(point);
      expect(rating).toBe(3);
    });

    it('should get a rating of 4 for a point with offshore winds, half overhead high swell and good interval', () => {
      const point = {
        ...defaultPoint,
        ...{
          swellHeight: 0.7,
          swellPeriod: 12,
          windDirection: 250,
        },
      };
      const rating = defaultRating.getRatingForPoint(point);
      expect(rating).toBe(4);
    });

    it('should get a rating of 4 for a point with offshore winds, shoulder high swell and good interval', () => {
      const point = {
        ...defaultPoint,
        ...{
          swellHeight: 1.5,
          swellPeriod: 12,
          windDirection: 250,
        },
      };
      const rating = defaultRating.getRatingForPoint(point);
      expect(rating).toBe(4);
    });

    it('should get a rating of 5 classic day!', () => {
      const point = {
        ...defaultPoint,
        ...{
          swellHeight: 2.5,
          swellPeriod: 16,
          windDirection: 250,
        },
      };
      const rating = defaultRating.getRatingForPoint(point);
      expect(rating).toBe(5);
    });
    it('should get a rating of 4 a good condition but with crossshore winds', () => {
      const point = {
        ...defaultPoint,
        ...{
          swellHeight: 2.5,
          swellPeriod: 16,
          windDirection: 130,
        },
      };
      const rating = defaultRating.getRatingForPoint(point);
      expect(rating).toBe(4);
    });
  });

  describe('Get rating based on wind and wave direction', () => {
    it('Should get rating 1 for a beach with onshore wind', () => {
      const rating = defaultRating.getRatingBasedOnWindAndWaveDirections(
        Position.E,
        Position.E
      );
      expect(rating).toBe(1);
    });

    it('Should get rating 3 for a beach with cross winds', () => {
      const rating = defaultRating.getRatingBasedOnWindAndWaveDirections(
        Position.E,
        Position.S
      );
      expect(rating).toBe(3);
    });

    it('Should get rating 5 for a beach with offshore wind', () => {
      const rating = defaultRating.getRatingBasedOnWindAndWaveDirections(
        Position.E,
        Position.W
      );
      expect(rating).toBe(5);
    });
  });

  describe('Get rating based on swell period', () => {
    it('Should get rating 1 for a period of 5 seconds', () => {
      const rating = defaultRating.getRatingBasedOnSwellPeriod(5);
      expect(rating).toBe(1);
    });
    it('Should get rating 2 for a period of 9 seconds', () => {
      const rating = defaultRating.getRatingBasedOnSwellPeriod(9);
      expect(rating).toBe(2);
    });
    it('Should get rating 4 for a period of 13 seconds', () => {
      const rating = defaultRating.getRatingBasedOnSwellPeriod(13);
      expect(rating).toBe(4);
    });
    it('Should get rating 5 for a period of 16 seconds', () => {
      const rating = defaultRating.getRatingBasedOnSwellPeriod(16);
      expect(rating).toBe(5);
    });
  });

  describe('Get rating based on swell height', () => {
    it('Should get rating 1 for a swell height lower than ankle to knee', () => {
      const rating = defaultRating.getRatingBasedOnSwellHeight(0.2);
      expect(rating).toBe(1);
    });
    it('Should get rating 2 for a ankle to knee swell height', () => {
      const rating = defaultRating.getRatingBasedOnSwellHeight(0.6);
      expect(rating).toBe(2);
    });
    it('Should get rating 3 for a waist swell height', () => {
      const rating = defaultRating.getRatingBasedOnSwellHeight(1.5);
      expect(rating).toBe(3);
    });
    it('Should get rating 5 for a overhead swell height', () => {
      const rating = defaultRating.getRatingBasedOnSwellHeight(2.6);
      expect(rating).toBe(5);
    });
  });

  describe('Get position based on points locations', () => {
    it('Should get east position based on east points locations', () => {
      const position = defaultRating.getPositionFromDirection(92);
      expect(position).toBe(Position.E);
    });
    it('Should get west position based on west points locations', () => {
      const position = defaultRating.getPositionFromDirection(300);
      expect(position).toBe(Position.W);
    });
    it('Should get north position based on north points locations', () => {
      const position = defaultRating.getPositionFromDirection(360);
      expect(position).toBe(Position.N);
    });
    it('Should get north position based on north points locations', () => {
      const position = defaultRating.getPositionFromDirection(40);
      expect(position).toBe(Position.N);
    });
    it('Should get south position based on south points locations', () => {
      const position = defaultRating.getPositionFromDirection(200);
      expect(position).toBe(Position.S);
    });
  });
});
