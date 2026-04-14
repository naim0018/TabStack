import { useState } from "react";
import { Sidebar } from "@/Layout/Sidebar";
import { TopBar } from "@/Layout/TopBar";
import { DashboardLayout } from "@/Layout/DashboardLayout";
import { EditModal } from "@/common/EditModal";
import { ConfirmationModal } from "@/common/ConfirmationModal";
import { chromeApi } from "@/utils/chrome";
import { Overview } from "@/pages/Dashboard/Overview/Overview";
import { SpacesView } from "@/pages/Dashboard/Spaces/SpacesView";
import { NotesView } from "@/pages/Dashboard/Notes/NotesView";
import { RemindersView } from "@/pages/Dashboard/Reminders/RemindersView";
import { BookmarksView } from "@/pages/Dashboard/Bookmarks/BookmarksView";
import { WatchlistView } from "@/pages/Dashboard/Watchlist/WatchlistView";
import { CustomizeSettings } from "@/pages/Dashboard/Settings/Customize/CustomizeSettings";
import { SectionList } from "@/common/SectionList";
import {
  Clock as ClockWidget,
  Calendar,
} from "@/pages/Dashboard/Overview/Components/Widgets";
import { Plus, Edit2, Trash2 } from "lucide-react";

import { useAppData } from "@/hooks/useAppData";
import { useAppHandlers } from "@/hooks/useAppHandlers";
import { getCleanUrlFromUrl, encodeMetaToUrl } from "@/utils/metadata";
import { GlassContainer } from "@/components/ui/GlassContainer";

