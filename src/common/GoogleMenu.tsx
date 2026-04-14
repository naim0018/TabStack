import { useState, useRef, useEffect } from "react";
import { BsGrid3X3GapFill } from "react-icons/bs";

const GOOGLE_APPS = [
  {
    name: "Search",
    url: "https://www.google.com",
    icon: "https://www.gstatic.com/images/branding/product/2x/google_search_64dp.png",
  },
  {
    name: "Maps",
    url: "https://maps.google.com",
    icon: "https://www.gstatic.com/images/branding/product/2x/maps_64dp.png",
  },
  {
    name: "YouTube",
    url: "https://www.youtube.com",
    icon: "https://www.gstatic.com/images/branding/product/2x/youtube_64dp.png",
  },
  {
    name: "Gmail",
    url: "https://mail.google.com",
    icon: "https://www.gstatic.com/images/branding/product/2x/gmail_64dp.png",
  },
  {
    name: "Drive",
    url: "https://drive.google.com",
    icon: "https://www.gstatic.com/images/branding/product/2x/drive_64dp.png",
  },
  {
    name: "Meet",
    url: "https://meet.google.com",
    icon: "https://www.gstatic.com/images/branding/product/2x/meet_64dp.png",
  },
  {
    name: "Docs",
    url: "https://docs.google.com/document",
    icon: "https://www.gstatic.com/images/branding/product/2x/docs_64dp.png",
  },
  {
    name: "Sheets",
    url: "https://docs.google.com/spreadsheets",
    icon: "https://www.gstatic.com/images/branding/product/2x/sheets_64dp.png",
  },
  {
    name: "Slides",
    url: "https://docs.google.com/presentation",
    icon: "https://www.gstatic.com/images/branding/product/2x/slides_64dp.png",
  },
  {
    name: "Play",
    url: "https://play.google.com",
    icon: "https://www.gstatic.com/images/branding/product/2x/play_64dp.png",
  },
  {
    name: "News",
    url: "https://news.google.com",
    icon: "https://www.gstatic.com/images/branding/product/2x/news_64dp.png",
  },
  {
    name: "Chat",
    url: "https://chat.google.com",
    icon: "https://www.gstatic.com/images/branding/product/2x/chat_64dp.png",
  },
  {
    name: "Contacts",
    url: "https://contacts.google.com",
    icon: "https://www.gstatic.com/images/branding/product/2x/contacts_64dp.png",
  },

  {
    name: "Calendar",
    url: "https://calendar.google.com",
    icon: "https://www.gstatic.com/images/branding/product/2x/calendar_64dp.png",
  },
  {
    name: "Translate",
    url: "https://translate.google.com",
    icon: "https://www.gstatic.com/images/branding/product/2x/translate_64dp.png",
  },
  {
    name: "Photos",
    url: "https://photos.google.com",
    icon: "https://www.gstatic.com/images/branding/product/2x/photos_64dp.png",
  },
  {
    name: "Shopping",
    url: "https://shopping.google.com",
    icon: "https://www.gstatic.com/images/branding/product/2x/shopping_64dp.png",
  },
  {
    name: "Finance",
    url: "https://www.google.com/finance",
    icon: "https://www.gstatic.com/images/branding/product/2x/finance_64dp.png",
  },

  {
    name: "Books",
    url: "https://books.google.com",
    icon: "https://www.gstatic.com/images/branding/product/2x/books_64dp.png",
  },
  {
    name: "Keep",
    url: "https://keep.google.com",
    icon: "https://www.gstatic.com/images/branding/product/2x/keep_64dp.png",
  },
  {
    name: "Classroom",
    url: "https://classroom.google.com",
    icon: "https://www.gstatic.com/images/branding/product/2x/classroom_64dp.png",
  },
  {
    name: "Earth",
    url: "https://earth.google.com",
    icon: "https://www.gstatic.com/images/branding/product/2x/earth_64dp.png",
  },
  {
    name: "Forms",
    url: "https://docs.google.com/forms",
    icon: "https://www.gstatic.com/images/branding/product/2x/forms_64dp.png",
  },
];

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
            absolute right-0 top-full mt-4 w-[320px] max-h-[480px] overflow-y-auto
            bg-bg-header/95 backdrop-blur-md
            border border-border-card
            rounded-3xl
            shadow-2xl
            p-4
            z-[100]
            scrollbar-thin scrollbar-thumb-border-card
          "
        >
          <div className="grid grid-cols-3 gap-y-4 gap-x-2 animate-in fade-in zoom-in-95 duration-200">
            {GOOGLE_APPS.map((app) => (
              <a
                key={app.name}
                href={app.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-white/5 hover:scale-105 transition-all group"
              >
                <div className="w-12 h-12 flex items-center justify-center p-1 group-hover:drop-shadow-lg transition-all">
                  <img
                    src={app.icon}
                    alt={app.name}
                    className="w-10 h-10 object-contain"
                    loading="lazy"
                  />
                </div>
                <span className="text-[12px] font-medium text-text-primary/90 text-center leading-tight">
                  {app.name}
                </span>
              </a>
            ))}

            <div className="col-span-3 pt-6 pb-2 flex justify-center border-t border-border-card/50 mt-2">
              <a
                href="https://about.google/products/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-2.5 rounded-full border border-border-card/50 text-[13px] font-medium text-text-secondary hover:bg-white/5 hover:text-text-primary transition-all"
              >
                More from Google
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
