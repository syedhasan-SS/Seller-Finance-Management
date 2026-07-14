// ============================================================================
// Fleek Winback — SendBird sender  ·  "Comms" tab
//
// Reads the "Comms" tab, composes a message per row from the columns below,
// and sends it to each customer (SendBird user_id = email) as the Fleek admin.
// Per customer: find-or-create channel ▸ add admin as operator ▸ unfreeze ▸
// send ▸ freeze (one-way; the customer can't reply).
//
//   A  email
//   B  first_name
//   C  discount_code
//   D  discount_value
//   E  product_1_url
//
// HOW TO USE: paste rows into the Comms tab, then click the "Send messages"
// button (assigned to sendComms) — or Run ▸ sendComms from the editor.
// ============================================================================

// ===== Configuration =====
const API_TOKEN = 'e1a895365a96ad7d77c8ab17c54df9bd7915dde8';
const BASE_URL = 'https://api-C95825E2-F797-434C-B723-18B6B6194CFA.sendbird.com/v3';
const SPREADSHEET_ID = '1ezbw-dchgB-gNsqdI-DL_aXZdhfZf2M5rHUnPz5fg5g'; // Sendbird Winback
const SHEET_NAME = 'Comms';
const ADMIN_USER_ID = '354872';            // sender + operator (Fleek Team)
const CHANNEL_NAME = 'Fleek Customer Support';
const CURRENCY = '£';
const SEND_DELAY_MS = 200;

// Column headers read from row 1 of the Comms tab.
const COL_EMAIL = 'email';
const COL_FIRST_NAME = 'first_name';
const COL_DISCOUNT_CODE = 'discount_code';
const COL_DISCOUNT_VALUE = 'discount_value';
const COL_URL = 'product_1_url';

// ===== Message template (EDIT HERE) =========================================
function composeMessage_(r) {
  return CURRENCY + r.discountValue + ' off is still waiting, your code is unused.\n\n' +
    'Hi ' + r.firstName + ', use ' + r.discountCode + ' on your next order. Take another look: ' + r.url;
}

// ===== Button entry point ===================================================
function sendComms() {
  const ui = SpreadsheetApp.getUi();
  let ctx;
  try { ctx = readComms_(); } catch (e) { ui.alert('Cannot send', e.message, ui.ButtonSet.OK); return; }
  const sheet = ctx.sheet, recipients = ctx.recipients;

  if (!recipients.length) { ui.alert('Nothing to send', 'No valid rows found on the "' + SHEET_NAME + '" tab.', ui.ButtonSet.OK); return; }

  const statusCol = getStatusCol_(sheet);
  const statuses = sheet.getRange(1, statusCol, sheet.getLastRow(), 1).getValues();
  const pending = recipients.filter(function (r) {
    return String(statuses[r.rowNum - 1][0] || '').indexOf('sent') !== 0;
  });

  const sample = composeMessage_(pending[0] || recipients[0]);
  const resp = ui.alert('Send Comms messages',
    'Tab: ' + SHEET_NAME + '\nReady to send to ' + pending.length + ' customer(s).' +
    '\n(' + (recipients.length - pending.length) + ' already sent are skipped.)\n\nFirst message preview:\n----\n' + sample + '\n----\n\nSend now?',
    ui.ButtonSet.OK_CANCEL);
  if (resp !== ui.Button.OK) return;

  let ok = 0, fail = 0;
  for (let i = 0; i < pending.length; i++) {
    const r = pending[i];
    try {
      deliverOne_(r.email, composeMessage_(r));
      sheet.getRange(r.rowNum, statusCol).setValue('sent ' + new Date().toISOString());
      ok++;
    } catch (e) {
      sheet.getRange(r.rowNum, statusCol).setValue('failed: ' + e.message);
      fail++;
    }
    SpreadsheetApp.flush();
    Utilities.sleep(SEND_DELAY_MS);
  }
  ui.alert('Done', 'Sent: ' + ok + '\nFailed: ' + fail, ui.ButtonSet.OK);
}

