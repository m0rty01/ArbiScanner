/**
 * Prediction Client for ArbiScanner Phase 6
 * Handles communication with the ML Prediction API.
 */

const PredictionClient = {
  /**
   * Fetches a price prediction from the ML API.
   * @param {Object} listing - The listing object.
   * @returns {Promise<Object|null>} - Predicted data or null on failure.
   */
  async getPrediction(listing) {
    const settings = await new Promise(resolve => {
      chrome.storage.local.get(['mlEnabled', 'mlApiEndpoint'], resolve);
    });

    if (!settings.mlEnabled || !settings.mlApiEndpoint) {
      return null;
    }

    try {
      const response = await fetch(settings.mlApiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: listing.title,
          description: listing.description || "",
          category: listing.category || "",
          location: listing.location || "",
          objects_detected: listing.objects_detected || []
        })

      });

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }

      const data = await response.json();
      return {
        predicted_price: data.predicted_price,
        confidence_score: data.confidence_score || null,
        model_version: data.model_version || "v1.0"
      };

    } catch (error) {
      console.error('Prediction API Error:', error);
      return null;
    }
  }
};
