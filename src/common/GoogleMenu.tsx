import React, { useState, useRef, useEffect } from "react";
import { Grid } from "lucide-react";
import { BsGrid3X3GapFill } from "react-icons/bs";

export function GoogleMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const apps = [
    { name: "Search", url: "https://www.google.com", domain: "google.com" },
    { name: "Maps", url: "https://maps.google.com", domain: "maps.google.com" },
    { name: "YouTube", url: "https://www.youtube.com", domain: "youtube.com" },
    {
      name: "Play",
      url: "https://play.google.com",
      domain: "play.google.com",
      icon: "https://www.google.com/s2/favicons?domain=play.google.com&sz=64",
    },
    {
      name: "Gmail",
      url: "https://mail.google.com",
      domain: "mail.google.com",
    },
    { name: "Meet", url: "https://meet.google.com", domain: "meet.google.com" },
    {
      name: "Drive",
      url: "https://drive.google.com",
      domain: "drive.google.com",
    },
    {
      name: "Calendar",
      url: "https://calendar.google.com",
      domain: "calendar.google.com",
    },
    {
      name: "Translate",
      url: "https://translate.google.com",
      domain: "translate.google.com",
    },
    {
      name: "Photos",
      url: "https://photos.google.com",
      domain: "photos.google.com",
    },
    { name: "News", url: "https://news.google.com", domain: "news.google.com" },
    { name: "Keep", url: "https://keep.google.com", domain: "keep.google.com" },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-xl transition-all ${
          isOpen
            ? "bg-accent/10 text-accent"
            : "text-gray-200 hover:bg-bg-card hover:text-gray-100"
        }`}
        title="Google Apps"
      >
        <BsGrid3X3GapFill
          size={24}
          className="text-gray-200 hover:text-gray-100 transition-colors"
        />
      </button>

      {isOpen && (
        <div
          className="
    absolute right-0 top-full mt-4 w-[320px] bg-bg-header
    backdrop-blur-xs
    border border-border-card
    rounded-3xl
    shadow-2xl
    p-6
    grid grid-cols-3
    gap-y-6 gap-x-2
    animate-in fade-in zoom-in-95 duration-200
    z-[100]
  "
        >
          {apps.map((app) => (
            <a
              key={app.name}
              href={app.url}
              className="flex flex-col items-center gap-3 p-2 rounded-2xl hover:bg-bg-card hover:shadow-sm hover:scale-105 transition-all group"
            >
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-sm p-2 group-hover:shadow-md transition-shadow">
                <img
                  src={
                    app.icon ||
                    `https://www.google.com/s2/favicons?domain=${app.domain}&sz=64`
                  }
                  alt={app.name}
                  className="w-8 h-8 object-contain"
                />
              </div>
              <span className="text-[13px] font-medium text-text-primary/90">
                {app.name}
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
