import React, { useEffect, useRef } from 'react';
import { Search, Mic, Camera } from 'lucide-react';

export function GoogleSearch() {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto focus on mount
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = inputRef.current?.value;
    if (query) {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-[584px] mx-auto mt-16 mb-24 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="mb-8 select-none pointer-events-none">
        <h1 className="text-7xl font-black tracking-tighter flex items-center">
          <span className="text-[#4285F4]">G</span>
          <span className="text-[#EA4335]">o</span>
          <span className="text-[#FBBC05]">o</span>
          <span className="text-[#4285F4]">g</span>
          <span className="text-[#34A853]">l</span>
          <span className="text-[#EA4335]">e</span>
        </h1>
      </div>

      <form 
        onSubmit={handleSearch}
        className="w-full relative group"
      >
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-accent transition-colors">
          <Search size={20} />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          className="w-full h-[46px] bg-bg-card border border-border-card rounded-full pl-12 pr-28 text-sm text-text-primary outline-none hover:shadow-lg focus:shadow-lg focus:border-accent/40 focus:ring-4 focus:ring-accent/5 transition-all font-medium"
          placeholder="Search Google or type a URL"
        />

        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
          <button type="button" className="p-1.5 rounded-full hover:bg-border-card text-blue-500 transition-colors" title="Search by voice">
             <Mic size={20} />
          </button>
          <button type="button" className="p-1.5 rounded-full hover:bg-border-card text-red-500 transition-colors" title="Search by image">
             <Camera size={20} />
          </button>
        </div>
      </form>

      <div className="flex gap-3 mt-8">
        <button 
           onClick={handleSearch}
           className="px-6 py-2 bg-bg-card border border-border-card rounded-md text-[14px] font-medium text-text-primary hover:border-accent/40 hover:bg-accent/5 transition-all shadow-sm"
        >
          Google Search
        </button>
        <button 
           className="px-6 py-2 bg-bg-card border border-border-card rounded-md text-[14px] font-medium text-text-primary hover:border-accent/40 hover:bg-accent/5 transition-all shadow-sm"
           onClick={() => window.open('https://www.google.com/doodles', '_blank')}
        >
          I'm Feeling Lucky
        </button>
      </div>
    </div>
  );
}
