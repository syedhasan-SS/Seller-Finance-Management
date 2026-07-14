import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, MessageCircle, Play, ThumbsDown, ThumbsUp } from 'lucide-react';
import { SectionLabel, Stamp, SwingTag } from './kit';
import { type ArticleBlock } from './data';
import { getArticle, publishedArticles } from './store';
import { AssetImg, AssetPdf, AssetVideo } from './AssetMedia';
import HelpSheet from './HelpSheet';

function Block({ block, onNavigate }: { block: ArticleBlock; onNavigate: (slug: string) => void }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  switch (block.type) {
    case 'text':
      return <div className="uni-p" dangerouslySetInnerHTML={{ __html: block.html }} />;
    case 'heading':
      return block.level === 2 ? (
        <h2 className="uni-h2" dangerouslySetInnerHTML={{ __html: block.html }} />
      ) : (
        <h3 className="uni-h3" dangerouslySetInnerHTML={{ __html: block.html }} />
      );
    case 'list': {
      const items = block.items.map((it, i) => <li key={i} dangerouslySetInnerHTML={{ __html: it }} />);
      return block.style === 'number' ? <ol className="uni-ol">{items}</ol> : <ul className="uni-ul">{items}</ul>;
    }
    case 'table':
      return (
        <div className="uni-tablewrap">
          <table className="uni-table">
            <thead>
              <tr>
                {(block.rows[0] ?? []).map((c, i) => (
                  <th key={i} dangerouslySetInnerHTML={{ __html: c }} />
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.slice(1).map((row, ri) => (
                <tr key={ri}>
                  {row.map((c, ci) => (
                    <td key={ci} dangerouslySetInnerHTML={{ __html: c }} />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'code':
      return (
        <pre className="uni-code">
          {block.lang && <span className="lang">{block.lang}</span>}
          <code>{block.code}</code>
        </pre>
      );
    case 'quote':
      return <blockquote className="uni-quote" dangerouslySetInnerHTML={{ __html: block.html }} />;
    case 'divider':
      return <hr className="uni-hr" />;
    case 'in_short':
      return (
        <div className="uni-inshort">
          <b>In short:</b> {block.text}
        </div>
      );
    case 'section':
      return <div className="uni-asec">{block.title}</div>;
    case 'chips':
      return (
        <div className="uni-chiprow" style={{ marginTop: 2 }}>
          {block.items.map((c) => (
            <span key={c} className="uni-chip">
              ✓ {c}
            </span>
          ))}
        </div>
      );
    case 'step':
      return (
        <>
          <div className="uni-step">
            <span className="uni-stepnum">{block.n}</span>
            <p dangerouslySetInnerHTML={{ __html: block.html }} />
          </div>
          {block.shot && <div className="uni-shot">{block.shot}</div>}
        </>
      );
    case 'image':
      return (
        <div style={{ margin: '14px 0' }}>
          {block.assetId ? (
            <AssetImg assetId={block.assetId} alt={block.alt} />
          ) : block.src ? (
            <img
              src={block.src}
              alt={block.alt}
              loading="lazy"
              style={{ maxWidth: '100%', borderRadius: 12, border: '1px solid var(--line)', display: 'block' }}
            />
          ) : (
            <div className="uni-shot" style={{ margin: 0 }}>image missing</div>
          )}
        </div>
      );
    case 'pdf':
      return <AssetPdf assetId={block.assetId} src={block.src} caption={block.caption} />;
    case 'video':
      if (block.assetId) return <AssetVideo assetId={block.assetId} caption={block.caption} length={block.length} />;
      if (block.embedUrl)
        return (
          <div className="uni-vid">
            <div style={{ position: 'relative', paddingTop: '56.25%', background: '#000' }}>
              <iframe
                src={block.embedUrl}
                title={block.caption}
                allowFullScreen
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
              />
            </div>
            <div className="uni-vcap">{block.caption}</div>
          </div>
        );
      return (
        <div className="uni-vid">
          <div className="uni-vstage">
            <span className="uni-play">
              <Play size={20} fill="currentColor" />
            </span>
            <span className="uni-ptag uni-ptag--l">🔇 silent demo · {block.length}</span>
            <span className="uni-ptag uni-ptag--r">⤢ full screen</span>
          </div>
          <div className="uni-vcap">{block.caption}</div>
        </div>
      );
    case 'callout':
      return (
        <div className={`uni-callout uni-callout--${block.tone}`}>
          <span>⚠️</span>
          <div>
            <b>{block.title}</b>
            {block.text}
          </div>
        </div>
      );
    case 'faq':
      return (
        <div className="uni-faq">
          {block.items.map((f, i) => (
            <div key={f.q}>
              <button className="uni-faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                {f.q}
                {openFaq === i ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              {openFaq === i && <div className="uni-faq-a">{f.a}</div>}
            </div>
          ))}
        </div>
      );
    case 'related':
      return (
        <>
          <SectionLabel>Next for you</SectionLabel>
          <div className="uni-list">
            {block.items.map((r) => (
              <button key={r.title} className="uni-row" onClick={() => onNavigate(r.slug)}>
                {r.title}
                <span className="uni-arr">
                  <ChevronRight size={15} />
                </span>
              </button>
            ))}
          </div>
        </>
      );
    default:
      return null;
  }
}

/** Shown for slugs that exist in the plan but aren't written yet. */
function ComingSoon({ slug }: { slug: string }) {
  const navigate = useNavigate();
  const title = slug.replace(/-/g, ' ');
  return (
    <div className="uni-scroll">
      <div className="uni-topline" style={{ marginBottom: 4 }}>
        <button className="uni-crumb" onClick={() => navigate(-1)}>
          <ChevronLeft size={13} /> Back
        </button>
      </div>
      <div className="uni-soonhero">
        <div style={{ fontSize: 30, marginBottom: 8 }}>✍️</div>
        <div style={{ fontWeight: 800, fontSize: 16, textTransform: 'capitalize' }}>{title}</div>
        <p style={{ fontSize: 12.5, color: 'var(--muted)', margin: '6px 0 0' }}>
          This guide is being written. It will appear here — no update needed on your side.
        </p>
      </div>
      <SectionLabel>Ready now</SectionLabel>
      <div className="uni-list">
        {publishedArticles().map((a) => (
          <button key={a.slug} className="uni-row" onClick={() => navigate(`/university/article/${a.slug}`)}>
            {a.title}
            <span className="uni-arr">
              <ChevronRight size={15} />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ArticleView() {
  const navigate = useNavigate();
  const { articleSlug } = useParams();
  const [params] = useSearchParams();
  const isPreview = params.get('preview') === '1';
  const stored = articleSlug ? getArticle(articleSlug) : undefined;
  const article = stored && (stored.status === 'published' || isPreview) ? stored : undefined;
  const [helpful, setHelpful] = useState<'yes' | 'no' | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);

  if (!article) return <ComingSoon slug={articleSlug ?? ''} />;

  const vote = (v: 'yes' | 'no') => {
    setHelpful(v);
    console.info('[university] article_feedback', article.slug, v);
  };

  return (
    <>
      <div className="uni-scroll">
        <div className="uni-topline" style={{ marginBottom: 4 }}>
          <button className="uni-crumb" onClick={() => navigate('/university')}>
            <ChevronLeft size={13} /> {article.topic}
          </button>
          <span className="uni-langpill">
            <button className="on">EN</button>
            <button>اردو</button>
          </span>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', margin: '10px 0 4px' }}>
          <SwingTag>{article.topic}</SwingTag>
          <Stamp>Verified by Fleek</Stamp>
        </div>
        <h1 className="uni-atitle">{article.title}</h1>
        <div className="uni-ameta">
          <span>⏱ {article.readMins} min</span>
          <span>·</span>
          <span>{article.updated}</span>
        </div>

        {article.blocks.map((b, i) => (
          <Block key={i} block={b} onNavigate={(slug) => navigate(`/university/article/${slug}`)} />
        ))}

        <div className="uni-helpful">
          Did this solve it?
          <button className={`uni-hbtn${helpful === 'yes' ? ' picked' : ''}`} style={{ marginLeft: 'auto' }} onClick={() => vote('yes')}>
            <ThumbsUp size={12} style={{ verticalAlign: -1 }} /> Yes
          </button>
          <button className={`uni-hbtn${helpful === 'no' ? ' picked' : ''}`} onClick={() => vote('no')}>
            <ThumbsDown size={12} style={{ verticalAlign: -1 }} /> No
          </button>
        </div>

        <button className="uni-btn uni-btn--ink" style={{ marginTop: 18 }} onClick={() => setHelpOpen(true)}>
          <MessageCircle size={16} /> Still stuck? Chat with us
        </button>
      </div>
      {helpOpen && <HelpSheet onClose={() => setHelpOpen(false)} />}
    </>
  );
}
