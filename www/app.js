// app.js - MyExpiryTracker
// Put this file in the same folder as index.html (www/app.js)

// Make functions globally available by attaching to window
(function (window, document) {
  'use strict';

  // variables accessible across functions
  let db = null;
  const TABLE = 'items';

  // Utility: log wrapper
  function log(...args) { console.log('[MyExpiryTracker]', ...args); }

  // Fallback storage using localStorage when WebSQL isn't available
  const fallback = {
    key: 'myExpiry_items',
    read() {
      const raw = localStorage.getItem(this.key);
      return raw ? JSON.parse(raw) : [];
    },
    write(arr) {
      localStorage.setItem(this.key, JSON.stringify(arr));
    },
    insert(item) {
      const arr = this.read();
      item.id = (Date.now() + Math.floor(Math.random()*1000)).toString();
      arr.push(item);
      this.write(arr);
      return Promise.resolve(item.id);
    },
    all() {
      return Promise.resolve(this.read());
    },
    clear() {
      this.write([]);
      return Promise.resolve();
    }
  };

  // Initialize DB (WebSQL) or fallback
  function initDB() {
    if (window.openDatabase) {
      try {
        db = openDatabase('expiryDB', '1.0', 'MyExpiryTracker Database', 2 * 1024 * 1024);
        db.transaction(tx => {
          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS ${TABLE} (
              id TEXT PRIMARY KEY,
              category TEXT,
              item TEXT,
              date TEXT,
              cycle TEXT,
              price TEXT,
              notes TEXT,
              reminder TEXT
            )`
          );
        }, err => {
          log('Failed to create table:', err);
        }, () => {
          log('WebSQL DB ready');
        });
        return;
      } catch (e) {
        log('openDatabase error, using fallback:', e);
        db = null;
      }
    } else {
      log('openDatabase not available in this environment — will use localStorage fallback');
      db = null;
    }
  }

  // Insert item - returns Promise that resolves with insert id
  function insertItem(item) {
    if (db) {
      return new Promise((resolve, reject) => {
        db.transaction(tx => {
          const id = item.id || Date.now().toString();
          tx.executeSql(
            `INSERT OR REPLACE INTO ${TABLE} (id, category, item, date, cycle, price, notes, reminder) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, item.category, item.item, item.date, item.cycle, item.price, item.notes, item.reminder],
            (_, result) => resolve(id),
            (_, err) => { reject(err); return false; }
          );
        }, err => reject(err));
      });
    } else {
      return fallback.insert(item);
    }
  }

  // Get all items - returns Promise resolving to array
  function getAllItems() {
    if (db) {
      return new Promise((resolve, reject) => {
        db.transaction(tx => {
          tx.executeSql(`SELECT * FROM ${TABLE}`, [], (_, rs) => {
            const out = [];
            for (let i = 0; i < rs.rows.length; i++) out.push(rs.rows.item(i));
            resolve(out);
          }, (_, err) => { reject(err); return false; });
        }, err => reject(err));
      });
    } else {
      return fallback.all();
    }
  }

  // Delete all
  function clearAllItems() {
    if (db) {
      return new Promise((resolve, reject) => {
        db.transaction(tx => {
          tx.executeSql(`DELETE FROM ${TABLE}`, [], () => resolve(), (_, err) => { reject(err); return false; });
        }, err => reject(err));
      });
    } else {
      return fallback.clear();
    }
  }

  // Validate required fields
  function validateForm(category, itemName, date, reminder) {
    if (!category || !itemName || !date || !reminder) return false;
    return true;
  }

  // expose saveItem to global scope for onclick usage
  window.saveItem = function saveItem() {
    const category = (document.getElementById('category') || {}).value || '';
    const itemName = (document.getElementById('item') || {}).value || '';
    const date = (document.getElementById('date') || {}).value || '';
    const cycle = (document.getElementById('cycle') || {}).value || '';
    const price = (document.getElementById('price') || {}).value || '';
    const notes = (document.getElementById('notes') || {}).value || '';
    const reminder = (document.getElementById('reminder') || {}).value || '';
    const msg = document.getElementById('msg');

    if (!validateForm(category, itemName, date, reminder)) {
      if (msg) { msg.textContent = 'Please fill all required fields.'; }
      log('Validation failed');
      return;
    }

    const item = {
      id: Date.now().toString(),
      category, item: itemName, date, cycle, price, notes, reminder
    };

    insertItem(item)
      .then(id => {
        log('Saved id=', id);
        if (msg) {
          msg.textContent = 'Saved successfully!';
          setTimeout(()=> msg.textContent = '', 2500);
        }
        // clear form
        document.getElementById('item').value = '';
        document.getElementById('date').value = '';
        document.getElementById('price').value = '';
        document.getElementById('notes').value = '';
        document.getElementById('reminder').value = '';
      })
      .catch(err => {
        log('Save error', err);
        if (msg) msg.textContent = 'Error saving item.';
      });
  };

  // expose deleteAll
  window.deleteAll = function deleteAll() {
    const msg = document.getElementById('msg');
    if (!confirm('Delete ALL items? This cannot be undone.')) return;

    clearAllItems()
      .then(() => {
        log('All items deleted');
        if (msg) {
          msg.textContent = 'All items deleted.';
          setTimeout(()=> msg.textContent = '', 2500);
        }
      })
      .catch(err => {
        log('Delete all error', err);
        if (msg) msg.textContent = 'Error deleting items.';
      });
  };

  // expose viewAll - navigates to view.html and stores list in sessionStorage for simple transfer
  window.viewAll = function viewAll() {
    // not used if view.html reads DB itself - keep for compatibility
    window.location.href = 'view.html';
  };

  // on view page, populate list element
  window.populateViewList = function populateViewList() {
    const el = document.getElementById('list');
    if (!el) return;
    el.innerHTML = 'Loading...';
    getAllItems()
      .then(items => {
        if (!items || items.length === 0) {
          el.innerHTML = '<p>No items found.</p>';
          return;
        }
        const html = items.map(it => {
          return `<div style="margin-bottom:16px; border-bottom:1px solid #ddd; padding-bottom:8px;">
                    <strong>Category:</strong> ${escapeHtml(it.category)}<br>
                    <strong>Name:</strong> ${escapeHtml(it.item)}<br>
                    <strong>Expiry Date:</strong> ${escapeHtml(it.date)}<br>
                    <strong>Cycle:</strong> ${escapeHtml(it.cycle)}<br>
                    <strong>Price:</strong> ${escapeHtml(it.price)}<br>
                    <strong>Notes:</strong> ${escapeHtml(it.notes)}<br>
                    <strong>Reminder:</strong> ${escapeHtml(it.reminder)}<br>
                  </div>`;
        }).join('');
        el.innerHTML = html;
      })
      .catch(err => {
        log('populateViewList error', err);
        el.innerHTML = '<p>Error loading items.</p>';
      });
  };

  // small helper to escape HTML
  function escapeHtml(s) {
    if (!s) return '';
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  }

  // deviceready or DOMContentLoaded
  function onReady() {
    log('onReady called');
    initDB();
    // if view.html loaded, auto populate list
    if (document.getElementById('list')) {
      populateViewList();
    }
  }

  // Try Cordova deviceready first, fallback to DOMContentLoaded
  if (window.document) {
    document.addEventListener('deviceready', onReady, false);
    document.addEventListener('DOMContentLoaded', () => {
      // if Cordova isn't present, still initialise DB
      // small timeout to allow cordova.js to fire if it will
      setTimeout(() => {
        if (!window.cordova) onReady();
      }, 50);
    });
  }

})(window, document);
