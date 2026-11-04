export type StorageType = 'cold_storage' | 'dry_warehouse' | 'controlled_atmosphere';
export type WarehouseBookingStatus = 'done' | 'active' | 'released' | 'cancelled';

export interface WarehouseBooking {
  id: string;
  ticket_number: string;
  warehouse_id: string;
  warehouse_name: string;
  warehouse_type: StorageType;
  warehouse_address: string;
  nearest_apmc_mandi: string;
  mandi_id?: string;
  farmer_id?: string;
  farmer_name: string;
  farmer_phone: string;
  crop_name: string;
  quantity_quintals: number;
  rate_per_quintal_month: number;
  estimated_monthly_charge: number;
  storage_duration_months: number;
  temperature_range: string;
  humidity_range: string;
  // Warehouse Owner / Manager details
  manager_name: string;
  manager_phone: string;
  manager_email: string;
  license_no: string;
  status: WarehouseBookingStatus; // set to 'done' on confirmation
  booked_at: string; // ISO string
  created_at?: string;
  updated_at?: string;
}

export interface CreateWarehouseBookingInput {
  warehouse_id: string;
  farmer_name: string;
  farmer_phone: string;
  crop_name: string;
  quantity_quintals: number;
  storage_duration_months?: number;
  farmer_id?: string;
}

