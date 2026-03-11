/**
 * Background script for ArbiScanner Phase 3
 * Coordinates automation, alarms, and alert delivery.
 */

importScripts('utils.js', 'keywordDictionary.js', 'dealDetector.js', 'alertService.js', 'searchAutomation.js', 'databaseService.js', 'dataExporter.js');



chrome.runtime.onInstalled.addListener(() => {
  console.log('ArbiScanner Phase 3 installed.');
  
  // Set up the alarm for search rotation
  chrome.storage.local.get(['scanInterval'], (items) => {
    const interval = items.scanInterval || 2;
    chrome.alarms.create('rotateSearch', { periodInMinutes: interval });
    console.log(`Initial alarm set for every ${interval} minutes.`);
  });
});

// Watch for changes in scan interval to update alarm
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.scanInterval) {
    const newInterval = changes.scanInterval.newValue || 2;
    chrome.alarms.clear('rotateSearch', () => {
      chrome.alarms.create('rotateSearch', { periodInMinutes: newInterval });
      console.log(`Alarm updated to every ${newInterval} minutes.`);
    });
  }
});

/**
 * Handle alarm triggers
 */
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'rotateSearch') {
    console.log('Alarm triggered: Rotating Marketplace search.');
    SearchAutomation.start();
  }
});

/**
 * Listen for messages from content scripts
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'NEW_LISTING' || message.type === 'DEAL_DETECTED') {
    // Phase 4: Store in Database
    DatabaseService.upsertListing(message.listing || message.deal);
  }

  if (message.type === 'DEAL_DETECTED') {
    console.log('Deal Message Received from Content Script:', message.deal.title);
    
    // Trigger the Alert Service
    AlertService.sendAlert(message.deal);


    // Optional: Show a browser notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon.png', // Place a placeholder icon if needed, or omit
      title: 'Deal Detected!',
      message: `${message.deal.title} - $${message.deal.price} (Profit: $${message.deal.deal_margin})`,
      priority: 2
    });
  }
});
