// options.js

// Saves options to chrome.storage
function saveOptions() {
  const searchUrls = document.getElementById('searchUrls').value.split('\n').filter(url => url.trim() !== '');
  const scanInterval = document.getElementById('scanInterval').value;
  const telegramToken = document.getElementById('telegramToken').value;
  const telegramChatId = document.getElementById('telegramChatId').value;
  const discordWebhook = document.getElementById('discordWebhook').value;
  const mlEnabled = document.getElementById('mlEnabled').checked;
  const mlApiEndpoint = document.getElementById('mlApiEndpoint').value;
  const imageApiEndpoint = document.getElementById('imageApiEndpoint').value;

  chrome.storage.local.set({
    searchUrls,
    scanInterval: parseInt(scanInterval) || 2,
    telegramToken,
    telegramChatId,
    discordWebhook,
    mlEnabled,
    mlApiEndpoint,
    imageApiEndpoint
  }, () => {


    // Update status to let user know options were saved.
    const status = document.getElementById('status');
    status.textContent = 'Settings saved!';
    status.className = 'status success';
    setTimeout(() => {
      status.textContent = '';
      status.className = 'status';
    }, 2000);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
async function restoreOptions() {
  chrome.storage.local.get({
    searchUrls: [],
    scanInterval: 2,
    telegramToken: '',
    telegramChatId: '',
    discordWebhook: '',
    mlEnabled: false,
    mlApiEndpoint: 'http://localhost:8000/predict',
    imageApiEndpoint: 'http://localhost:8001/detect_objects'
  }, (items) => {
    document.getElementById('searchUrls').value = items.searchUrls.join('\n');
    document.getElementById('scanInterval').value = items.scanInterval;
    document.getElementById('telegramToken').value = items.telegramToken;
    document.getElementById('telegramChatId').value = items.telegramChatId;
    document.getElementById('discordWebhook').value = items.discordWebhook;
    document.getElementById('mlEnabled').checked = items.mlEnabled;
    document.getElementById('mlApiEndpoint').value = items.mlApiEndpoint;
    document.getElementById('imageApiEndpoint').value = items.imageApiEndpoint;
  });



  // Use importScripts style check to ensure DatabaseService is available
  if (typeof DatabaseService !== 'undefined') {
    const count = await DatabaseService.getListingCount();
    document.getElementById('listingCount').textContent = count;
  }
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);

// Export Buttons
document.getElementById('exportJson')?.addEventListener('click', () => DataExporter.exportToJSON());
document.getElementById('exportCsv')?.addEventListener('click', () => DataExporter.exportToCSV());

