/**
 * Vehicle Transportation Booking Service (Demonstration Engine)
 * Realistic agricultural transport fleet dispatcher connecting farmers to verified
 * carriers for transporting harvest to the nearest APMC Mandi.
 */

import { calculateTransportationCost } from './transport-calculator';
import { calculateDistanceKm, DEFAULT_MANDIS } from './mandi-service';

export type VehicleType = 'chhota_hathi' | 'pickup' | 'tractor_trolley' | 'canter_14ft' | 'heavy_truck_10w';

export interface TransportAgency {
  id: string;
  name: string;
  fleetSize: number;
  rating: number; // 1-5
  verifiedSince: string;
  contactPhone: string;
  dispatchHub: string;
}

export interface TransportDriver {
  id: string;
  name: string;
  phone: string;
  experienceYears: number;
  licenseNumber: string;
  rating: number;
  avatarInitials: string;
}

export interface VehicleOption {
  type: VehicleType;
  label: string;
  capacityQuintals: number;
  baseCost: number;
  ratePerKmPerQuintal: number;
  description: string;
  typicalPlate: string;
}

export interface VehicleBookingToken {
  bookingId: string;
  tokenNumber: string;
  farmerName: string;
  farmerPhone: string;
  pickupLocation: string;
  destinationMandiId: string;
  destinationMandiName: string;
  cropName: string;
  quantityQuintals: number;
  vehicleType: VehicleType;
  vehicleLabel: string;
  vehicleNumber: string;
  agencyName: string;
  agencyPhone: string;
  driverName: string;
  driverPhone: string;
  distanceKm: number;
  costPerQuintal: number;
  totalCost: number;
  estimatedTransitMinutes: number;
  status: 'assigned' | 'en_route_pickup' | 'loaded' | 'reached_mandi';
  bookedAt: string;
  pickupWindow: string;
}

export const TRANSPORT_AGENCIES: TransportAgency[] = [
  {
    id: 'agency-kisan-gati',
    name: 'Kisan Gati Rural Logistics Hub',
    fleetSize: 42,
    rating: 4.9,
    verifiedSince: '2021',
    contactPhone: '+919822019988',
    dispatchHub: 'Pune – Ahmednagar Agricultural Corridor',
  },
  {
    id: 'agency-krishi-rath',
    name: 'Krishi Rath Farmer Transport Union',
    fleetSize: 68,
    rating: 4.8,
    verifiedSince: '2019',
    contactPhone: '+919822445566',
    dispatchHub: 'Nashik – Marathwada APMC Network',
  },
  {
    id: 'agency-gramin-freight',
    name: 'Gramin Kisan Express Freight Co.',
    fleetSize: 35,
    rating: 4.7,
    verifiedSince: '2022',
    contactPhone: '+919822771122',
    dispatchHub: 'Western Maharashtra & Khandesh Zone',
  },
];

export const FLEET_DRIVERS: TransportDriver[] = [
  {
    id: 'drv-01',
    name: 'Rameshwar G. Shinde',
    phone: '+919850123456',
    experienceYears: 12,
    licenseNumber: 'MH-12-20120045891',
    rating: 4.9,
    avatarInitials: 'RS',
  },
  {
    id: 'drv-02',
    name: 'Balwant Singh Chahal',
    phone: '+919814234567',
    experienceYears: 15,
    licenseNumber: 'PB-10-20090038291',
    rating: 4.95,
    avatarInitials: 'BC',
  },
  {
    id: 'drv-03',
    name: 'Pravin Kashinath Mane',
    phone: '+919823345678',
    experienceYears: 8,
    licenseNumber: 'MH-14-20160089201',
    rating: 4.8,
    avatarInitials: 'PM',
  },
  {
    id: 'drv-04',
    name: 'Jagdishbhai K. Patel',
    phone: '+919825456789',
    experienceYears: 11,
    licenseNumber: 'GJ-01-20130071290',
    rating: 4.85,
    avatarInitials: 'JP',
  },
  {
    id: 'drv-05',
    name: 'Santosh Vitthalrao Kadam',
    phone: '+919823567890',
    experienceYears: 9,
    licenseNumber: 'MH-26-20150029381',
    rating: 4.75,
    avatarInitials: 'SK',
  },
];

export const VEHICLE_OPTIONS: VehicleOption[] = [
  {
    type: 'chhota_hathi',
    label: 'Mini Truck / Chhota Hathi (Tata Ace / Mahindra Bolero)',
    capacityQuintals: 20,
    baseCost: 350,
    ratePerKmPerQuintal: 0.85,
    description: 'Ideal for 5 to 20 Quintals. Fast farm-lane accessibility.',
    typicalPlate: 'MH-12-RN-4821',
  },
  {
    type: 'pickup',
    label: 'Maxi Truck / Bolero Maxi (2.5 - 3.5 MT)',
    capacityQuintals: 35,
    baseCost: 550,
    ratePerKmPerQuintal: 0.8,
    description: 'Ideal for 20 to 35 Quintals. Heavy payload with tarpaulin cover.',
    typicalPlate: 'MH-14-BT-9102',
  },
  {
    type: 'tractor_trolley',
    label: 'Tractor-Trolley (Double Axle Farm Hauler)',
    capacityQuintals: 60,
    baseCost: 700,
    ratePerKmPerQuintal: 0.75,
    description: 'Direct field loading for sugarcane, grain sacks, and rough terrain.',
    typicalPlate: 'MH-16-TR-3390',
  },
  {
    type: 'canter_14ft',
    label: '14-Foot Canter Truck (Eicher / Ashok Leyland)',
    capacityQuintals: 90,
    baseCost: 950,
    ratePerKmPerQuintal: 0.7,
    description: 'Bulk commercial transport (50 to 90 Quintals). Fully enclosed.',
    typicalPlate: 'MH-12-CT-6644',
  },
  {
    type: 'heavy_truck_10w',
    label: '10-Wheeler Heavy Freight Truck (15-20 MT)',
    capacityQuintals: 200,
    baseCost: 1500,
    ratePerKmPerQuintal: 0.65,
    description: 'Inter-district bulk agricultural carrier for large farm cooperatives.',
    typicalPlate: 'MH-04-HT-8822',
  },
];

