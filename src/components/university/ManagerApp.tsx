/**
 * Help Center Manager — /tools/help-center
 * Local-pilot portal: SX migrates SOPs here today; content persists in this
 * browser (localStorage) and renders live at /university. Export JSON = backup.
 */
import { useEffect, useMemo, useState } from 'react';
import { Link, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import './manager.css';
import { useAuth } from '@/contexts/AuthContext';
import { topics, updates as seedUpdates, type ArticleBlock, type Update } from './data';
import { textToBlocks } from './importText';
import { listAssets, subscribeMedia, type MediaAsset } from './media';
import MediaTab from './MediaTab';
import RichText from './RichText';
import { sanitizeHtml } from './sanitize';
import {
  duplicateArticle,
  exportJson,
  getArticle,
  importJson,
  initSyncAdmin,
  listArticles,
  listUpdates,
  removeArticle,
  removeUpdate,
  setArticleStatus,
  subscribe,
  uniqueSlug,
  upsertArticle,
  upsertUpdate,
  type ArticleStatus,
  type StoredArticle,
} from './store';

const slugifyTitle = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'untitled';

function useRerenderOnStore() {
  const [, setTick] = useState(0);
  useEffect(() => subscribe(() => setTick((t) => t + 1)), []);
}

type AssetKind = 'image' | 'video' | 'pdf';
const kindPrefix: Record<AssetKind, string> = { image: 'image/', video: 'video/', pdf: 'application/pdf' };

function useMediaAssets(kind?: AssetKind): MediaAsset[] {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  useEffect(() => {
    const load = () => listAssets().then(setAssets);
    load();
    return subscribeMedia(load);
  }, []);
  return kind ? assets.filter((a) => a.mime.startsWith(kindPrefix[kind])) : assets;
}

/** Asset dropdown used by image, video & PDF block editors. */
function AssetPicker({ kind, value, onChange }: { kind: AssetKind; value?: string; onChange: (id: string) => void }) {
  const assets = useMediaAssets(kind);
  return (
    <select value={value ?? ''} onChange={(e) => onChange(e.target.value)} style={{ width: '100%' }}>
      <option value="">{assets.length ? `— pick a ${kind} from the library —` : `no ${kind}s uploaded yet (Media tab)`}</option>
      {assets.map((a) => (
        <option key={a.id} value={a.id}>
          {a.name} ({Math.round(a.size / 1024)} KB)
        </option>
      ))}
    </select>
  );
}

function download(filename: string, text: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

// ── Import modal ─────────────────────────────────────────────────────────────

function ImportModal({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const [text, setText] = useState('');
  return (
    <div className="hcm-modal" onClick={onClose}>
      <div className="hcm-modalcard" onClick={(e) => e.stopPropagation()}>
        <h3>Paste an SOP</h3>
        <p>
          Copy the whole article from Zendesk / SOP Portal / a doc and paste it here. First line becomes the title;
          headings, numbered steps, bullets, Note:, and Q:/A: pairs are detected automatically. You clean up in the editor.
        </p>
        <textarea
          autoFocus
          rows={14}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={'Sea Shipping Policy and Guide\n\nSea Shipping is a new, lower-cost freight option…\n\n1. What is Sea Shipping?\n…'}
        />
        <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
          <button className="hcm-btn hcm-btn--ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            className="hcm-btn"
            disabled={!text.trim()}
            onClick={() => {
              const { title, blocks } = textToBlocks(text);
              const slug = uniqueSlug(slugifyTitle(title));
              upsertArticle({
                slug,
                title,
                topic: 'Fix a Problem',
                readMins: Math.max(1, Math.round(text.split(/\s+/).length / 150)),
                updated: 'Just imported',
                blocks,
                status: 'draft',
                updatedAt: new Date().toISOString(),
              });
              onClose();
              navigate(`/tools/help-center/edit/${slug}`);
            }}
          >
            Convert to blocks →
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Articles table ───────────────────────────────────────────────────────────

function ArticlesTable() {
  useRerenderOnStore();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [q, setQ] = useState('');
  const [importOpen, setImportOpen] = useState(false);
  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const all = listArticles();
    return needle ? all.filter((a) => `${a.title} ${a.topic} ${a.status}`.toLowerCase().includes(needle)) : all;
  }, [q]);

  return (
    <>
      <div className="hcm-toolbar">
        <input type="search" placeholder="Filter by title, topic, status…" value={q} onChange={(e) => setQ(e.target.value)} />
        <span style={{ flex: 1 }} />
        <button className="hcm-btn hcm-btn--ghost" onClick={() => download(`help-center-backup-${new Date().toISOString().slice(0, 10)}.json`, exportJson())}>
          ⤓ Export backup
        </button>
        {isAdmin && (
          <label className="hcm-btn hcm-btn--ghost" style={{ display: 'inline-block' }}>
            ⤒ Import backup
            <input
              type="file"
              accept="application/json"
              style={{ display: 'none' }}
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const res = importJson(await f.text());
                window.alert(res.message);
                e.target.value = '';
              }}
            />
          </label>
        )}
        <button className="hcm-btn hcm-btn--ghost" onClick={() => setImportOpen(true)}>
          📋 Paste an SOP
        </button>
        <button
          className="hcm-btn"
          onClick={() => {
            const slug = uniqueSlug('new-article');
            upsertArticle({
              slug,
              title: 'New article',
              topic: 'Fix a Problem',
              readMins: 1,
              updated: 'Draft',
              blocks: [{ type: 'in_short', text: 'One or two sentences that answer the question straight away.' }],
              status: 'draft',
              updatedAt: new Date().toISOString(),
            });
            navigate(`/tools/help-center/edit/${slug}`);
          }}
        >
          ＋ New article
        </button>
      </div>

      {rows.length === 0 ? (
        <div className="hcm-empty">Nothing matches. Try “Paste an SOP” to migrate your first article.</div>
      ) : (
        <table className="hcm-table">
          <thead>
            <tr>
              <th>Article</th>
              <th>Topic</th>
              <th>Status</th>
              <th>Blocks</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.slug}>
                <td>
                  <b>{a.title}</b>
                </td>
                <td>
                  <span className="hcm-pill hcm-pill--cat">{a.topic}</span>
                </td>
                <td>
                  <span className={`hcm-pill hcm-pill--${a.status}`}>{a.status}</span>
                </td>
                <td>{a.blocks.length}</td>
                <td>{a.updatedAt.slice(0, 10)}</td>
                <td className="actions">
                  <button className="hcm-btn hcm-btn--ghost hcm-btn--sm" onClick={() => navigate(`/tools/help-center/edit/${a.slug}`)}>
                    Edit
                  </button>
                  <button
                    className="hcm-btn hcm-btn--ghost hcm-btn--sm"
                    onClick={() => setArticleStatus(a.slug, a.status === 'published' ? 'draft' : 'published')}
                  >
                    {a.status === 'published' ? 'Unpublish' : 'Publish'}
                  </button>
                  <button className="hcm-btn hcm-btn--ghost hcm-btn--sm" onClick={() => duplicateArticle(a.slug)}>
                    Duplicate
                  </button>
                  <button
                    className="hcm-btn hcm-btn--ghost hcm-btn--sm"
                    onClick={() => setArticleStatus(a.slug, a.status === 'archived' ? 'draft' : 'archived')}
                  >
                    {a.status === 'archived' ? 'Restore' : 'Archive'}
                  </button>
                  {isAdmin && (
                    <button
                      className="hcm-btn hcm-btn--sm hcm-btn--danger"
                      onClick={() => {
                        if (window.confirm(`Delete “${a.title}” permanently? Archive is usually safer.`)) removeArticle(a.slug);
                      }}
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {importOpen && <ImportModal onClose={() => setImportOpen(false)} />}
    </>
  );
}

// ── Block editor ─────────────────────────────────────────────────────────────

interface NotionCtx {
  onEnter: () => void;
  onEmptyBackspace: () => void;
  onSlash: () => void;
  autoFocus: boolean;
}

function BlockEditor({ block, onChange, notion }: { block: ArticleBlock; onChange: (b: ArticleBlock) => void; notion?: NotionCtx }) {
  const [focusItem, setFocusItem] = useState<number | null>(null);

  switch (block.type) {
    case 'in_short':
      return (
        <RichText
          html={block.text}
          multiline
          placeholder="One or two sentences that answer the question straight away"
          onChange={(html) => onChange({ ...block, text: html })}
        />
      );
    case 'text':
      return (
        <RichText
          html={block.html}
          placeholder="Type — “/” for blocks, Enter for a new block"
          onChange={(html) => onChange({ ...block, html })}
          onEnter={notion?.onEnter}
          onEmptyBackspace={notion?.onEmptyBackspace}
          onSlash={notion?.onSlash}
          autoFocus={notion?.autoFocus}
        />
      );
    case 'heading':
      return (
        <div className="row2" style={{ gridTemplateColumns: '86px 1fr' }}>
          <select value={block.level} onChange={(e) => onChange({ ...block, level: Number(e.target.value) === 3 ? 3 : 2 })}>
            <option value={2}>H2</option>
            <option value={3}>H3</option>
          </select>
          <RichText html={block.html} placeholder="Heading" onChange={(html) => onChange({ ...block, html })} onEnter={notion?.onEnter} autoFocus={notion?.autoFocus} />
        </div>
      );
    case 'list':
      return (
        <>
          <select value={block.style} onChange={(e) => onChange({ ...block, style: e.target.value === 'number' ? 'number' : 'bullet' })} style={{ marginBottom: 6 }}>
            <option value="bullet">• Bulleted</option>
            <option value="number">1. Numbered</option>
          </select>
          {block.items.map((it, i) => (
            <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'flex-start', marginTop: 4 }}>
              <span style={{ color: 'var(--muted)', fontSize: 13, marginTop: 8, width: 18, textAlign: 'right' }}>
                {block.style === 'number' ? `${i + 1}.` : '•'}
              </span>
              <div style={{ flex: 1 }}>
                <RichText
                  html={it}
                  placeholder="List item — Enter for next"
                  autoFocus={focusItem === i}
                  onChange={(html) => onChange({ ...block, items: block.items.map((x, j) => (j === i ? html : x)) })}
                  onEnter={() => {
                    const items = [...block.items];
                    items.splice(i + 1, 0, '');
                    onChange({ ...block, items });
                    setFocusItem(i + 1);
                  }}
                  onEmptyBackspace={() => {
                    if (block.items.length === 1) return;
                    onChange({ ...block, items: block.items.filter((_, j) => j !== i) });
                    setFocusItem(Math.max(0, i - 1));
                  }}
                />
              </div>
            </div>
          ))}
        </>
      );
    case 'table':
      return (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table className="hcm-tableedit">
              <tbody>
                {block.rows.map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => (
                      <td key={ci}>
                        <input
                          value={cell.replace(/<[^>]+>/g, '')}
                          placeholder={ri === 0 ? 'Header' : ''}
                          style={ri === 0 ? { fontWeight: 700 } : undefined}
                          onChange={(e) =>
                            onChange({
                              ...block,
                              rows: block.rows.map((r, rj) => (rj === ri ? r.map((c, cj) => (cj === ci ? sanitizeHtml(e.target.value) : c)) : r)),
                            })
                          }
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
            <button className="hcm-btn hcm-btn--ghost hcm-btn--sm" onClick={() => onChange({ ...block, rows: [...block.rows, block.rows[0].map(() => '')] })}>＋ Row</button>
            <button className="hcm-btn hcm-btn--ghost hcm-btn--sm" onClick={() => onChange({ ...block, rows: block.rows.map((r) => [...r, '']) })}>＋ Column</button>
            <button className="hcm-btn hcm-btn--ghost hcm-btn--sm" disabled={block.rows.length <= 2} onClick={() => onChange({ ...block, rows: block.rows.slice(0, -1) })}>− Row</button>
            <button className="hcm-btn hcm-btn--ghost hcm-btn--sm" disabled={block.rows[0].length <= 1} onClick={() => onChange({ ...block, rows: block.rows.map((r) => r.slice(0, -1)) })}>− Column</button>
          </div>
        </>
      );
    case 'code':
      return (
        <>
          <input
            value={block.lang ?? ''}
            placeholder="Language label (optional) — e.g. sql, json"
            style={{ marginBottom: 6, width: 220 }}
            onChange={(e) => onChange({ ...block, lang: e.target.value || undefined })}
          />
          <textarea className="hcm-codearea" rows={5} value={block.code} placeholder="Paste code or commands…" onChange={(e) => onChange({ ...block, code: e.target.value })} />
        </>
      );
    case 'quote':
      return (
        <div style={{ borderLeft: '3px solid var(--yellow)', paddingLeft: 10 }}>
          <RichText html={block.html} multiline placeholder="Quote or highlighted note" onChange={(html) => onChange({ ...block, html })} autoFocus={notion?.autoFocus} />
        </div>
      );
    case 'divider':
      return <hr style={{ border: 0, borderTop: '1.5px dashed #C9C6BC', margin: '6px 0' }} />;
    case 'section':
      return <input value={block.title} placeholder="Section heading (red-accented on the seller side)" onChange={(e) => onChange({ ...block, title: e.target.value })} />;
    case 'step':
      return (
        <div className="row2" style={{ gridTemplateColumns: '52px 1fr' }}>
          <input
            type="number"
            min={1}
            value={block.n}
            onChange={(e) => onChange({ ...block, n: Number(e.target.value) || 1 })}
            aria-label="Step number"
          />
          <RichText html={block.html} placeholder="What the seller should do — keep it under ~40 words" onChange={(html) => onChange({ ...block, html })} onEnter={notion?.onEnter} autoFocus={notion?.autoFocus} />
        </div>
      );
    case 'callout':
      return (
        <>
          <input value={block.title} onChange={(e) => onChange({ ...block, title: e.target.value })} placeholder="Bold lead line" />
          <div style={{ marginTop: 6 }}>
            <RichText html={block.text} multiline placeholder="Max two sentences" onChange={(html) => onChange({ ...block, text: html })} />
          </div>
        </>
      );
    case 'chips':
      return (
        <input
          value={block.items.join(', ')}
          onChange={(e) => onChange({ ...block, items: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
          placeholder="Comma-separated items"
        />
      );
    case 'image':
      return (
        <>
          {block.src && !block.assetId && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 6 }}>
              <img src={block.src} alt={block.alt} style={{ height: 54, borderRadius: 6, border: '1px solid var(--line)' }} />
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                Zendesk-hosted image — works now; re-upload to the Media library during polish to own the file.
              </span>
            </div>
          )}
          <AssetPicker kind="image" value={block.assetId} onChange={(assetId) => onChange({ ...block, assetId })} />
          <input
            style={{ marginTop: 6, width: '100%' }}
            value={block.alt}
            placeholder="Alt text — what a seller who can't see it needs to know (required)"
            onChange={(e) => onChange({ ...block, alt: e.target.value })}
          />
        </>
      );
    case 'video':
      return (
        <>
          <AssetPicker kind="video" value={block.assetId} onChange={(assetId) => onChange({ ...block, assetId: assetId || undefined })} />
          <input
            style={{ marginTop: 6, width: '100%' }}
            value={block.embedUrl ?? ''}
            placeholder="…or paste a Loom/YouTube embed URL (used when no library video is picked)"
            onChange={(e) => onChange({ ...block, embedUrl: e.target.value || undefined })}
          />
          <div className="row2" style={{ marginTop: 6 }}>
            <input value={block.caption} onChange={(e) => onChange({ ...block, caption: e.target.value })} placeholder="Caption" />
            <input value={block.length} onChange={(e) => onChange({ ...block, length: e.target.value })} placeholder="0:45" />
          </div>
        </>
      );
    case 'pdf':
      return (
        <>
          <AssetPicker kind="pdf" value={block.assetId} onChange={(assetId) => onChange({ ...block, assetId: assetId || undefined })} />
          <input
            style={{ marginTop: 6, width: '100%' }}
            value={block.caption ?? ''}
            placeholder="Caption — e.g. “Packing checklist (print this)”"
            onChange={(e) => onChange({ ...block, caption: e.target.value || undefined })}
          />
        </>
      );
    case 'faq':
      return (
        <>
          {block.items.map((it, i) => (
            <div key={i} className="hcm-faqitem">
              <input
                value={it.q}
                placeholder="Question"
                onChange={(e) => onChange({ ...block, items: block.items.map((x, j) => (j === i ? { ...x, q: e.target.value } : x)) })}
              />
              <textarea
                rows={2}
                style={{ marginTop: 6 }}
                value={it.a}
                placeholder="Answer"
                onChange={(e) => onChange({ ...block, items: block.items.map((x, j) => (j === i ? { ...x, a: e.target.value } : x)) })}
              />
              <button
                className="hcm-btn hcm-btn--ghost hcm-btn--sm"
                style={{ marginTop: 6 }}
                onClick={() => onChange({ ...block, items: block.items.filter((_, j) => j !== i) })}
              >
                Remove question
              </button>
            </div>
          ))}
          <button
            className="hcm-btn hcm-btn--ghost hcm-btn--sm"
            style={{ marginTop: 8 }}
            onClick={() => onChange({ ...block, items: [...block.items, { q: '', a: '' }] })}
          >
            ＋ Add question
          </button>
        </>
      );
    case 'related':
      return <div style={{ fontSize: 12, color: 'var(--muted)' }}>Related links: {block.items.map((i) => i.title).join(' · ') || 'none'} (edited later via linking UI)</div>;
    default:
      return null;
  }
}

const ADDABLE: { label: string; make: () => ArticleBlock }[] = [
  { label: '📝 Text', make: () => ({ type: 'text', html: '' }) },
  { label: 'H Heading', make: () => ({ type: 'heading', level: 2, html: '' }) },
  { label: '🏷 Section', make: () => ({ type: 'section', title: '' }) },
  { label: '• List', make: () => ({ type: 'list', style: 'bullet', items: [''] }) },
  { label: '🔢 Step', make: () => ({ type: 'step', n: 1, html: '' }) },
  { label: '💡 Callout', make: () => ({ type: 'callout', tone: 'warn', title: '', text: '' }) },
  { label: '⊞ Table', make: () => ({ type: 'table', rows: [['Column 1', 'Column 2'], ['', '']] }) },
  { label: '｛｝Code', make: () => ({ type: 'code', code: '' }) },
  { label: '❝ Quote', make: () => ({ type: 'quote', html: '' }) },
  { label: '— Divider', make: () => ({ type: 'divider' }) },
  { label: '✅ Chips', make: () => ({ type: 'chips', items: [] }) },
  { label: '🖼 Image', make: () => ({ type: 'image', assetId: '', alt: '' }) },
  { label: '🎬 Video', make: () => ({ type: 'video', caption: '', length: '0:30' }) },
  { label: '📄 PDF', make: () => ({ type: 'pdf', caption: '' }) },
  { label: '❓ FAQ', make: () => ({ type: 'faq', items: [{ q: '', a: '' }] }) },
];

function Editor() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const existing = slug ? getArticle(slug) : undefined;
  const [article, setArticle] = useState<StoredArticle | undefined>(existing);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [focusIdx, setFocusIdx] = useState<number | null>(null);
  const [slashIdx, setSlashIdx] = useState<number | null>(null);

  if (!article)
    return (
      <div className="hcm-empty">
        Article not found. <Link to="/tools/help-center">Back to the list</Link>
      </div>
    );

  const save = (status?: ArticleStatus) => {
    const next = { ...article, status: status ?? article.status };
    upsertArticle(next);
    setArticle(next);
    setSavedAt(new Date().toLocaleTimeString());
  };

  const setBlocks = (blocks: ArticleBlock[]) => setArticle({ ...article, blocks });
  const move = (i: number, dir: -1 | 1) => {
    const b = [...article.blocks];
    const j = i + dir;
    if (j < 0 || j >= b.length) return;
    [b[i], b[j]] = [b[j], b[i]];
    setBlocks(b);
  };

  // Notion interactions: Enter = new text block below, Backspace-on-empty =
  // remove block, "/" in an empty text block = block menu at that position.
  const insertAt = (i: number, b: ArticleBlock) => {
    const blocks = [...article.blocks];
    blocks.splice(i, 0, b);
    setBlocks(blocks);
    setFocusIdx(i);
  };
  const removeAt = (i: number) => {
    setBlocks(article.blocks.filter((_, j) => j !== i));
    setFocusIdx(Math.max(0, i - 1));
    setSlashIdx(null);
  };
  const convertAt = (i: number, b: ArticleBlock) => {
    setBlocks(article.blocks.map((x, j) => (j === i ? b : x)));
    setSlashIdx(null);
    setFocusIdx(i);
  };

  return (
    <div className="hcm-edgrid">
      <div className="hcm-canvas">
        <div className="hcm-field">
          <label>Title</label>
          <input className="hcm-titleinput" value={article.title} onChange={(e) => setArticle({ ...article, title: e.target.value })} />
        </div>
        {article.blocks.map((b, i) => (
          <div key={i} className="hcm-block">
            <span className="btag">{b.type}</span>
            <span className="hcm-blockbar">
              <button onClick={() => move(i, -1)} aria-label="Move up">↑</button>
              <button onClick={() => move(i, 1)} aria-label="Move down">↓</button>
              <button onClick={() => insertAt(i + 1, { type: 'text', html: '' })} aria-label="Insert block below">＋</button>
              <button onClick={() => removeAt(i)} aria-label="Delete block">✕</button>
            </span>
            <BlockEditor
              block={b}
              onChange={(nb) => setBlocks(article.blocks.map((x, j) => (j === i ? nb : x)))}
              notion={{
                onEnter: () => insertAt(i + 1, { type: 'text', html: '' }),
                onEmptyBackspace: () => removeAt(i),
                onSlash: () => setSlashIdx(i),
                autoFocus: focusIdx === i,
              }}
            />
            {slashIdx === i && (
              <div className="hcm-slash">
                <div className="hcm-slash-title">Turn into…</div>
                {ADDABLE.map((a) => (
                  <button key={a.label} onClick={() => convertAt(i, a.make())}>
                    {a.label}
                  </button>
                ))}
                <button className="close" onClick={() => setSlashIdx(null)}>✕ close</button>
              </div>
            )}
          </div>
        ))}
        <div className="hcm-addrow">
          {ADDABLE.map((a) => (
            <button key={a.label} onClick={() => setBlocks([...article.blocks, a.make()])}>
              {a.label}
            </button>
          ))}
        </div>
      </div>

      <div className="hcm-side">
        <div className="hcm-sidecard">
          <h4>Publish</h4>
          <div className="stack">
            <span className={`hcm-pill hcm-pill--${article.status}`} style={{ alignSelf: 'flex-start' }}>
              {article.status}
            </span>
            <button className="hcm-btn hcm-btn--ghost" onClick={() => save()}>
              Save draft {savedAt && <span style={{ fontWeight: 400, fontSize: 10 }}>· saved {savedAt}</span>}
            </button>
            <button className="hcm-btn" onClick={() => save('published')}>
              Publish
            </button>
            <button
              className="hcm-btn hcm-btn--ghost"
              onClick={() => {
                save();
                window.open(`/university/article/${article.slug}?preview=1`, '_blank');
              }}
            >
              📱 Preview as seller
            </button>
          </div>
        </div>
        <div className="hcm-sidecard">
          <h4>Placement</h4>
          <div className="hcm-field">
            <label>Topic</label>
            <select value={article.topic} onChange={(e) => setArticle({ ...article, topic: e.target.value })}>
              {topics.map((t) => (
                <option key={t.slug} value={t.title}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>
          <div className="hcm-field">
            <label>Read time (min)</label>
            <input
              type="number"
              min={1}
              value={article.readMins}
              onChange={(e) => setArticle({ ...article, readMins: Number(e.target.value) || 1 })}
            />
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)' }}>slug: {article.slug}</div>
        </div>
        {isAdmin && (
          <div className="hcm-sidecard">
            <h4>Danger zone</h4>
            <button
              className="hcm-btn hcm-btn--sm hcm-btn--danger"
              onClick={() => {
                if (window.confirm('Delete this article permanently?')) {
                  removeArticle(article.slug);
                  navigate('/tools/help-center');
                }
              }}
            >
              Delete article
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Updates tab ──────────────────────────────────────────────────────────────

function UpdatesTab() {
  useRerenderOnStore();
  const rows = listUpdates();
  const blank = (): Update => ({ id: `u-${Date.now()}`, date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }), title: '', body: '' });
  const [editing, setEditing] = useState<Update | null>(null);

  return (
    <>
      <div className="hcm-toolbar">
        <span style={{ flex: 1 }} />
        <button className="hcm-btn" onClick={() => setEditing(blank())}>
          ＋ New announcement
        </button>
      </div>
      <table className="hcm-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Title</th>
            <th>Body</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((u) => (
            <tr key={u.id}>
              <td>{u.date}</td>
              <td>
                <b>{u.title}</b> {u.important && <span className="hcm-pill" style={{ background: 'var(--red-soft)', color: 'var(--red)' }}>Important</span>}
              </td>
              <td style={{ maxWidth: 420 }}>{u.body}</td>
              <td className="actions">
                <button className="hcm-btn hcm-btn--ghost hcm-btn--sm" onClick={() => setEditing(u)}>
                  Edit
                </button>
                <button className="hcm-btn hcm-btn--sm hcm-btn--danger" onClick={() => removeUpdate(u.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {editing && (
        <div className="hcm-modal" onClick={() => setEditing(null)}>
          <div className="hcm-modalcard" onClick={(e) => e.stopPropagation()}>
            <h3>{editing.title ? 'Edit announcement' : 'New announcement'}</h3>
            <div className="hcm-field">
              <label>Title</label>
              <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} style={{ width: '100%' }} />
            </div>
            <div className="hcm-field">
              <label>Body</label>
              <textarea rows={3} value={editing.body} onChange={(e) => setEditing({ ...editing, body: e.target.value })} />
            </div>
            <label style={{ fontSize: 12.5, display: 'flex', gap: 6, alignItems: 'center' }}>
              <input type="checkbox" checked={!!editing.important} onChange={(e) => setEditing({ ...editing, important: e.target.checked })} />
              Mark as Important
            </label>
            <div style={{ display: 'flex', gap: 8, marginTop: 14, justifyContent: 'flex-end' }}>
              <button className="hcm-btn hcm-btn--ghost" onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button
                className="hcm-btn"
                disabled={!editing.title.trim()}
                onClick={() => {
                  upsertUpdate(editing);
                  setEditing(null);
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Shell ────────────────────────────────────────────────────────────────────

export default function ManagerApp() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { isAdmin, role } = useAuth();
  const tab = pathname.includes('/updates') ? 'updates' : pathname.includes('/media') ? 'media' : 'articles';
  const [syncMode, setSyncMode] = useState<'checking' | 'online' | 'local'>('checking');
  useEffect(() => {
    initSyncAdmin().then(setSyncMode);
  }, []);
  void seedUpdates; // keep types honest if data seeds change

  return (
    <div className="hcm-app">
      <div className="hcm-top">
        <span className="hcm-logo">⚡ Fleek<em>OS</em></span>
        <span className="hcm-crumb">Home › Admin › Help Center Manager</span>
        <div className="right">
          <span className={`hcm-pill ${isAdmin ? 'hcm-pill--published' : 'hcm-pill--draft'}`}>
            {isAdmin ? `${role} · full control` : 'editor · no delete/restore'}
          </span>
          <button className="hcm-btn hcm-btn--ghost hcm-btn--sm" onClick={() => window.open('/university', '_blank')}>
            📱 Open Seller University
          </button>
        </div>
      </div>
      <div className="hcm-body">
        <h1 className="hcm-h1">
          Every SOP, updated, <span className="hl">in sellers&rsquo; hands.</span>
        </h1>
        <div className="hcm-sub">Write, publish and measure Seller University. Publishing is instant; drafts are private to this tool.</div>
        {syncMode === 'online' ? (
          <div className="hcm-note" style={{ background: 'var(--green-soft)', borderColor: '#BFE5CB' }}>
            <b>✓ Synced:</b> content and media save to Vercel Blob — shared across all editors and served to sellers at <b>/university</b>. Export backup still works as a belt-and-braces snapshot.
          </div>
        ) : (
          <div className="hcm-note">
            <b>Local mode{syncMode === 'checking' ? ' (checking sync…)' : ''}:</b> the content API isn&rsquo;t reachable (plain <code>vite</code> dev serves no <code>/api</code> — use <code>vercel dev</code> or the deployed portal for sync). Content stays in this browser; use <b>Export backup</b> after each session.
          </div>
        )}
        <div className="hcm-tabs">
          <button className={`hcm-tab ${tab === 'articles' ? 'on' : ''}`} onClick={() => navigate('/tools/help-center')}>
            Articles
          </button>
          <button className={`hcm-tab ${tab === 'media' ? 'on' : ''}`} onClick={() => navigate('/tools/help-center/media')}>
            Media
          </button>
          <button className={`hcm-tab ${tab === 'updates' ? 'on' : ''}`} onClick={() => navigate('/tools/help-center/updates')}>
            Announcements
          </button>
        </div>
        <Routes>
          <Route index element={<ArticlesTable />} />
          <Route path="edit/:slug" element={<Editor />} />
          <Route path="media" element={<MediaTab readonly={!isAdmin} />} />
          <Route path="updates" element={<UpdatesTab />} />
        </Routes>
      </div>
    </div>
  );
}
