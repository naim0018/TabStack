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
import { Clock as ClockWidget, Calendar } from "@/pages/Dashboard/Overview/Components/Widgets";

import { useAppData } from "@/hooks/useAppData";
import { useAppHandlers } from "@/hooks/useAppHandlers";
import { getCleanUrlFromUrl } from "@/utils/metadata";

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
    notes,
    quickLinksData,
    watchlistData,
    mostVisitedData,
    refreshData,
    tabStackFolderId,
    notesFolderId,
    remindersFolderId,
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
        topbar={
          <TopBar
            onSearch={setSearchQuery}
            hasBackground={!!settings.backgroundImage}
            onViewValues={() =>
              setSettings((s) => ({
                ...s,
                viewMode: s.viewMode === "feed" ? "tabs" : "feed",
              }))
            }
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
          />
        }
        sidebarRight={
          settings.activeSidebarItem !== "dashboard" ? (
            (looseBookmarks.length > 0 || settings.activeSidebarItem !== "spaces") && (
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
            )
          ) : (
            <div className="flex flex-col gap-6">
              <div className="glass border border-border-card rounded-3xl p-6 backdrop-blur-md shadow-sm">
                <ClockWidget
                  now={now.getTime()}
                  mode={settings.clockMode}
                  onToggle={handleToggleClockMode}
                />
              </div>
              <div className="glass border border-border-card rounded-3xl overflow-hidden backdrop-blur-md shadow-sm">
                <Calendar />
              </div>
            </div>
          )
        }
      >
        {settings.activeSidebarItem === "dashboard" ? (
          <Overview
            settings={settings}
            onToggleClockMode={handleToggleClockMode}
            reminders={reminders}
            quickLinks={quickLinksData}
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
                url: getCleanUrlFromUrl(r.url),
                type: "reminder",
              });
              setModalForceType("reminder");
              setIsModalOpen(true);
            }}
            onDeleteReminder={(id) => deleteItem(id)}
            onAddQuickLink={() => {
              setModalForceType("bookmark");
              setModalInitialData({
                id: "",
                title: "",
                url: "",
                type: "quicklink" as any,
              });
              setIsModalOpen(true);
            }}
            onEditQuickLink={(link) => {
              setModalInitialData({
                ...link,
                url: getCleanUrlFromUrl(link.url),
                type: "quicklink" as any,
              });
              setModalForceType("bookmark");
              setIsModalOpen(true);
            }}
            onDeleteQuickLink={(id) => deleteItem(id)}
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
          <SpacesView
            settings={settings}
            setSettings={setSettings}
          />
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
                type: "note"
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
                type: "reminder"
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
                url: getCleanUrlFromUrl(item.url)
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
                  s.gridMode === "horizontal"
                    ? "vertical"
                    : "horizontal",
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
