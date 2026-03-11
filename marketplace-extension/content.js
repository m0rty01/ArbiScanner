/**
 * Content Script for ArbiScanner
 * Handles listing extraction and DOM monitoring.
 */

// Set to keep track of processed listing URLs to avoid duplicates
const processedUrls = new Set();

/**
 * Extracts data from a listing card element.
 * @param {Element} card - The listing card DOM element.
 * @returns {Object|null} - The extracted listing object or null if extraction fails essential fields.
 */
async function extractListing(card) {

  try {
    // 1. URL - The card itself is the <a> tag
    const urlAttr = card.getAttribute('href');
    if (!urlAttr) return null;
    
    // Normalize URL (relative to absolute)
    const url = urlAttr.startsWith('http') ? urlAttr : `https://www.facebook.com${urlAttr.split('?')[0]}`;

    // Skip if already processed
    if (processedUrls.has(url)) return null;

    // 2. Title - Search for the span with line-clamp style
    const titleEl = card.querySelector('span[style*="-webkit-line-clamp: 2"]');
    const title = titleEl ? titleEl.innerText.trim() : null;

    // 3. Price - Usually the first span in the info area
    // We look for a span that contains a digit or "Free"
    const priceEl = Array.from(card.querySelectorAll('span')).find(el => 
      /\d/.test(el.innerText) || el.innerText.toLowerCase().includes('free')
    );
    const priceText = priceEl ? priceEl.innerText.trim() : null;
    const price = Utils.parsePrice(priceText);

    // 4. Image URL
    const imageEl = card.querySelector('img');
    const image_url = imageEl ? imageEl.src : null;

    // 5. Location - Usually the last span in the info area
    const spans = Array.from(card.querySelectorAll('span'));
    const locationEl = spans.length > 0 ? spans[spans.length - 1] : null;
    const location = locationEl ? locationEl.innerText.trim() : null;

    // Build the object
    const listing = {
      title,
      price,
      url,
      image_url,
      location,
      timestamp: Utils.getTimestamp(),
      source: "facebook_marketplace",
      cardElement: card
    };


    // Phase 4: Send all listings to background for storage
    chrome.runtime.sendMessage({ type: 'NEW_LISTING', listing: listing });

    // Phase 2: Deal Detection
    const deal = await DealDetector.analyze(listing);
    if (deal) {

      console.log('Deal Detected:', deal);
      UIHighlighter.highlight(card, deal);
      
      // Phase 3: Send to Background for Alerts
      chrome.runtime.sendMessage({ type: 'DEAL_DETECTED', deal: deal });
    }



    // Mark as processed
    processedUrls.add(url);

    return listing;

  } catch (error) {
    console.error('Error extracting listing:', error);
    return null;
  }
}

/**
 * Scans the page for all currently visible listings.
 */
function scanExistingListings() {
  const cards = document.querySelectorAll('a[href^="/marketplace/item/"]');
  console.log(`Scanning ${cards.length} existing listings...`);
  
  cards.forEach(card => {
    const listing = extractListing(card);
    if (listing) {
      console.log('Detected Listing:', listing);
    }
  });
}

/**
 * Initializes a MutationObserver to watch for new listing items being added to the DOM.
 */
function initObserver() {
  const containerSelector = 'div.x9f619.x1n2onr6.x1ja2u2z';
  const targetNode = document.querySelector(containerSelector) || document.body;

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // Check if the added node is a listing card or contains one
          const cards = node.querySelectorAll ? node.querySelectorAll('a[href^="/marketplace/item/"]') : [];
          
          // Also check if the node itself is a card
          if (node.tagName === 'A' && node.getAttribute('href')?.startsWith('/marketplace/item/')) {
            const listing = extractListing(node);
            if (listing) console.log('New Listing Detected (Self):', listing);
          }

          cards.forEach(card => {
            const listing = extractListing(card);
            if (listing) {
              console.log('New Listing Detected (Child):', listing);
            }
          });
        }
      });
    });
  });

  const config = { childList: true, subtree: true };
  observer.observe(targetNode, config);
  console.log('ArbiScanner: MutationObserver active.');
}

// Start the scanner
window.addEventListener('load', () => {
  // Wait a bit for FB's dynamic content to settle
  setTimeout(() => {
    scanExistingListings();
    initObserver();
  }, 2000);
});
