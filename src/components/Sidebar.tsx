import React from 'react';
import { LayoutGrid, Plus, Moon, Sun, ChevronLeft, ChevronRight, Folder, FileText, Bell } from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  theme: 'dark' | 'light';
  boards: { id: string; name: string }[];
  folders?: any[]; // Recursive folders
  activeBoardId: string;
  activeTabId?: string;
  activeSidebarItem: string;
  onToggleSidebar: () => void;
  onToggleTheme: () => void;
  onSelectBoard: (id: string) => void;
  onSelectFolder: (id: string) => void;
  onSelectNotes: () => void;
  onSelectReminders: () => void;
  onSelectSpace: () => void;
  onCreateBoard: () => void;
}

export function Sidebar({
  collapsed,
  theme,
  boards,
  folders = [],
  activeBoardId,
  activeTabId,
  activeSidebarItem,
  onToggleSidebar,
  onToggleTheme,
  onSelectBoard,
  onSelectFolder,
  onSelectNotes,
  onSelectReminders,
  onSelectSpace,
  onCreateBoard,
}: SidebarProps) {
  return (
    <aside
      className={`
        bg-bg-sidebar border-r border-border-card flex flex-col flex-shrink-0 
        transition-all duration-300 ease-in-out h-full
        ${collapsed ? 'w-[72px] p-2' : 'w-[260px] p-6'}
      `}
    >
      <div className={`flex items-center justify-between mb-8 ${collapsed ? 'flex-col gap-4 justify-center mb-4' : ''}`}>
        <div className={`flex items-center gap-3 overflow-hidden ${collapsed ? 'w-full justify-center gap-0' : ''}`}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-indigo-400 flex items-center justify-center flex-shrink-0 text-white">
            <LayoutGrid size={18} strokeWidth={2.5} />
          </div>
          {!collapsed && (
            <h1 className="text-xl font-bold whitespace-nowrap tracking-tight transition-opacity duration-200">
              TabStack
            </h1>
          )}
        </div>
        <button
          onClick={onToggleSidebar}
          className="p-1 rounded text-text-secondary hover:bg-border-card hover:text-text-primary transition-colors"
          title="Toggle Sidebar"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="flex flex-col gap-1 flex-1 min-h-0">
        <div className="flex flex-col gap-1 overflow-y-auto flex-1 no-scrollbar pb-4">
          <div className="text-[10px] uppercase font-bold text-text-secondary/60 mb-2 px-3 tracking-widest {!collapsed ? '' : 'hidden'}">Library</div>
          {boards.map((board) => (
            <div key={board.id} className="flex flex-col gap-0.5">
                <button
                onClick={() => onSelectBoard(board.id)}
                className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all w-full
                    ${collapsed ? 'justify-center p-2.5' : ''}
                    ${
                    activeSidebarItem === 'bookmarks' && activeBoardId === board.id && (activeTabId === 'tabs' || !activeTabId)
                        ? 'bg-border-card text-text-primary shadow-sm'
                        : 'text-text-secondary hover:bg-border-card hover:text-text-primary'
                    }
                `}
                title={board.name}
                >
                <Folder size={18} className="flex-shrink-0" />
                {!collapsed && <span className="truncate">{board.name}</span>}
                </button>
            </div>
          ))}

          <button
            onClick={onSelectNotes}
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mb-1 transition-all w-full
              ${collapsed ? 'justify-center p-2.5' : ''}
              ${
                activeSidebarItem === 'notes'
                  ? 'bg-border-card text-text-primary shadow-sm'
                  : 'text-text-secondary hover:bg-border-card hover:text-text-primary'
              }
            `}
            title="Notes"
          >
            <FileText size={18} className="flex-shrink-0" />
            {!collapsed && <span>Notes</span>}
          </button>

          <button
            onClick={onSelectReminders}
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mb-1 transition-all w-full
              ${collapsed ? 'justify-center p-2.5' : ''}
              ${
                activeSidebarItem === 'reminders'
                  ? 'bg-border-card text-text-primary shadow-sm'
                  : 'text-text-secondary hover:bg-border-card hover:text-text-primary'
              }
            `}
            title="Reminders"
          >
            <Bell size={18} className="flex-shrink-0" />
            {!collapsed && <span>Reminders</span>}
          </button>
        </div>

        <div className="h-px bg-border-card my-4 mx-0" />

        <button
          onClick={onCreateBoard}
          className={`
            flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all w-full
            text-text-secondary hover:bg-border-card hover:text-text-primary
            ${collapsed ? 'justify-center p-2.5' : ''}
          `}
          title="Create Board"
        >
          <Plus size={18} className="flex-shrink-0" />
          {!collapsed && <span>New Board</span>}
        </button>

        <button
          onClick={onSelectSpace}
          className={`
            flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all w-full
            ${collapsed ? 'justify-center p-2.5' : ''}
            ${
              activeSidebarItem === 'spaces'
                ? 'bg-border-card text-text-primary shadow-sm'
                : 'text-text-secondary hover:bg-border-card hover:text-text-primary'
            }
          `}
          title="Spaces"
        >
          <LayoutGrid size={18} className="flex-shrink-0" />
          {!collapsed && <span>Spaces</span>}
        </button>
      </nav>

      <div className="mt-auto pt-4 border-t border-border-card">
        <button
          onClick={onToggleTheme}
          className={`
            flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all w-full
            text-text-secondary hover:bg-border-card hover:text-text-primary
            ${collapsed ? 'justify-center p-2.5' : ''}
          `}
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          {!collapsed && <span>{theme === 'dark' ? 'Light' : 'Dark'} Mode</span>}
        </button>
      </div>
    </aside>
  );
}
