import { describe, it, expect } from 'vitest';
import {
  calculateTransportationCost,
  calculateHaversineDistanceKm,
} from '@/lib/transport-calculator';

describe('Transport Calculator (M5)', () => {
  const puneLocation = { latitude: 18.5204, longitude: 73.8567 };
  const mumbaiLocation = { latitude: 19.0760, longitude: 72.8777 };

  it('calculates 0 km distance for identical coordinates', () => {
    const dist = calculateHaversineDistanceKm(
      puneLocation.latitude,
      puneLocation.longitude,
      puneLocation.latitude,
      puneLocation.longitude
    );
    expect(dist).toBe(0);
  });

  it('calculates approximate straight-line Haversine distance between Pune and Mumbai', () => {
    const dist = calculateHaversineDistanceKm(
      puneLocation.latitude,
      puneLocation.longitude,
      mumbaiLocation.latitude,
      mumbaiLocation.longitude
    );
    // Straight-line distance is ~120 km
    expect(dist).toBeGreaterThan(110);
    expect(dist).toBeLessThan(130);
  });

  it('selects Mini Tempo for loads up to 15 quintals', () => {
    const res = calculateTransportationCost(puneLocation, mumbaiLocation, {
      quantityQuintals: 10,
    });
    expect(res.vehicle.id).toBe('mini_tempo');
  });

  it('selects Pickup Truck for loads between 16 and 35 quintals', () => {
    const res = calculateTransportationCost(puneLocation, mumbaiLocation, {
      quantityQuintals: 30,
    });
    expect(res.vehicle.id).toBe('pickup');
  });

  it('selects Tractor Trolley for loads between 36 and 75 quintals', () => {
    const res = calculateTransportationCost(puneLocation, mumbaiLocation, {
      quantityQuintals: 60,
    });
    expect(res.vehicle.id).toBe('tractor');
  });

  it('selects Commercial Truck for loads greater than 75 quintals', () => {
    const res = calculateTransportationCost(puneLocation, mumbaiLocation, {
      quantityQuintals: 150,
    });
    expect(res.vehicle.id).toBe('heavy_truck');
  });

  it('scales cost monotonically as load increases for the same distance', () => {
    const res10 = calculateTransportationCost(puneLocation, mumbaiLocation, { quantityQuintals: 10 });
    const res30 = calculateTransportationCost(puneLocation, mumbaiLocation, { quantityQuintals: 30 });
    const res60 = calculateTransportationCost(puneLocation, mumbaiLocation, { quantityQuintals: 60 });
    const res150 = calculateTransportationCost(puneLocation, mumbaiLocation, { quantityQuintals: 150 });

    expect(res10.totalCost).toBeLessThan(res30.totalCost);
    expect(res30.totalCost).toBeLessThan(res60.totalCost);
    expect(res60.totalCost).toBeLessThan(res150.totalCost);
  });

  it('labels distance explicitly as approximate straight-line', () => {
    const res = calculateTransportationCost(puneLocation, mumbaiLocation, {
      quantityQuintals: 20,
    });
    expect(res.isApproximateStraightLine).toBe(true);
    expect(res.straightLineDistanceKm).toBe(res.distanceKm);
    expect(res.formattedDistance).toContain('(approx. straight-line)');
  });

  it('provides an itemized cost breakdown that sums to total cost', () => {
    const res = calculateTransportationCost(puneLocation, mumbaiLocation, {
      quantityQuintals: 25,
      roundDecimals: 0,
    });
    const { baseMobilization, distanceCost, weightFreightCost, handlingCost } = res.breakdown;
    const computedTotal = baseMobilization + distanceCost + weightFreightCost + handlingCost;
    expect(Math.abs(computedTotal - res.totalCost)).toBeLessThanOrEqual(2);
  });
});
