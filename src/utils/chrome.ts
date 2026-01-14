// Standard check for extension environment
export const isExtension = typeof chrome !== 'undefined' && typeof chrome.runtime !== 'undefined' && !!chrome.runtime.id;

console.log('TabStack Environment:', isExtension ? 'Extension' : 'Web/Dev');

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
        if (isExtension && chrome.topSites) {
            return new Promise((resolve) => chrome.topSites.get((sites) => {
                console.log('Top Sites fetched:', sites?.length);
                resolve(sites);
            }));
        }
        console.log('Using mock top sites');
        return mockTopSites as unknown as chrome.topSites.MostVisitedURL[];
    },
    /**
     * Fetches recent browsing history from the Chrome API.
     * If not in an extension environment, returns empty history.
     * @returns {Promise<chrome.history.HistoryItem[]>} A promise that resolves with an array of history items.
     */
    getHistory: async (maxResults: number = 20): Promise<chrome.history.HistoryItem[]> => {
        if (isExtension && chrome.history) {
            return new Promise((resolve) => {
                chrome.history.search({ text: '', maxResults }, (results) => {
                    if (chrome.runtime.lastError) {
                        console.error('History fetch error:', chrome.runtime.lastError);
                        resolve([]);
                        return;
                    }
                    console.log('History fetched count:', results?.length);
                    resolve(results || []);
                });
            });
        }
        return [
            { id: 'h1', title: 'GitHub', url: 'https://github.com' },
            { id: 'h2', title: 'Google', url: 'https://google.com' },
            { id: 'h3', title: 'YouTube', url: 'https://youtube.com' }
        ] as chrome.history.HistoryItem[];
    },
    /**
     * Fetches custom bookmark metadata from Chrome's local storage.
     * We use local storage for performance and size, relying on URL hashes for cross-device sync.
     * @returns {Promise<Record<string, any>>} A promise that resolves with the bookmark metadata.
     */
    getMetadata: async (): Promise<Record<string, any>> => {
        if (isExtension) {
            return new Promise((resolve) => {
                chrome.storage.local.get(['bookmarkMetadata'], (result) => {
                    resolve(result.bookmarkMetadata || {});
                });
            });
        }
        return {}; // Mock metadata
    },
    /**
     * Saves custom bookmark metadata to Chrome's local storage.
     * Reliance on sync storage for metadata often hits quota limits. 
     * URL hash encoding is our primary cross-device sync mechanism.
     * @param {any} metadata The metadata object to save.
     * @returns {Promise<void>} A promise that resolves when the metadata is saved.
     */
    saveMetadata: async (metadata: any) => {
        if (isExtension) {
            return chrome.storage.local.set({ bookmarkMetadata: metadata });
        }
        console.log('Saved metadata:', metadata);
    },
    /**
     * Helper to resolve local image placeholders in settings.
     */
    resolveLocalSettings: async (settings: any) => {
        if (!settings || settings.backgroundImage !== 'LOCAL_UPLOAD') return settings;
        return new Promise((resolve) => {
            chrome.storage.local.get(['localBackgroundImage'], (localResult) => {
                if (localResult.localBackgroundImage) {
                    resolve({ ...settings, backgroundImage: localResult.localBackgroundImage });
                } else {
                    // If LOCAL_UPLOAD is present but image is missing (e.g. on another device),
                    // we keep the placeholder so it can be resolved if they upload a new one,
                    // but the UI should handle the missing source.
                    console.warn('TabStack: Local image missing on this device.');
                    resolve(settings);
                }
            });
        });
    },
    /**
     * Fetches extension settings from Chrome storage.
     * Uses sync storage for general settings and local storage for large assets like background images.
     */
    getSettings: async (defaultSettings: any): Promise<any> => {
        if (isExtension) {
            return new Promise((resolve) => {
                chrome.storage.sync.get(['appSettings'], async (syncResult) => {
                    const settings = syncResult.appSettings || defaultSettings;
                    const resolved = await chromeApi.resolveLocalSettings(settings);
                    console.log('TabStack: Loaded settings (Resolved LOCAL_UPLOAD if present)');
                    resolve(resolved);
                });
            });
        }
        const stored = localStorage.getItem('tabstack-settings');
        const settings = stored ? JSON.parse(stored) : defaultSettings;
        console.log('TabStack: Loaded settings from localStorage');
        return settings;
    },
    /**
     * Saves extension settings.
     * Large background images (Data URLs) are saved to local storage.
     * General settings and remote URLs are saved to sync storage.
     */
    saveSettings: async (settings: any) => {
        if (isExtension) {
            try {
                const { backgroundImage, ...syncSettings } = settings;
                
                // If the image is a data URL (local upload), store it locally
                if (backgroundImage && backgroundImage.startsWith('data:')) {
                    await chrome.storage.local.set({ localBackgroundImage: backgroundImage });
                    await chrome.storage.sync.set({ 
                        appSettings: { ...syncSettings, backgroundImage: 'LOCAL_UPLOAD' } 
                    });
                    console.log('TabStack: Saved local image and synced settings');
                    return;
                } 
                
                // If it's the 'LOCAL_UPLOAD' placeholder, just save other settings to sync
                if (backgroundImage === 'LOCAL_UPLOAD') {
                    await chrome.storage.sync.set({ 
                        appSettings: { ...syncSettings, backgroundImage: 'LOCAL_UPLOAD' } 
                    });
                    return;
                }

                // If it's a remote URL or empty, remove local override and save normally
                await chrome.storage.local.remove('localBackgroundImage');
                await chrome.storage.sync.set({ 
                    appSettings: { ...syncSettings, backgroundImage } 
                });
                console.log('TabStack: Saved settings with remote/no image');
            } catch (err) {
                console.error('TabStack: Settings save failed', err);
            }
        } else {
            localStorage.setItem('tabstack-settings', JSON.stringify(settings));
            console.log('TabStack: Saved settings to localStorage (Dev Mode)');
        }
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
