/* Global State */
let state = {
    tabs: [],
    bookmarks: [], 
    flatFolders: [],
    looseBookmarks: [],
    topSites: [],
    settings: {
        theme: 'dark', 
        sidebarCollapsed: false,
        viewMode: 'feed', 
        activeTab: 'tabs', 
        activeBoardId: '1', // Default to Bookmarks Bar
        activeSidebarItem: 'spaces', // Set to 'spaces' to show boards overview by default
        boards: [{ id: '1', name: 'Bookmark' }],
        collapsedSections: ['top-sites', 'loose'], 
    },
    metadata: {} 
};

const ELEMENTS = {
    mainFeed: document.getElementById('main-feed'),
    sideFeed: document.getElementById('side-feed'),
    remindersShelf: document.getElementById('reminders-shelf'),
    boardsNav: document.getElementById('boards-nav'),
    searchInput: document.getElementById('search-input'),
    tabCountText: document.getElementById('tab-count-text'),
    sidebar: document.getElementById('sidebar'),
    sidebarToggle: document.getElementById('sidebar-toggle'),
    themeToggle: document.getElementById('theme-toggle'),
    editModal: document.getElementById('edit-modal'),
    modalTitle: document.getElementById('modal-title'),
    editType: document.getElementById('edit-type'),
    editTitle: document.getElementById('edit-title'),
    editUrl: document.getElementById('edit-url'),
    editDesc: document.getElementById('edit-desc'),
    editDeadline: document.getElementById('edit-deadline'),
    cancelEdit: document.getElementById('cancel-edit'),
    saveEdit: document.getElementById('save-edit'),
    viewToggleBtn: document.getElementById('view-toggle-btn'),
    createBtn: document.getElementById('create-btn'),
    addReminderBtn: document.getElementById('add-reminder-btn'),
    createBoardBtn: document.getElementById('create-board-btn'),
    // Groups
    urlGroup: document.getElementById('url-group'),
    descGroup: document.getElementById('desc-group'),
    deadlineGroup: document.getElementById('deadline-group'),
    typeGroup: document.getElementById('type-group')
};

let editingBookmarkId = null;
let dragSourceId = null;
let dragSourceType = null;
let dropMarker = null;

/* Initialization */
async function init() {
    loadSettings();
    applyTheme();
    applySidebarState();
    setupEventListeners();
    await refreshData();
    setInterval(updateCountdowns, 1000);
}

function loadSettings() {
    const stored = localStorage.getItem('tabstack-settings');
    if (stored) {
        state.settings = { ...state.settings, ...JSON.parse(stored) };
    }
}

function saveSettings() {
    localStorage.setItem('tabstack-settings', JSON.stringify(state.settings));
}

async function refreshData() {
    const [tabs, tree, metadata, topSites] = await Promise.all([
        getOpenTabs(),
        getBookmarksTree(),
        getMetadata(),
        getTopSites()
    ]);
    
    state.tabs = tabs;
    state.metadata = metadata || {};
    state.topSites = topSites.slice(0, 10);
    
    processBookmarks(tree);
    render();
}

function getMetadata() {
    return new Promise(resolve => {
        chrome.storage.local.get(['bookmarkMetadata'], (result) => {
            resolve(result.bookmarkMetadata || {});
        });
    });
}

function getTopSites() {
    return new Promise(resolve => {
        chrome.topSites.get(resolve);
    });
}

function processBookmarks(tree) {
    const activeBoard = String(state.settings.activeBoardId);
    let boardNode = null;
    
    function findNode(nodes, id) {
        for (const node of nodes) {
            if (String(node.id) === id) return node;
            if (node.children) {
                const found = findNode(node.children, id);
                if (found) return found;
            }
        }
        return null;
    }

    boardNode = findNode(tree, activeBoard) || findNode(tree, '1');
    
    state.flatFolders = [];
    state.looseBookmarks = [];

    if (boardNode && boardNode.children) {
        boardNode.children.forEach(node => {
            if (node.children) state.flatFolders.push(node);
            else state.looseBookmarks.push(node);
        });
    }
}

