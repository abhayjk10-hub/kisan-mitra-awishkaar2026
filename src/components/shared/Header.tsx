'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Sprout,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Calendar,
  LifeBuoy,
  CheckCircle2,
  Building2,
  Snowflake,
  Leaf,
  Tractor,
  ShieldCheck,
  Landmark,
  Truck,
} from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { t } from '@/lib/translations';
import { getCurrentMandiSession, logoutMandi } from '@/lib/mandi-service';
import {
  getCurrentGovernmentOfficialSession,
  logoutGovernmentOfficial,
  GovernmentOfficialSession,
} from '@/lib/government-procurement-service';
import { MandiSession } from '@/types';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [mandiSession, setMandiSession] = useState<MandiSession | null>(null);
  const [govtSession, setGovtSession] = useState<GovernmentOfficialSession | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const servicesDropdownRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();
  const router = useRouter();
  const { language } = useLanguage();
  const { user, signOut } = useAuth();

  // Listen to Mandi Portal & Government Official session changes
  useEffect(() => {
    const syncSessions = () => {
      setMandiSession(getCurrentMandiSession());
      setGovtSession(getCurrentGovernmentOfficialSession());
    };
    syncSessions();
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', syncSessions);
      window.addEventListener('km_mandi_sync', syncSessions);
      window.addEventListener('km_govt_sync', syncSessions);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', syncSessions);
        window.removeEventListener('km_mandi_sync', syncSessions);
        window.removeEventListener('km_govt_sync', syncSessions);
      }
    };
  }, [pathname]);

  const isMandiOperator = Boolean(mandiSession);
  const isGovtOfficial = Boolean(govtSession);

  // Agricultural services housed cleanly inside Services dropdown
  const serviceLinks = [
    {
      href: '/procurement',
      label: t('nav.procurement', language),
      desc:
        language === 'hi'
          ? 'एमएसपी खरीद एवं गुणवत्ता निरीक्षण'
          : language === 'mr'
          ? 'हमीभाव खरेदी व गुणवत्ता तपासणी'
          : language === 'gu'
          ? 'ટેકાના ભાવે ખરીદી અને ગુણવત્તા તપાસ'
          : language === 'pa'
          ? 'ਐਮ.ਐਸ.ਪੀ. ਖਰੀਦ ਅਤੇ ਗੁਣਵੱਤਾ ਜਾਂਚ'
          : 'MSP procurement & FAQ quality inspection',
      icon: Landmark,
      iconColor: 'text-sky-400',
      bgColor: 'bg-sky-500/15',
    },
    {
      href: '/cold-storage',
      label: t('nav.coldStorage', language),
      desc:
        language === 'hi'
          ? 'शीत भंडारण एवं वैज्ञानिक गोदाम'
          : language === 'mr'
          ? 'शीतगृह आणि वैज्ञानिक गोदामे'
          : language === 'gu'
          ? 'કોલ્ડ સ્ટોરેજ અને વૈજ્ઞાનિક ગોડાઉન'
          : language === 'pa'
          ? 'ਕੋਲਡ ਸਟੋਰੇਜ ਅਤੇ ਵਿਗਿਆਨਕ ਗੁਦਾਮ'
          : 'Find nearest cold stores & godowns',
      icon: Snowflake,
      iconColor: 'text-cyan-400',
      bgColor: 'bg-cyan-500/15',
    },
    {
      href: '/crop-care',
      label: t('nav.cropCare', language),
      desc:
        language === 'hi'
          ? 'जैविक व रासायनिक खाद-कीटनाशक'
          : language === 'mr'
          ? 'सेंद्रिय आणि रासायनिक खते-कीटकनाशके'
          : language === 'gu'
          ? 'જૈવિક અને રાસાયણિક ખાતર-જંતુનાશક'
          : language === 'pa'
          ? 'ਜੈਵਿਕ ਅਤੇ ਰਸਾਇਣਕ ਖਾਦ-ਕੀਟਨਾਸ਼ਕ'
          : 'ICAR & CIBRC nutrient and pest guide',
      icon: Leaf,
      iconColor: 'text-emerald-400',
      bgColor: 'bg-emerald-500/15',
    },
    {
      href: '/machinery-rental',
      label: t('nav.machinery', language),
      desc:
        language === 'hi'
          ? 'ट्रैक्टर, हार्वेस्टर व डीहलर किराया'
          : language === 'mr'
          ? 'ट्रॅक्टर, हार्वेस्टर व डीहलर भाड्याने'
          : language === 'gu'
          ? 'ટ્રેક્ટર, હાર્વેસ્ટર અને ડીહલર ભાડે'
          : language === 'pa'
          ? 'ਟਰੈਕਟਰ, ਹਾਰਵੈਸਟਰ ਅਤੇ ਡੀਹਲਰ ਕਿਰਾਏ \'ਤੇ'
          : 'Tractor, harvester, huller CHC rentals',
      icon: Tractor,
      iconColor: 'text-amber-400',
      bgColor: 'bg-amber-500/15',
    },
    {
      href: '/schemes',
      label: t('nav.schemes', language),
      desc:
        language === 'hi'
          ? 'PMFBY, KCC, PM-KISAN योजनाएं'
          : language === 'mr'
          ? 'PMFBY, KCC, PM-KISAN योजना'
          : language === 'gu'
          ? 'PMFBY, KCC, PM-KISAN યોજનાઓ'
          : language === 'pa'
          ? 'PMFBY, KCC, PM-KISAN ਸਕੀਮਾਂ'
          : 'Crop insurance, subsidies, & KCC',
      icon: ShieldCheck,
      iconColor: 'text-rose-400',
      bgColor: 'bg-rose-500/15',
    },
    {
      href: '/vehicle-booking',
      label: t('nav.vehicleBooking', language),
      desc:
        language === 'hi'
          ? 'खेत से मंडी वाहन परिवहन'
          : language === 'mr'
          ? 'शेत ते बाजार समिती वाहतूक'
          : language === 'gu'
          ? 'ખેતરથી માર્કેટ યાર્ડ વાહન પરિવહન'
          : language === 'pa'
          ? 'ਖੇਤ ਤੋਂ ਮੰਡੀ ਵਾਹਨ ਆਵਾਜਾਈ'
          : 'Farm-to-Mandi crop transport',
      icon: Truck,
      iconColor: 'text-amber-400',
      bgColor: 'bg-amber-500/15',
    },
  ];

  const isServicesActive = serviceLinks.some((s) => pathname.startsWith(s.href));

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (servicesDropdownRef.current && !servicesDropdownRef.current.contains(event.target as Node)) {
        setServicesDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on navigation
  useEffect(() => {
    // Close transient menus when the route changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProfileDropdownOpen(false);
    setServicesDropdownOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  // Extract display name and avatar initials based on active role
  const displayName = isMandiOperator
    ? mandiSession?.mandi?.name || t('nav.apmcYard', language)
    : isGovtOfficial
    ? govtSession?.official.full_name || t('nav.govtOfficial', language)
    : user?.user_metadata?.full_name ||
      user?.user_metadata?.name ||
      (user?.phone ? `${t('nav.farmerAccount', language)} (${user.phone.slice(-4)})` : user?.email?.split('@')[0]) ||
      t('nav.farmerAccount', language);

  const userIdentifier = isMandiOperator
    ? `${mandiSession?.mandi?.code || ''} • ${t('nav.mandiOfficial', language)}`
    : isGovtOfficial
    ? `${govtSession?.official.employee_id || ''} • ${govtSession?.official.procurement_agency_name || 'Govt'}`
    : user?.phone || user?.email || t('nav.farmerAccount', language);

  const initials = isMandiOperator
    ? 'AP'
    : isGovtOfficial
    ? 'GO'
    : displayName
        .split(' ')
        .filter(Boolean)
        .map((n: string) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'F';

  const handleLogout = async () => {
    setProfileDropdownOpen(false);
    setMenuOpen(false);
    if (isMandiOperator) {
      logoutMandi();
      setMandiSession(null);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('km_mandi_sync'));
      }
      router.push('/login?role=mandi');
    } else if (isGovtOfficial) {
      logoutGovernmentOfficial();
      setGovtSession(null);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('km_govt_sync'));
      }
      router.push('/login?role=government');
    } else {
      await signOut();
      router.push('/login?role=farmer');
    }
  };

  return (
    <header className="bg-primary-950/95 backdrop-blur-md border-b border-white/10 sticky top-0 z-50 text-white w-full overflow-x-clip">
      <div className="w-full max-w-[1536px] mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group shrink-0 mr-1 xl:mr-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-primary-400 rounded-xl flex items-center justify-center shadow-md group-hover:bg-primary-300 transition-colors shrink-0">
              <Sprout className="w-4 h-4 sm:w-5 sm:h-5 text-primary-950" aria-hidden="true" />
            </div>
            <div className="hidden sm:block shrink-0">
              <p className="font-bold text-white text-sm sm:text-base leading-tight whitespace-nowrap">{t('appName', language)}</p>
              <p className="text-[10px] text-primary-300 leading-tight hidden 2xl:block whitespace-nowrap">{t('appTagline', language)}</p>
            </div>
          </Link>

          {/* Desktop Navigation Links (Role-Gated Strictly) */}
          <nav
            className="hidden lg:flex items-center gap-1 xl:gap-2 shrink min-w-0"
            role="navigation"
            aria-label={t('common.mainNavigation', language)}
          >
            {/* 1. Common Home Link */}
            <Link
              href="/"
              className={`px-2.5 xl:px-3 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                isActive('/')
                  ? 'bg-white/15 text-white shadow-sm font-semibold'
                  : 'text-primary-100 hover:text-white hover:bg-white/10'
              }`}
              aria-current={isActive('/') ? 'page' : undefined}
            >
              {t('nav.home', language)}
            </Link>

            {/* 2. Role: MANDI OPERATOR (Home, Mandi Dashboard, Contact) */}
            {isMandiOperator ? (
              <>
                <Link
                  href="/mandi/dashboard"
                  className={`px-2.5 xl:px-3 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                    isActive('/mandi/dashboard')
                      ? 'bg-amber-600/30 text-amber-200 border border-amber-400/40 shadow-sm font-semibold'
                      : 'text-amber-200 hover:text-white hover:bg-white/10'
                  }`}
                  aria-current={isActive('/mandi/dashboard') ? 'page' : undefined}
                >
                  {t('nav.mandiDashboard', language)}
                </Link>
                <Link
                  href="/mandi/warehouse-dashboard"
                  className={`px-2.5 xl:px-3 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                    isActive('/mandi/warehouse-dashboard')
                      ? 'bg-emerald-600/30 text-emerald-200 border border-emerald-400/40 shadow-sm font-semibold'
                      : 'text-emerald-200 hover:text-white hover:bg-white/10'
                  }`}
                  aria-current={isActive('/mandi/warehouse-dashboard') ? 'page' : undefined}
                >
                  Warehouse Dashboard
                </Link>
              </>
            ) : isGovtOfficial ? (
              /* 3. Role: GOVERNMENT OFFICIAL (Home, MSP Procurement, Procurement Dashboard, Contact) */
              <>
                <Link
                  href="/procurement"
                  className={`px-2.5 xl:px-3 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                    isActive('/procurement')
                      ? 'bg-white/15 text-white shadow-sm font-semibold'
                      : 'text-primary-100 hover:text-white hover:bg-white/10'
                  }`}
                  aria-current={isActive('/procurement') ? 'page' : undefined}
                >
                  {t('nav.procurement', language)}
                </Link>
                <Link
                  href="/government/dashboard"
                  className={`px-2.5 xl:px-3 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                    isActive('/government/dashboard')
                      ? 'bg-sky-600/30 text-sky-200 border border-sky-400/40 shadow-sm font-semibold'
                      : 'text-sky-200 hover:text-white hover:bg-white/10'
                  }`}
                  aria-current={isActive('/government/dashboard') ? 'page' : undefined}
                >
                  {t('nav.govtDashboard', language)}
                </Link>
              </>
            ) : (
              /* 4. Role: FARMER / GUEST (Home, Slot Booking, Mandi Prices, Services, Contact) */
              <>
                <Link
                  href="/slot-booking"
                  className={`px-2.5 xl:px-3 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                    isActive('/slot-booking')
                      ? 'bg-white/15 text-white shadow-sm font-semibold'
                      : 'text-primary-100 hover:text-white hover:bg-white/10'
                  }`}
                  aria-current={isActive('/slot-booking') ? 'page' : undefined}
                >
                  {t('nav.slotBooking', language)}
                </Link>

                <Link
                  href="/mandi-prices"
                  className={`px-2.5 xl:px-3 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                    isActive('/mandi-prices')
                      ? 'bg-white/15 text-white shadow-sm font-semibold'
                      : 'text-primary-100 hover:text-white hover:bg-white/10'
                  }`}
                  aria-current={isActive('/mandi-prices') ? 'page' : undefined}
                >
                  {t('nav.mandiPrices', language)}
                </Link>

                {/* Services Dropdown for Farmer */}
                <div className="relative shrink-0" ref={servicesDropdownRef}>
                  <button
                    type="button"
                    id="services-dropdown-button"
                    aria-expanded={servicesDropdownOpen}
                    aria-haspopup="true"
                    onClick={() => setServicesDropdownOpen((prev) => !prev)}
                    className={`flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                      isServicesActive
                        ? 'bg-white/15 text-white shadow-sm font-semibold'
                        : 'text-primary-100 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span>{t('nav.services', language)}</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-primary-300 transition-transform duration-200 ${
                        servicesDropdownOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {servicesDropdownOpen && (
                    <div
                      className="absolute left-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 text-gray-800 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="services-dropdown-button"
                    >
                      <div className="px-4 py-2 border-b border-gray-100 bg-gray-50/70 rounded-t-xl mb-1">
                        <p className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                          {t('nav.services', language)}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          {language === 'hi' ? 'किसानों के लिए जरूरी सुविधाएं' : language === 'mr' ? 'शेतकऱ्यांसाठी आवश्यक सेवा' : 'Essential agricultural farmer tools'}
                        </p>
                      </div>

                      {serviceLinks.map((service) => {
                        const Icon = service.icon;
                        const active = pathname.startsWith(service.href);
                        return (
                          <Link
                            key={service.href}
                            href={service.href}
                            onClick={() => setServicesDropdownOpen(false)}
                            className={`flex items-center gap-3 px-3.5 py-2.5 hover:bg-gray-50 transition-colors ${
                              active ? 'bg-emerald-50 text-emerald-950 font-semibold' : 'text-gray-700'
                            }`}
                            role="menuitem"
                          >
                            <div className={`w-8 h-8 rounded-xl ${service.bgColor} flex items-center justify-center shrink-0`}>
                              <Icon className={`w-4 h-4 ${service.iconColor}`} />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-bold leading-tight text-gray-900">{service.label}</span>
                              <span className="text-[10px] text-gray-500 leading-tight mt-0.5">{service.desc}</span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Common Contact Link */}
            <Link
              href="/contact"
              className={`px-2.5 xl:px-3 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                isActive('/contact')
                  ? 'bg-white/15 text-white shadow-sm font-semibold'
                  : 'text-primary-100 hover:text-white hover:bg-white/10'
              }`}
              aria-current={isActive('/contact') ? 'page' : undefined}
            >
              {t('nav.contact', language)}
            </Link>
          </nav>

          {/* Right Section: Language Selector + Auth States */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <LanguageSelector />

            {/* ── LOGGED IN STATE ── */}
            {user || mandiSession || govtSession ? (
              <div className="relative shrink-0" ref={dropdownRef}>
                {/* Profile Button with Avatar Icon and Name */}
                <button
                  type="button"
                  id="profile-dropdown-button"
                  aria-expanded={profileDropdownOpen}
                  aria-haspopup="true"
                  onClick={() => setProfileDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/15 py-1 px-2 xl:px-3 rounded-full transition-all text-left focus:outline-none focus:ring-2 focus:ring-primary-400 shrink-0"
                >
                  {/* Avatar Icon */}
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full font-bold text-xs flex items-center justify-center shadow-inner ring-2 shrink-0 ${
                    isMandiOperator
                      ? 'bg-amber-600 text-amber-950 ring-amber-400/40'
                      : isGovtOfficial
                      ? 'bg-sky-600 text-sky-100 ring-sky-400/40'
                      : 'bg-emerald-600 text-white ring-emerald-400/40'
                  }`}>
                    {initials}
                  </div>

                  {/* User Name */}
                  <div className="hidden xl:flex flex-col text-left">
                    <span className="text-xs font-semibold text-white leading-tight max-w-[110px] 2xl:max-w-[140px] truncate">
                      {displayName}
                    </span>
                    <span className="text-[10px] text-primary-300 leading-none">
                      {isMandiOperator
                        ? t('nav.mandiOfficial', language)
                        : isGovtOfficial
                        ? t('nav.govtOfficial', language)
                        : t('nav.online', language)}
                    </span>
                  </div>

                  <ChevronDown
                    className={`w-3.5 h-3.5 text-primary-300 transition-transform duration-200 shrink-0 ${
                      profileDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Profile Dropdown Menu */}
                {profileDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 text-gray-800 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="profile-dropdown-button"
                  >
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/70 rounded-t-xl">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-10 h-10 rounded-full font-bold text-sm flex items-center justify-center shadow-sm ${
                          isMandiOperator
                            ? 'bg-amber-500 text-amber-950'
                            : isGovtOfficial
                            ? 'bg-sky-600 text-sky-100'
                            : 'bg-emerald-600 text-white'
                        }`}>
                          {initials}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-sm font-bold text-gray-900 truncate">
                            {displayName}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {userIdentifier}
                          </p>
                        </div>
                      </div>
                      <div className={`mt-2.5 inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                        isMandiOperator
                          ? 'bg-amber-100 text-amber-900'
                          : isGovtOfficial
                          ? 'bg-sky-100 text-sky-900'
                          : 'bg-emerald-100/80 text-emerald-700'
                      }`}>
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {isMandiOperator
                          ? t('nav.apmcYard', language)
                          : isGovtOfficial
                          ? 'Authorized Govt Inspector'
                          : t('nav.verifiedAccount', language)}
                      </div>
                    </div>

                    {/* Navigation Actions (Role-Filtered) */}
                    <div className="py-1">
                      {isMandiOperator ? (
                        <>
                          <Link
                            href="/mandi/dashboard"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-amber-900 bg-amber-50/50 hover:bg-amber-100 transition-colors"
                            role="menuitem"
                          >
                            <Building2 className="w-4 h-4 text-amber-600" />
                            <span>{t('nav.mandiDashboard', language)}</span>
                          </Link>
                          <Link
                            href="/mandi/warehouse-dashboard"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-emerald-900 bg-emerald-50/50 hover:bg-emerald-100 transition-colors"
                            role="menuitem"
                          >
                            <Building2 className="w-4 h-4 text-emerald-600" />
                            <span>Warehouse Dashboard</span>
                          </Link>
                          <Link
                            href="/contact"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-900 transition-colors"
                            role="menuitem"
                          >
                            <LifeBuoy className="w-4 h-4 text-primary-600" />
                            <span>{t('nav.supportDesk', language)}</span>
                          </Link>
                        </>
                      ) : isGovtOfficial ? (
                        <>
                          <Link
                            href="/procurement"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-sky-50 hover:text-sky-900 transition-colors"
                            role="menuitem"
                          >
                            <Landmark className="w-4 h-4 text-sky-600" />
                            <span>{t('nav.procurement', language)}</span>
                          </Link>
                          <Link
                            href="/government/dashboard"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-sky-900 bg-sky-50/50 hover:bg-sky-100 transition-colors"
                            role="menuitem"
                          >
                            <ShieldCheck className="w-4 h-4 text-sky-600" />
                            <span>{t('nav.govtDashboard', language)}</span>
                          </Link>
                          <Link
                            href="/contact"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-900 transition-colors"
                            role="menuitem"
                          >
                            <LifeBuoy className="w-4 h-4 text-primary-600" />
                            <span>{t('nav.supportDesk', language)}</span>
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link
                            href="/slot-booking"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-900 transition-colors"
                            role="menuitem"
                          >
                            <Calendar className="w-4 h-4 text-primary-600" />
                            <span>{t('nav.mandiBookings', language)}</span>
                          </Link>
                          <Link
                            href="/contact"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-900 transition-colors"
                            role="menuitem"
                          >
                            <LifeBuoy className="w-4 h-4 text-primary-600" />
                            <span>{t('nav.supportDesk', language)}</span>
                          </Link>
                        </>
                      )}
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-100 my-1" />

                    {/* Logout Option */}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors text-left"
                      role="menuitem"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t('nav.logout', language)}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* ── LOGGED OUT STATE: SHOW LOGIN & REGISTER BUTTONS ── */
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 text-sm font-medium text-white hover:text-primary-200 hover:bg-white/10 rounded-xl transition-colors min-h-[38px] flex items-center"
                >
                  {t('nav.signIn', language)}
                </Link>
                <Link
                  href="/register"
                  className="bg-primary-400 hover:bg-primary-300 text-primary-950 text-sm font-bold px-4 py-1.5 rounded-xl transition-all shadow-sm hover:shadow min-h-[38px] flex items-center"
                >
                  {t('nav.register', language)}
                </Link>
              </div>
            )}

            {/* Mobile Menu Trigger Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 rounded-xl text-primary-200 hover:text-white hover:bg-white/10 transition-colors"
              aria-expanded={menuOpen}
              aria-label={t('common.toggleMenu', language)}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {menuOpen && (
          <div className="lg:hidden border-t border-white/10 py-4 space-y-3 animate-in slide-in-from-top-2">
            {/* User credentials if logged in */}
            {(user || mandiSession || govtSession) && (
              <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl border border-white/10 mb-2">
                <div className={`w-10 h-10 rounded-full font-bold text-sm flex items-center justify-center ${
                  isMandiOperator
                    ? 'bg-amber-500 text-amber-950'
                    : isGovtOfficial
                    ? 'bg-sky-600 text-sky-100'
                    : 'bg-emerald-600 text-white'
                }`}>
                  {initials}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-white truncate">{displayName}</p>
                  <p className="text-xs text-primary-300 truncate">{userIdentifier}</p>
                </div>
              </div>
            )}

            {/* Nav links (Role-Gated Strictly) */}
            <div className="space-y-1">
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className={`flex px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  pathname === '/'
                    ? 'bg-white/20 text-white font-semibold'
                    : 'text-primary-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                {t('nav.home', language)}
              </Link>

              {/* MANDI OPERATOR (Home, Mandi Dashboard, Warehouse Dashboard, Contact) */}
              {isMandiOperator ? (
                <>
                  <Link
                    href="/mandi/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className={`flex px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      pathname.startsWith('/mandi/dashboard')
                        ? 'bg-white/20 text-white font-semibold'
                        : 'text-primary-100 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {t('nav.mandiDashboard', language)}
                  </Link>
                  <Link
                    href="/mandi/warehouse-dashboard"
                    onClick={() => setMenuOpen(false)}
                    className={`flex px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      pathname.startsWith('/mandi/warehouse-dashboard')
                        ? 'bg-emerald-600/30 text-emerald-200 font-semibold'
                        : 'text-emerald-200 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    Warehouse Dashboard
                  </Link>
                </>
              ) : isGovtOfficial ? (
                /* GOVERNMENT OFFICIAL (Home, MSP Procurement, Procurement Dashboard, Contact) */
                <>
                  <Link
                    href="/procurement"
                    onClick={() => setMenuOpen(false)}
                    className={`flex px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      pathname.startsWith('/procurement')
                        ? 'bg-white/20 text-white font-semibold'
                        : 'text-primary-100 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {t('nav.procurement', language)}
                  </Link>
                  <Link
                    href="/government/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className={`flex px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      pathname.startsWith('/government/dashboard')
                        ? 'bg-sky-600/40 text-sky-200 font-semibold'
                        : 'text-sky-200 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {t('nav.govtDashboard', language)}
                  </Link>
                </>
              ) : (
                /* FARMER / GUEST (Home, Slot Booking, Mandi Prices, Services, Contact) */
                <>
                  <Link
                    href="/slot-booking"
                    onClick={() => setMenuOpen(false)}
                    className={`flex px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      pathname.startsWith('/slot-booking')
                        ? 'bg-white/20 text-white font-semibold'
                        : 'text-primary-100 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {t('nav.slotBooking', language)}
                  </Link>
                  <Link
                    href="/mandi-prices"
                    onClick={() => setMenuOpen(false)}
                    className={`flex px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      pathname.startsWith('/mandi-prices')
                        ? 'bg-white/20 text-white font-semibold'
                        : 'text-primary-100 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {t('nav.mandiPrices', language)}
                  </Link>

                  {/* Mobile Services Section */}
                  <div className="pt-2 pb-1">
                    <p className="px-3.5 text-[11px] font-bold text-primary-300 uppercase tracking-wider">
                      {t('nav.services', language)}
                    </p>
                  </div>

                  {serviceLinks.map((service) => {
                    const Icon = service.icon;
                    return (
                      <Link
                        key={service.href}
                        href={service.href}
                        onClick={() => setMenuOpen(false)}
                        className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                          pathname.startsWith(service.href)
                            ? 'bg-white/20 text-white font-semibold'
                            : 'text-primary-100 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${service.iconColor}`} />
                        <span>{service.label}</span>
                      </Link>
                    );
                  })}
                </>
              )}

              <Link
                href="/contact"
                onClick={() => setMenuOpen(false)}
                className={`flex px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  pathname.startsWith('/contact')
                    ? 'bg-white/20 text-white font-semibold'
                    : 'text-primary-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                {t('nav.contact', language)}
              </Link>
            </div>

            {/* Auth Buttons for Mobile */}
            <div className="pt-2 border-t border-white/10">
              {user || mandiSession || govtSession ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-300 hover:text-red-200 bg-red-950/40 hover:bg-red-900/50 border border-red-800/40 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" aria-hidden="true" />
                  <span>{t('nav.logout', language)}</span>
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-center py-2.5 px-3 rounded-xl border border-white/20 text-white text-sm font-medium hover:bg-white/10 text-center"
                  >
                    {t('nav.signIn', language)}
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-center py-2.5 px-3 rounded-xl bg-primary-400 text-primary-950 text-sm font-bold hover:bg-primary-300 text-center shadow-sm"
                  >
                    {t('nav.register', language)}
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