const App = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const {
    settings,
    setSettings,
    tabs,
    tree,
    metadata,
    setMetadata,
    history,
    now,
    flatFolders,
    looseBookmarks,
    allBookmarks,
    reminders,
    plans,
    notes,
    quickLinksData,
    watchlistData,
    mostVisitedData,
    refreshData,
    tabStackFolderId,
    notesFolderId,
    remindersFolderId,
    plansFolderId,
    quickLinksFolderId,
    watchlistFolderId,
    mostVisitedFolderId,
  } = useAppData();

  const {
    isModalOpen,
    setIsModalOpen,
    modalInitialData,
    setModalInitialData,
    modalForceType,
    setModalForceType,
    draggingId,
    confirmState,
    setConfirmState,
    handleToggleSection,
    handleToggleClockMode,
    deleteItem,
    handleExportData,
    handleImportData,
    handleForceSync,
    handleSaveEdit,
    handleCreateBoard,
    handleDragStart,
    handleDrop,
    handleCardClick,
  } = useAppHandlers({
    settings,
    setSettings,
    refreshData,
    tabStackFolderId,
    notesFolderId,
    remindersFolderId,
    plansFolderId,
    quickLinksFolderId,
    watchlistFolderId,
    mostVisitedFolderId,
    metadata,
    setMetadata,
    tree,
    tabs,
    allBookmarks,
  });

  return (
    <>
      <DashboardLayout
        settings={settings}
        sidebar={
          <Sidebar
            collapsed={settings.sidebarCollapsed}
            theme={settings.theme}
            boards={settings.boards}
            activeBoardId={settings.activeBoardId}
            activeTabId={settings.activeTab}
            activeSidebarItem={settings.activeSidebarItem}
            hasBackground={!!settings.backgroundImage}
            onToggleSidebar={() =>
              setSettings((s) => ({
                ...s,
                sidebarCollapsed: !s.sidebarCollapsed,
              }))
            }
            onToggleTheme={() =>
              setSettings((s) => ({
                ...s,
                theme: s.theme === "light" ? "dark" : "light",
              }))
            }
            onSelectBoard={(id) =>
              setSettings((s) => ({
                ...s,
                activeBoardId: id,
                activeSidebarItem: "bookmarks",
                activeTab: "tabs",
              }))
            }
            onSelectFolder={(id) =>
              setSettings((s) => ({
                ...s,
                activeTab: id,
                activeSidebarItem: "bookmarks",
              }))
            }
            onSelectSpace={() =>
              setSettings((s) => ({ ...s, activeSidebarItem: "spaces" }))
            }
            onSelectNotes={() =>
              setSettings((s) => ({ ...s, activeSidebarItem: "notes" }))
            }
            onSelectReminders={() =>
              setSettings((s) => ({ ...s, activeSidebarItem: "reminders" }))
            }
            onSelectDashboard={() =>
              setSettings((s) => ({ ...s, activeSidebarItem: "dashboard" }))
            }
            onSelectWatchlist={() =>
              setSettings((s) => ({ ...s, activeSidebarItem: "watchlist" }))
            }
            onSelectCustomize={() =>
              setSettings((s) => ({ ...s, activeSidebarItem: "customize" }))
            }
            onCreateBoard={handleCreateBoard}
            onEditBoard={async (id, name) => {
              await chromeApi.updateBookmark(id, { title: name });
              refreshData();
            }}
            onDeleteBoard={(id) => deleteItem(id, true)}
            onSearch={setSearchQuery}
            tabStackFolderId={tabStackFolderId || undefined}
          />
        }
        topbarRight={
          <TopBar
            onSearch={setSearchQuery}
            hasBackground={!!settings.backgroundImage}
            onViewValues={() => {}}
            viewMode={settings.viewMode}
            onCreate={(type) => {
              setModalForceType(type);
              setModalInitialData(null);
              setIsModalOpen(true);
            }}
            onAddReminder={() => {
              setModalForceType("reminder");
              setModalInitialData(null);
              setIsModalOpen(true);
            }}
            tabCount={tabs.length}
            showSearch={false}
            showLogo={false}
          />
        }
        sidebarRight={
          settings.activeSidebarItem === "dashboard" ? (
            <div className="flex flex-col gap-6">
              <GlassContainer className="p-6">
                <ClockWidget
                  now={now.getTime()}
                  mode={settings.clockMode}
                  onToggle={handleToggleClockMode}
                />
              </GlassContainer>
              <GlassContainer className="overflow-hidden">
                <Calendar />
              </GlassContainer>
            </div>
          ) : settings.activeSidebarItem === "bookmarks" && looseBookmarks.length > 0 ? (
              <SectionList
                title="Quick Links"
                items={looseBookmarks}
                id="loose"
                settings={settings}
                searchQuery={searchQuery}
                now={now.getTime()}
                draggingId={draggingId}
                onToggleSection={handleToggleSection}
                onDrop={handleDrop}
                onDragStart={handleDragStart}
                onItemClick={handleCardClick}
                onItemEdit={(item: any) => {
                  setModalInitialData(item);
                  setModalForceType("bookmark");
                  setIsModalOpen(true);
                }}
                onItemDelete={(item: any) => deleteItem(item.id)}
              />
          ) : null
        }
        bottomDock={
          settings.activeSidebarItem !== "customize" ? (
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
              <div className="glass-dock border border-white/10 rounded-xl p-2 px-4 flex items-center gap-3 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:scale-105 transition-all duration-500">
                {/* Quick Links */}
                {quickLinksData.map((link: any) => (
                  <div key={link.id} className="relative group/ql">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-1 group"
                    >
                      <div className="w-14 h-14 rounded-[1.2rem] bg-linear-to-br from-white/10 to-white/5 flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-sm border border-white/5 overflow-hidden">
                        <img
                          src={`https://www.google.com/s2/favicons?domain=${link.url || ""}&sz=128`}
                          alt={link.title}
                          className="w-10 h-10 object-contain drop-shadow-md"
                        />
                      </div>
                      {/* Tooltip on hover */}
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-md text-white text-[10px] font-bold opacity-0 group-hover/ql:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10 translate-y-2 group-hover/ql:translate-y-0 duration-300">
                        {link.title}
                      </div>
                    </a>

                    {/* Quick Actions */}
                    <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover/ql:opacity-100 transition-opacity scale-75 group-hover/ql:scale-100 duration-300">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setModalInitialData({
                            ...link,
                            url: getCleanUrlFromUrl(link.url),
                            type: "quicklink" as any,
                          });
                          setModalForceType("bookmark");
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white hover:bg-accent transition-colors shadow-lg"
                      >
                        <Edit2 size={10} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteItem(link.id);
                        }}
                        className="p-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white hover:bg-red-500 transition-colors shadow-lg"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Divider if we have custom links */}
                {quickLinksData.length > 0 && (
                  <div className="w-px h-10 bg-white/10 mx-1 self-center" />
                )}

                {/* Fallback to Top Sites if empty */}
                {quickLinksData.length === 0 && mostVisitedData.slice(0, 5).map((site: any, idx: number) => (
                  <div key={idx} className="relative group/ql">
                    <a
                      href={site.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-1 group"
                    >
                      <div className="w-14 h-14 rounded-[1.2rem] bg-linear-to-br from-white/10 to-white/5 flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-sm border border-white/5 overflow-hidden">
                        <img
                          src={`https://www.google.com/s2/favicons?domain=${site.url || ""}&sz=128`}
                          alt={site.title}
                          className="w-10 h-10 object-contain drop-shadow-md opacity-70 group-hover:opacity-100"
                        />
                      </div>
                    </a>
                  </div>
                ))}

                {/* Add Link Button */}
                <button
                  onClick={() => {
                    setModalForceType("bookmark");
                    setModalInitialData({
                      id: "",
                      title: "",
                      url: "",
                      type: "quicklink" as any,
                    });
                    setIsModalOpen(true);
                  }}
                  className="w-14 h-14 rounded-[1.2rem] bg-white/10 flex items-center justify-center hover:bg-accent/20 transition-all duration-300 group border border-dashed border-white/20 hover:border-accent/50"
                >
                  <Plus size={24} className="text-white opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                </button>
              </div>
            </div>
          ) : null
        }
      >
        {settings.activeSidebarItem === "dashboard" ? (
          <Overview
            reminders={reminders}
            plans={plans}
            now={now.getTime()}
            topSites={mostVisitedData}
            history={history}
            onCreateReminder={() => {
              setModalForceType("reminder");
              setModalInitialData(null);
              setIsModalOpen(true);
            }}
            onEditReminder={(r) => {
              setModalInitialData({
                ...r,
                url: r.url ? getCleanUrlFromUrl(r.url) : "about:blank",
                type: "reminder",
              });
              setModalForceType("reminder");
              setIsModalOpen(true);
            }}
            onDeleteReminder={(id) => deleteItem(id)}
            onCreatePlan={() => {
                setModalForceType("plan");
                setModalInitialData(null);
                setIsModalOpen(true);
            }}
            onEditPlan={(p) => {
                setModalInitialData({
                    ...p,
                    url: "about:blank",
                    type: "plan",
                });
                setModalForceType("plan");
                setIsModalOpen(true);
            }}
            onTogglePlan={async (plan) => {
                const isCompleted = plan.completedAt;
                const metaToSave = { 
                    description: plan.description, 
                    deadline: plan.deadline, 
                    type: "plan",
                    completedAt: isCompleted ? null : Date.now() 
                };
                try {
                    const newUrl = encodeMetaToUrl("about:blank", metaToSave);
                    await chromeApi.updateBookmark(plan.id, { url: newUrl });
                    const newMeta = { ...metadata, [plan.id]: metaToSave };
                    await chromeApi.saveMetadata(newMeta);
                    setMetadata(newMeta);
                    refreshData();
                } catch (e) {
                    console.error("Toggle plan failed", e);
                }
            }}
            onDeletePlan={(id) => deleteItem(id)}
            onAddMostVisited={() => {
                setModalForceType("mostvisited");
                setModalInitialData({
                  id: "",
                  title: "",
                  url: "",
                  type: "mostvisited",
                });
                setIsModalOpen(true);
              }}
              onEditMostVisited={(site) => {
                setModalInitialData({
                  ...site,
                  url: getCleanUrlFromUrl(site.url),
                  type: "mostvisited",
                });
                setModalForceType("mostvisited");
                setIsModalOpen(true);
              }}
              onDeleteMostVisited={(id) => deleteItem(id)}
          />
        ) : settings.activeSidebarItem === "spaces" ? (
          <SpacesView settings={settings} setSettings={setSettings} />
        ) : settings.activeSidebarItem === "notes" ? (
          <NotesView
            notes={notes}
            searchQuery={searchQuery}
            now={now.getTime()}
            onCreate={() => {
              setModalForceType("note");
              setModalInitialData(null);
              setIsModalOpen(true);
            }}
            onEdit={(n) => {
              setModalInitialData({
                ...n,
                url: getCleanUrlFromUrl(n.url),
                type: "note",
              });
              setModalForceType("note");
              setIsModalOpen(true);
            }}
            onDelete={(id) => deleteItem(id)}
          />
        ) : settings.activeSidebarItem === "reminders" ? (
          <RemindersView
            reminders={reminders}
            searchQuery={searchQuery}
            now={now.getTime()}
            onCreate={() => {
              setModalForceType("reminder");
              setModalInitialData(null);
              setIsModalOpen(true);
            }}
            onEdit={(r) => {
              setModalInitialData({
                ...r,
                url: getCleanUrlFromUrl(r.url),
                type: "reminder",
              });
              setModalForceType("reminder");
              setIsModalOpen(true);
            }}
            onDelete={(id) => deleteItem(id)}
          />
        ) : settings.activeSidebarItem === "watchlist" ? (
          <WatchlistView
            watchlist={watchlistData}
            searchQuery={searchQuery}
            now={now.getTime()}
            onCreate={() => {
              setModalForceType("bookmark");
              setModalInitialData({
                id: "",
                title: "",
                url: "",
                type: "watchlist" as any,
              });
              setIsModalOpen(true);
            }}
            onEdit={(item) => {
              setModalInitialData({
                ...item,
                url: getCleanUrlFromUrl(item.url),
                type: "watchlist" as any,
              });
              setModalForceType("bookmark");
              setIsModalOpen(true);
            }}
            onDelete={(id) => deleteItem(id)}
          />
        ) : settings.activeSidebarItem === "customize" ? (
          <CustomizeSettings
            settings={settings}
            setSettings={setSettings}
            onExportData={handleExportData}
            onImportData={handleImportData}
            onForceSync={handleForceSync}
          />
        ) : settings.activeSidebarItem === "bookmarks" ? (
          <BookmarksView
            settings={settings}
            tabs={tabs}
            flatFolders={flatFolders}
            looseBookmarks={looseBookmarks}
            searchQuery={searchQuery}
            now={now.getTime()}
            draggingId={draggingId}
            onToggleSection={handleToggleSection}
            onDrop={handleDrop}
            onDragStart={handleDragStart}
            onItemClick={handleCardClick}
            onItemEdit={(item: any) => {
              setModalForceType(null);
              setModalInitialData({
                ...item,
                url: getCleanUrlFromUrl(item.url),
              });
              setIsModalOpen(true);
            }}
            onItemDelete={(item: any) => deleteItem(item.id)}
            onTabClose={(item) => chromeApi.closeTab(item.id)}
            onCreateBookmark={() => {
              setModalForceType("bookmark");
              setModalInitialData(null);
              setIsModalOpen(true);
            }}
            onToggleViewMode={() =>
              setSettings((s) => ({
                ...s,
                gridMode:
                  s.gridMode === "horizontal" ? "vertical" : "horizontal",
              }))
            }
            onToggleAllSections={(collapse) => {
              if (collapse) {
                const allIds = flatFolders.map((f: any) => f.id);
                if (
                  settings.activeSidebarItem === "bookmarks" &&
                  settings.activeBoardId === "1"
                ) {
                  allIds.push("tabs");
                }
                setSettings((s) => ({
                  ...s,
                  collapsedSections: allIds,
                }));
              } else {
                setSettings((s) => ({
                  ...s,
                  collapsedSections: [],
                }));
              }
            }}
          />
        ) : null}
      </DashboardLayout>

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
        onCancel={() => setConfirmState((prev) => ({ ...prev, isOpen: false }))}
      />
    </>
  );
};

export default App;
