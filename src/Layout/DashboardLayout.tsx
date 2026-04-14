import React from "react";
import { Settings } from "@/types";

interface DashboardLayoutProps {
  settings: Settings;
  sidebar: React.ReactNode;
  topbar?: React.ReactNode;
  topbarRight?: React.ReactNode;
  children: React.ReactNode;
  sidebarRight?: React.ReactNode;
  bottomDock?: React.ReactNode;
}

export function DashboardLayout({
  settings,
  sidebar,
  topbar,
  topbarRight,
  children,
  sidebarRight,
  bottomDock,
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
          filter:
            settings.textBrightness && settings.textBrightness !== 100
              ? `brightness(${settings.textBrightness / 100})`
              : "none",
        }}
      />

      {/* Background Image Layer (with Blur & Brightness) */}
      {settings.backgroundType === "image" && settings.backgroundImage && (
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

      {/* Solid Color Background */}
      {settings.backgroundType === "solid" && (
        <div
          className="absolute inset-0 z-0 transition-colors duration-300"
          style={{
            backgroundColor: settings.backgroundColor || "#1a1c23",
            opacity: (settings.backgroundOpacity || 100) / 100,
          }}
        />
      )}

      {/* Gradient Background */}
      {settings.backgroundType === "gradient" && (
        <div
          className="absolute inset-0 z-0 transition-all duration-300"
          style={{
            background: settings.backgroundGradient || "linear-gradient(to bottom right, #4f46e5, #9333ea)",
            opacity: (settings.backgroundOpacity || 100) / 100,
          }}
        />
      )}

      {/* Main Container */}
      <div className="relative z-10 flex h-full w-full">
        {sidebar}

        <main className="flex-1 flex flex-col min-w-0 relative bg-transparent overflow-y-auto no-scrollbar scroll-smooth">
          <div className="p-4 md:p-8">
            <div className="max-w-[1720px] mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
                {/* Main Content View */}
                <div className="col-span-4 flex flex-col min-w-0">
                  <div className="w-full">{children}</div>
                </div>

                {/* Right Sidebar / Widget Area */}
                <aside className="col-span-1 flex flex-col gap-6 sticky h-fit max-h-screen">
                  {topbarRight}
                  {sidebarRight}
                </aside>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Bottom Dock */}
      {bottomDock}
    </div>
  );
}

