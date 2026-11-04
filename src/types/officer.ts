export interface OfficerProfile {
  id: string; // uuid referencing auth.users.id
  officer_id: string; // unique, e.g. OFF-001
  full_name: string;
  contact_number: string;
  batch_id: string; // e.g. APMC-B01
  email?: string;
  created_at: string;
}

export interface CreateOfficerInput {
  full_name: string;
  contact_number: string;
  batch_id: string;
  officer_id?: string;
  email?: string;
  password?: string; // defaults to 'Demo@12345'
}

export interface OfficerAuthSession {
  user: {
    id: string;
    email?: string;
  };
  officer: OfficerProfile;
  access_token: string;
}

