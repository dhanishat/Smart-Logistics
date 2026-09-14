'use client';

import React from 'react';
import { useTranslation } from '@/lib/i18n';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-slate-800/80 bg-[#060910] py-8 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="font-bold text-white">{t('footer.platform', 'NE RoadSense Platform')}</span>
          <span className="text-slate-600">&bull;</span>
          <span>{t('footer.states', 'Serving Assam • Meghalaya • Arunachal • Sikkim • Nagaland • Manipur • Mizoram • Tripura')}</span>
        </div>
        <div className="text-slate-500 text-center md:text-right">
          {t('footer.mission', 'Empowering Logistics Drivers, Transport Fleets, NDRF & Border Roads Infrastructure')}
        </div>
      </div>
    </footer>
  );
}
