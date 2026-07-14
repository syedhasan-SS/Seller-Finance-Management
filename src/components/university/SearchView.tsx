import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, MessageCircle, PenLine, Search } from 'lucide-react';
import { SectionLabel } from './kit';
import { comingSoon, slugify, topics } from './data';
import { publishedArticles } from './store';
import HelpSheet from './HelpSheet';

/** Live search across ready articles and in-progress titles. Every query would be logged in production. */
export default function SearchView() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get('q') ?? '');
  const [helpOpen, setHelpOpen] = useState(false);

  const needle = q.trim().toLowerCase();
  const ready = useMemo(() => {
    const all = publishedArticles();
    return needle ? all.filter((a) => `${a.title} ${a.topic}`.toLowerCase().includes(needle)) : all;
  }, [needle]);
  const drafts = useMemo(() => {
    const all = Object.entries(comingSoon).flatMap(([topicSlug, titles]) =>
      titles.map((t) => ({ topicSlug, title: t })),
    );
    return needle ? all.filter((d) => d.title.toLowerCase().includes(needle)) : [];
  }, [needle]);

  return (
    <>
      <div className="uni-scroll">
        <div className="uni-topline" style={{ marginBottom: 12 }}>
          <button className="uni-crumb" onClick={() => navigate('/university')}>
            <ChevronLeft size={13} /> Seller University
          </button>
        </div>
        <div className="uni-searchinput">
          <Search size={16} />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search — “payment”, “bank”, “shipping”…"
            aria-label="Search guides"
          />
        </div>

        <SectionLabel>{needle ? `Results for “${q.trim()}”` : 'All guides'}</SectionLabel>
        {ready.length > 0 && (
          <div className="uni-list">
            {ready.map((a) => (
              <button key={a.slug} className="uni-row" onClick={() => navigate(`/university/article/${a.slug}`)}>
                <span>
                  {a.title}
                  <span style={{ display: 'block', fontSize: 10, color: 'var(--muted)' }}>
                    {a.topic} · {a.readMins} min
                  </span>
                </span>
                <span className="uni-arr">
                  <ChevronRight size={15} />
                </span>
              </button>
            ))}
          </div>
        )}

        {drafts.length > 0 && (
          <>
            <SectionLabel>Being written</SectionLabel>
            <div className="uni-list">
              {drafts.map((d) => (
                <button
                  key={d.title}
                  className="uni-row"
                  style={{ color: 'var(--muted)' }}
                  onClick={() => navigate(`/university/article/${slugify(d.title)}`)}
                >
                  <PenLine size={14} />
                  {d.title}
                  <span className="uni-arr" style={{ fontSize: 10, fontWeight: 700 }}>
                    soon
                  </span>
                </button>
              ))}
            </div>
          </>
        )}

        {needle && ready.length === 0 && drafts.length === 0 && (
          <div className="uni-noresult">
            Nothing yet for <b>“{q.trim()}”</b>.<br />
            This search is logged — it tells our team what to write next.
          </div>
        )}

        <button className="uni-btn uni-btn--ghost" style={{ marginTop: 18 }} onClick={() => setHelpOpen(true)}>
          <MessageCircle size={16} /> Can&rsquo;t find it? Talk to us
        </button>

        <SectionLabel>Browse instead</SectionLabel>
        <div className="uni-chiprow">
          {topics.map((t) => (
            <button key={t.slug} className="uni-chip" onClick={() => navigate(`/university/topic/${t.slug}`)}>
              {t.title}
            </button>
          ))}
        </div>
      </div>
      {helpOpen && <HelpSheet onClose={() => setHelpOpen(false)} />}
    </>
  );
}
