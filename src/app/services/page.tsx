'use client';

import React from 'react';
import Link from 'next/link';
import {
  Landmark,
  Snowflake,
  Leaf,
  Tractor,
  ShieldCheck,
  Truck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import PageContainer from '@/components/shared/PageContainer';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/lib/translations';

export default function ServicesPage() {
  const { language } = useLanguage();

  const services = [
    {
      href: '/procurement',
      title: t('nav.procurement', language),
      badge: 'MSP • Fair Average Quality',
      desc:
        language === 'hi'
          ? 'सरकारी न्यूनतम समर्थन मूल्य (MSP) खरीद के लिए गुणवत्ता निरीक्षण स्लॉट बुक करें और भुगतान स्थिति ट्रैक करें।'
          : language === 'mr'
          ? 'शासकीय हमीभाव (MSP) खरेदीसाठी गुणवत्ता तपासणी स्लॉट बुक करा आणि देयक स्थिती ट्रॅक करा.'
          : language === 'gu'
          ? 'સરકારી લઘુત્તમ ટેકાના ભાવ (MSP) ખરીદી માટે ગુણવત્તા નિરીક્ષણ સ્લોટ બુક કરો અને ચુકવણી સ્થિતિ ટ્રેક કરો.'
          : language === 'pa'
          ? 'ਸਰਕਾਰੀ ਘੱਟੋ-ਘੱਟ ਸਮਰਥਨ ਮੁੱਲ (MSP) ਖਰੀਦ ਲਈ ਗੁਣਵੱਤਾ ਜਾਂਚ ਸਲਾਟ ਬੁੱਕ ਕਰੋ ਅਤੇ ਭੁਗਤਾਨ ਸਥਿਤੀ ਟਰੈਕ ਕਰੋ।'
          : 'Book Fair Average Quality (FAQ) crop inspection appointments with certified government officials for guaranteed MSP procurement.',
      icon: Landmark,
      color: 'from-sky-700 to-sky-950',
      badgeColor: 'bg-sky-100 text-sky-900 border-sky-300',
    },
    {
      href: '/cold-storage',
      title: t('nav.coldStorage', language),
      badge: 'WDRA • e-NWR Certified',
      desc:
        language === 'hi'
          ? 'निकटतम आधुनिक शीतगृह एवं वैज्ञानिक गोदाम खोजें, नमी व तापमान चेक करें और स्टोरेज स्पेस आरक्षित करें।'
          : language === 'mr'
          ? 'जवळचे आधुनिक शीतगृह आणि वैज्ञानिक गोदामे शोधा, तापमान तपासा आणि साठवणूक जागा आरक्षित करा.'
          : language === 'gu'
          ? 'નજીકનું આધુનિક કોલ્ડ સ્ટોરેજ અને વૈજ્ઞાનિક ગોડાઉન શોધો, ભેજ અને તાપમાન તપાસો અને સ્ટોરેજ સ્પેસ બુક કરો.'
          : language === 'pa'
          ? 'ਨੇੜਲੇ ਆਧੁਨਿਕ ਕੋਲਡ ਸਟੋਰੇਜ ਅਤੇ ਵਿਗਿਆਨਕ ਗੁਦਾਮ ਲੱਭੋ, ਨਮੀ ਅਤੇ ਤਾਪਮਾਨ ਚੈੱਕ ਕਰੋ ਅਤੇ ਸਟੋਰੇਜ ਜਗ੍ਹਾ ਰਾਖਵੀਂ ਕਰੋ।'
          : 'Locate WDRA-approved cold chain facilities and CWC godowns with real-time temperature, humidity, and direct space reservations.',
      icon: Snowflake,
      color: 'from-cyan-700 to-cyan-950',
      badgeColor: 'bg-cyan-100 text-cyan-900 border-cyan-300',
    },
    {
      href: '/crop-care',
      title: t('nav.cropCare', language),
      badge: 'ICAR & CIBRC Certified',
      desc:
        language === 'hi'
          ? 'अपनी जमीन के सही आकार के अनुसार जैविक व रासायनिक खाद-कीटनाशक की मात्रा की वैज्ञानिक गणना करें।'
          : language === 'mr'
          ? 'तुमच्या जमिनीच्या अचूक क्षेत्रफळानुसार सेंद्रिय आणि रासायनिक खते व कीटकनाशकांची प्रमाण गणना करा.'
          : language === 'gu'
          ? 'તમારી જમીનના ચોક્કસ કદ અનુસાર જૈવિક અને રાસાયણિક ખાતર-જંતુનાશકના જથ્થાની વૈજ્ઞાનિક ગણતરી કરો.'
          : language === 'pa'
          ? 'ਆਪਣੀ ਜ਼ਮੀਨ ਦੇ ਸਹੀ ਆਕਾਰ ਅਨੁਸਾਰ ਜੈਵਿਕ ਅਤੇ ਰਸਾਇਣਕ ਖਾਦ-ਕੀਟਨਾਸ਼ਕਾਂ ਦੀ ਮਾਤਰਾ ਦੀ ਵਿਗਿਆਨਕ ਗਣਨਾ ਕਰੋ।'
          : 'Scientific nutrient and crop protection advisory with dynamic acreage scaling for organic and inorganic ICAR-approved inputs.',
      icon: Leaf,
      color: 'from-emerald-700 to-emerald-950',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    },
    {
      href: '/machinery-rental',
      title: t('nav.machinery', language),
      badge: 'SMAM CHC Network',
      desc:
        language === 'hi'
          ? 'कस्टम हायरिंग सेंटर (CHC) से प्रमाणित ट्रैक्टर, रोटावेटर, कंबाइन हार्वेस्टर और राइस डीहलर मालिकों से सीधा संपर्क करें।'
          : language === 'mr'
          ? 'कस्टम हायरिंग सेंटर (CHC) मधून ट्रॅक्टर, रोटाव्हेटर, हार्वेस्टर आणि राइस डीहलर मालकांशी थेट संपर्क साधा.'
          : language === 'gu'
          ? 'કસ્ટમ હાયરિંગ સેન્ટર (CHC) ના પ્રમાણિત ટ્રેક્ટર, રોટાવેટર, કમ્બાઈન હાર્વેસ્ટર અને રાઇસ હલર માલિકોનો સીધો સંપર્ક કરો.'
          : language === 'pa'
          ? 'ਕਸਟਮ ਹਾਇਰਿੰਗ ਸੈਂਟਰ (CHC) ਤੋਂ ਪ੍ਰਮਾਣਿਤ ਟਰੈਕਟਰ, ਰੋਟਾਵੇਟਰ, ਕੰਬਾਈਨ ਹਾਰਵੈਸਟਰ ਅਤੇ ਰਾਈਸ ਡੀਹਲਰ ਮਾਲਕਾਂ ਨਾਲ ਸਿੱਧਾ ਸੰਪਰਕ ਕਰੋ।'
          : 'Explore certified farm machinery catalog with complete technical specs, rates, and direct machine owner contact details.',
      icon: Tractor,
      color: 'from-amber-700 to-amber-950',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    },
    {
      href: '/schemes',
      title: t('nav.schemes', language),
      badge: 'Central & State Govt',
      desc:
        language === 'hi'
          ? 'PMFBY फसल बीमा, किसान क्रेडिट कार्ड (KCC), और पीएम-किसान अनुदान योजनाओं की पात्रता और आवेदन लिंक।'
          : language === 'mr'
          ? 'PMFBY पीक विमा, किसान क्रेडिट कार्ड (KCC), आणि पीएम-किसान अनुदानाची माहिती आणि थेट अर्ज.'
          : language === 'gu'
          ? 'PMFBY પાક વીમો, કિસાન ક્રેડિટ કાર્ડ (KCC) અને પીએમ-કિસાન સબસિડી યોજનાઓની પાત્રતા અને અરજી લિંક.'
          : language === 'pa'
          ? 'PMFBY ਫਸਲ ਬੀਮਾ, ਕਿਸਾਨ ਕ੍ਰੈਡਿਟ ਕਾਰਡ (KCC), ਅਤੇ ਪੀਐਮ-ਕਿਸਾਨ ਸਬਸਿਡੀ ਸਕੀਮਾਂ ਦੀ ਯੋਗਤਾ ਅਤੇ ਅਰਜ਼ੀ ਲਿੰਕ।'
          : 'Access official PMFBY crop insurance, Kisan Credit Card (KCC), PM-KISAN, and AIF subsidies with direct links and helplines.',
      icon: ShieldCheck,
      color: 'from-rose-700 to-rose-950',
      badgeColor: 'bg-rose-100 text-rose-900 border-rose-300',
    },
    {
      href: '/vehicle-booking',
      title: t('nav.vehicleBooking', language),
      badge: 'Instant Dispatch Token',
      desc:
        language === 'hi'
          ? 'खेत से मंडी तक फसल परिवहन के लिए छोटे हाथी से लेकर भारी ट्रक बुक करें और तत्काल टोकन प्राप्त करें।'
          : language === 'mr'
          ? 'शेत ते बाजार समिती वाहतुकीसाठी योग्य वाहन निवडा आणि तात्काळ वाहतूक टोकन मिळवा.'
          : language === 'gu'
          ? 'ખેતરથી માર્કેટ યાર્ડ સુધી પાક પરિવહન માટે છોટા હાથીથી લઈને ભારે ટ્રક બુક કરો અને તાત્કાલિક ટોકન મેળવો.'
          : language === 'pa'
          ? 'ਖੇਤ ਤੋਂ ਮੰਡੀ ਤੱਕ ਫਸਲ ਦੀ ਢੋਆ-ਢੁਆਈ ਲਈ ਛੋਟੇ ਹਾਥੀ ਤੋਂ ਲੈ ਕੇ ਭਾਰੀ ਟਰੱਕ ਬੁੱਕ ਕਰੋ ਅਤੇ ਤੁਰੰਤ ਟੋਕਨ ਪ੍ਰਾਪਤ ਕਰੋ।'
          : 'Book verified agricultural transport carriers from mini trucks to 10-wheelers with transparent per-quintal freight calculation.',
      icon: Truck,
      color: 'from-teal-700 to-teal-950',
      badgeColor: 'bg-teal-100 text-teal-900 border-teal-300',
    },
  ];

  return (
    <PageContainer>
      <div className="max-w-6xl mx-auto py-8 space-y-8">
        {/* Header Hero Banner */}
        <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-primary-950 text-white rounded-[2rem] p-8 sm:p-10 shadow-2xl relative overflow-hidden border border-emerald-800/40">
          <div className="max-w-3xl relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              {t('services.eyebrow', language)}
            </div>
            <h1 className="display-font text-3xl sm:text-5xl font-extrabold leading-tight">
              {t('services.title', language)}
            </h1>
            <p className="text-sm sm:text-base text-primary-100/90 leading-relaxed">
              {t('services.subtitle', language)}
            </p>
          </div>
        </div>

        {/* 6 Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.href}
                className="bg-white rounded-3xl border-2 border-primary-100 hover:border-emerald-500 hover:shadow-xl transition-all p-6 flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.color} text-white flex items-center justify-center shadow-md`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${s.badgeColor}`}
                    >
                      {s.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-primary-950 group-hover:text-emerald-800 transition-colors">
                      {s.title}
                    </h3>
                    <p className="text-xs text-primary-700 mt-1 leading-relaxed">{s.desc}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-primary-100">
                  <Link
                    href={s.href}
                    className="inline-flex items-center justify-between w-full text-xs font-extrabold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-2.5 rounded-xl transition-colors"
                  >
                    <span>Open Service</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PageContainer>
  );
}

