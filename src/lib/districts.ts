/**
 * Supported agricultural districts in Maharashtra and neighbouring regions.
 * Used for manual district selection when browser GPS location is denied or unavailable.
 */

export interface DistrictLocation {
  id: string;
  name: string;
  state: string;
  latitude: number;
  longitude: number;
}

export const SUPPORTED_DISTRICTS: DistrictLocation[] = [
  { id: 'pune', name: 'Pune (पुणे)', state: 'Maharashtra', latitude: 18.5204, longitude: 73.8567 },
  { id: 'nashik', name: 'Nashik (नाशिक)', state: 'Maharashtra', latitude: 19.9975, longitude: 73.7898 },
  { id: 'mumbai', name: 'Mumbai / Thane (मुंबई / ठाणे)', state: 'Maharashtra', latitude: 19.0760, longitude: 72.8777 },
  { id: 'nagpur', name: 'Nagpur (नागपूर)', state: 'Maharashtra', latitude: 21.1458, longitude: 79.0882 },
  { id: 'kolhapur', name: 'Kolhapur (कोल्हापूर)', state: 'Maharashtra', latitude: 16.7050, longitude: 74.2433 },
  { id: 'solapur', name: 'Solapur (सोलापूर)', state: 'Maharashtra', latitude: 17.6599, longitude: 75.9064 },
  { id: 'ahmednagar', name: 'Ahmednagar (अहमदनगर)', state: 'Maharashtra', latitude: 19.0948, longitude: 74.7480 },
  { id: 'aurangabad', name: 'Chhatrapati Sambhajinagar (छ. संभाजीनगर)', state: 'Maharashtra', latitude: 19.8762, longitude: 75.3433 },
  { id: 'amravati', name: 'Amravati (अमरावती)', state: 'Maharashtra', latitude: 20.9320, longitude: 77.7523 },
  { id: 'sangli', name: 'Sangli (सांगली)', state: 'Maharashtra', latitude: 16.8524, longitude: 74.5815 },
  { id: 'latur', name: 'Latur (लातूर)', state: 'Maharashtra', latitude: 18.4088, longitude: 76.5604 },
  { id: 'jalgaon', name: 'Jalgaon (जळगाव)', state: 'Maharashtra', latitude: 21.0077, longitude: 75.5626 },
];

