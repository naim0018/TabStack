import React from 'react';
import { Settings } from '@/types';

interface DashboardLayoutProps {
  settings: Settings;
  sidebar: React.ReactNode;
  topbar: React.ReactNode;
  children: React.ReactNode;
  sidebarRight?: React.ReactNode;
}

export function DashboardLayout({
  settings,
  sidebar,
  topbar,
  children,
  sidebarRight
}: DashboardLayoutProps) {
  return (
    <div
      className="relative flex h-screen bg-bg text-text-primary font-sans overflow-hidden transition-colors duration-300 selection:bg-accent/30"
      data-theme={settings.theme}
      style={
        {
          "--glass-opacity": (settings.cardOpacity ?? 60) / 100,
          "--card-blur": `${settings.cardBlur ?? 16}px`,
          "--card-bg-color": settings.cardBackgroundColor || (settings.theme === 'dark' ? '#1e293b' : '#ffffff'),
          "--card-bg": `color-mix(in srgb, var(--card-bg-color) calc(var(--glass-opacity) * 100%), transparent)`,
          "--text-primary": settings.textColor || (settings.theme === 'dark' ? '#e2e8f0' : '#0f172a'),
          "--bg-color": settings.backgroundColor || (settings.theme === 'dark' ? '#1a1c23' : '#f8fafc'),
          "--app-brightness": (settings.textBrightness ?? 100) / 100,
          filter: "brightness(var(--app-brightness))",
        } as React.CSSProperties
      }
    >
      {/* Background Image Layer */}
      {settings.backgroundImage && (
        <div className="absolute inset-0 z-0 pointer-events-none transition-all duration-500 overflow-hidden">
          <img
            src={settings.backgroundImage}
            className="w-full h-full object-cover"
            style={{
              opacity: (settings.backgroundOpacity || 50) / 100,
              filter: `blur(${settings.backgroundBlur || 0}px)`,
            }}
            alt=""
          />
        </div>
      )}

      {/* Main Container */}
      <div className="relative z-10 flex h-full w-full">
        {sidebar}
        
        <main
          className={`flex-1 flex flex-col min-w-0 relative ${
            settings.backgroundImage ? "bg-transparent" : "bg-bg"
          }`}
        >
          {topbar}
          
          <div className="flex-1 overflow-y-auto p-4 scroll-smooth">
            <div className="max-w-425 mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-[1fr,340px] gap-10 items-start">
                {/* Main Content View */}
                <div className="flex flex-col min-w-0">
                  <div className="w-full">
                    {children}
                  </div>
                </div>

                {/* Right Sidebar / Widget Area */}
                {sidebarRight && (
                  <aside className="flex flex-col gap-6 sticky top-4 h-fit max-h-[calc(100vh-100px)] overflow-y-auto no-scrollbar pb-10">
                    {sidebarRight}
                  </aside>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
