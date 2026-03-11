/**
 * Search Automation for ArbiScanner Phase 3
 * Manages rotation between different Marketplace search URLs.
 */

const SearchAutomation = {
  /**
   * Gets the next URL in the rotation.
   * @returns {Promise<string|null>}
   */
  async getNextUrl() {
    return new Promise(resolve => {
      chrome.storage.local.get(['searchUrls', 'lastSearchIndex'], (items) => {
        const urls = items.searchUrls || [];
        if (urls.length === 0) return resolve(null);

        let nextIndex = (items.lastSearchIndex !== undefined) ? (items.lastSearchIndex + 1) : 0;
        if (nextIndex >= urls.length) nextIndex = 0;

        chrome.storage.local.set({ lastSearchIndex: nextIndex });
        resolve(urls[nextIndex]);
      });
    });
  },

  /**
   * Starts the automation cycle.
   */
  async start() {
    console.log('Search Automation started.');
    this.runCycle();
  },

  /**
   * Performs one cycle of rotation.
   */
  async runCycle() {
    const nextUrl = await this.getNextUrl();
    if (!nextUrl) {
      console.log('No search URLs configured. Waiting...');
      return;
    }

    console.log('Moving to next search:', nextUrl);
    
    // Find the marketplace tab or create one
    chrome.tabs.query({ url: "*://*.facebook.com/marketplace/*" }, (tabs) => {
      if (tabs.length > 0) {
        chrome.tabs.update(tabs[0].id, { url: nextUrl, active: true });
      } else {
        chrome.tabs.create({ url: nextUrl, active: true });
      }
    });
  }
};
