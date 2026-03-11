/**
 * Deal Detector for ArbiScanner Phase 2
 * Analyzes listings for potential deals based on keywords and price.
 */

const DealDetector = {
  /**
   * Analyzes a listing object to determine if it's a "deal".
   * @param {Object} listing - The listing object from extraction.
   * @returns {Promise<Object|null>} - Deal analysis result or null if no match found.
   */
  async analyze(listing) {
    if (!listing || !listing.title || listing.price === null) return null;

    // Phase 5: ML Prediction
    const settings = await new Promise(resolve => {
      chrome.storage.local.get(['mlEnabled', 'mlApiEndpoint', 'imageApiEndpoint'], resolve);
    });

    if (settings.mlEnabled && settings.mlApiEndpoint) {
      // Phase 7: Extract Images and Detect Objects
      listing.objects_detected = [];
      try {
        if (listing.cardElement) { // Assume the content script attaches the DOM element
          const imageUrls = ImageExtractor.extract(listing.cardElement);
          if (imageUrls.length > 0) {
            listing.objects_detected = await ImageDetectionClient.detectObjects(imageUrls);
          }
        }
      } catch (err) {
        console.warn('Image detection err:', err);
      }

      try {
        const data = await PredictionClient.getPrediction(listing);
        
        if (data) {
          const predictedPrice = data.predicted_price;
          const margin = predictedPrice - listing.price;


          // Use the same DEAL_THRESHOLD
          if (margin >= 150) { // Threshold could be made dynamic
            return {
              ...listing,
              estimated_value: predictedPrice,
              deal_margin: margin,
              matched_keyword: 'ML Prediction',
              category: 'ML Valuation',
              model_version: data.model_version,
              objects_detected: listing.objects_detected,
              historical_pricing: data.historical_pricing
            };

          }
          return null; // ML says no deal
        }
      } catch (e) {
        console.warn('ML Prediction failed, falling back to keywords:', e);
      }
    }


    // Phase 2 Fallback: Rule-Based Logic
    const normalizedTitle = this.normalize(listing.title);
    
    // Find the best keyword match (highest value)
    let bestMatch = null;

    for (const item of KEYWORD_DICTIONARY) {
      if (normalizedTitle.includes(item.keyword.toLowerCase())) {
        if (!bestMatch || item.average_resale_value > bestMatch.average_resale_value) {
          bestMatch = item;
        }
      }
    }

    if (bestMatch) {
      const deal_margin = bestMatch.average_resale_value - listing.price;
      const is_deal = deal_margin >= 150;

      if (listing.price < (bestMatch.minimum_expected_price || 0)) {
        return null; 
      }

      if (is_deal) {
        return {
          ...listing,
          estimated_value: bestMatch.average_resale_value,
          deal_margin: deal_margin,
          matched_keyword: bestMatch.keyword,
          category: bestMatch.category
        };
      }
    }

    return null;
  },


  /**
   * Normalizes text for matching.
   * @param {string} text 
   * @returns {string}
   */
  normalize(text) {
    return text.toLowerCase().replace(/[^\w\s]/gi, '');
  }
};
