import React, { useEffect, useState, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { Card, CardItem } from './components/Card';
import { EditModal, EditData } from './components/EditModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { chromeApi } from './utils/chrome';
import { ChevronDown, Clock, LayoutGrid, AlertCircle, Info, Edit2, Trash2, Bell } from 'lucide-react';

// Settings interface
interface Settings {
  theme: 'dark' | 'light';
  sidebarCollapsed: boolean;
  viewMode: 'feed' | 'tabs';
  activeTab: string; 
  activeBoardId: string;
  activeSidebarItem: string;
  boards: { id: string; name: string }[];
  collapsedSections: string[];
}

const DEFAULT_SETTINGS: Settings = {
  theme: 'dark',
  sidebarCollapsed: false,
  viewMode: 'feed',
  activeTab: 'tabs',
  activeBoardId: '1',
  activeSidebarItem: 'spaces',
  boards: [{ id: '1', name: 'Bookmark' }],
  collapsedSections: [],
};

const App = () => {
  const [settings, setSettings] = useState<Settings>(() => {
    const stored = localStorage.getItem('tabstack-settings');
    const parsed = stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
    // Migrate old settings if necessary
    if (!parsed.boards) parsed.boards = DEFAULT_SETTINGS.boards;
    return parsed;
  });

  const [tabs, setTabs] = useState<chrome.tabs.Tab[]>([]);
  const [tree, setTree] = useState<chrome.bookmarks.BookmarkTreeNode[]>([]);
  const [metadata, setMetadata] = useState<Record<string, any>>({});
  const [topSites, setTopSites] = useState<chrome.topSites.MostVisitedURL[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [now, setNow] = useState(Date.now());
  
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  // Modal & Confirmation State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialData, setModalInitialData] = useState<EditData | null>(null);
  const [modalForceType, setModalForceType] = useState<'bookmark' | 'folder' | 'reminder' | null>(null);
  
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Drag State
  const [draggingId, setDraggingId] = useState<string | null>(null);

  // Load Data
  const refreshData = async () => {
    try {
      const [t, tr, m, ts] = await Promise.all([
        chromeApi.getTabs(),
        chromeApi.getTree(),
        chromeApi.getMetadata(),
        chromeApi.getTopSites(),
      ]);
      setTabs(t);
      setTree(tr);
      setMetadata(m);
      setTopSites(ts.slice(0, 10));

      // After loading tree, ensure all boards exist in the actual bookmarks tree
      if (tr.length > 0) {
        const rootBookmarks = tr[0].children || [];
        const existingBoards = settings.boards.filter(b => {
           const find = (nodes: any[]): any => {
              for(let n of nodes) {
                if(n.id === b.id) return n;
                if(n.children) {
                   const f = find(n.children);
                   if(f) return f;
                }
              }
              return null;
           };
           return find(rootBookmarks);
        });
        if (existingBoards.length !== settings.boards.length && existingBoards.length > 0) {
           setSettings(s => ({ ...s, boards: existingBoards }));
        }
      }
    } catch (err) {
      console.error('Failed to refresh data', err);
    }
  };

  useEffect(() => {
    refreshData();
    // Listen for tab/bookmark changes if in extension
    if (typeof chrome !== 'undefined' && chrome.bookmarks) {
      const handler = () => refreshData();
      chrome.bookmarks.onCreated.addListener(handler);
      chrome.bookmarks.onRemoved.addListener(handler);
      chrome.bookmarks.onChanged.addListener(handler);
      chrome.bookmarks.onMoved.addListener(handler);
      if (chrome.tabs) {
        chrome.tabs.onCreated.addListener(handler);
        chrome.tabs.onRemoved.addListener(handler);
        chrome.tabs.onUpdated.addListener(handler);
      }
      return () => {
        chrome.bookmarks.onCreated.removeListener(handler);
        chrome.bookmarks.onRemoved.removeListener(handler);
        chrome.bookmarks.onChanged.removeListener(handler);
        chrome.bookmarks.onMoved.removeListener(handler);
      };
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tabstack-settings', JSON.stringify(settings));
    document.body.setAttribute('data-theme', settings.theme);
  }, [settings]);

  // Derived State
  const { flatFolders, looseBookmarks } = useMemo(() => {
    const activeBoardId = settings.activeBoardId;
    let boardNode: any = null;

    const findNode = (nodes: any[], id: string): any => {
      for (const node of nodes) {
        if (String(node.id) === id) return node;
        if (node.children) {
          const found = findNode(node.children, id);
          if (found) return found;
        }
      }
      return null;
    };

    if (tree && tree.length > 0) {
       boardNode = findNode(tree[0].children || [], activeBoardId) || findNode(tree[0].children || [], '1');
    }

    const flat: any[] = [];
    const loose: any[] = [];

    if (boardNode && boardNode.children) {
      boardNode.children.forEach((node: any) => {
        if (node.children) flat.push(node);
        else loose.push(node);
      });
    }
    
    return { flatFolders: flat, looseBookmarks: loose };
  }, [tree, settings.activeBoardId]);

  const reminders = useMemo(() => {
    const res: any[] = [];
    Object.keys(metadata).forEach(id => {
      if (metadata[id].type === 'reminder') {
        const findInTree = (nodes: any[]): any => {
             for(let n of nodes) {
                 if(n.id === id) return n;
                 if(n.children) {
                     const f = findInTree(n.children);
                     if(f) return f;
                 }
             }
             return null;
        };
        const item = findInTree(tree);
        if(item) res.push({...item, ...metadata[id]});
      }
    });
    return res;
  }, [metadata, tree]);

  // Handlers
  const handleToggleSection = (id: string) => {
    setSettings(prev => ({
      ...prev,
      collapsedSections: prev.collapsedSections.includes(id) 
        ? prev.collapsedSections.filter(s => s !== id)
        : [...prev.collapsedSections, id]
    }));
  };

  const deleteItem = (id: string) => {
    setConfirmState({
      isOpen: true,
      title: 'Delete Item',
      message: 'Are you sure you want to permanently delete this item?',
      onConfirm: async () => {
        await chromeApi.removeTree(id);
        refreshData();
      }
    });
  };

  const handleSaveEdit = async (data: EditData) => {
      const { id, title, url, type, description, deadline } = data;
      const metaToSave = { description, deadline, type };
      
      try {
        let savedId = id;
        if (!id) {
            const parentId = settings.activeTab !== 'tabs' ? settings.activeTab : settings.activeBoardId;
            const createParams: any = { parentId: (parentId === 'tabs' || parentId === 'Space') ? '1' : parentId, title };
            if (type !== 'folder') createParams.url = url || (type === 'reminder' ? 'about:blank' : '');
            const created = await chromeApi.createBookmark(createParams);
            savedId = created.id;
        } else {
            const updateParams: any = { title };
            if (type !== 'folder') updateParams.url = url;
            await chromeApi.updateBookmark(id, updateParams);
        }

        if (savedId) {
            const newMeta = { ...metadata, [savedId]: metaToSave };
            await chromeApi.saveMetadata(newMeta);
            setMetadata(newMeta);
        }
        setIsModalOpen(false);
        refreshData();
      } catch(e) {
          console.error('Failed to save metadata', e);
      }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggingId(id);
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDrop = async (e: React.DragEvent, parentId: string) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('text/plain');
    if (!sourceId || sourceId === parentId) return;

    try {
      // Check if it's a tab or bookmark (tabs are numeric, but in our wrapper we handle it)
      const tab = tabs.find(t => String(t.id) === sourceId);
      if (tab) {
         // Convert Tab to Bookmark
         await chromeApi.createBookmark({ parentId, title: tab.title, url: tab.url });
      } else {
         // Move Bookmark
         await chromeApi.moveBookmark(sourceId, { parentId });
      }
      refreshData();
    } catch (err) {
      console.error('Drag and Drop failed', err);
    }
    setDraggingId(null);
  };

  const renderSection = (title: string, items: any[], id: string, isTabSection = false) => {
      if (!items || items.length === 0) return null;
      const filteredItems = searchQuery ? items.filter(i => i.title.toLowerCase().includes(searchQuery.toLowerCase())) : items;
      if (filteredItems.length === 0 && searchQuery) return null;

      const isCollapsed = settings.collapsedSections.includes(id);

      return (
          <div 
            className={`mb-8 p-4 w-full group/section transition-all ${draggingId ? 'scale-[0.99] opacity-80' : ''}`}
            onDragOver={(e) => { e.preventDefault(); }}
            onDrop={(e) => !isTabSection && handleDrop(e, id)}
          >
              <div 
                className="flex items-center gap-2 mb-4 cursor-pointer select-none"
                onClick={() => handleToggleSection(id)}
              >
                 <div className={`p-1 rounded-md text-text-secondary hover:bg-border-card transition-all ${isCollapsed ? '-rotate-90' : ''}`}>
                     <ChevronDown size={14} />
                 </div>
                 <h3 className="text-[14px] font-bold text-text-primary/90 flex items-center gap-2 uppercase tracking-tight">
                     {title}
                     <span className="text-text-secondary text-xs font-medium opacity-40 ml-1 bg-border-card px-1.5 rounded-full">{items.length}</span>
                 </h3>
              </div>
              
              {!isCollapsed && (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    {filteredItems.map((item: any) => (
                        <Card 
                            key={item.id || item.title} 
                            item={{...item, ...metadata[item.id] }} 
                            isTab={isTabSection}
                            onClick={() => isTabSection ? chromeApi.activateTab(item.id) : (item.url ? window.location.href = item.url : null)}
                            onEdit={() => { setModalInitialData({...item, ...metadata[item.id], type: (item.children || item.type === 'folder') ? 'folder' : (metadata[item.id]?.type || 'bookmark')}); setModalForceType(null); setIsModalOpen(true); }}
                            onDelete={() => isTabSection ? chromeApi.closeTab(item.id) : deleteItem(item.id)}
                            onClose={() => chromeApi.closeTab(item.id)}
                            onDragStart={(e) => handleDragStart(e, String(item.id))}
                        />
                    ))}
                </div>
              )}
          </div>
      );
  };

  return (
    <div className="flex h-screen bg-bg text-text-primary font-sans overflow-hidden transition-colors duration-300 selection:bg-accent/30">
      <Sidebar 
          collapsed={settings.sidebarCollapsed}
          theme={settings.theme}
          boards={settings.boards}
          activeBoardId={settings.activeBoardId}
          activeSidebarItem={settings.activeSidebarItem}
          onToggleSidebar={() => setSettings(s => ({ ...s, sidebarCollapsed: !s.sidebarCollapsed }))}
          onToggleTheme={() => setSettings(s => ({ ...s, theme: s.theme === 'light' ? 'dark' : 'light' }))}
          onSelectBoard={(id) => setSettings(s => ({ ...s, activeBoardId: id, activeSidebarItem: 'bookmarks' }))}
          onSelectSpace={() => setSettings(s => ({ ...s, activeSidebarItem: 'spaces' }))}
          onCreateBoard={() => {
              setModalForceType('folder');
              setModalInitialData(null);
              setIsModalOpen(true);
          }}
      />
      
      <main className="flex-1 flex flex-col min-w-0 bg-bg relative">
          <TopBar 
             onSearch={setSearchQuery}
             onViewValues={() => setSettings(s => ({ ...s, viewMode: s.viewMode === 'feed' ? 'tabs' : 'feed' }))}
             viewMode={settings.viewMode}
             onCreate={(type) => { setModalForceType(type); setModalInitialData(null); setIsModalOpen(true); }}
             onAddReminder={() => { setModalForceType('reminder'); setModalInitialData(null); setIsModalOpen(true); }}
             tabCount={tabs.length}
          />

          <div className="flex-1 overflow-y-auto p-4 scroll-smooth">
              {/* Reminders Shelf */}
              {settings.activeSidebarItem !== 'spaces' && reminders.length > 0 && (
                  <div className={`mb-10 p-4 bg-gradient-to-br from-bg-card to-accent-glow/10 border border-accent/20 rounded-2xl backdrop-blur-md max-w-[1600px] mx-auto shadow-sm transition-all duration-300 ${settings.collapsedSections.includes('reminders') ? 'pb-4' : 'pb-6'}`}>
                      <div 
                        className="text-xs font-bold uppercase tracking-widest text-accent flex items-center justify-between cursor-pointer select-none"
                        onClick={() => handleToggleSection('reminders')}
                      >
                          <div className="flex items-center gap-2"><Clock size={16} /> Active Reminders <span className="text-[10px] opacity-50 bg-accent/10 px-1.5 py-0.5 rounded-full">{reminders.length}</span></div>
                          <div className={`transition-transform duration-300 ${settings.collapsedSections.includes('reminders') ? '-rotate-90' : ''}`}>
                            <ChevronDown size={14} />
                          </div>
                      </div>
                      
                      {!settings.collapsedSections.includes('reminders') && (
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4 mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                          {reminders.map((r: any) => {
                              const diff = new Date(r.deadline).getTime() - now;
                              const isPast = diff <= 0;
                              const absDiff = Math.abs(diff);
                              const d = Math.floor(absDiff / (1000 * 60 * 60 * 24));
                              const h = Math.floor((absDiff % (1000 * 60 * 60 * 24)) / 3600000);
                              const m = Math.floor((absDiff % 3600000) / 60000);
                              const s = Math.floor((absDiff % 60000) / 1000);
                              
                              const displayUrl = r.url && r.url !== 'about:blank' ? r.url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0] : '';
                              const formattedDeadline = new Date(r.deadline).toLocaleString([], { 
                                  month: 'short', 
                                  day: 'numeric', 
                                  hour: 'numeric', 
                                  minute: '2-digit',
                                  second: '2-digit',
                                  hour12: true 
                              });

                              return (
                                <div 
                                  key={r.id} 
                                  onClick={() => r.url && r.url !== 'about:blank' && (window.location.href = r.url)}
                                  className="group relative flex flex-col p-4 bg-bg-card border border-border-card rounded-2xl hover:border-accent hover:shadow-xl hover:shadow-accent/5 transition-all cursor-pointer min-h-[120px]"
                                >
                                    <div className="flex items-start justify-between gap-4 mb-3">
                                      <div className="flex items-center gap-3 min-w-0">
                                          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent flex-shrink-0">
                                            <Bell size={16} />
                                          </div>
                                          <div className="flex flex-col min-w-0">
                                            <div className="font-bold text-sm text-text-primary group-hover:text-accent transition-colors truncate mb-0.5">{r.title}</div>
                                            {displayUrl && <div className="text-[10px] text-text-secondary/60 truncate italic whitespace-nowrap overflow-hidden text-ellipsis">{displayUrl}</div>}
                                          </div>
                                      </div>
                                      <div className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-md border flex-shrink-0 ${
                                          isPast ? 'bg-danger/10 text-danger border-danger/20' : 'bg-success/10 text-success border-success/20'
                                      }`}>
                                          {isPast ? 'EXPIRED' : `${d > 0 ? `${d}d ` : ''}${h}h ${m}m ${s}s`}
                                      </div>
                                    </div>

                                    <div className="flex flex-col min-w-0 flex-1">

                                      <div className="mt-auto flex items-center justify-between pt-2 border-t border-border-card/30">
                                          <div className="text-[10px] font-medium text-text-secondary/50 flex items-center gap-1">
                                              <Clock size={10} />
                                              {formattedDeadline}
                                          </div>
                                          
                                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                              <button 
                                                onClick={(e) => { e.stopPropagation(); setModalInitialData(r); setIsModalOpen(true); }} 
                                                className="p-1 hover:text-accent transition-colors"
                                              >
                                                  <Edit2 size={12}/>
                                              </button>
                                              <button 
                                                onClick={(e) => { e.stopPropagation(); deleteItem(r.id); }} 
                                                className="p-1 hover:text-danger transition-colors"
                                              >
                                                  <Trash2 size={12}/>
                                              </button>
                                          </div>
                                      </div>
                                    </div>

                                    {/* Tooltip Description */}
                                    {r.description && (
                                      <div className="absolute left-0 right-0 bottom-full mb-2 mx-2 p-3 bg-bg-card border border-border-card rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] pointer-events-none transform translate-y-2 group-hover:translate-y-0">
                                        <div className="text-[11px] text-text-secondary leading-relaxed line-clamp-4">{r.description}</div>
                                        <div className="absolute -bottom-1.5 left-6 w-3 h-3 bg-bg-card border-r border-b border-border-card rotate-45"></div>
                                      </div>
                                    )}
                                </div>
                              );
                          })}
                        </div>
                      )}
                  </div>
              )}

              <div className="max-w-[1600px] mx-auto">
                {settings.activeSidebarItem === 'spaces' ? (
                   <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-2xl font-black text-text-primary tracking-tight">Your Spaces</h2>
                            <div className="h-px flex-1 bg-border-card mx-6 opacity-40"></div>
                        </div>
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6 px-2">
                            {settings.boards.map(board => (
                                <div 
                                  key={board.id}
                                  onClick={() => setSettings(s => ({...s, activeBoardId: board.id, activeSidebarItem: 'bookmarks'}))}
                                  className="h-[160px] p-6 rounded-2xl border border-border-card bg-bg-card hover:bg-gradient-to-br hover:from-bg-card hover:to-accent-glow/20 flex flex-col justify-between cursor-pointer group transition-all duration-300 hover:shadow-2xl hover:shadow-accent/5 hover:-translate-y-1 relative overflow-hidden"
                                >
                                     <div className="absolute -right-4 -top-4 text-accent/5 group-hover:text-accent/10 transition-colors">
                                         <LayoutGrid size={120} />
                                     </div>
                                     <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center group-hover:scale-110 transition-transform">
                                         <LayoutGrid size={20} />
                                     </div>
                                     <div>
                                        <span className="text-xl font-black text-text-primary group-hover:text-accent transition-colors tracking-tight">{board.name}</span>
                                        <div className="text-xs text-text-secondary mt-1 font-medium opacity-60">Custom Board Space</div>
                                     </div>
                                </div>
                            ))}
                        </div>
                   </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-[1fr,340px] gap-10 items-start">
                    <div className="flex flex-col min-w-0">
                      {settings.viewMode === 'tabs' ? (
                        <div className="animate-in fade-in duration-300">
                           <div className="flex flex-wrap gap-4 px-2  mb-10 overflow-x-auto pb-2 no-scrollbar">
                               {[
                                  { id: 'tabs', title: 'Running Tabs', count: tabs.length },
                                  ...flatFolders.map((f: any) => ({ id: f.id, title: f.title, count: f.children?.length || 0 }))
                               ].map(chip => (
                                   <button
                                      key={chip.id}
                                      onClick={() => setSettings(s => ({ ...s, activeTab: chip.id }))}
                                      className={`px-5 py-2.5 rounded-xl border text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                                          settings.activeTab === chip.id 
                                          ? 'bg-accent text-white border-accent shadow-lg shadow-accent/20 scale-105' 
                                          : 'bg-bg-card border-border-card text-text-secondary hover:text-text-primary hover:bg-border-card'
                                      }`}
                                   >
                                       {chip.title}
                                       <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${settings.activeTab === chip.id ? 'bg-white/20' : 'bg-bg'}`}>{chip.count}</span>
                                   </button>
                               ))}
                           </div>
                           <div 
                             onDragOver={(e) => e.preventDefault()}
                             onDrop={(e) => settings.activeTab !== 'tabs' && handleDrop(e, settings.activeTab)}
                           >
                              <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
                                  {(settings.activeTab === 'tabs' ? tabs : (flatFolders.find((f: any) => f.id === settings.activeTab)?.children || [])).map((item: any) => (
                                       <Card 
                                          key={item.id} 
                                          item={{...item, ...metadata[item.id]}} 
                                          isTab={settings.activeTab === 'tabs'}
                                          onClick={() => settings.activeTab === 'tabs' ? chromeApi.activateTab(item.id) : (item.url ? window.location.href = item.url : null)}
                                          onEdit={() => { setModalInitialData({...item, ...metadata[item.id], type: (item.children || item.type === 'folder') ? 'folder' : (metadata[item.id]?.type || 'bookmark')}); setModalForceType(null); setIsModalOpen(true); }}
                                          onDelete={() => settings.activeTab === 'tabs' ? chromeApi.closeTab(item.id) : deleteItem(item.id)}
                                          onClose={() => chromeApi.closeTab(item.id)}
                                          onDragStart={(e) => handleDragStart(e, String(item.id))}
                                       />
                                  ))}
                                  {((settings.activeTab === 'tabs' ? tabs : (flatFolders.find((f: any) => f.id === settings.activeTab)?.children || [])).length === 0) && (
                                      <div className="col-span-full py-20 text-center text-text-secondary border-2 border-dashed border-border-card rounded-3xl opacity-40">
                                          No items found in this section
                                      </div>
                                  )}
                              </div>
                           </div>
                        </div>
                      ) : (
                        <>
                          {renderSection('Running Tabs', tabs, 'tabs', true)}
                          {flatFolders.map((folder: any) => renderSection(folder.title, folder.children, folder.id))}
                          {flatFolders.length === 0 && looseBookmarks.length === 0 && tabs.length === 0 && (
                             <div className="py-20 text-center border-2 border-dashed border-border-card rounded-3xl opacity-30">
                                This space is looking a bit empty. Create some bookmarks or folders!
                             </div>
                          )}
                        </>
                      )}
                    </div>

                    <aside className="flex flex-col gap-10 sticky top-4 h-fit max-h-[calc(100vh-100px)] overflow-y-auto no-scrollbar pb-10">
                        {topSites.length > 0 && (
                           <div className="w-full mb-10 group/section">
                               <div 
                                 className="flex items-center gap-2 mb-4 cursor-pointer select-none"
                                 onClick={() => handleToggleSection('topsites')}
                               >
                                   <div className={`p-1 rounded-md text-text-secondary hover:bg-border-card transition-all ${settings.collapsedSections.includes('topsites') ? '-rotate-90' : ''}`}>
                                       <ChevronDown size={14} />
                                   </div>
                                   <h3 className="text-[14px] font-bold text-text-primary/90 flex items-center gap-2 uppercase tracking-tight">
                                       Most Visited
                                       <span className="text-text-secondary text-xs font-medium opacity-40 ml-1 bg-border-card px-1.5 rounded-full">{topSites.length}</span>
                                   </h3>
                               </div>
                               {!settings.collapsedSections.includes('topsites') && (
                                 <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                     {topSites.map((site: any, idx: number) => (
                                         <div 
                                            key={idx} 
                                            onClick={() => window.location.href = site.url}
                                            className="p-3 rounded-xl bg-bg-card border border-border-card hover:border-accent/40 hover:bg-accent/5 transition-all text-center cursor-pointer group"
                                         >
                                             <img src={`https://www.google.com/s2/favicons?domain=${site.url}&sz=64`} className="w-8 h-8 mx-auto mb-2 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" alt=""/>
                                             <div className="text-[11px] font-bold text-text-primary truncate">{site.title}</div>
                                         </div>
                                     ))}
                                 </div>
                               )}
                           </div>
                        )}
                        {renderSection('Quick Links', looseBookmarks, 'loose')}
                    </aside>
                  </div>
                )}
              </div>
          </div>
      </main>

      <EditModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEdit}
        initialData={modalInitialData}
        forceType={modalForceType}
      />

      <ConfirmationModal
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        onConfirm={confirmState.onConfirm}
        onCancel={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default App;
