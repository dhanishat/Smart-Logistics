'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  AlertTriangle,
  Check,
  Compass,
  Globe,
  MapPin,
  Menu,
  Radio,
  Route,
  Search,
  ShieldCheck,
  Truck,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { VEHICLE_CATALOG } from '@/lib/neData';
import { useTranslation } from '@/lib/i18n';

export default function Navbar() {
  const pathname = usePathname();
  const {
    stats,
    selectedVehicle,
    setSelectedVehicle,
    isAudioEnabled,
    setIsAudioEnabled,
  } = useStore();

  const { currentLanguage, setLanguage, t, languages, currentLanguageInfo } = useTranslation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langModalOpen, setLangModalOpen] = useState(false);
  const [langSearch, setLangSearch] = useState('');
  const [selectedRegionFilter, setSelectedRegionFilter] = useState('All');

  const navLinks = [
    { href: '/', label: t('nav.overview', 'Overview'), icon: Compass },
    { href: '/report', label: t('nav.report', 'Report Hazard'), icon: AlertTriangle, badge: 'AI Scan' },
    { href: '/map', label: t('nav.map', 'Live GIS Map'), icon: MapPin, count: stats.activeAlerts },
    { href: '/planner', label: t('nav.planner', 'Route Planner'), icon: Route },
    { href: '/risk', label: t('nav.risk', 'Risk Radar'), icon: Radio },
    { href: '/admin', label: t('nav.admin', 'Authority Control'), icon: ShieldCheck },
  ];

  const regions = ['All', 'National', 'Assam', 'Arunachal', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Sikkim', 'Tripura'];

  const filteredLanguages = useMemo(() => {
    return languages.filter((l) => {
      const matchesSearch =
        l.nativeName.toLowerCase().includes(langSearch.toLowerCase()) ||
        l.englishName.toLowerCase().includes(langSearch.toLowerCase()) ||
        l.region.toLowerCase().includes(langSearch.toLowerCase()) ||
        l.script.toLowerCase().includes(langSearch.toLowerCase());

      const matchesRegion =
        selectedRegionFilter === 'All' ||
        (selectedRegionFilter === 'National' && (l.region.includes('National') || l.region.includes('Global'))) ||
        l.region.toLowerCase().includes(selectedRegionFilter.toLowerCase());

      return matchesSearch && matchesRegion;
    });
  }, [languages, langSearch, selectedRegionFilter]);

  const handleSelectLanguage = (code: string) => {
    setLanguage(code);
    setLangModalOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#090D16]/95 backdrop-blur-md border-b border-slate-800/80">
      {/* Top Telemetry Alert Ribbon */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-amber-950/30 to-red-950/40 border-b border-slate-800/50 px-4 py-1 text-xs flex items-center justify-between text-slate-300">
        <div className="flex items-center gap-3 overflow-hidden">
          <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-400 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {t('telemetry.title', 'NE LIVE TELEMETRY:')}
          </span>
          <span className="truncate text-slate-400">
            {t(
              'telemetry.ribbon',
              'No live hazard reports yet. Submit verified road conditions to update the network.'
            )}
          </span>
        </div>
        <div className="hidden md:flex items-center gap-4 shrink-0 text-slate-400">
          <span className="flex items-center gap-1">
            <span className="text-red-400 font-bold">{stats.criticalBlockages}</span> {t('telemetry.blockages', 'Blockages')}
          </span>
          <span className="text-slate-600">|</span>
          <span className="flex items-center gap-1">
            <span className="text-emerald-400 font-bold">{stats.roadsMonitored}</span> {t('telemetry.corridorsActive', 'Corridors Active')}
          </span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-2 lg:gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-600 to-blue-600 flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform shrink-0">
              <Compass className="w-5 h-5 text-white animate-spin-slow" />
            </div>
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-emerald-400 bg-clip-text text-transparent">
                NE RoadSense
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                AI
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1.5 shrink-0">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                    isActive
                      ? 'text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 shadow-sm shadow-emerald-500/10'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 leading-none shrink-0">
                      {link.badge}
                    </span>
                  )}
                  {link.count !== undefined && link.count > 0 && (
                    <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-red-500/20 text-red-400 border border-red-500/30 leading-none shrink-0">
                      {link.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Cluster */}
          <div className="hidden md:flex items-center gap-2 lg:gap-2.5 shrink-0">
            {/* Language Selector Dropdown Button */}
            <button
              onClick={() => setLangModalOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/40 hover:border-emerald-400 rounded-xl px-2.5 py-1.5 shadow-sm hover:shadow-emerald-500/10 transition-all text-left shrink-0 group"
              title="Change Website Language / भाषा / লোন / Ktien / Ṭawng"
            >
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Globe className="w-3.5 h-3.5 animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] uppercase font-bold text-emerald-400/80 tracking-wider leading-none">
                  {t('nav.languages', 'Languages')}
                </span>
                <span className="text-xs font-bold text-white truncate max-w-[130px]">
                  {currentLanguageInfo.nativeName}
                </span>
              </div>
            </button>

            {/* Vehicle Profile Switcher */}
            <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-xl px-2.5 py-1.5 shadow-inner shrink-0">
              <Truck className="w-3.5 h-3.5 text-emerald-400 mr-2 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[8px] uppercase font-bold text-slate-400 tracking-wider leading-none">
                  {t('nav.vehicleProfile', 'Vehicle Profile')}
                </span>
                <select
                  value={selectedVehicle}
                  onChange={(e) => setSelectedVehicle(e.target.value as any)}
                  className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer pr-1 truncate max-w-[150px]"
                >
                  {VEHICLE_CATALOG.map((v) => (
                    <option key={v.type} value={v.type} className="bg-slate-900 text-white text-xs">
                      {t(`vehicle.${v.type}`, v.shortLabel || v.label)} ({v.weightTonnes}T)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Audio Toggle */}
            <button
              onClick={() => setIsAudioEnabled(!isAudioEnabled)}
              title={isAudioEnabled ? t('nav.audioOn', 'Audio Alerts On') : t('nav.audioOff', 'Audio Alerts Muted')}
              className={`p-2 rounded-xl border transition-all shrink-0 ${
                isAudioEnabled
                  ? 'bg-slate-900 border-slate-800 text-emerald-400 hover:border-emerald-500/50'
                  : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
              }`}
            >
              {isAudioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>

          </div>

          {/* Mobile Menu & Language Button */}
          <div className="flex xl:hidden items-center gap-2">
            <button
              onClick={() => setLangModalOpen(true)}
              className="p-2 rounded-lg bg-slate-900 border border-emerald-500/40 text-emerald-400 flex items-center gap-1 text-xs font-bold"
              title="Language"
            >
              <Globe className="w-4 h-4" />
              <span className="truncate max-w-[65px]">{currentLanguageInfo.nativeName}</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-[#090D16] border-b border-slate-800 px-4 pt-2 pb-6 space-y-3">
          {/* Mobile Language Trigger */}
          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold uppercase">{t('nav.languages', 'Languages')}:</span>
                <span className="text-xs font-bold text-white">{currentLanguageInfo.nativeName} ({currentLanguageInfo.englishName})</span>
              </div>
            </div>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setLangModalOpen(true);
              }}
              className="px-2.5 py-1 text-xs bg-emerald-500 text-black font-bold rounded-lg hover:bg-emerald-400"
            >
              Change
            </button>
          </div>

          {/* Vehicle Selector Mobile */}
          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
            <span className="text-xs text-slate-400 block mb-1 font-semibold">
              {t('nav.vehicleProfile', 'Vehicle Profile')}:
            </span>
            <select
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value as any)}
              className="w-full bg-slate-800 text-white text-sm font-semibold rounded-lg px-3 py-2 border border-slate-700"
            >
              {VEHICLE_CATALOG.map((v) => (
                <option key={v.type} value={v.type}>
                  {t(`vehicle.${v.type}`, v.label)} ({v.weightTonnes} Tonnes)
                </option>
              ))}
            </select>
          </div>

          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-emerald-400" />
                  <span>{link.label}</span>
                </div>
                {link.badge && (
                  <span className="px-2 py-0.5 text-[10px] rounded bg-amber-500/20 text-amber-300">
                    {link.badge}
                  </span>
                )}
                {link.count !== undefined && link.count > 0 && (
                  <span className="px-2 py-0.5 text-[10px] rounded-full bg-red-500/20 text-red-400">
                    {link.count}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}

      {/* Full Multilingual Language Selector Modal / Dialog */}
      {langModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-5xl h-[82vh] sm:h-[78vh] flex flex-col bg-[#0B1120] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="shrink-0 p-3 sm:p-4 border-b border-slate-800 flex items-start justify-between gap-3 bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-950/30">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <Globe className="w-5 h-5 animate-spin-slow" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-lg font-extrabold text-white flex flex-wrap items-center gap-2 leading-tight">
                    <span>Choose Language</span>
                    <span className="px-2 py-0.5 text-[10px] rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 shrink-0">
                      {languages.length} Languages
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Choose your language. The full website text will be translated automatically.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setLangModalOpen(false)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search & Region Filter Bar */}
            <div className="shrink-0 p-3 sm:p-4 border-b border-slate-800/80 bg-slate-900/50 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={langSearch}
                  onChange={(e) => setLangSearch(e.target.value)}
                  placeholder="Search by language (e.g. Tamil, Assamese, Bodo, Khasi, Mizo, Meitei, Monpa, Tangkhul)..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* State/Region filter chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin text-xs">
                {regions.map((region) => (
                  <button
                    key={region}
                    onClick={() => setSelectedRegionFilter(region)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                      selectedRegionFilter === region
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm shadow-emerald-500/20'
                        : 'bg-slate-800/70 text-slate-300 hover:bg-slate-700/80'
                    }`}
                  >
                    {region}
                  </button>
                ))}
              </div>
            </div>

            {/* Languages Grid */}
            <div className="p-3 sm:p-5 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 min-h-0">
              {filteredLanguages.map((lang) => {
                const isSelected = currentLanguage === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => handleSelectLanguage(lang.code)}
                    className={`p-3 rounded-xl border text-left flex items-start justify-between gap-2 transition-all hover:scale-[1.01] ${
                      isSelected
                        ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 text-slate-200'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-bold text-white tracking-wide">
                          {lang.nativeName}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <span className="font-semibold text-emerald-400/90">{lang.englishName}</span>
                        <span>&bull;</span>
                        <span className="text-[11px] text-slate-400 truncate max-w-[150px]">{lang.region}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Script: <span className="text-slate-300">{lang.script}</span>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="p-1 rounded-full bg-emerald-500 text-slate-950 shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="shrink-0 p-3 sm:p-4 border-t border-slate-800 bg-slate-950/90 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
              <div>
                Active Language: <strong className="text-emerald-400 font-bold">{currentLanguageInfo.nativeName} ({currentLanguageInfo.englishName})</strong>
              </div>
              <button
                onClick={() => setLangModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
