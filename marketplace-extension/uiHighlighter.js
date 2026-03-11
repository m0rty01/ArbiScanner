/**
 * UI Highlighter for ArbiScanner Phase 2
 * Adds visual indicators to listing cards identified as deals.
 */

const UIHighlighter = {
  /**
   * Highlights a listing card element and adds a deal badge.
   * @param {Element} card - The listing card DOM element.
   * @param {Object} deal - The deal analysis result.
   */
  highlight(card, deal) {
    if (!card || !deal) return;

    // Apply visual highlight to the card
    card.style.border = '4px solid #4ade80'; // Bright green border
    card.style.borderRadius = '8px';
    card.style.position = 'relative';
    card.style.backgroundColor = 'rgba(74, 222, 128, 0.1)'; // Light green tint
    card.style.transition = 'all 0.3s ease';

    // Add "DEAL DETECTED" badge if not already present
    if (!card.querySelector('.arbi-scanner-badge')) {
      const badge = document.createElement('div');
      badge.className = 'arbi-scanner-badge';
      
      const isML = deal.category === 'ML Valuation';
      badge.innerText = isML ? 'ML DEAL DETECTED' : 'DEAL DETECTED';
      
      badge.style.position = 'absolute';
      badge.style.top = '10px';
      badge.style.right = '10px';
      badge.style.backgroundColor = isML ? '#8b5cf6' : '#16a34a'; // Purple for ML

      badge.style.color = 'white';
      badge.style.padding = '4px 8px';
      badge.style.borderRadius = '4px';
      badge.style.fontWeight = 'bold';
      badge.style.fontSize = '12px';
      badge.style.zIndex = '100';
      badge.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
      
      card.appendChild(badge);

      // Add tooltip style info
      const info = document.createElement('div');
      info.className = 'arbi-scanner-info';
      info.innerHTML = `
        <div style="font-size: 11px; margin-top: 4px; color: ${deal.category === 'ML Valuation' ? '#8b5cf6' : '#16a34a'}; font-weight: bold;">
          Est. Value: $${deal.estimated_value}<br>
          Pot. Profit: $${deal.deal_margin}
          ${deal.objects_detected && deal.objects_detected.length > 0 ? `<br><span style="font-size: 9px; color: #d97706;">Detected: ${deal.objects_detected.join(', ')}</span>` : ''}
          ${deal.historical_pricing && deal.historical_pricing.historical_avg_price ? `<br><span style="font-size: 9px; color: #2563eb;">eBay Avg: $${deal.historical_pricing.historical_avg_price} (${deal.historical_pricing.recent_price_trend})</span>` : ''}
          ${deal.model_version ? `<br><span style="font-size: 9px; opacity: 0.8;">Model: ${deal.model_version}</span>` : ''}
        </div>

      `;
      // Find a good place to insert info, maybe after the title or at the bottom
      const infoContainer = card.querySelector('div[style*="display: flex"][style*="flex-direction: column"]');
      if (infoContainer) {
        infoContainer.appendChild(info);
      }
    }
  }
};
