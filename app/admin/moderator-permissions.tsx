// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import * as sb from '@/lib/sb';

const PERMISSION_KEYS = [
  { key: 'posts', label: 'সংবাদ ও পোস্ট ব্যবস্থাপনা (Posts)' },
  { key: 'notices', label: 'নোটিশ বোর্ড (Notices)' },
  { key: 'editorial', label: 'সম্পাদকীয় ও মতামত (Editorial)' },
  { key: 'stories', label: 'স্টোরিজ (Stories)' },
  { key: 'reels', label: 'রিলস হাব (Reels)' },
  { key: 'polls', label: 'পোল ও জরিপ (Polls)' },
  { key: 'events', label: 'ইভেন্ট ব্যবস্থাপনা (Events)' },
  { key: 'club_posts', label: 'ক্লাব পোস্ট (Club Posts)' },
  { key: 'comments', label: 'মন্তব্য মডারেশন (Comments)' }
];

export default function ModeratorPermissionsManager() {
  const [globalMode, setGlobalMode] = useState('custom');
  const [moderators, setModerators] = useState([]);
  const [selectedModId, setSelectedModId] = useState('');
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    try {
      const token = sb.getToken?.() || '';
      if (typeof sb.getModeratorPanelMode === 'function') {
        const modeData = await sb.getModeratorPanelMode(token);
        if (modeData?.mode) setGlobalMode(modeData.mode);
      }

      if (typeof sb.getAllProfilesAdmin === 'function') {
        const profiles = await sb.getAllProfilesAdmin(token);
        const mods = (profiles || []).filter(p => p.role === 'moderator' && p.approved);
        setModerators(mods);
        if (mods.length > 0) {
          setSelectedModId(mods[0].id);
          if (typeof sb.getModeratorPermissions === 'function') {
            const perms = await sb.getModeratorPermissions(token, mods[0].id);
            setPermissions(perms || {});
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleModeChange(newMode) {
    try {
      setLoading(true);
      const token = sb.getToken?.() || '';
      if (typeof sb.setModeratorPanelMode === 'function') {
        await sb.setModeratorPanelMode(token, newMode);
      }
      setGlobalMode(newMode);
      setMsg('মডারেটর প্যানেল মোড আপডেট হয়েছে!');
      setTimeout(() => setMsg(''), 3000);
    } catch (e) {
      alert('ত্রুটি: ' + e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectMod(id) {
    setSelectedModId(id);
    try {
      const token = sb.getToken?.() || '';
      if (typeof sb.getModeratorPermissions === 'function') {
        const perms = await sb.getModeratorPermissions(token, id);
        setPermissions(perms || {});
      }
    } catch (e) {
      setPermissions({});
    }
  }

  async function handleTogglePerm(key) {
    if (!selectedModId) return;
    const updated = { ...permissions, [key]: !permissions[key] };
    setPermissions(updated);
    try {
      const token = sb.getToken?.() || '';
      if (typeof sb.setModeratorPermissions === 'function') {
        await sb.setModeratorPermissions(token, selectedModId, updated);
      }
      setMsg('পারমিশন সফলভাবে সংরক্ষিত হয়েছে!');
      setTimeout(() => setMsg(''), 3000);
    } catch (e) {
      alert('ত্রুটি: ' + e.message);
    }
  }

  return (
    <div className="space-y-6 rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white">মডারেটর এক্সেস ও পারমিশন কন্ট্রোল</h2>
          <p className="text-sm text-slate-400">এডমিন হিসেবে মডারেটরদের জন্য নির্দিষ্ট ফিচার চালু বা বন্ধ করুন</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-slate-300 font-medium mr-2">গ্লোবাল মোড:</span>
          <button
            onClick={() => handleModeChange('all_enabled')}
            disabled={loading}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              globalMode === 'all_enabled' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            সব চালু (All Enabled)
          </button>
          <button
            onClick={() => handleModeChange('custom')}
            disabled={loading}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              globalMode === 'custom' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            কাস্টম পারমিশন (Custom)
          </button>
          <button
            onClick={() => handleModeChange('all_disabled')}
            disabled={loading}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              globalMode === 'all_disabled' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            সব বন্ধ (All Disabled)
          </button>
        </div>
      </div>

      {msg && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl text-sm">
          {msg}
        </div>
      )}

      {moderators.length === 0 ? (
        <p className="text-slate-400 py-4">কোনো অনুমোদিত মডারেটর অ্যাকাউন্ট পাওয়া যায়নি।</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2 border-r border-white/10 pr-4">
            <h3 className="font-semibold text-slate-300 mb-2">মডারেটর নির্বাচন করুন</h3>
            {moderators.map((mod) => (
              <button
                key={mod.id}
                onClick={() => handleSelectMod(mod.id)}
                className={`w-full text-left p-3 rounded-xl transition ${
                  selectedModId === mod.id
                    ? 'bg-blue-600 text-white font-medium'
                    : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div>{mod.full_name || 'নামহীন মডারেটর'}</div>
                <div className="text-xs opacity-75">{mod.email}</div>
              </button>
            ))}
          </div>

          <div className="md:col-span-2 space-y-3">
            <h3 className="font-semibold text-slate-300 mb-2">
              ফিচার পারমিশন {globalMode !== 'custom' && <span className="text-xs text-amber-400 font-normal">(গ্লোবাল মোড কার্যকর আছে)</span>}
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {PERMISSION_KEYS.map(({ key, label }) => {
                const isActive = permissions[key] ?? true;
                return (
                  <div
                    key={key}
                    onClick={() => handleTogglePerm(key)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                      isActive
                        ? 'border-emerald-500/40 bg-emerald-950/20 text-white'
                        : 'border-white/10 bg-slate-950/40 text-slate-400'
                    }`}
                  >
                    <span className="text-sm font-medium">{label}</span>
                    <span
                      className={`text-xs px-2 py-1 rounded-md font-bold ${
                        isActive ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isActive ? 'অনুমোদিত' : 'বন্ধ'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}