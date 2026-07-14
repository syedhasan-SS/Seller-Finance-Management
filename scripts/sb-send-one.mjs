#!/usr/bin/env node
// One-off SendBird test sender (mirrors FleekOutreach.gs deliverOne_):
//   create-or-get distinct channel [admin, recipient] named CHANNEL_NAME
//   ▸ unfreeze if already frozen ▸ send as admin ▸ freeze.
//
// Env required: SENDBIRD_APP_ID, SENDBIRD_API_TOKEN, SENDBIRD_ADMIN_ID, TEST_EMAIL, TEST_MESSAGE
// Env optional: SENDBIRD_BASE, CHANNEL_NAME

const appId = process.env.SENDBIRD_APP_ID;
const token = process.env.SENDBIRD_API_TOKEN;
const adminId = process.env.SENDBIRD_ADMIN_ID;
const base = process.env.SENDBIRD_BASE || `https://api-${appId}.sendbird.com`;
const email = (process.env.TEST_EMAIL || '').trim().toLowerCase();
const message = process.env.TEST_MESSAGE || '';
const channelName = process.env.CHANNEL_NAME || 'Fleek Customer Support';

for (const [k, v] of Object.entries({ SENDBIRD_APP_ID: appId, SENDBIRD_API_TOKEN: token, SENDBIRD_ADMIN_ID: adminId, TEST_EMAIL: email, TEST_MESSAGE: message })) {
  if (!v) { console.error(`Missing env: ${k}`); process.exit(1); }
}

async function api(method, ep, body) {
  const res = await fetch(base + ep, {
    method,
    headers: { 'Api-Token': token, 'Content-Type': 'application/json; charset=utf8' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json; try { json = text ? JSON.parse(text) : {}; } catch { json = { raw: text }; }
  if (!res.ok) { const e = new Error(`${method} ${ep} -> ${res.status}: ${json.message || text}`); e.code = json.code; throw e; }
  return json;
}

async function ensureUser(uid) {
  try { await api('POST', '/v3/users', { user_id: uid, nickname: uid, profile_url: '' }); }
  catch (e) { if (e.code !== 400202) throw e; } // 400202 = already exists
}

async function main() {
  await ensureUser(email);
  const ch = await api('POST', '/v3/group_channels', { user_ids: [adminId, email], is_distinct: true, name: channelName });
  console.log(`channel: ${ch.channel_url} (frozen=${ch.freeze})`);
  if (ch.freeze) { await api('PUT', `/v3/group_channels/${encodeURIComponent(ch.channel_url)}/freeze`, { freeze: false }); console.log('unfroze existing channel'); }
  const msg = await api('POST', `/v3/group_channels/${encodeURIComponent(ch.channel_url)}/messages`, { message_type: 'MESG', user_id: adminId, message });
  console.log(`sent message_id=${msg.message_id}`);
  await api('PUT', `/v3/group_channels/${encodeURIComponent(ch.channel_url)}/freeze`, { freeze: true });
  console.log('froze channel — done');
}

main().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
