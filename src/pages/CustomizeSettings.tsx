import React, { useState } from 'react';
import { ImagePlus, Upload, X, RefreshCw, Eye, Palette, Sliders, Type } from 'lucide-react';
import { Settings } from '../types';

interface CustomizeSettingsProps {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  onExportData: () => void;
  onImportData: () => void;
  onForceSync: () => void;
}

// Predefined beautiful background images
const PRESET_BACKGROUNDS = [
  {
    name: 'Abstract Gradient',
    url: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1920&q=80',
  },
  {
    name: 'Mountain Landscape',
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80',
  },
  {
    name: 'Ocean Waves',
    url: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1920&q=80',
  },
  {
    name: 'Northern Lights',
    url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1920&q=80',
  },
  {
    name: 'Starry Night',
    url: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&q=80',
  },
  {
    name: 'Forest Path',
    url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&q=80',
  },
  {
    name: 'City Skyline',
    url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1920&q=80',
  },
  {
    name: 'Desert Dunes',
    url: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1920&q=80',
  },
];

export function CustomizeSettings({ 
  settings, 
  setSettings, 
  onExportData, 
  onImportData,
  onForceSync
}: CustomizeSettingsProps) {
  const [customUrl, setCustomUrl] = useState('');
  const [isAddingCustom, setIsAddingCustom] = useState(false);

  const handlePresetSelect = (url: string) => {
    setSettings((s) => ({ ...s, backgroundImage: url }));
  };

  const handleCustomUrlAdd = () => {
    if (customUrl.trim()) {
      setSettings((s) => ({ ...s, backgroundImage: customUrl.trim() }));
      setCustomUrl('');
      setIsAddingCustom(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setSettings((s) => ({ ...s, backgroundImage: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveBackground = () => {
    setSettings((s) => ({ ...s, backgroundImage: '' }));
  };

  const handleOpacityChange = (value: number) => {
    setSettings((s) => ({ ...s, backgroundOpacity: value }));
  };

  const handleBlurChange = (value: number) => {
    setSettings((s) => ({ ...s, backgroundBlur: value }));
  };

  const handleCardOpacityChange = (value: number) => {
    setSettings((s) => ({ ...s, cardOpacity: value }));
  };

  const handleTextBrightnessChange = (value: number) => {
    setSettings((s) => ({ ...s, textBrightness: value }));
  };

  const handleTextColorChange = (value: string) => {
    setSettings((s) => ({ ...s, textColor: value }));
  };

  const handleBackgroundColorChange = (value: string) => {
    setSettings((s) => ({ ...s, backgroundColor: value }));
  };

  const handleCardBlurChange = (value: number) => {
    setSettings((s) => ({ ...s, cardBlur: value }));
  };

  const handleCardBackgroundColorChange = (value: string) => {
    setSettings((s) => ({ ...s, cardBackgroundColor: value }));
  };

  const syncStatus = "Connected"; // Visual placeholder

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-black text-text-primary tracking-tight flex items-center gap-3">
          <Palette className="text-accent" size={32} />
          Customize
        </h2>
        <p className="text-text-secondary font-medium mt-2">
          Personalize your workspace appearance
        </p>
      </div>

      {/* Sync & Backup Section */}
      <div className="glass border border-border-card rounded-3xl p-6 backdrop-blur-md shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <RefreshCw size={24} className="text-accent animate-spin-slow" />
            <div>
              <h3 className="text-xl font-bold text-text-primary">Sync & Backup</h3>
              <p className="text-sm text-text-secondary font-medium">Export or import your data manually if sync is slow</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold border border-emerald-500/20">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Chrome Sync Ready
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Export */}
          <button
            onClick={onExportData}
            className="flex items-center gap-4 p-5 rounded-2xl bg-bg-card border border-border-card hover:border-accent hover:bg-accent/5 transition-all text-left group"
          >
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Upload size={24} className="text-accent rotate-180" />
            </div>
            <div>
              <div className="font-bold text-text-primary group-hover:text-accent transition-colors">Export All Data</div>
              <div className="text-xs text-text-secondary font-medium mt-0.5">Save settings, notes & reminders as a file</div>
            </div>
          </button>

          {/* Import */}
          <button
            onClick={onImportData}
            className="flex items-center gap-4 p-5 rounded-2xl bg-bg-card border border-border-card hover:border-accent hover:bg-accent/5 transition-all text-left group"
          >
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Upload size={24} className="text-accent" />
            </div>
            <div>
              <div className="font-bold text-text-primary group-hover:text-accent transition-colors">Import Data</div>
              <div className="text-xs text-text-secondary font-medium mt-0.5">Restore data from a backup file</div>
            </div>
          </button>
        </div>

        <div className="pt-2">
            <button
                onClick={onForceSync}
                className="w-full py-4 rounded-xl border-2 border-dashed border-border-card hover:border-accent/40 hover:bg-accent/5 flex items-center justify-center gap-3 transition-all group"
            >
                <RefreshCw size={18} className="text-text-secondary group-hover:text-accent group-hover:rotate-180 transition-all duration-700" />
                <span className="text-sm font-bold text-text-secondary group-hover:text-accent">Force Metadata Repair & Push to Sync</span>
            </button>
            <p className="text-[10px] text-text-secondary text-center mt-3 font-medium opacity-60">
                Tip: If your notes aren't appearing on another PC, click "Force Metadata Repair" to re-encode all data into your bookmarks.
            </p>
        </div>
      </div>

      {/* Current Background Preview */}
      {settings.backgroundImage && (
        <div className="glass border border-border-card rounded-3xl p-6 backdrop-blur-md shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <Eye size={20} className="text-accent" />
              Current Background
            </h3>
            <button
              onClick={handleRemoveBackground}
              className="px-4 py-2 rounded-xl bg-danger/10 text-danger font-semibold text-sm hover:bg-danger/20 transition-all flex items-center gap-2"
            >
              <X size={16} />
              Remove
            </button>
          </div>
          <div className="relative h-48 rounded-2xl overflow-hidden border border-border-card bg-bg-card/50 flex items-center justify-center">
            {settings.backgroundImage === 'LOCAL_UPLOAD' ? (
              <div className="text-center p-6">
                <Upload size={40} className="mx-auto mb-3 text-text-secondary opacity-20" />
                <p className="text-sm font-bold text-text-secondary">Image stored on another device</p>
                <p className="text-[10px] text-text-secondary mt-1">Upload a new image or choose a preset to sync</p>
              </div>
            ) : (
              <img
                src={settings.backgroundImage}
                alt="Current background"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="text-sm font-bold text-text-secondary">Image Link Broken or Missing</div>';
                }}
                style={{
                  opacity: (settings.backgroundOpacity || 50) / 100,
                  filter: `blur(${settings.backgroundBlur || 0}px)`,
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* Wallpaper Adjustments */}
      <div className="glass border border-border-card rounded-3xl p-6 backdrop-blur-md shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <Palette size={20} className="text-accent" />
            Background Adjustments
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Opacity Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-text-secondary">
                  Wallpaper Visibility (Opacity)
                </label>
                <span className="text-sm font-bold text-accent">
                  {settings.backgroundOpacity || 50}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.backgroundOpacity || 50}
                onChange={(e) => handleOpacityChange(Number(e.target.value))}
                className="w-full h-2 bg-border-card rounded-full appearance-none cursor-pointer accent-accent"
              />
            </div>

            {/* Blur Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-text-secondary">
                  Wallpaper Blur
                </label>
                <span className="text-sm font-bold text-accent">
                  {settings.backgroundBlur || 0}px
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                value={settings.backgroundBlur || 0}
                onChange={(e) => handleBlurChange(Number(e.target.value))}
                className="w-full h-2 bg-border-card rounded-full appearance-none cursor-pointer accent-accent"
              />
            </div>
        </div>
      </div>

      {/* Interface Adjustments */}
      <div className="glass border border-border-card rounded-3xl p-6 backdrop-blur-md shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <Sliders size={20} className="text-accent" />
            Card Appearance
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Card Opacity */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-text-secondary">
                  Card Background Opacity
                </label>
                <span className="text-sm font-bold text-accent">
                  {settings.cardOpacity || 60}%
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={settings.cardOpacity || 60}
                onChange={(e) => handleCardOpacityChange(Number(e.target.value))}
                className="w-full h-2 bg-border-card rounded-full appearance-none cursor-pointer accent-accent"
              />
              <p className="text-[10px] text-text-secondary font-medium">Controls the transparency of all cards and panels</p>
            </div>

            {/* Card Blur */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-text-secondary">
                  Card Background Blur
                </label>
                <span className="text-sm font-bold text-accent">
                  {settings.cardBlur ?? 16}px
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                value={settings.cardBlur ?? 16}
                onChange={(e) => handleCardBlurChange(Number(e.target.value))}
                className="w-full h-2 bg-border-card rounded-full appearance-none cursor-pointer accent-accent"
              />
              <p className="text-[10px] text-text-secondary font-medium">Controls the frosted glass intensity</p>
            </div>

            {/* Card Background Color */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-text-secondary block">
                Card Accent Color
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={settings.cardBackgroundColor || '#1e293b'}
                  onChange={(e) => handleCardBackgroundColorChange(e.target.value)}
                  className="w-12 h-12 rounded-lg bg-bg-card border border-border-card cursor-pointer"
                />
                <div className="flex flex-col">
                    <span className="text-xs font-mono font-bold text-text-primary uppercase">{settings.cardBackgroundColor || '#1e293b'}</span>
                    <button 
                        onClick={() => handleCardBackgroundColorChange('#1e293b')}
                        className="text-[10px] text-accent font-bold hover:underline text-left mt-1"
                    >
                        Reset
                    </button>
                </div>
              </div>
              <p className="text-[10px] text-text-secondary font-medium">Base color for cards (combined with opacity)</p>
            </div>
        </div>
      </div>

      {/* Typography & Colors */}
      <div className="glass border border-border-card rounded-3xl p-6 backdrop-blur-md shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <Type size={20} className="text-accent" />
            Typography & Colors
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Text Brightness */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-text-secondary">
                  General Text Brightness
                </label>
                <span className="text-sm font-bold text-accent">
                  {settings.textBrightness || 100}%
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="150"
                value={settings.textBrightness || 100}
                onChange={(e) => handleTextBrightnessChange(Number(e.target.value))}
                className="w-full h-2 bg-border-card rounded-full appearance-none cursor-pointer accent-accent"
              />
              <p className="text-[10px] text-text-secondary font-medium">Adjust how bright the text appears on screen</p>
            </div>

            {/* Text Color */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-text-secondary block">
                Primary Text Color
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={settings.textColor || '#e2e8f0'}
                  onChange={(e) => handleTextColorChange(e.target.value)}
                  className="w-12 h-12 rounded-lg bg-bg-card border border-border-card cursor-pointer"
                />
                <div className="flex flex-col">
                    <span className="text-xs font-mono font-bold text-text-primary uppercase">{settings.textColor || '#e2e8f0'}</span>
                    <button 
                        onClick={() => handleTextColorChange('#e2e8f0')}
                        className="text-[10px] text-accent font-bold hover:underline text-left mt-1"
                    >
                        Reset
                    </button>
                </div>
              </div>
            </div>

            {/* Background Color */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-text-secondary block">
                Main Background Color
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={settings.backgroundColor || '#1a1c23'}
                  onChange={(e) => handleBackgroundColorChange(e.target.value)}
                  className="w-12 h-12 rounded-lg bg-bg-card border border-border-card cursor-pointer"
                />
                <div className="flex flex-col">
                    <span className="text-xs font-mono font-bold text-text-primary uppercase">{settings.backgroundColor || '#1a1c23'}</span>
                    <button 
                        onClick={() => handleBackgroundColorChange('#1a1c23')}
                        className="text-[10px] text-accent font-bold hover:underline text-left mt-1"
                    >
                        Reset
                    </button>
                </div>
              </div>
            </div>
        </div>
      </div>

      {/* Upload Options */}
      <div className="glass border border-border-card rounded-3xl p-6 backdrop-blur-md shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-text-primary">Upload Custom Wallpaper</h3>
        
        <div className="flex gap-3">
          {/* File Upload */}
          <label className="flex-1 cursor-pointer">
            <div className="p-4 rounded-xl border-2 border-dashed border-border-card hover:border-accent/40 bg-bg-card/30 hover:bg-accent/5 transition-all text-center">
              <Upload size={24} className="mx-auto mb-2 text-accent" />
              <p className="text-sm font-semibold text-text-primary">Upload Image</p>
              <p className="text-[10px] text-text-secondary mt-1 italic">Note: Only stays on this PC</p>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {/* Custom URL */}
          <div className="flex-1">
            {!isAddingCustom ? (
              <button
                onClick={() => setIsAddingCustom(true)}
                className="w-full h-full p-4 rounded-xl border-2 border-dashed border-border-card hover:border-accent/40 bg-bg-card/30 hover:bg-accent/5 transition-all"
              >
                <ImagePlus size={24} className="mx-auto mb-2 text-accent" />
                <p className="text-sm font-semibold text-text-primary">Add URL</p>
                <p className="text-xs text-text-secondary mt-1">Use image link</p>
              </button>
            ) : (
              <div className="h-full flex flex-col gap-2 p-2 rounded-xl border border-border-card bg-bg-card/30">
                <input
                  type="text"
                  placeholder="https://example.com/image.jpg"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg bg-bg border border-border-card text-text-primary text-xs outline-none focus:border-accent transition-all"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCustomUrlAdd}
                    className="flex-1 px-3 py-2 rounded-lg bg-accent text-white text-xs font-semibold hover:shadow-lg transition-all"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingCustom(false);
                      setCustomUrl('');
                    }}
                    className="px-3 py-2 rounded-lg border border-border-card text-text-secondary text-xs font-semibold hover:bg-border-card transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preset Backgrounds */}
      <div className="glass border border-border-card rounded-3xl p-6 backdrop-blur-md shadow-sm">
        <h3 className="text-lg font-bold text-text-primary mb-4">Preset Wallpapers</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {PRESET_BACKGROUNDS.map((preset) => (
            <button
              key={preset.url}
              onClick={() => handlePresetSelect(preset.url)}
              className={`group relative aspect-video rounded-xl overflow-hidden border-2 transition-all ${
                settings.backgroundImage === preset.url
                  ? 'border-accent shadow-lg shadow-accent/20 scale-105'
                  : 'border-border-card hover:border-accent/40 hover:scale-105'
              }`}
            >
              <img
                src={preset.url}
                alt={preset.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2">
                <p className="text-white font-bold text-xs truncate w-full">
                  {preset.name}
                </p>
              </div>
              {settings.backgroundImage === preset.url && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center">
                  <RefreshCw size={14} />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
