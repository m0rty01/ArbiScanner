/**
 * Image Detection Client for ArbiScanner Phase 7
 * Handles communication with the YOLO-based Image Detection API.
 */

const ImageDetectionClient = {
  /**
   * Sends image URLs to the detection API and gets object labels.
   * @param {string[]} imageUrls - Array of image URLs to analyze.
   * @returns {Promise<string[]>} - Array of detected object labels.
   */
  async detectObjects(imageUrls) {
    if (!imageUrls || imageUrls.length === 0) return [];

    const settings = await new Promise(resolve => {
      chrome.storage.local.get(['imageApiEndpoint'], resolve);
    });

    const endpoint = settings.imageApiEndpoint || 'http://localhost:8001/detect_objects';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image_urls: imageUrls
        })
      });

      if (!response.ok) {
        throw new Error(`Detection API returned status ${response.status}`);
      }

      const data = await response.json();
      if (data.objects && Array.isArray(data.objects)) {
        return data.objects.map(obj => obj.label);
      }
      
      return [];
    } catch (error) {
      console.error('Image Detection API Error:', error);
      return [];
    }
  }
};
