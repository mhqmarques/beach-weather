import { ForecastPoint } from '@src/clients/stormGlassClient';
import { Beach, Position } from '@src/models/beach';

//meters
const WAVE_HEIGHTS = {
  ankleToKneeHeight: {
    min: 0.3,
    max: 1.0,
  },
  waistHeight: {
    min: 1.1,
    max: 2.0,
  },
  headHeight: {
    min: 2.1,
    max: 2.5,
  },
};

///***** AVALIAR COESAO E ACOPLAMENTO */
export class Rating {
  constructor(private beach: Beach) {}

  public getRatingForPoint(point: ForecastPoint): number {
    const waveDirectionPosition = this.getPositionFromDirection(
      point.waveDirection
    );
    const windDirectionPosition = this.getPositionFromDirection(
      point.windDirection
    );
    const windAndWaveRating = this.getRatingBasedOnWindAndWaveDirections(
      waveDirectionPosition,
      windDirectionPosition
    );
    const swellPeriodRating = this.getRatingBasedOnSwellPeriod(
      point.swellPeriod
    );
    const swellHeightRating = this.getRatingBasedOnSwellHeight(
      point.swellHeight
    );

    const finalRating =
      (windAndWaveRating + swellPeriodRating + swellHeightRating) / 3;

    return Math.round(finalRating);
  }

  public getRatingBasedOnWindAndWaveDirections(
    waveDirectionPosition: Position,
    windDirectionPosition: Position
  ): number {
    if (waveDirectionPosition === windDirectionPosition) {
      return 1;
    } else if (
      this.isWindOffShore(waveDirectionPosition, windDirectionPosition)
    ) {
      return 5;
    }
    return 3;
  }

  public getRatingBasedOnSwellPeriod(swellPeriod: number): number {
    if (swellPeriod >= 7 && swellPeriod < 10) {
      return 2;
    }
    if (swellPeriod > 10 && swellPeriod < 14) {
      return 4;
    }
    if (swellPeriod >= 14) {
      return 5;
    }
    return 1;
  }

  public getRatingBasedOnSwellHeight(height: number): number {
    if (
      height >= WAVE_HEIGHTS.ankleToKneeHeight.min &&
      height <= WAVE_HEIGHTS.ankleToKneeHeight.max
    ) {
      return 2;
    }
    if (
      height >= WAVE_HEIGHTS.waistHeight.min &&
      height <= WAVE_HEIGHTS.waistHeight.max
    ) {
      return 3;
    }
    if (
      height >= WAVE_HEIGHTS.headHeight.min &&
      height <= WAVE_HEIGHTS.headHeight.max
    ) {
      return 4;
    }
    if (height > WAVE_HEIGHTS.headHeight.max) {
      return 5;
    }
    return 1;
  }

  public getPositionFromDirection(coordinates: number): Position {
    if (coordinates >= 310 || (coordinates >= 0 && coordinates <= 50)) {
      return Position.N;
    }
    if (coordinates >= 50 && coordinates < 120) {
      return Position.E;
    }
    if (coordinates >= 120 && coordinates < 220) {
      return Position.S;
    }
    if (coordinates >= 220 && coordinates < 310) {
      return Position.W;
    }
    return Position.E;
  }

  private isWindOffShore(
    waveDirectionPosition: Position,
    windDirectionPosition: Position
  ): boolean {
    return (
      (waveDirectionPosition === Position.S &&
        this.beach.position === Position.S &&
        windDirectionPosition === Position.N) ||
      (waveDirectionPosition === Position.N &&
        this.beach.position === Position.N &&
        windDirectionPosition === Position.S) ||
      (waveDirectionPosition === Position.E &&
        this.beach.position === Position.E &&
        windDirectionPosition === Position.W) ||
      (waveDirectionPosition === Position.W &&
        this.beach.position === Position.W &&
        windDirectionPosition === Position.E)
    );
  }
}
