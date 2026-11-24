import React, { useState, useEffect, useRef } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { Save, Trash2, Plus, CheckCircle2 } from 'lucide-react';
import { db } from '../../firebase';
import { siteId } from '../../constants/siteConfig';
import {
  useSiteSettings,
  defaultSettings,
  SiteSettings,
  AboutFact,
} from '../../hooks/useSiteSettings';
import { handleFirestoreError, OperationType } from '../../utils/firebaseErrors';
import ImageUpload from '../../components/admin/ImageUpload';

export default function AdminSettings() {
  const { settings } = useSiteSettings();
  const isDirtyRef = useRef(false);

  const [form, setForm] = useState<SiteSettings>(settings);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  useEffect(() => {
    if (!isDirtyRef.current) {
      setForm(settings);
    }
  }, [settings]);

  const updateField = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => {
    isDirtyRef.current = true;
    setSavedMsg('');
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateFact = (idx: number, field: keyof AboutFact, value: string) => {
    isDirtyRef.current = true;
    setSavedMsg('');
    setForm((prev) => {
      const nextFacts = [...(prev.aboutFacts || [])];
      nextFacts[idx] = { ...nextFacts[idx], [field]: value };
      return { ...prev, aboutFacts: nextFacts };
    });
  };

  const addFact = () => {
    isDirtyRef.current = true;
    setForm((prev) => ({
      ...prev,
      aboutFacts: [
        ...(prev.aboutFacts || []),
        { icon: 'ShieldCheck', title: '', desc: '' },
      ],
    }));
  };

  const removeFact = (idx: number) => {
    isDirtyRef.current = true;
    setForm((prev) => ({
      ...prev,
      aboutFacts: (prev.aboutFacts || []).filter((_, i) => i !== idx),
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedMsg('');
    const path = `sites/${siteId}/settings/site`;
    try {
      const cleanPayload: SiteSettings = {
        ...defaultSettings,
        ...form,
        aboutFacts: (form.aboutFacts || []).filter((f) => f.title.trim() || f.desc.trim()),
      };
      await setDoc(doc(db, 'sites', siteId, 'settings', 'site'), cleanPayload);
      localStorage.setItem(`site_settings_cache_${siteId}`, JSON.stringify(cleanPayload));
      isDirtyRef.current = false;
      setSavedMsg('Site settings saved and synced globally!');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="max-w-5xl space-y-8 pb-12">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-stone-200 sticky top-0 z-20">
        <div>
          <h2 className="text-lg font-bold text-stone-900">Global Visual Identity</h2>
          <p className="text-xs text-stone-500">
            Changes sync immediately across the public storefront.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {savedMsg && (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-100 px-3 py-1.5 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {savedMsg}
            </span>
          )}
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-lime-600 hover:bg-lime-700 disabled:opacity-50 text-white font-bold text-sm px-6 py-2.5 rounded-xl cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Text & Copy */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 space-y-5">
        <h3 className="font-bold text-stone-900 text-base border-b border-stone-100 pb-3">
          Brand & Hero Copy
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Website Name
            </label>
            <input
              type="text"
              required
              value={form.siteName}
              onChange={(e) => updateField('siteName', e.target.value)}
              className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Footer Copyright Text
            </label>
            <input
              type="text"
              value={form.copyrightText}
              onChange={(e) => updateField('copyrightText', e.target.value)}
              className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1.5">
            Hero Section Title (supports &lt;br/&gt;)
          </label>
          <input
            type="text"
            value={form.heroTitle}
            onChange={(e) => updateField('heroTitle', e.target.value)}
            className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1.5">
            Hero Section Subtitle
          </label>
          <textarea
            rows={3}
            value={form.heroSubtitle}
            onChange={(e) => updateField('heroSubtitle', e.target.value)}
            className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm"
          />
        </div>
      </div>

      {/* Quick Facts Editor */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 space-y-5">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <h3 className="font-bold text-stone-900 text-base">
            About Page - Quick Facts
          </h3>
          <button
            type="button"
            onClick={addFact}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-lime-700 hover:text-lime-800 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Quick Fact
          </button>
        </div>

        <div className="space-y-4">
          {(form.aboutFacts || []).map((fact, idx) => (
            <div
              key={idx}
              className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start bg-stone-50 p-4 rounded-xl border border-stone-200"
            >
              <div className="md:col-span-3">
                <label className="block text-[11px] font-bold text-stone-500 mb-1">
                  Icon
                </label>
                <select
                  value={fact.icon}
                  onChange={(e) => updateFact(idx, 'icon', e.target.value)}
                  className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs"
                >
                  <option value="ShieldCheck">ShieldCheck</option>
                  <option value="GraduationCap">GraduationCap</option>
                  <option value="Award">Award</option>
                  <option value="Leaf">Leaf</option>
                  <option value="Heart">Heart</option>
                  <option value="BookOpen">BookOpen</option>
                </select>
              </div>
              <div className="md:col-span-4">
                <label className="block text-[11px] font-bold text-stone-500 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={fact.title}
                  onChange={(e) => updateFact(idx, 'title', e.target.value)}
                  className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs"
                />
              </div>
              <div className="md:col-span-4">
                <label className="block text-[11px] font-bold text-stone-500 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={fact.desc}
                  onChange={(e) => updateFact(idx, 'desc', e.target.value)}
                  className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs"
                />
              </div>
              <div className="md:col-span-1 flex justify-end pt-5">
                <button
                  type="button"
                  onClick={() => removeFact(idx)}
                  className="text-red-500 hover:text-red-700 p-1.5 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6 Image Uploads */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 space-y-6">
        <h3 className="font-bold text-stone-900 text-base border-b border-stone-100 pb-3">
          Visual Assets & Backgrounds
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ImageUpload
            label="Brand Logo (1:1)"
            folder="settings"
            aspect={1}
            value={form.logoUrl}
            onChange={(url) => updateField('logoUrl', url)}
          />
          <ImageUpload
            label="Founder / CEO Photo (1:1)"
            folder="settings"
            aspect={1}
            value={form.ceoPhotoUrl}
            onChange={(url) => updateField('ceoPhotoUrl', url)}
          />
          <ImageUpload
            label="Home Hero Background (16:9)"
            folder="settings"
            aspect={16 / 9}
            value={form.heroBgUrl}
            onChange={(url) => updateField('heroBgUrl', url)}
          />
          <ImageUpload
            label="About Banner Background (16:9)"
            folder="settings"
            aspect={16 / 9}
            value={form.aboutBgUrl}
            onChange={(url) => updateField('aboutBgUrl', url)}
          />
          <ImageUpload
            label="Services Banner Background (16:9)"
            folder="settings"
            aspect={16 / 9}
            value={form.servicesBgUrl}
            onChange={(url) => updateField('servicesBgUrl', url)}
          />
        </div>
      </div>
    </form>
  );
}
