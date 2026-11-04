'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Building2,
  User,
  Phone,
  Mail,
  Lock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Landmark,
} from 'lucide-react';
import PageContainer from '@/components/shared/PageContainer';
import FormCard from '@/components/shared/FormCard';
import InputField from '@/components/shared/InputField';
import PrimaryButton from '@/components/shared/PrimaryButton';
import {
  registerGovernmentOfficial,
  DEFAULT_AGENCIES,
  DEFAULT_PROCUREMENT_CENTRES,
} from '@/lib/government-procurement-service';

export default function GovernmentRegisterPage() {
  const [fullName, setFullName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [designation, setDesignation] = useState('Procurement Quality Inspector (Grade-1)');
  const [department, setDepartment] = useState('Quality Control & Procurement Division');
  const [agencyId, setAgencyId] = useState(DEFAULT_AGENCIES[0].id);
  const [state, setState] = useState('Maharashtra');
  const [district, setDistrict] = useState('Pune');
  const [taluka, setTaluka] = useState('Haveli');
  const [centreId, setCentreId] = useState(DEFAULT_PROCUREMENT_CENTRES[0].id);
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify both password entries.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    const selectedAgency = DEFAULT_AGENCIES.find((a) => a.id === agencyId);
    const selectedCentre = DEFAULT_PROCUREMENT_CENTRES.find((c) => c.id === centreId);

    setSubmitting(true);
    try {
      const res = await registerGovernmentOfficial({
        full_name: fullName,
        employee_id: employeeId,
        designation,
        department,
        procurement_agency_id: agencyId,
        procurement_agency_name: selectedAgency?.agency_name,
        state,
        district,
        taluka,
        assigned_procurement_centre_id: centreId,
        assigned_procurement_centre_name: selectedCentre?.centre_name,
        official_mobile: mobile,
        official_email: email,
        password,
      });

      if (!res.success || !res.official) {
        setError(res.error || 'Failed to register government official credentials.');
        setSubmitting(false);
        return;
      }

      setRegisteredSuccess(true);
      setSubmitting(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred during official registration.');
      setSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <div className="py-8 sm:py-12 max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-sky-700 text-white rounded-2xl shadow-lg mb-3">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="display-font text-3xl font-extrabold text-primary-950">
            Government Official Registration
          </h1>
          <p className="mt-1 text-sm text-primary-700">
            Register authorized government procurement and quality inspection credentials
          </p>
        </div>

        <FormCard className="bg-white/95 backdrop-blur border-sky-200 shadow-2xl p-6 sm:p-8">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {registeredSuccess ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 bg-sky-100 text-sky-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-sky-950">
                Official Account Registered!
              </h2>
              <p className="text-xs text-sky-800 max-w-md mx-auto leading-relaxed">
                Your government official profile has been recorded in the MSP procurement register. You may now sign in using your official employee ID or email to access the procurement dashboard.
              </p>
              <div className="pt-4">
                <Link
                  href="/login?role=government"
                  className="inline-flex items-center justify-center gap-2 bg-sky-700 hover:bg-sky-800 text-white font-bold px-6 py-3 rounded-xl shadow-md transition-colors text-sm"
                >
                  <span>Proceed to Official Login</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Official Personal Information */}
              <div className="border-b border-gray-100 pb-3 mb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-sky-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-sky-600" />
                  <span>1. Official Profile</span>
                </h3>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <InputField
                  id="full-name"
                  label="Official Full Name *"
                  type="text"
                  placeholder="e.g. Ramesh S. Kulkarni"
                  value={fullName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
                  icon={<User className="w-4 h-4" />}
                  required
                />

                <InputField
                  id="employee-id"
                  label="Government Employee ID *"
                  type="text"
                  placeholder="e.g. FCI-MH-2025-4421"
                  value={employeeId}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmployeeId(e.target.value)}
                  icon={<ShieldCheck className="w-4 h-4" />}
                  required
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <InputField
                  id="designation"
                  label="Official Designation *"
                  type="text"
                  placeholder="e.g. Quality Inspection Officer"
                  value={designation}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDesignation(e.target.value)}
                  icon={<Landmark className="w-4 h-4" />}
                  required
                />

                <InputField
                  id="department"
                  label="Department / Directorate *"
                  type="text"
                  placeholder="e.g. Quality Control & Storage Wing"
                  value={department}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDepartment(e.target.value)}
                  icon={<Building2 className="w-4 h-4" />}
                  required
                />
              </div>

              {/* Agency & Depot Jurisdiction */}
              <div className="border-b border-gray-100 pb-3 pt-3 mb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-sky-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-sky-600" />
                  <span>2. Agency & Jurisdiction</span>
                </h3>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Sponsoring Procurement Agency *
                </label>
                <select
                  value={agencyId}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setAgencyId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                  required
                >
                  {DEFAULT_AGENCIES.map((agency) => (
                    <option key={agency.id} value={agency.id}>
                      {agency.agency_name} ({agency.agency_code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                <InputField
                  id="state"
                  label="State *"
                  type="text"
                  value={state}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setState(e.target.value)}
                  icon={<MapPin className="w-4 h-4" />}
                  required
                />

                <InputField
                  id="district"
                  label="District *"
                  type="text"
                  placeholder="e.g. Pune"
                  value={district}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDistrict(e.target.value)}
                  icon={<MapPin className="w-4 h-4" />}
                  required
                />

                <InputField
                  id="taluka"
                  label="Taluka *"
                  type="text"
                  placeholder="e.g. Haveli"
                  value={taluka}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTaluka(e.target.value)}
                  icon={<MapPin className="w-4 h-4" />}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Assigned Procurement Centre / Depot *
                </label>
                <select
                  value={centreId}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCentreId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                  required
                >
                  {DEFAULT_PROCUREMENT_CENTRES.map((centre) => (
                    <option key={centre.id} value={centre.id}>
                      {centre.centre_name} ({centre.district}, {centre.state})
                    </option>
                  ))}
                </select>
              </div>

              {/* Contact & Security Credentials */}
              <div className="border-b border-gray-100 pb-3 pt-3 mb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-sky-900 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-sky-600" />
                  <span>3. Security & Access Credentials</span>
                </h3>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <InputField
                  id="mobile"
                  label="Official Mobile Number *"
                  type="tel"
                  placeholder="e.g. 9822188410"
                  value={mobile}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMobile(e.target.value.replace(/\D/g, ''))}
                  icon={<Phone className="w-4 h-4" />}
                  required
                />

                <InputField
                  id="email"
                  label="Official Government Email *"
                  type="email"
                  placeholder="e.g. inspector@fci.gov.in"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  icon={<Mail className="w-4 h-4" />}
                  required
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <InputField
                  id="password"
                  label="Access Password *"
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  icon={<Lock className="w-4 h-4" />}
                  required
                />

                <InputField
                  id="confirm-password"
                  label="Confirm Password *"
                  type="password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                  icon={<Lock className="w-4 h-4" />}
                  required
                />
              </div>

              <div className="pt-4">
                <PrimaryButton
                  type="submit"
                  fullWidth
                  loading={submitting}
                  size="lg"
                  className="bg-sky-700 hover:bg-sky-800 text-white font-bold"
                >
                  Register Official Account
                </PrimaryButton>
              </div>

              <div className="pt-3 text-center border-t border-gray-100">
                <p className="text-xs text-gray-600">
                  Already have an official account?{' '}
                  <Link
                    href="/login?role=government"
                    className="font-bold text-sky-700 hover:text-sky-900 underline underline-offset-2"
                  >
                    Sign In to Government Portal
                  </Link>
                </p>
              </div>
            </form>
          )}
        </FormCard>
      </div>
    </PageContainer>
  );
}
