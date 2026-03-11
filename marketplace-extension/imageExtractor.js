/**
 * Image Extractor for ArbiScanner Phase 7
 * Extracts image URLs from listing cards.
 */

const ImageExtractor = {
  /**
   * Extracts the primary image URL from a listing card.
   * In a real implementation we might scrape the gallery via the URL,
   * but for the feed, we extract the visible thumbnail (which is high-res enough).
   * @param {Element} card 
   * @returns {string[]} - Array of image URLs.
   */
  extract(card) {
    if (!card) return [];
    
    const imageEl = card.querySelector('img');
    if (imageEl && imageEl.src) {
      // Return as an array to support multiple images in the future
      return [imageEl.src];
    }
    
    return [];
  }
};
