import React, { useState } from "react";
import { Eye, Plus, Trash2, Edit2, ExternalLink, Globe } from "lucide-react";
import { BookmarkItem } from "../types";

interface WatchlistViewProps {
  watchlist: BookmarkItem[];
  searchQuery: string;
  now: number;
  onCreate: () => void;
  onEdit: (item: BookmarkItem) => void;
  onDelete: (id: string) => void;
}

export function PreviewImage({ url, title }: { url: string; title: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Using microlink for better quality, fallback to mshots if needed
  const previewUrl = `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&embed=screenshot.url`;

  return (
    <div className="relative w-full h-full">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-border-card/20 animate-pulse">
          <div className="w-10 h-10 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
        </div>
      )}
      
      {!error ? (
        <img
          src={previewUrl}
          alt={title}
          className={`w-full h-full object-cover transition-opacity duration-700 ${
            loading ? "opacity-0" : "opacity-100"
          }`}
          onLoad={() => setLoading(false)}
          onError={() => {
            setError(true);
            setLoading(false);
          }}
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full bg-bg-card flex flex-col items-center justify-center gap-2">
            <Globe size={48} className="text-text-secondary/20" />
            <span className="text-[10px] text-text-secondary/40 font-bold uppercase tracking-widest">No Preview</span>
        </div>
      )}
      
      <div className="absolute inset-0 bg-gradient-to-t from-bg-card/40 to-transparent" />
    </div>
  );
}

export function WatchlistView({
  watchlist,
  searchQuery,
  now,
  onCreate,
  onEdit,
  onDelete,
}: WatchlistViewProps) {
  const filteredWatchlist = watchlist.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.url && item.url.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col gap-6">
        <div className="glass border border-border-card rounded-3xl p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-black flex items-center gap-3 text-text-primary">
                <div className="p-2 rounded-xl bg-accent/10 text-accent">
                  <Eye size={24} />
                </div>
                Watch List
              </h2>
              <p className="text-sm text-text-secondary mt-1">Keep track of your favorite pages and resources.</p>
            </div>
            <button
              onClick={onCreate}
              className="px-4 py-2 rounded-xl bg-accent text-white text-sm font-bold hover:shadow-lg hover:shadow-accent/20 transition-all flex items-center gap-2"
            >
              <Plus size={18} /> Add to Watchlist
            </button>
          </div>

          {filteredWatchlist.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredWatchlist.map((item) => (
                <div
                  key={item.id}
                  className="group relative bg-bg-card/50 border border-border-card rounded-2xl overflow-hidden hover:border-accent/40 transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-xl"
                >
                  {/* Preview Area */}
                  <div className="aspect-video w-full bg-border-card/20 relative overflow-hidden flex items-center justify-center">
                    {item.url ? (
                        <div className="absolute inset-0 group-hover:scale-110 transition-transform duration-700">
                            <PreviewImage url={item.url} title={item.title} />
                        </div>
                    ) : (
                      <div className="w-full h-full bg-bg-card flex items-center justify-center">
                        <Eye size={48} className="text-text-secondary/20" />
                      </div>
                    )}
                    
                    {/* Buttons Overlay */}
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 z-20">
                      <button
                        onClick={() => onEdit(item)}
                        className="p-2.5 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-accent transition-all hover:scale-110 shadow-lg"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        className="p-2.5 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-red-500 transition-all hover:scale-110 shadow-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-text-primary text-base truncate transition-colors group-hover:text-accent">
                          {item.title}
                        </h3>
                        {item.url && (
                          <p className="text-xs text-text-secondary truncate mt-0.5 opacity-60 font-medium">
                            {(() => {
                                try {
                                    return new URL(item.url).hostname;
                                } catch (e) {
                                    return item.url;
                                }
                            })()}
                          </p>
                        )}
                      </div>
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 rounded-xl bg-accent/10 text-accent hover:bg-accent hover:text-white transition-all flex-shrink-0 hover:scale-110"
                          title="Open Link"
                        >
                          <ExternalLink size={18} />
                        </a>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-sm text-text-secondary/70 line-clamp-2 mt-3 leading-relaxed border-t border-border-card pt-3">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-text-secondary opacity-50">
              <Eye size={64} className="mb-4 opacity-20" />
              <p className="text-lg font-medium">No items in your watchlist</p>
              <button
                 onClick={onCreate}
                 className="mt-4 text-accent hover:underline font-bold"
              >
                Add your first item
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
