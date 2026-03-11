/**
 * Data Exporter for ArbiScanner Phase 4
 * Handles exporting IndexedDB data to JSON or CSV.
 */

const DataExporter = {
  /**
   * Fetches all listings from IndexedDB.
   * @returns {Promise<Array>}
   */
  async getAllListings() {
    if (!DatabaseService.db) await DatabaseService.init();

    return new Promise((resolve, reject) => {
      const transaction = DatabaseService.db.transaction(['listings'], 'readonly');
      const store = transaction.objectStore('listings');
      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = () => resolve(getAllRequest.result);
      getAllRequest.onerror = (e) => reject(e);
    });
  },

  /**
   * Exports data as a downloadable file.
   * @param {string} content - The file content.
   * @param {string} fileName - The name of the file.
   * @param {string} contentType - The MIME type.
   */
  downloadFile(content, fileName, contentType) {
    const a = document.createElement('a');
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
  },

  /**
   * Exports all listings to JSON.
   */
  async exportToJSON() {
    const data = await this.getAllListings();
    const jsonStr = JSON.stringify(data, null, 2);
    this.downloadFile(jsonStr, 'marketplace_listings.json', 'application/json');
  },

  /**
   * Exports all listings to CSV.
   */
  async exportToCSV() {
    const data = await this.getAllListings();
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    for (const row of data) {
      const values = headers.map(header => {
        const val = row[header];
        const escaped = ('' + val).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }

    const csvStr = csvRows.join('\n');
    this.downloadFile(csvStr, 'marketplace_listings.csv', 'text/csv');
  }
};
