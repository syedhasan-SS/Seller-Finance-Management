// ============================================================================
// Fleek Winback — SendBird sender  ·  "Without Discount" tab
//
// Sends the pre-composed message in the `message_text` column to each customer
// as the Fleek admin (ADMIN_USER_ID), one channel per customer (user_id = email).
// Per customer: find-or-create channel ▸ add admin as operator ▸ unfreeze ▸
// send ▸ freeze (one-way; the customer can't reply).
//
// HOW TO USE (from the Apps Script editor):
//   1) Test one buyer: set TEST_EMAIL below, then Run ▸ sendTestToOneBuyer
//   2) Full send:      Run ▸ sendWinbackToAll   (skips rows already marked sent)
// ============================================================================

// ===== Configuration =====
const API_TOKEN = 'e1a895365a96ad7d77c8ab17c54df9bd7915dde8';
const BASE_URL = 'https://api-C95825E2-F797-434C-B723-18B6B6194CFA.sendbird.com/v3';
const SPREADSHEET_ID = '1ezbw-dchgB-gNsqdI-DL_aXZdhfZf2M5rHUnPz5fg5g'; // Sendbird Winback
const SHEET_NAME = 'Without Discount';
const ADMIN_USER_ID = '354872';            // sender + operator (Fleek Team)
const CHANNEL_NAME = 'Fleek Customer Support';
const EMAIL_HEADER = 'email';
const MESSAGE_HEADER = 'message_text';
const SEND_DELAY_MS = 200;

// >>> Put ONE buyer email here, then Run ▸ sendTestToOneBuyer <<<
const TEST_EMAIL = '';

// ===== Entry points =========================================================
function sendTestToOneBuyer() {
  if (!TEST_EMAIL) { Logger.log('Set TEST_EMAIL at the top of the script first.'); return; }
  const ctx = readRecipients_();
  const target = TEST_EMAIL.trim().toLowerCase();
  const r = ctx.recipients.find(function (x) { return x.email === target; });
  if (!r) { Logger.log('No row with a valid message_text found for ' + target); return; }
  Logger.log('Sending test to ' + r.email + ' ...');
  const channelUrl = deliverOne_(r.email, r.message);
  Logger.log('Test sent to ' + r.email + '  (channel ' + channelUrl + ')');
}

function sendWinbackToAll() {
  const ctx = readRecipients_();
  const sheet = ctx.sheet;
  const recipients = ctx.recipients;
  const statusCol = getStatusCol_(sheet);
  const statuses = sheet.getRange(1, statusCol, sheet.getLastRow(), 1).getValues();

  let ok = 0, fail = 0, skip = 0;
  for (let i = 0; i < recipients.length; i++) {
    const r = recipients[i];
    if (String(statuses[r.rowNum - 1][0] || '').indexOf('sent') === 0) { skip++; continue; }
    try {
      deliverOne_(r.email, r.message);
      sheet.getRange(r.rowNum, statusCol).setValue('sent ' + new Date().toISOString());
      ok++;
      Logger.log('sent ' + r.email);
    } catch (e) {
      sheet.getRange(r.rowNum, statusCol).setValue('failed: ' + e.message);
      fail++;
      Logger.log('FAILED ' + r.email + ': ' + e.message);
    }
    SpreadsheetApp.flush();
    Utilities.sleep(SEND_DELAY_MS);
  }
  Logger.log('Done. sent=' + ok + ' failed=' + fail + ' skipped=' + skip);
}

// ===== Sheet reading ========================================================
function readRecipients_() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error('Sheet "' + SHEET_NAME + '" not found.');
  const data = sheet.getDataRange().getValues();
  const header = data[0].map(function (h) { return String(h).trim().toLowerCase(); });
  const emailCol = header.indexOf(EMAIL_HEADER);
  const msgCol = header.indexOf(MESSAGE_HEADER);
  if (emailCol === -1 || msgCol === -1) {
    throw new Error('Missing "' + EMAIL_HEADER + '" or "' + MESSAGE_HEADER + '" header on "' + SHEET_NAME + '".');
  }
  const recipients = [];
  const seen = {};
  const emailRe = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  for (let i = 1; i < data.length; i++) {
    const email = String(data[i][emailCol] || '').trim().toLowerCase();
    const message = String(data[i][msgCol] || '').trim();
    if (!email && !message) continue;        // blank row
    if (!emailRe.test(email)) continue;      // skip invalid email
    if (!message) continue;                  // need a message
    if (seen[email]) continue;               // dedupe
    seen[email] = true;
    recipients.push({ rowNum: i + 1, email: email, message: message });
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
