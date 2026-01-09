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
    getTree: async (): Promise<chrome.bookmarks.BookmarkTreeNode[]> => {
        if (isExtension) return new Promise((resolve) => chrome.bookmarks.getTree(resolve));
        return [{ id: 'root', title: 'root', children: mockBookmarks }] as unknown as chrome.bookmarks.BookmarkTreeNode[];
    },
    getTabs: async (): Promise<chrome.tabs.Tab[]> => {
        if (isExtension) return new Promise((resolve) => chrome.tabs.query({}, resolve));
        return mockTabs as unknown as chrome.tabs.Tab[];
    },
    getTopSites: async (): Promise<chrome.topSites.MostVisitedURL[]> => {
        if (isExtension && chrome.topSites) return new Promise((resolve) => chrome.topSites.get(resolve));
        return mockTopSites as unknown as chrome.topSites.MostVisitedURL[];
    },
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
    saveMetadata: async (metadata: any) => {
        if (isExtension) {
            return chrome.storage.local.set({ bookmarkMetadata: metadata });
        }
        console.log('Saved metadata:', metadata);
    },
    createBookmark: async (data: any): Promise<chrome.bookmarks.BookmarkTreeNode> => {
        if (isExtension) return chrome.bookmarks.create(data);
        console.log('Created bookmark:', data);
        return { id: Math.random().toString(), ...data } as chrome.bookmarks.BookmarkTreeNode;
    },
    updateBookmark: async (id: string, data: any) => {
        if (isExtension) return chrome.bookmarks.update(id, data);
        console.log('Updated bookmark:', id, data);
    },
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
    }
};
