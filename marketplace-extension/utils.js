/**
 * Utility functions for ArbiScanner
 */

const Utils = {
  /**
   * Parses a price string into a numeric value.
   * Handles various currency symbols and formats.
   * @param {string} priceString - The raw price text (e.g., "$1,200", "CA$700", "Free")
   * @returns {number|null} - The numeric price or null if unparseable or Free.
   */
  parsePrice(priceString) {
    if (!priceString) return null;
    if (priceString.toLowerCase().includes('free')) return 0;

    // Sometimes Facebook shows both original and discounted price (e.g., "$500 $600")
    // We want to capture the first one (the current price)
    // Extract only the first group of digits/decimals
    const match = priceString.match(/[\d,.]+/);
    if (!match) return null;

    // Remove commas and parse
    const cleaned = match[0].replace(/,/g, '');
    const price = parseFloat(cleaned);

    return isNaN(price) ? null : price;
  },


  /**
   * Returns the current timestamp in ISO format.
   * @returns {string}
   */
  getTimestamp() {
    return new Date().toISOString();
  }
};

// Export for use in other scripts if needed (though injected scripts share global scope if not modules)
if (typeof module !== 'undefined') {
  module.exports = Utils;
}
