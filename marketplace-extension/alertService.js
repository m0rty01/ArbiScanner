/**
 * Alert Service for ArbiScanner Phase 3
 * Handles sending notifications to Telegram and Discord.
 */

const AlertService = {
  /**
   * Sends a notification for a detected deal.
   * @param {Object} deal - The deal object.
   */
  async sendAlert(deal) {
    if (!deal) return;

    // Check storage for credentials
    const settings = await new Promise(resolve => {
      chrome.storage.local.get(['telegramToken', 'telegramChatId', 'discordWebhook', 'alertedUrls'], resolve);
    });

    const alertedUrls = new Set(settings.alertedUrls || []);
    if (alertedUrls.has(deal.url)) {
      console.log('Skipping alert for duplicate URL:', deal.url);
      return;
    }

    // Add to alerted URLs and save
    alertedUrls.add(deal.url);
    chrome.storage.local.set({ alertedUrls: Array.from(alertedUrls).slice(-500) }); // Keep last 500

    // Send to Telegram if configured
    if (settings.telegramToken && settings.telegramChatId) {
      this.sendToTelegram(deal, settings.telegramToken, settings.telegramChatId);
    }

    // Send to Discord if configured
    if (settings.discordWebhook) {
      this.sendToDiscord(deal, settings.discordWebhook);
    }
  },

  /**
   * Sends alert to Telegram bot.
   */
  async sendToTelegram(deal, token, chatId) {
    const text = `🔥 *Deal Detected* 🔥\n\n` +
      `*Item:* ${deal.title}\n` +
      `*Price:* $${deal.price}\n` +
      `*Est. Value:* $${deal.estimated_value}\n` +
      `*Profit:* $${deal.deal_margin}\n` +
      `*Category:* ${deal.category}\n` +
      `*Location:* ${deal.location}\n\n` +
      `[View Listing](${deal.url})`;

    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: 'Markdown'
        })
      });
      console.log('Telegram alert sent successfully.');
    } catch (e) {
      console.error('Failed to send Telegram alert:', e);
    }
  },

  /**
   * Sends alert to Discord webhook.
   */
  async sendToDiscord(deal, webhookUrl) {
    const payload = {
      content: "**🔥 Marketplace Deal Detected 🔥**",
      embeds: [{
        title: deal.title,
        color: 16711680, // Red/Green color codes could be used here
        url: deal.url,
        fields: [
          { name: "Price", value: `$${deal.price}`, inline: true },
          { name: "Est. Value", value: `$${deal.estimated_value}`, inline: true },
          { name: "Potential Profit", value: `$${deal.deal_margin}`, inline: true },
          { name: "Category", value: deal.category, inline: true },
          { name: "Location", value: deal.location, inline: true }
        ],
        timestamp: new Date().toISOString()
      }]
    };

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      console.log('Discord alert sent successfully.');
    } catch (e) {
      console.error('Failed to send Discord alert:', e);
    }
  }
};
