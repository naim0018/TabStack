export const isExtension = typeof chrome !== 'undefined' && !!chrome.bookmarks;

const mockBookmarks = [
  {
    id: '1', title: 'Bookmarks Bar', children: [
        { id: '10', title: 'Work', children: [] },
        { id: '11', title: 'Personal', url: 'https://google.com' },
        { id: '12', title: 'News', children: [
            { id: '121', title: 'Hacker News', url: 'https://news.ycombinator.com' }
        ]}
    ]
  }
];

const mockTabs = [
  { id: 1, title: 'Google', url: 'https://google.com', favIconUrl: 'https://www.google.com/s2/favicons?domain=google.com' },
  { id: 2, title: 'GitHub', url: 'https://github.com', favIconUrl: 'https://github.com/favicon.ico' }
];

const mockTopSites = [
    { title: 'YouTube', url: 'https://youtube.com' },
    { title: 'Reddit', url: 'https://reddit.com' }
];

export const chromeApi = {
    /**
     * Fetches the entire bookmark tree from the Chrome API.
     * If not in an extension environment, returns mock bookmark data.
     * @returns {Promise<chrome.bookmarks.BookmarkTreeNode[]>} A promise that resolves with the bookmark tree.
     */
    getTree: async (): Promise<chrome.bookmarks.BookmarkTreeNode[]> => {
        if (isExtension) return new Promise((resolve) => chrome.bookmarks.getTree(resolve));
        return [{ id: 'root', title: 'root', children: mockBookmarks }] as unknown as chrome.bookmarks.BookmarkTreeNode[];
    },
    /**
     * Fetches all open tabs in the current window from the Chrome API.
     * If not in an extension environment, returns mock tab data.
     * @returns {Promise<chrome.tabs.Tab[]>} A promise that resolves with an array of tab objects.
     */
    getTabs: async (): Promise<chrome.tabs.Tab[]> => {
        if (isExtension) return new Promise((resolve) => chrome.tabs.query({}, resolve));
        return mockTabs as unknown as chrome.tabs.Tab[];
    },
    /**
     * Fetches the list of most visited top sites from the Chrome API.
     * If not in an extension environment, returns mock top sites data.
     * @returns {Promise<chrome.topSites.MostVisitedURL[]>} A promise that resolves with an array of top site URLs.
     */
    getTopSites: async (): Promise<chrome.topSites.MostVisitedURL[]> => {
        if (isExtension && chrome.topSites) return new Promise((resolve) => chrome.topSites.get(resolve));
        return mockTopSites as unknown as chrome.topSites.MostVisitedURL[];
    },
    /**
     * Fetches custom bookmark metadata from Chrome's sync storage.
     * If not in an extension environment, returns an empty object.
     * @returns {Promise<Record<string, any>>} A promise that resolves with the bookmark metadata.
     */
    getMetadata: async (): Promise<Record<string, any>> => {
        if (isExtension) {
            return new Promise((resolve) => {
                chrome.storage.sync.get(['bookmarkMetadata'], (result) => {
                    resolve(result.bookmarkMetadata || {});
                });
            });
        }
        return {}; // Mock metadata
    },
    /**
     * Saves custom bookmark metadata to Chrome's sync storage.
     * If not in an extension environment, logs the metadata to the console.
     * @param {any} metadata The metadata object to save.
     * @returns {Promise<void>} A promise that resolves when the metadata is saved.
     */
    saveMetadata: async (metadata: any) => {
        if (isExtension) {
            return chrome.storage.sync.set({ bookmarkMetadata: metadata });
        }
        console.log('Saved metadata:', metadata);
    },
    /**
     * Fetches extension settings from Chrome's sync storage.
     * If not in an extension environment, fetches from localStorage or returns default settings.
     * @param {any} defaultSettings The default settings to use if none are found.
     * @returns {Promise<any>} A promise that resolves with the application settings.
     */
    getSettings: async (defaultSettings: any): Promise<any> => {
        if (isExtension) {
            return new Promise((resolve) => {
                chrome.storage.sync.get(['appSettings'], (result) => {
                    resolve(result.appSettings || defaultSettings);
                });
            });
        }
        const stored = localStorage.getItem('tabstack-settings');
        return stored ? JSON.parse(stored) : defaultSettings;
    },
    /**
     * Saves extension settings to Chrome's sync storage.
     * If not in an extension environment, saves to localStorage.
     * @param {any} settings The settings object to save.
     * @returns {Promise<void>} A promise that resolves when the settings are saved.
     */
    saveSettings: async (settings: any) => {
        if (isExtension) {
            return chrome.storage.sync.set({ appSettings: settings });
        }
        localStorage.setItem('tabstack-settings', JSON.stringify(settings));
        console.log('Saved settings:', settings);
    },
    /**
     * Creates a new bookmark or folder using the Chrome API.
     * If not in an extension environment, logs the data and returns a mock bookmark.
     * @param {any} data The bookmark creation data (e.g., parentId, title, url).
     * @returns {Promise<chrome.bookmarks.BookmarkTreeNode>} A promise that resolves with the created bookmark node.
     */
    createBookmark: async (data: any): Promise<chrome.bookmarks.BookmarkTreeNode> => {
        if (isExtension) return chrome.bookmarks.create(data);
        console.log('Created bookmark:', data);
        return { id: Math.random().toString(), ...data } as chrome.bookmarks.BookmarkTreeNode;
    },
    /**
     * Updates an existing bookmark using the Chrome API.
     * If not in an extension environment, logs the ID and data.
     * @param {string} id The ID of the bookmark to update.
     * @param {any} data The update data (e.g., title, url).
     * @returns {Promise<chrome.bookmarks.BookmarkTreeNode>} A promise that resolves with the updated bookmark node.
     */
    updateBookmark: async (id: string, data: any) => {
        if (isExtension) return chrome.bookmarks.update(id, data);
        console.log('Updated bookmark:', id, data);
    },
    /**
     * Removes a specific bookmark or an empty folder using the Chrome API.
     * If not in an extension environment, logs the ID.
     * @param {string} id The ID of the bookmark to remove.
     * @returns {Promise<void>} A promise that resolves when the bookmark is removed.
     */
    removeBookmark: async (id: string) => { 
        if (isExtension) return chrome.bookmarks.remove(id); 
        console.log('Removed bookmark:', id);
    },
    removeTree: async (id: string) => {
        if (isExtension) return chrome.bookmarks.removeTree(id);
        console.log('Removed tree:', id);
    },
    moveBookmark: async (id: string, destination: any) => {
        if (isExtension) return chrome.bookmarks.move(id, destination);
        console.log('Moved bookmark:', id, destination);
    },
    closeTab: async (id: number) => {
        if (isExtension) return chrome.tabs.remove(id);
        console.log('Closed tab:', id);
    },
    activateTab: async (id: number) => {
        if (isExtension) return chrome.tabs.update(id, { active: true });
        console.log('Activated tab:', id);
    },
    moveTab: async (id: number, index: number) => {
        if (isExtension) return chrome.tabs.move(id, { index });
        console.log('Moved tab:', id, index);
    }
};