// ===== Sheet reading ========================================================
function readComms_() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error('Sheet "' + SHEET_NAME + '" not found.');
  const data = sheet.getDataRange().getValues();
  const header = data[0].map(function (h) { return String(h).trim().toLowerCase(); });

  const cEmail = header.indexOf(COL_EMAIL);
  const cFirst = header.indexOf(COL_FIRST_NAME);
  const cCode = header.indexOf(COL_DISCOUNT_CODE);
  const cValue = header.indexOf(COL_DISCOUNT_VALUE);
  const cUrl = header.indexOf(COL_URL);
  const missing = [];
  if (cEmail === -1) missing.push(COL_EMAIL);
  if (cFirst === -1) missing.push(COL_FIRST_NAME);
  if (cCode === -1) missing.push(COL_DISCOUNT_CODE);
  if (cValue === -1) missing.push(COL_DISCOUNT_VALUE);
  if (cUrl === -1) missing.push(COL_URL);
  if (missing.length) throw new Error('Missing column header(s) on "' + SHEET_NAME + '": ' + missing.join(', '));

  const emailRe = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  const recipients = [];
  const seen = {};
  for (let i = 1; i < data.length; i++) {
    const email = String(data[i][cEmail] || '').trim().toLowerCase();
    const url = String(data[i][cUrl] || '').trim();
    if (!email && !url) continue;            // blank row
    if (!emailRe.test(email)) continue;      // skip invalid email
    if (!url) continue;                      // need a product link
    if (seen[email]) continue;               // dedupe
    seen[email] = true;
    recipients.push({
      rowNum: i + 1,
      email: email,
      firstName: String(data[i][cFirst] || '').trim() || 'there',
      discountCode: String(data[i][cCode] || '').trim(),
      discountValue: String(data[i][cValue] || '').trim(),
      url: url
    });
  }
  return { sheet: sheet, recipients: recipients };
}

function getStatusCol_(sheet) {
  const lastCol = sheet.getLastColumn();
  const header = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  for (let i = 0; i < header.length; i++) {
    if (String(header[i]).trim() === 'Sent Status') return i + 1;
  }
  const col = lastCol + 1;
  sheet.getRange(1, col).setValue('Sent Status');
  return col;
}

// ===== Per-customer delivery ================================================
function deliverOne_(email, message) {
  ensureUser_(email);
  const channelUrl = findOrCreateChannel(email);
  if (!channelUrl) throw new Error('channel creation failed');
  unfreezeChannel(channelUrl);
  sendMessageToChannel(channelUrl, message, ADMIN_USER_ID);
  freezeChannel(channelUrl);
  return channelUrl;
}

// ===== SendBird helpers =====================================================
function ensureUser_(userId) {
  try {
    sbFetch_('post', BASE_URL + '/users', { user_id: userId, nickname: userId, profile_url: '' });
  } catch (e) {
    if (e.sbCode !== 400202) throw e; // 400202 = already exists
  }
}

function findOrCreateChannel(userId) {
  const res = sbFetch_('post', BASE_URL + '/group_channels', {
    name: CHANNEL_NAME,
    user_ids: [ADMIN_USER_ID, userId],
    is_distinct: true
  });
  if (!res.channel_url) { Logger.log('Channel create failed for ' + userId + ': ' + JSON.stringify(res)); return null; }
  addModeratorToChannel(res.channel_url, ADMIN_USER_ID);
  return res.channel_url;
}

function addModeratorToChannel(channelUrl, userId) {
  if (!channelUrl) return;
  try {
    sbFetch_('post', BASE_URL + '/group_channels/' + encodeURIComponent(channelUrl) + '/operators', { operator_ids: [userId] });
  } catch (e) {
    Logger.log('addModerator note (' + channelUrl + '): ' + e.message);
  }
}

function unfreezeChannel(channelUrl) {
  if (!channelUrl) return;
  sbFetch_('put', BASE_URL + '/group_channels/' + encodeURIComponent(channelUrl) + '/freeze', { freeze: false });
}

function sendMessageToChannel(channelUrl, message, senderId) {
  if (!channelUrl) return;
  sbFetch_('post', BASE_URL + '/group_channels/' + encodeURIComponent(channelUrl) + '/messages', {
    message_type: 'MESG',
    user_id: senderId,
    message: message
  });
}

function freezeChannel(channelUrl) {
  if (!channelUrl) return;
  sbFetch_('put', BASE_URL + '/group_channels/' + encodeURIComponent(channelUrl) + '/freeze', { freeze: true });
}

// Shared fetch with error handling + 429 backoff.
function sbFetch_(method, url, payload) {
  const options = {
    method: method,
    headers: { 'Api-Token': API_TOKEN, 'Content-Type': 'application/json; charset=utf8' },
    muteHttpExceptions: true
  };
  if (payload) options.payload = JSON.stringify(payload);
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = UrlFetchApp.fetch(url, options);
    const code = res.getResponseCode();
    if (code === 429) { Utilities.sleep(Math.pow(2, attempt) * 1000); continue; }
    const text = res.getContentText();
    let json = {};
    try { json = text ? JSON.parse(text) : {}; } catch (e) { json = { raw: text }; }
    if (code < 200 || code >= 300) {
      const err = new Error(String(method).toUpperCase() + ' ' + url + ' -> ' + code + ': ' + (json.message || text));
      err.sbCode = json.code;
      throw err;
    }
    return json;
  }
  throw new Error('Rate limited after retries: ' + url);
}