function getOpenTabs() {
    return new Promise(resolve => chrome.tabs.query({}, resolve));
}

function getBookmarksTree() {
    return new Promise(resolve => chrome.bookmarks.getTree(resolve));
}

/* Rendering */
function render() {
    // Clear everything
    ELEMENTS.mainFeed.innerHTML = '';
    ELEMENTS.sideFeed.innerHTML = '';
    ELEMENTS.boardsNav.innerHTML = '';
    ELEMENTS.remindersShelf.innerHTML = '';
    ELEMENTS.remindersShelf.classList.add('hidden');
    
    // Stats
    ELEMENTS.tabCountText.textContent = `${state.tabs.length} Tabs`;

    // 1. Reminders (Only if not in Spaces view)
    if (state.settings.activeSidebarItem !== 'spaces') {
        const reminders = getReminders();
        if (reminders.length > 0) {
            renderRemindersShelf(reminders);
        }
    }

    // 2. Sidebar Highlights
    updateSidebarUI();
    state.settings.boards.forEach(board => renderBoardNavItem(board));

    // 3. Main Content
    if (state.settings.activeSidebarItem === 'spaces') {
        renderSpacesView();
    } else {
        // Render Board Stuff
        if (state.topSites.length > 0) renderSection('Most Visited', state.topSites, 'top-sites', ELEMENTS.sideFeed);
        if (state.looseBookmarks.length > 0) renderSection('Quick Links', state.looseBookmarks, 'loose', ELEMENTS.sideFeed);
        
        if (state.settings.viewMode === 'tabs') renderTabsView();
        else renderFeedView();
    }

    addDragDropHandlers();
}

function updateSidebarUI() {
    document.querySelectorAll('.nav-item').forEach(item => {
        const target = item.dataset.target;
        item.classList.toggle('active', state.settings.activeSidebarItem === target);
    });
}

function renderRemindersShelf(reminders) {
    const isCollapsed = state.settings.collapsedSections.includes('reminders');
    ELEMENTS.remindersShelf.classList.toggle('collapsed', isCollapsed);
    ELEMENTS.remindersShelf.classList.remove('hidden');
    
    const header = document.createElement('div');
    header.className = 'section-header';
    header.style.marginBottom = isCollapsed ? '0' : '16px';
    header.innerHTML = `
        <div class="section-title">
            <svg class="section-toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--accent)"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            Active Reminders
        </div>
    `;
    header.onclick = () => { toggleSection('reminders', ELEMENTS.remindersShelf); render(); };
    ELEMENTS.remindersShelf.appendChild(header);
    
    if (!isCollapsed) {
        const grid = document.createElement('div');
        grid.className = 'reminders-grid';
        reminders.forEach(item => grid.appendChild(createReminderNote(item)));
        ELEMENTS.remindersShelf.appendChild(grid);
    }
}