const STORAGE_VEHICLE_BOOKING = 'km_demo_vehicle_booking';

export function getStoredVehicleBooking(): VehicleBookingToken | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_VEHICLE_BOOKING);
    return raw ? (JSON.parse(raw) as VehicleBookingToken) : null;
  } catch {
    return null;
  }
}

export function saveStoredVehicleBooking(booking: VehicleBookingToken | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (!booking) {
      localStorage.removeItem(STORAGE_VEHICLE_BOOKING);
    } else {
      localStorage.setItem(STORAGE_VEHICLE_BOOKING, JSON.stringify(booking));
    }
  } catch {
    // ignore
  }
}

/**
 * Calculates transportation cost, ETA, and distance between farmer coordinates and selected Mandi.
 */
export function calculateTripDetails(
  userLat: number,
  userLng: number,
  mandiId: string,
  quantityQuintals: number,
  vehicleType: VehicleType
): {
  distanceKm: number;
  costPerQuintal: number;
  totalCost: number;
  estimatedTransitMinutes: number;
  mandiName: string;
} {
  const targetMandi = DEFAULT_MANDIS.find((m) => m.id === mandiId) || DEFAULT_MANDIS[0];
  const distanceKm = Math.max(
    5,
    calculateDistanceKm(userLat, userLng, targetMandi.latitude, targetMandi.longitude)
  );

  const costRes = calculateTransportationCost(
    { latitude: userLat, longitude: userLng },
    { latitude: targetMandi.latitude, longitude: targetMandi.longitude },
    {
      quantityQuintals,
      roundDecimals: 0,
    }
  );

  const opt = VEHICLE_OPTIONS.find((v) => v.type === vehicleType) || VEHICLE_OPTIONS[0];
  const totalCost = Math.round(costRes.totalCost * (opt.ratePerKmPerQuintal / 0.85));
  const costPerQuintal = Math.round((totalCost / Math.max(1, quantityQuintals)) * 10) / 10;

  // Average rural/highway speed = 35 km/h + 20 mins farm loading/unloading
  const estimatedTransitMinutes = Math.round((distanceKm / 35) * 60 + 20);

  return {
    distanceKm,
    costPerQuintal,
    totalCost,
    estimatedTransitMinutes,
    mandiName: targetMandi.name,
  };
}

/**
 * Generates an instant, realistic mock vehicle booking token for demonstration
 */
export function createVehicleBooking(input: {
  farmerName: string;
  farmerPhone: string;
  pickupLocation: string;
  userLat?: number;
  userLng?: number;
  destinationMandiId: string;
  cropName: string;
  quantityQuintals: number;
  vehicleType: VehicleType;
}): VehicleBookingToken {
  const agencyIndex = Math.floor(Math.random() * TRANSPORT_AGENCIES.length);
  const driverIndex = Math.floor(Math.random() * FLEET_DRIVERS.length);

  const agency = TRANSPORT_AGENCIES[agencyIndex];
  const driver = FLEET_DRIVERS[driverIndex];
  const vehicleOpt = VEHICLE_OPTIONS.find((v) => v.type === input.vehicleType) || VEHICLE_OPTIONS[0];

  const userLat = input.userLat || 18.5204;
  const userLng = input.userLng || 73.8567;

  const trip = calculateTripDetails(
    userLat,
    userLng,
    input.destinationMandiId,
    input.quantityQuintals,
    input.vehicleType
  );

  // Random deterministic token generator: TRK-MH-<random 4 digits>
  const randCode = Math.floor(1000 + Math.random() * 9000);
  const tokenNumber = `TRK-MH-2026-${randCode}`;
  const bookingId = `bk-trk-${Date.now()}`;

  const now = new Date();
  const pickupTime = new Date(now.getTime() + 45 * 60000); // 45 minutes from now
  const pickupWindow = `${pickupTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} – ${new Date(pickupTime.getTime() + 30 * 60000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;

  // Random realistic license plate variation
  const plateLetters = ['RN', 'BT', 'TR', 'CT', 'HT'][driverIndex % 5];
  const vehicleNumber = `MH-${(12 + driverIndex).toString().padStart(2, '0')}-${plateLetters}-${Math.floor(1000 + Math.random() * 9000)}`;

  const booking: VehicleBookingToken = {
    bookingId,
    tokenNumber,
    farmerName: input.farmerName.trim(),
    farmerPhone: input.farmerPhone.trim(),
    pickupLocation: input.pickupLocation.trim() || 'Farmer Field Hub',
    destinationMandiId: input.destinationMandiId,
    destinationMandiName: trip.mandiName,
    cropName: input.cropName.trim(),
    quantityQuintals: input.quantityQuintals,
    vehicleType: input.vehicleType,
    vehicleLabel: vehicleOpt.label,
    vehicleNumber,
    agencyName: agency.name,
    agencyPhone: agency.contactPhone,
    driverName: driver.name,
    driverPhone: driver.phone,
    distanceKm: trip.distanceKm,
    costPerQuintal: trip.costPerQuintal,
    totalCost: trip.totalCost,
    estimatedTransitMinutes: trip.estimatedTransitMinutes,
    status: 'assigned',
    bookedAt: now.toISOString(),
    pickupWindow,
  };

  saveStoredVehicleBooking(booking);
  return booking;
}
