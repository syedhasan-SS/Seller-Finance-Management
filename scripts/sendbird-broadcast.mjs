#!/usr/bin/env node
// SendBird customer outreach broadcaster.
//
// Reads a CSV exported from the campaign sheet and sends a personalised 1:1
// message to each customer via the SendBird Platform API. The recipient's
// SendBird user_id is their email (column B). For each recipient we find-or-
// create a distinct group channel between a Fleek sender user and the customer,
// then post the message into it.
//
// SAFETY: dry-run by default. Nothing is sent unless you pass --send.
//
// Usage:
//   node scripts/sendbird-broadcast.mjs --file data/with_discount.csv --campaign with-discount
//   node scripts/sendbird-broadcast.mjs --file data/with_discount.csv --campaign with-discount --limit 3 --send
//   node scripts/sendbird-broadcast.mjs --file data/no_discount.csv  --campaign no-discount  --send
//
// Required env (put in .env or export):
//   SENDBIRD_APP_ID     SendBird Application ID
//   SENDBIRD_API_TOKEN  SendBird Platform API token (master or secondary)
//   SENDBIRD_SENDER_ID  user_id of the Fleek bot/admin that messages appear from
// Optional env:
//   SENDBIRD_API_BASE   override base URL (default https://api-<APP_ID>.sendbird.com)

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

// ---------------------------------------------------------------------------
// Message copy. EDIT THESE to change wording. Placeholders are filled per row.
//   {{firstName}}    column C
//   {{discountCode}} column D (with-discount campaign only)
//   {{products}}     column J, one URL per line (auto-linked by SendBird clients)
// ---------------------------------------------------------------------------
function buildMessage(campaign, { firstName, discountCode, products }) {
  const name = (firstName || '').trim() || 'there';
  const links = products.join('\n');

  if (campaign === 'with-discount') {
    return [
      `Hi ${name},`,
      ``,
      `We've picked out a few items we think you'll love on Fleek. Use code ${discountCode} at checkout for your discount:`,
      ``,
      links,
      ``,
      `Happy shopping,`,
      `The Fleek Team`,
    ].join('\n');
  }

  // no-discount
  return [
    `Hi ${name},`,
    ``,
    `We've picked out a few items we think you'll love on Fleek:`,
    ``,
    links,
    ``,
    `The Fleek Team`,
  ].join('\n');
}

// ---------------------------------------------------------------------------
// Column mapping (0-based). B=1 email, C=2 first name, D=3 discount, J=9 products.
// ---------------------------------------------------------------------------
const COL = { email: 1, firstName: 2, discountCode: 3, products: 9 };

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------
function parseArgs(argv) {
  const args = { send: false, createUsers: true, headerRows: 1, delayMs: 200 };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    const next = () => argv[++i];
    switch (a) {
      case '--file': args.file = next(); break;
      case '--campaign': args.campaign = next(); break;     // with-discount | no-discount
      case '--send': args.send = true; break;
      case '--limit': args.limit = parseInt(next(), 10); break;
      case '--only': args.only = next().split(',').map(s => s.trim().toLowerCase()).filter(Boolean); break;
      case '--header-rows': args.headerRows = parseInt(next(), 10); break;
      case '--delay-ms': args.delayMs = parseInt(next(), 10); break;
      case '--no-create-users': args.createUsers = false; break;
      case '--help': case '-h': args.help = true; break;
      default: console.error(`Unknown arg: ${a}`); process.exit(1);
    }
  }
  return args;
}

const HELP = `SendBird customer outreach broadcaster

  --file <path>        CSV exported from the campaign sheet (required)
  --campaign <name>    with-discount | no-discount (required)
  --send               actually send (omit for a dry run that prints messages)
  --limit <n>          only process the first n valid rows (good for a test batch)
  --only a@x,b@y       only send to these emails (comma-separated)
  --header-rows <n>    number of leading header rows to skip (default 1)
  --delay-ms <n>       pause between sends to respect rate limits (default 200)
  --no-create-users    do not auto-create missing SendBird users
  -h, --help           show this help
`;

