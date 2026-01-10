import React, { useState, useRef, useEffect } from 'react';
import { Search, Grip, Plus, Bell, Layout, Grid, Folder, User, Settings, HelpCircle, Archive, ShoppingBag, Youtube, Mail, Globe, Calendar, Image, Music, Video, MessageCircle } from "lucide-react";

interface GoogleApp {
  name: string;
  icon: React.ReactNode;
  url: string;
}

const GOOGLE_APPS: GoogleApp[] = [
  { name: 'Search', icon: <Search size={24} className="text-blue-500" />, url: 'https://google.com' },
  { name: 'Gmail', icon: <Mail size={24} className="text-red-500" />, url: 'https://mail.google.com' },
  { name: 'Drive', icon: <Archive size={24} className="text-orange-500" />, url: 'https://drive.google.com' },
  { name: 'YouTube', icon: <Youtube size={24} className="text-red-600" />, url: 'https://youtube.com' },
  { name: 'Maps', icon: <Globe size={24} className="text-green-500" />, url: 'https://maps.google.com' },
  { name: 'Calendar', icon: <Calendar size={24} className="text-blue-600" />, url: 'https://calendar.google.com' },
  { name: 'Photos', icon: <Image size={24} className="text-purple-500" />, url: 'https://photos.google.com' },
  { name: 'News', icon: <Globe size={24} className="text-blue-400" />, url: 'https://news.google.com' },
  { name: 'Meet', icon: <Video size={24} className="text-green-600" />, url: 'https://meet.google.com' },
  { name: 'Translate', icon: <Globe size={24} className="text-blue-500" />, url: 'https://translate.google.com' },
  { name: 'Play', icon: <ShoppingBag size={24} className="text-green-400" />, url: 'https://play.google.com' },
  { name: 'Contacts', icon: <User size={24} className="text-indigo-500" />, url: 'https://contacts.google.com' },
];

export function GoogleMenu() {
  const [isAppsOpen, setIsAppsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const appsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (appsRef.current && !appsRef.current.contains(event.target as Node)) {
        setIsAppsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex items-center gap-4 ml-4">
      {/* Apps Menu */}
      <div className="relative" ref={appsRef}>
        <button
          onClick={() => setIsAppsOpen(!isAppsOpen)}
          className="p-2 rounded-full hover:bg-border-card transition-all text-text-secondary hover:text-text-primary flex items-center justify-center group"
          title="Google Apps"
        >
          <Grip size={22} className="group-hover:scale-110 transition-transform" />
        </button>

        {isAppsOpen && (
          <div className="absolute right-0 mt-2 w-[320px] bg-bg-sidebar border border-border-card rounded-3xl shadow-2xl p-6 z-50 grid grid-cols-3 gap-y-6 animate-in fade-in zoom-in-95 duration-200">
            {GOOGLE_APPS.map((app) => (
              <a
                key={app.name}
                href={app.url}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center gap-2 group transition-all"
              >
                <div className="w-14 h-14 rounded-2xl bg-bg flex items-center justify-center border border-border-card group-hover:border-accent group-hover:bg-accent/5 transition-all">
                  {app.icon}
                </div>
                <span className="text-[11px] font-medium text-text-secondary group-hover:text-text-primary">
                  {app.name}
                </span>
              </a>
            ))}
            <div className="col-span-3 pt-4 border-t border-border-card mt-2 flex justify-center">
              <button className="text-[12px] font-bold text-accent hover:bg-accent/10 px-6 py-2 rounded-full transition-all">
                More from Google
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Profile Menu */}
      <div className="relative" ref={profileRef}>
        <button
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className="w-10 h-10 rounded-full border-2 border-border-card hover:border-accent transition-all overflow-hidden p-0.5 bg-gradient-to-tr from-accent/20 to-accent-glow/20"
        >
          <div className="w-full h-full rounded-full bg-accent flex items-center justify-center text-white text-sm font-bold shadow-inner">
            JD
          </div>
        </button>

        {isProfileOpen && (
          <div className="absolute right-0 mt-2 w-[360px] bg-bg-sidebar border border-border-card rounded-3xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-8 flex flex-col items-center border-b border-border-card bg-gradient-to-b from-accent/5 to-transparent">
              <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-xl border-4 border-bg-sidebar">
                JD
              </div>
              <h3 className="text-[15px] font-bold text-text-primary">John Doe</h3>
              <p className="text-[12px] text-text-secondary mb-6">john.doe@gmail.com</p>
              <button className="px-6 py-2 rounded-full border border-border-card hover:bg-border-card transition-all text-sm font-semibold text-text-primary">
                Manage your Google Account
              </button>
            </div>
            
            <div className="p-4 grid grid-cols-1 gap-1">
              <button className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-border-card transition-all text-left group">
                <Settings size={18} className="text-text-secondary group-hover:text-text-primary" />
                <span className="text-sm font-medium text-text-primary">Account settings</span>
              </button>
              <button className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-border-card transition-all text-left group">
                <HelpCircle size={18} className="text-text-secondary group-hover:text-text-primary" />
                <span className="text-sm font-medium text-text-primary">Help & Feedback</span>
              </button>
            </div>

            <div className="p-4 bg-bg border-t border-border-card flex justify-center">
              <button className="px-8 py-2 rounded-xl border border-border-card hover:bg-danger/10 hover:border-danger hover:text-danger transition-all text-sm font-bold text-text-secondary">
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
