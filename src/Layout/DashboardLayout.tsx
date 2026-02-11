import React from "react";
import { Settings } from "@/types";

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
  sidebarRight,
}: DashboardLayoutProps) {
  return (
    <div
      className="relative flex h-screen text-text-primary font-sans overflow-hidden transition-colors duration-300 selection:bg-accent/30"
      data-theme={settings.theme}
    >
      {/* Background Color Layer (with Brightness) */}
      <div 
        className="absolute inset-0 z-0 bg-bg transition-all duration-300 ease-in-out"
        style={{
          filter: settings.textBrightness && settings.textBrightness !== 100 
            ? `brightness(${settings.textBrightness / 100})` 
            : 'none'
        }}
      />

      {/* Background Image Layer (with Blur & Brightness) */}
      {settings.backgroundImage && (
        <img
          src={settings.backgroundImage}
          className="absolute inset-0 z-0 w-full h-full object-cover transition-all duration-300 ease-out pointer-events-none"
          style={{
            opacity: (settings.backgroundOpacity || 50) / 100,
            filter: `blur(${settings.backgroundBlur || 0}px) brightness(${settings.textBrightness ? settings.textBrightness / 100 : 1})`,
          }}
          alt=""
        />
      )}

      {/* Main Container */}
      <div className="relative z-10 flex h-full w-full">
        {sidebar}
        
        <main className="flex-1 flex flex-col min-w-0 relative bg-transparent">
          {topbar}
          
          <div className="flex-1 overflow-y-auto p-4 scroll-smooth">
            <div className=" mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
                {/* Main Content View */}
                <div className="col-span-4 flex flex-col min-w-0">
                  <div className="w-full">{children}</div>
                </div>

                {/* Right Sidebar / Widget Area */}
                {sidebarRight && (
                  <aside className="col-span-1 flex flex-col gap-6 sticky h-fit max-h-[calc(100vh-100px)] overflow-y-auto no-scrollbar">
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