// ---------------------------------------------------------------------------
// Minimal RFC-4180-ish CSV parser. Handles quoted fields, embedded commas,
// escaped quotes ("") and newlines inside quoted cells (multi-URL J column).
// ---------------------------------------------------------------------------
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field); field = '';
    } else if (c === '\r') {
      // ignore; handled by \n
    } else if (c === '\n') {
      row.push(field); rows.push(row); row = []; field = '';
    } else {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  return rows;
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function extractProducts(cell) {
  if (!cell) return [];
  return cell
    .split(/[\s,;]+/)
    .map(s => s.trim())
    .filter(s => /^https?:\/\//i.test(s));
}

// ---------------------------------------------------------------------------
// SendBird Platform API client
// ---------------------------------------------------------------------------
function makeClient() {
  const appId = process.env.SENDBIRD_APP_ID;
  const token = process.env.SENDBIRD_API_TOKEN;
  const sender = process.env.SENDBIRD_SENDER_ID;
  const base = process.env.SENDBIRD_API_BASE || (appId && `https://api-${appId}.sendbird.com`);
  const missing = [];
  if (!appId) missing.push('SENDBIRD_APP_ID');
  if (!token) missing.push('SENDBIRD_API_TOKEN');
  if (!sender) missing.push('SENDBIRD_SENDER_ID');
  if (missing.length) {
    throw new Error(`Missing required env: ${missing.join(', ')}`);
  }

  async function api(method, endpoint, body) {
    const url = `${base}${endpoint}`;
    for (let attempt = 0; attempt < 5; attempt++) {
      const res = await fetch(url, {
        method,
        headers: { 'Api-Token': token, 'Content-Type': 'application/json; charset=utf8' },
        body: body ? JSON.stringify(body) : undefined,
      });
      if (res.status === 429) {
        const retryAfter = Number(res.headers.get('retry-after')) || 2 ** attempt;
        await sleep(retryAfter * 1000);
        continue;
      }
      const text = await res.text();
      let json;
      try { json = text ? JSON.parse(text) : {}; } catch { json = { raw: text }; }
      if (!res.ok) {
        const err = new Error(`SendBird ${method} ${endpoint} -> ${res.status}: ${json.message || text}`);
        err.status = res.status;
        err.code = json.code;
        throw err;
      }
      return json;
    }
    throw new Error(`SendBird ${method} ${endpoint} -> rate limited after retries`);
  }

  return {
    sender,
    // Idempotent user upsert. Ignores "user already exists" (code 400202).
    async ensureUser(userId, nickname) {
      try {
        await api('POST', '/v3/users', {
          user_id: userId,
          nickname: nickname || userId,
          profile_url: '',
          issue_access_token: false,
        });
      } catch (e) {
        if (e.code === 400202) return; // already exists
        throw e;
      }
    },
    // Find-or-create the distinct 1:1 channel between sender and recipient.
    async getOrCreateChannel(recipientId) {
      const ch = await api('POST', '/v3/group_channels', {
        user_ids: [sender, recipientId],
        is_distinct: true,
      });
      return ch.channel_url;
    },
    async sendMessage(channelUrl, message) {
      return api('POST', `/v3/group_channels/${encodeURIComponent(channelUrl)}/messages`, {
        message_type: 'MESG',
        user_id: sender,
        message,
      });
    },
  };
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const args = parseArgs(process.argv);
  if (args.help) { console.log(HELP); return; }
  if (!args.file || !args.campaign) { console.error(HELP); process.exit(1); }
  if (!['with-discount', 'no-discount'].includes(args.campaign)) {
    console.error(`--campaign must be "with-discount" or "no-discount"`); process.exit(1);
  }

  const raw = fs.readFileSync(args.file, 'utf8');
  const allRows = parseCsv(raw);
  const dataRows = allRows.slice(args.headerRows);

  // Build recipient list with validation + dedupe by email.
  const seen = new Set();
  const recipients = [];
  const skipped = [];
  for (let r = 0; r < dataRows.length; r++) {
    const row = dataRows[r];
    const lineNo = r + args.headerRows + 1;
    const email = (row[COL.email] || '').trim().toLowerCase();
    const firstName = (row[COL.firstName] || '').trim();
    const discountCode = (row[COL.discountCode] || '').trim();
    const products = extractProducts(row[COL.products]);

    if (!email) { continue; } // blank row
    if (!EMAIL_RE.test(email)) { skipped.push({ lineNo, email, reason: 'invalid email' }); continue; }
    if (seen.has(email)) { skipped.push({ lineNo, email, reason: 'duplicate' }); continue; }
    if (products.length === 0) { skipped.push({ lineNo, email, reason: 'no product URLs in column J' }); continue; }
    if (args.campaign === 'with-discount' && !discountCode) {
      skipped.push({ lineNo, email, reason: 'no discount code in column D' }); continue;
    }
    if (args.only && !args.only.includes(email)) { continue; }

    seen.add(email);
    recipients.push({ lineNo, email, firstName, discountCode, products });
  }

  let queue = recipients;
  if (Number.isInteger(args.limit)) queue = queue.slice(0, args.limit);

  console.log(`Campaign : ${args.campaign}`);
  console.log(`File     : ${args.file}`);
  console.log(`Mode     : ${args.send ? 'SEND (live)' : 'DRY RUN (no messages sent)'}`);
  console.log(`Valid    : ${recipients.length} recipient(s)${args.limit ? `, limited to ${queue.length}` : ''}`);
  console.log(`Skipped  : ${skipped.length}`);
  if (skipped.length) {
    for (const s of skipped.slice(0, 20)) console.log(`  - line ${s.lineNo} ${s.email || '(blank)'}: ${s.reason}`);
    if (skipped.length > 20) console.log(`  ... and ${skipped.length - 20} more`);
  }
  console.log('');

  // Dry run: print the first few composed messages and stop.
  if (!args.send) {
    const preview = queue.slice(0, 3);
    for (const rcpt of preview) {
      const msg = buildMessage(args.campaign, rcpt);
      console.log('────────────────────────────────────────');
      console.log(`to: ${rcpt.email}  (channel: sender ${process.env.SENDBIRD_SENDER_ID || '<SENDER_ID>'} ↔ ${rcpt.email})`);
      console.log('────────────────────────────────────────');
      console.log(msg);
      console.log('');
    }
    console.log(`Dry run complete. ${queue.length} message(s) would be sent. Re-run with --send to deliver.`);
    return;
  }

  // Live send.
  const client = makeClient();
  const results = [];
  let ok = 0, fail = 0;
  for (let i = 0; i < queue.length; i++) {
    const rcpt = queue[i];
    const message = buildMessage(args.campaign, rcpt);
    try {
      if (args.createUsers) await client.ensureUser(rcpt.email, rcpt.firstName);
      const channelUrl = await client.getOrCreateChannel(rcpt.email);
      await client.sendMessage(channelUrl, message);
      ok++;
      results.push({ email: rcpt.email, status: 'sent', channelUrl });
      console.log(`[${i + 1}/${queue.length}] sent -> ${rcpt.email}`);
    } catch (e) {
      fail++;
      results.push({ email: rcpt.email, status: 'failed', error: String(e.message || e) });
      console.error(`[${i + 1}/${queue.length}] FAILED -> ${rcpt.email}: ${e.message || e}`);
    }
    if (i < queue.length - 1) await sleep(args.delayMs);
  }

  // Write a results log next to the input file.
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const logPath = path.join(path.dirname(args.file), `send-log_${args.campaign}_${stamp}.json`);
  fs.writeFileSync(logPath, JSON.stringify({ campaign: args.campaign, file: args.file, ok, fail, results }, null, 2));
  console.log(`\nDone. Sent ${ok}, failed ${fail}. Log: ${logPath}`);
}

main().catch(e => { console.error(e); process.exit(1); });
