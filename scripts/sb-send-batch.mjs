#!/usr/bin/env node
// Batch SendBird sender for the "With discount" winback.
// Reads a CSV export (email + message_text columns, located by header) and a
// targets file (one email per line). For each target found in the CSV it sends
// that row's message_text VERBATIM as the Fleek admin, with the workflow:
//   ensureUser ▸ find-or-create channel ▸ add admin operator ▸ unfreeze ▸ send ▸ freeze.
//
// SAFETY: dry-run by default. Pass --send to actually deliver.
//
// Env: SENDBIRD_APP_ID, SENDBIRD_API_TOKEN, SENDBIRD_ADMIN_ID, [CHANNEL_NAME], [SENDBIRD_BASE]
// Args: --csv <path> --targets <path> [--send]

import fs from 'node:fs';

function arg(name, def) { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : def; }
const csvPath = arg('--csv');
const targetsPath = arg('--targets');
const doSend = process.argv.includes('--send');

const appId = process.env.SENDBIRD_APP_ID;
const token = process.env.SENDBIRD_API_TOKEN;
const adminId = process.env.SENDBIRD_ADMIN_ID;
const base = process.env.SENDBIRD_BASE || `https://api-${appId}.sendbird.com/v3`;
const channelName = process.env.CHANNEL_NAME || 'Fleek Customer Support';

function parseCsv(text) {
  const rows = []; let row = [], f = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else if (c === '"') q = true;
    else if (c === ',') { row.push(f); f = ''; }
    else if (c === '\r') { /* skip */ }
    else if (c === '\n') { row.push(f); rows.push(row); row = []; f = ''; }
    else f += c;
  }
  if (f.length || row.length) { row.push(f); rows.push(row); }
  return rows;
}

const csv = parseCsv(fs.readFileSync(csvPath, 'utf8'));
const header = csv[0].map(h => h.trim().toLowerCase());
const eCol = header.indexOf('email');
const mCol = header.indexOf('message_text');
if (eCol < 0 || mCol < 0) { console.error('CSV missing email/message_text header'); process.exit(1); }

const map = {};
for (let i = 1; i < csv.length; i++) {
  const e = (csv[i][eCol] || '').trim().toLowerCase();
  const m = (csv[i][mCol] || '').trim();
  if (e) map[e] = m;
}

const targets = fs.readFileSync(targetsPath, 'utf8').split(/\r?\n/).map(s => s.trim().toLowerCase()).filter(Boolean);
const matched = [], notFound = [], blankMsg = [];
const seen = new Set();
for (const t of targets) {
  if (seen.has(t)) continue;
  seen.add(t);
  if (!(t in map)) notFound.push(t);
  else if (!map[t]) blankMsg.push(t);
  else matched.push({ email: t, message: map[t] });
}

console.log(`targets=${targets.length} unique=${seen.size} matched=${matched.length} notFound=${notFound.length} blankMsg=${blankMsg.length}`);
if (notFound.length) console.log('\nNOT FOUND in With discount tab:\n  ' + notFound.join('\n  '));
if (blankMsg.length) console.log('\nBLANK message_text:\n  ' + blankMsg.join('\n  '));
if (matched.length) console.log('\nSAMPLE (first matched):\nTO: ' + matched[0].email + '\n----\n' + matched[0].message + '\n----');

if (!doSend) { console.log('\nDRY RUN — nothing sent. Re-run with --send to deliver.'); process.exit(0); }

for (const k of ['SENDBIRD_APP_ID', 'SENDBIRD_API_TOKEN', 'SENDBIRD_ADMIN_ID']) {
  if (!process.env[k]) { console.error('missing env ' + k); process.exit(1); }
}

async function api(method, ep, body) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(base + ep, {
      method,
      headers: { 'Api-Token': token, 'Content-Type': 'application/json; charset=utf8' },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (res.status === 429) { await new Promise(r => setTimeout(r, 2 ** attempt * 1000)); continue; }
    const text = await res.text();
    let j; try { j = text ? JSON.parse(text) : {}; } catch { j = { raw: text }; }
    if (!res.ok) { const e = new Error(`${method} ${ep} -> ${res.status}: ${j.message || text}`); e.code = j.code; throw e; }
    return j;
  }
  throw new Error('rate limited: ' + ep);
}
async function ensureUser(uid) { try { await api('POST', '/users', { user_id: uid, nickname: uid, profile_url: '' }); } catch (e) { if (e.code !== 400202) throw e; } }
async function deliver(email, message) {
  await ensureUser(email);
  const ch = await api('POST', '/group_channels', { name: channelName, user_ids: [adminId, email], is_distinct: true });
  const url = ch.channel_url;
  try { await api('POST', `/group_channels/${encodeURIComponent(url)}/operators`, { operator_ids: [adminId] }); } catch (e) { /* non-fatal */ }
  if (ch.freeze) await api('PUT', `/group_channels/${encodeURIComponent(url)}/freeze`, { freeze: false });
  await api('POST', `/group_channels/${encodeURIComponent(url)}/messages`, { message_type: 'MESG', user_id: adminId, message });
  await api('PUT', `/group_channels/${encodeURIComponent(url)}/freeze`, { freeze: true });
  return url;
}

const results = []; let ok = 0, fail = 0;
for (let i = 0; i < matched.length; i++) {
  const r = matched[i];
  try {
    const url = await deliver(r.email, r.message);
    ok++; results.push({ email: r.email, status: 'sent', channel: url });
    console.log(`[${i + 1}/${matched.length}] sent ${r.email}`);
  } catch (e) {
    fail++; results.push({ email: r.email, status: 'failed', error: String(e.message || e) });
    console.error(`[${i + 1}/${matched.length}] FAILED ${r.email}: ${e.message}`);
  }
  await new Promise(r => setTimeout(r, 200));
}
fs.writeFileSync('scripts/winback_send_log.json', JSON.stringify({ ok, fail, notFound, blankMsg, results }, null, 2));
console.log(`\nDONE sent=${ok} failed=${fail}. Log: scripts/winback_send_log.json`);
