/**
 * Database Service for ArbiScanner Phase 4
 * Handles storage of Marketplace listings in IndexedDB.
 */

const DatabaseService = {
  dbName: 'MarketplaceScannerDB',
  dbVersion: 1,
  db: null,

  /**
   * Initializes the IndexedDB database.
   */
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = (event) => {
        console.error('Database error:', event.target.error);
        reject(event.target.error);
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        console.log('IndexedDB initialized.');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('listings')) {
          const objectStore = db.createObjectStore('listings', { keyPath: 'listing_id' });
          objectStore.createIndex('price', 'price', { unique: false });
          objectStore.createIndex('first_seen', 'first_seen', { unique: false });
          objectStore.createIndex('last_seen', 'last_seen', { unique: false });
          objectStore.createIndex('matched_keywords', 'matched_keywords', { unique: false, multiEntry: true });
          objectStore.createIndex('category', 'category', { unique: false });
          console.log('Object store and indexes created.');
        }
      };
    });
  },

  /**
   * Extracts listing_id from Marketplace URL.
   * @param {string} url 
   * @returns {string|null}
   */
  extractListingId(url) {
    if (!url) return null;
    const match = url.match(/\/item\/(\d+)/);
    return match ? match[1] : null;
  },

  /**
   * Inserts or updates a listing in the database.
   * @param {Object} listing 
   */
  async upsertListing(listing) {
    if (!this.db) await this.init();

    const listing_id = this.extractListingId(listing.url);
    if (!listing_id) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['listings'], 'readwrite');
      const store = transaction.objectStore(transaction.objectStoreNames[0]);
      const getRequest = store.get(listing_id);

      getRequest.onsuccess = () => {
        const existingListing = getRequest.result;
        const now = new Date().toISOString();

        if (existingListing) {
          // Update existing record
          const updatedListing = {
            ...existingListing,
            title: listing.title,
            price: listing.price,
            image_url: listing.image_url,
            location: listing.location,
            last_seen: now,
            matched_keywords: listing.matched_keywords || existingListing.matched_keywords || [],
            estimated_value: listing.estimated_value || existingListing.estimated_value,
            deal_margin: listing.deal_margin || existingListing.deal_margin
          };
          store.put(updatedListing);
        } else {
          // Insert new record
          const newListing = {
            listing_id,
            ...listing,
            first_seen: now,
            last_seen: now,
            matched_keywords: listing.matched_keywords || [],
            source: "facebook_marketplace"
          };
          store.add(newListing);
        }
      };

      transaction.oncomplete = () => resolve();
      transaction.onerror = (e) => reject(e);
    });
  },

  /**
   * Gets total count of listings.
   */
  async getListingCount() {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['listings'], 'readonly');
      const store = transaction.objectStore('listings');
      const countRequest = store.count();
      countRequest.onsuccess = () => resolve(countRequest.result);
      countRequest.onerror = (e) => reject(e);
    });
  }
};
