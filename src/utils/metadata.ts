/**
 * encodeMetaToUrl
 * Embeds custom metadata (description, deadline, type) into the bookmark URL's hash.
 * This ensures that metadata is synced across devices because Chrome syncs bookmark URLs.
 * @param url The base URL
 * @param meta The metadata object to encode
 */
export const encodeMetaToUrl = (url: string, meta: any) => {
  try {
    const cleanUrl = url || "about:blank";
    const [base, hash] = cleanUrl.split("#");
    const hashParams = new URLSearchParams(hash || "");
    const metaStr = JSON.stringify(meta);
    const encoded = btoa(encodeURIComponent(metaStr)); // Base64 encode for URL safety
    hashParams.set("tsmeta", encoded);
    return `${base}#${hashParams.toString()}`;
  } catch (e) {
    return url;
  }
};

/**
 * decodeMetaFromUrl
 * Extracts metadata from a bookmark URL that was previously encoded.
 * @param url The bookmark URL
 */
export const decodeMetaFromUrl = (url: string) => {
  try {
    if (!url || !url.includes("#")) return {};
    const hash = url.split("#")[1];
    if (!hash) return {};
    const params = new URLSearchParams(hash);
    const encoded = params.get("tsmeta");
    if (!encoded) return {};
    const decoded = decodeURIComponent(atob(encoded));
    return JSON.parse(decoded);
  } catch (e) {
    return {};
  }
};

/**
 * getCleanUrlFromUrl
 * Removes TabStack internal metadata from the URL for display in edit fields.
 * @param url The bookmark URL
 */
export const getCleanUrlFromUrl = (url: string | undefined): string => {
  try {
    if (!url) return "";
    if (!url.includes("#")) return url;
    const [base, hash] = url.split("#");
    const params = new URLSearchParams(hash || "");
    params.delete("tsmeta");
    const newHash = params.toString();
    return newHash ? `${base}#${newHash}` : (base || "");
  } catch (e) {
    return url || "";
  }
};

/**
 * enrichItem
 * Combines a base bookmark node with metadata from URL hashes and sync storage.
 * URL hashes are treated as the primary source of truth for better cross-device sync.
 */
export const enrichItem = (node: any, metadata: Record<string, any> = {}): any => {
  if (!node) return null;
  const urlMeta = decodeMetaFromUrl(node.url);
  const syncMeta = metadata[node.id] || {};
  return {
    ...node,
    ...syncMeta,
    ...urlMeta, // URL hash takes priority for sync
  };
};