function renderSpacesView() {
    const section = document.createElement('div');
    section.className = 'section';
    section.innerHTML = `<div class="section-header"><div class="section-title">Boards Overview</div></div>`;
    
    const grid = document.createElement('div');
    grid.className = 'cards-grid';
    grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(280px, 1fr))';
    
    state.settings.boards.forEach(board => {
        const card = document.createElement('div');
        card.className = 'card board-card';
        card.style.height = '120px';
        card.style.justifyContent = 'center';
        card.style.alignItems = 'center';
        card.style.fontSize = '18px';
        card.style.fontWeight = '700';
        card.style.background = 'linear-gradient(135deg, var(--card-bg), var(--accent-glow))';
        card.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" style="margin-bottom:8px">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <path d="M9 3v18"></path>
            </svg>
            ${board.name}
            <div class="card-actions" style="opacity: 1; top: 12px; right: 12px;">
                <button class="action-btn edit-btn" title="Rename">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
                ${board.id !== '1' ? `
                <button class="action-btn delete-btn" title="Delete">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>` : ''}
            </div>
        `;
        card.onclick = (e) => {
             if (e.target.closest('.action-btn')) return;
             state.settings.activeBoardId = board.id;
             state.settings.activeSidebarItem = 'bookmarks';
             saveSettings();
             refreshData();
        };

        card.querySelector('.edit-btn').onclick = (e) => {
            e.stopPropagation();
            editBoard(board);
        };

        const delCardBtn = card.querySelector('.delete-btn');
        if (delCardBtn) {
            delCardBtn.onclick = (e) => {
                e.stopPropagation();
                deleteBoard(board);
            };
        }
        grid.appendChild(card);
    });
    
    section.appendChild(grid);
    ELEMENTS.mainFeed.appendChild(section);
}

function renderBoardNavItem(board) {
    const item = document.createElement('button'); 
    item.className = `nav-item ${ (state.settings.activeSidebarItem === 'bookmarks' && state.settings.activeBoardId === board.id) ? 'active' : '' }`;
    
    item.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px; flex: 1; overflow: hidden;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <path d="M9 3v18"></path>
            </svg>
            <span class="nav-text" style="text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${board.name}</span>
        </div>
        <div class="nav-actions" style="display: flex; gap: 4px;">
            <button class="action-btn edit-board-btn" title="Rename Board">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            ${board.id !== '1' ? `
            <button class="action-btn delete-board-btn" title="Delete Board">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>` : ''}
        </div>
    `;
    
    item.onclick = (e) => {
        if (e.target.closest('.action-btn')) return;
        state.settings.activeBoardId = board.id;
        state.settings.activeSidebarItem = 'bookmarks';
        saveSettings();
        refreshData();
    };

    item.querySelector('.edit-board-btn').onclick = (e) => {
        e.stopPropagation();
        editBoard(board);
    };

    const delBtn = item.querySelector('.delete-board-btn');
    if (delBtn) {
        delBtn.onclick = (e) => {
            e.stopPropagation();
            deleteBoard(board);
        };
    }

    ELEMENTS.boardsNav.appendChild(item);
}

async function editBoard(board) {
    const newName = prompt("Rename Board:", board.name);
    if (!newName || newName === board.name) return;

    // Update Bookmark Folder Name
    await chrome.bookmarks.update(board.id, { title: newName });
    
    // Update State
    const boardInState = state.settings.boards.find(b => b.id === board.id);
    if (boardInState) boardInState.name = newName;
    
    saveSettings();
    render();
}

async function deleteBoard(board) {
    if (board.id === '1') return; // Cannot delete primary bookmark board
    if (!confirm(`Are you sure you want to delete the board "${board.name}" and all its bookmarks?`)) return;

    // Remove Bookmark Folder
    await chrome.bookmarks.removeTree(board.id);
    
    // Update State
    state.settings.boards = state.settings.boards.filter(b => b.id !== board.id);
    if (state.settings.activeBoardId === board.id) {
        state.settings.activeBoardId = '1';
    }
    
    saveSettings();
    refreshData();
}

async function createBoard() {
    const name = prompt("Enter Board Name:");
    if (!name) return;

    // Create a new folder in Bookmarks Bar for this board
    const folder = await chrome.bookmarks.create({ parentId: '1', title: name });
    
    state.settings.boards.push({ id: folder.id, name: folder.title });
    state.settings.activeBoardId = folder.id;
    saveSettings();
    refreshData();
}

function getReminders() {
    const reminders = [];
    Object.keys(state.metadata).forEach(id => {
        if (state.metadata[id].type === 'reminder') {
            let found = state.looseBookmarks.find(b => b.id === id);
            if (!found) {
                state.flatFolders.forEach(f => {
                    const b = f.children?.find(c => c.id === id);
                    if (b) found = b;
                });
            }
            if (found) reminders.push(found);
        }
    });
    return reminders;
}

function createReminderNote(item) {
    const meta = state.metadata[item.id] || {};
    const note = document.createElement('div');
    note.className = 'reminder-note';
    
    const deadlineDate = meta.deadline ? new Date(meta.deadline).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'No deadline';
    
    note.innerHTML = `
        <div class="card-title" style="font-size: 16px; margin-bottom: 8px;">${item.title}</div>
        <div class="meta-desc" style="display: block; -webkit-line-clamp: unset; opacity: 1; margin-bottom: 12px;">${meta.description || 'No description provided'}</div>
        <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            ${deadlineDate}
        </div>
        <div class="countdown" data-deadline="${meta.deadline || ''}" style="width: 100%; justify-content: flex-start;"></div>
        <div class="card-actions" style="opacity: 1; top: 12px; right: 12px;">
            <button class="action-btn edit-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button class="action-btn delete-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
        </div>
    `;

    note.querySelector('.edit-btn').onclick = (e) => {
        e.stopPropagation();
        openEditModal(item);
    };

    note.querySelector('.delete-btn').onclick = (e) => {
        e.stopPropagation();
        removeBookmark(item.id);
    };
    
    const hasUrl = item.url && item.url !== 'about:blank';
    if (hasUrl) {
        note.style.cursor = 'pointer';
        note.onclick = () => window.location.href = item.url;
    }
    return note;
}

window.openModalById = (id) => {
    // Helper to find bookmark data
    let found = state.looseBookmarks.find(b => b.id === id);
    if (!found) {
        state.flatFolders.forEach(f => {
            const b = f.children?.find(c => c.id === id);
            if (b) found = b;
        });
    }
    if (found) openEditModal(found);
};

function renderFeedView() {
    if (state.tabs.length > 0) renderSection('Running Tabs', state.tabs, 'tabs', ELEMENTS.mainFeed);
    state.flatFolders.forEach(folder => renderSection(folder.title, folder.children, folder.id, ELEMENTS.mainFeed));
}

function renderTabsView() {
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'tabs-container';
    
    const addChip = (id, title, count) => {
        const chip = document.createElement('button');
        chip.className = `tab-chip ${state.settings.activeTab === id ? 'active' : ''}`;
        chip.textContent = `${title} (${count})`;
        chip.onclick = () => {
            state.settings.activeTab = id;
            saveSettings();
            render();
        };
        tabsContainer.appendChild(chip);
    };

    // Tabs View now only shows Running Tabs and Folders of the active BOARD.
    if (state.tabs.length > 0) addChip('tabs', 'Running Tabs', state.tabs.length);
    state.flatFolders.forEach(folder => addChip(folder.id, folder.title, folder.children?.length || 0));

    ELEMENTS.mainFeed.appendChild(tabsContainer);

    let activeItems = [];
    if (state.settings.activeTab === 'tabs') activeItems = state.tabs;
    else {
        const folder = state.flatFolders.find(f => f.id === state.settings.activeTab);
        if (folder) activeItems = folder.children || [];
        else { state.settings.activeTab = 'tabs'; activeItems = state.tabs; }
    }

    const grid = document.createElement('div');
    grid.className = 'cards-grid';
    grid.dataset.type = state.settings.activeTab === 'tabs' ? 'tabs' : 'bookmarks';
    grid.dataset.parentId = state.settings.activeTab;

    if (activeItems.length > 0) {
        activeItems.forEach(item => grid.appendChild(createCard(item, state.settings.activeTab === 'tabs')));
    } else {
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; color:var(--text-secondary); padding: 40px; border: 1px dashed var(--card-border); border-radius: 12px;">This folder is empty</div>`;
    }
    ELEMENTS.mainFeed.appendChild(grid);
}

function renderSection(title, items, id, container) {
    if (!items || items.length === 0) return;
    const isCollapsed = state.settings.collapsedSections.includes(id); 

    const section = document.createElement('div');
    section.className = `section ${isCollapsed ? 'collapsed' : ''}`;
    section.id = `section-${id}`;

    section.innerHTML = `
        <div class="section-header">
            <div class="section-title">
                <svg class="section-toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                ${title} <span style="opacity: 0.5; margin-left:8px;">${items.length}</span>
            </div>
        </div>
        <div class="cards-grid" data-type="${(id === 'tabs' || id === 'top-sites') ? 'external' : 'bookmarks'}" data-parent-id="${id}"></div>
    `;
    
    section.querySelector('.section-header').onclick = () => toggleSection(id, section);
    
    const grid = section.querySelector('.cards-grid');
    items.forEach(item => grid.appendChild(createCard(item, id === 'tabs', id === 'top-sites')));

    container.appendChild(section);
}

function toggleSection(id, element) {
    const isCollapsed = element.classList.toggle('collapsed');
    if (isCollapsed) {
        if (!state.settings.collapsedSections.includes(id)) state.settings.collapsedSections.push(id);
    } else {
        state.settings.collapsedSections = state.settings.collapsedSections.filter(sid => sid !== id);
    }
    saveSettings();
}

function toggleViewMode() {
    state.settings.viewMode = state.settings.viewMode === 'feed' ? 'tabs' : 'feed';
    saveSettings();
    render();
}

function createCard(item, isTab, isTopSite = false) {
    const card = document.createElement('div');
    card.className = 'card';
    card.draggable = !isTopSite;
    card.dataset.id = item.id;
    
    const meta = !isTab && !isTopSite ? state.metadata[item.id] || {} : {};
    const favUrl = (isTab || isTopSite) ? (item.favIconUrl || `https://www.google.com/s2/favicons?domain=${item.url || ''}&sz=64`) : `https://www.google.com/s2/favicons?domain=${item.url || ''}&sz=64`;
    
    let hostname = '';
    try { hostname = new URL(item.url || 'https://example.com').hostname; } catch(e) {}

    card.innerHTML = `
        <div class="card-header">
            <img class="card-icon" src="${favUrl}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2224%22 height=%2224%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22gray%22 stroke-width=%222%22><circle cx=%2212%22 cy=%2212%22 r=%2210%22/><line x1=%2212%22 y1=%228%22 x2=%2212%22 y2=%2216%22/><line x1=%228%22 y1=%2212%22 x2=%2216%22 y2=%2212%22/></svg>'">
            <div class="card-details">
                <div class="card-title">${item.title || 'Untitled'}</div>
                ${hostname ? `<div class="card-url">${hostname}</div>` : ''}
            </div>
        </div>
        ${(item.dateAdded || meta.description) ? `
            <div class="card-meta">
                ${item.dateAdded ? `<div class="meta-time"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>${new Date(item.dateAdded).toLocaleDateString()}</div>` : ''}
                ${meta.description ? `<div class="meta-desc">${meta.description}</div>` : ''}
            </div>
        ` : ''}
        <div class="card-actions">
            ${!isTab && !isTopSite ? `
                <button class="action-btn" id="edit-${item.id}"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>
                <button class="action-btn delete" id="del-${item.id}"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
            ` : isTab ? `
                <button class="action-btn delete" id="close-${item.id}"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
            ` : ''}
        </div>
    `;

    // Rebind events because innerHTML
    if (!isTab && !isTopSite) {
        card.querySelector(`#edit-${item.id}`).onclick = (e) => { e.stopPropagation(); openEditModal(item); };
        card.querySelector(`#del-${item.id}`).onclick = (e) => { e.stopPropagation(); removeBookmark(item.id); };
    } else if (isTab) {
        card.querySelector(`#close-${item.id}`).onclick = (e) => { e.stopPropagation(); closeTab(item.id); };
    }

    card.onclick = () => isTab ? chrome.tabs.update(item.id, { active: true }) : (item.url ? window.location.href = item.url : null);
    return card;
}

async function closeTab(id) { await chrome.tabs.remove(id); refreshData(); }
async function removeBookmark(id) { await chrome.bookmarks.remove(id); refreshData(); }

function updateCountdowns() {
    const now = Date.now();
    document.querySelectorAll('.countdown').forEach(el => {
        const diff = new Date(el.dataset.deadline).getTime() - now;
        if (diff <= 0) {
            el.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> Expired';
            el.classList.remove('safe');
        } else {
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            el.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> ${h}h ${m}m ${s}s`;
            if (h >= 24) el.classList.add('safe'); else el.classList.remove('safe');
        }
    });
}

function openEditModal(item = null, forceType = null) {
    if (item) {
        editingBookmarkId = item.id;
        ELEMENTS.modalTitle.textContent = "Edit Item";
        ELEMENTS.editTitle.value = item.title || '';
        ELEMENTS.editUrl.value = item.url || '';
        const meta = state.metadata[item.id] || {};
        ELEMENTS.editDesc.value = meta.description || '';
        ELEMENTS.editDeadline.value = meta.deadline || '';
        ELEMENTS.editType.value = meta.type || (item.children ? 'folder' : 'bookmark');
        ELEMENTS.typeGroup.style.display = 'none';
    } else {
        editingBookmarkId = 'new';
        ELEMENTS.modalTitle.textContent = forceType === 'reminder' ? "New Reminder" : "New Item";
        ELEMENTS.editTitle.value = "";
        ELEMENTS.editUrl.value = "";
        ELEMENTS.editDesc.value = "";
        ELEMENTS.editDeadline.value = "";
        ELEMENTS.editType.value = forceType || "bookmark";
        ELEMENTS.typeGroup.style.display = forceType ? 'none' : 'block';
    }
    updateModalFields();
    ELEMENTS.editModal.classList.add('visible');
    ELEMENTS.editModal.classList.remove('hidden');
}

function updateModalFields() {
    const type = ELEMENTS.editType.value;
    if (type === 'folder') {
        ELEMENTS.urlGroup.style.display = 'none';
    } else {
        ELEMENTS.urlGroup.style.display = 'block';
        ELEMENTS.urlGroup.querySelector('label').textContent = type === 'reminder' ? 'URL (Optional)' : 'URL';
    }
    ELEMENTS.deadlineGroup.style.display = type === 'reminder' ? 'block' : 'none';
}

function closeEditModal() { ELEMENTS.editModal.classList.remove('visible'); setTimeout(() => ELEMENTS.editModal.classList.add('hidden'), 300); }

async function saveBookmark() {
    const title = ELEMENTS.editTitle.value;
    let url = ELEMENTS.editUrl.value.trim();
    const type = ELEMENTS.editType.value;
    const metaObj = { description: ELEMENTS.editDesc.value, deadline: ELEMENTS.editDeadline.value, type };

    // Validation: Title required
    if (!title) {
        alert("Please enter a title");
        return;
    }

    // URL Handling for Reminders
    if (type === 'reminder' && !url) {
        url = 'about:blank'; // Placeholder for reminders without URL
    } else if (type !== 'folder') {
        if (!url) {
            alert("Please enter a URL");
            return;
        }
        // Auto-prepend https:// if missing
        if (!url.includes('://')) {
            url = 'https://' + url;
        }
    }

    let id = editingBookmarkId;
    try {
        if (editingBookmarkId === 'new') {
            const parentId = state.settings.activeTab !== 'tabs' && state.settings.activeTab !== 'reminders' ? state.settings.activeTab : '1';
            const createParams = { parentId, title };
            if (type !== 'folder') createParams.url = url;
            const node = await chrome.bookmarks.create(createParams);
            id = node.id;
        } else {
            const updateParams = { title };
            if (type !== 'folder') updateParams.url = url;
            await chrome.bookmarks.update(id, updateParams);
        }

        state.metadata[id] = metaObj;
        await chrome.storage.local.set({ bookmarkMetadata: state.metadata });
        closeEditModal();
        refreshData();
    } catch (err) {
        console.error("Failed to save:", err);
        alert("Could not save. Please check the URL format.");
    }
}

/* Drag & Drop */
function addDragDropHandlers() {
    const cards = document.querySelectorAll('.card');
    const containers = document.querySelectorAll('.cards-grid');
    cards.forEach(card => {
        card.addEventListener('dragstart', (e) => {
            dragSourceId = card.dataset.id;
            dragSourceType = card.parentElement.dataset.type;
            setTimeout(() => card.classList.add('dragging'), 0);
        });
        card.addEventListener('dragend', () => {
            card.classList.remove('dragging');
            if (dropMarker) dropMarker.remove();
        });
    });

    containers.forEach(grid => {
        if (grid.dataset.type === 'external') return; 
        grid.addEventListener('dragover', (e) => {
            e.preventDefault();
            grid.classList.add('drag-over');
            if (!dropMarker) {
                dropMarker = document.createElement('div');
                dropMarker.className = 'drop-marker vertical';
                document.body.appendChild(dropMarker);
            }
            const info = getDropTargetIndex(grid, e.clientX, e.clientY);
            if (info.closestItem) {
                const b = info.closestItem.getBoundingClientRect();
                dropMarker.style.height = `${b.height}px`;
                dropMarker.style.top = `${b.top + b.height/2}px`;
                dropMarker.style.left = `${info.insertAfter ? b.right : b.left}px`;
            }
        });
        grid.addEventListener('dragleave', () => grid.classList.remove('drag-over'));
        grid.addEventListener('drop', async (e) => {
            grid.classList.remove('drag-over');
            if (!dragSourceId) return;
            const info = getDropTargetIndex(grid, e.clientX, e.clientY);
            const parentId = grid.dataset.parentId === 'loose' ? '1' : grid.dataset.parentId;
            
            if (dragSourceType === 'tabs' && grid.dataset.type === 'bookmarks') {
                const tab = state.tabs.find(t => t.id == dragSourceId);
                await chrome.bookmarks.create({ parentId, title: tab.title, url: tab.url, index: info.index });
            } else if (dragSourceType === 'tabs' && grid.dataset.type === 'tabs') {
                await chrome.tabs.move(parseInt(dragSourceId), { index: info.index });
            } else if (dragSourceType === 'bookmarks' && grid.dataset.type === 'bookmarks') {
                await chrome.bookmarks.move(dragSourceId, { parentId, index: info.index });
            }
            refreshData();
        });
    });
}

function getDropTargetIndex(container, x, y) {
    const items = [...container.querySelectorAll('.card:not(.dragging)')];
    let closestItem = null, minD = Infinity;
    items.forEach(item => {
        const b = item.getBoundingClientRect();
        const d = Math.hypot(x - (b.left + b.width/2), y - (b.top + b.height/2));
        if (d < minD) { minD = d; closestItem = item; }
    });
    if (!closestItem) return { index: items.length, closestItem: null, insertAfter: true };
    const b = closestItem.getBoundingClientRect();
    const after = x > (b.left + b.width/2);
    const idx = items.indexOf(closestItem);
    return { index: after ? idx + 1 : idx, closestItem, insertAfter: after };
}

function setupEventListeners() {
    ELEMENTS.searchInput.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase();
        document.querySelectorAll('.card').forEach(c => c.style.display = (c.textContent.toLowerCase().includes(q)) ? 'flex' : 'none');
    });

    document.querySelectorAll('.nav-item[data-target]').forEach(item => {
        item.onclick = (e) => {
            e.preventDefault();
            state.settings.activeSidebarItem = item.dataset.target;
            if (state.settings.activeSidebarItem === 'bookmarks') {
                 // default to first board if none active
                 if (!state.settings.activeBoardId) state.settings.activeBoardId = '1';
            }
            saveSettings();
            refreshData();
        };
    });

    ELEMENTS.cancelEdit.onclick = closeEditModal;
    ELEMENTS.saveEdit.onclick = saveBookmark;
    ELEMENTS.themeToggle.onclick = () => { state.settings.theme = state.settings.theme === 'light' ? 'dark' : 'light'; saveSettings(); applyTheme(); };
    ELEMENTS.sidebarToggle.onclick = () => { state.settings.sidebarCollapsed = !state.settings.sidebarCollapsed; saveSettings(); applySidebarState(); };
    ELEMENTS.viewToggleBtn.onclick = toggleViewMode;
    ELEMENTS.createBtn.onclick = () => openEditModal();
    ELEMENTS.addReminderBtn.onclick = () => openEditModal(null, 'reminder');
    ELEMENTS.editType.onchange = updateModalFields;
    ELEMENTS.createBoardBtn.onclick = createBoard;
}

function applyTheme() {
    const isLight = state.settings.theme === 'light';
    document.body.setAttribute('data-theme', isLight ? 'light' : 'dark');
    document.querySelector('.sun-icon').style.display = isLight ? 'none' : 'block';
    document.querySelector('.moon-icon').style.display = isLight ? 'block' : 'none';
}

function applySidebarState() { ELEMENTS.sidebar.classList.toggle('collapsed', state.settings.sidebarCollapsed); }

init();
