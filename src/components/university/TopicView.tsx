import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, PenLine } from 'lucide-react';
import { SectionLabel, SwingTag } from './kit';
import { comingSoon, slugify, topics } from './data';
import { publishedArticles } from './store';

/** Topic (category) page — what a home-screen tile opens. */
export default function TopicView() {
  const navigate = useNavigate();
  const { topicSlug } = useParams();
  const topic = topics.find((t) => t.slug === topicSlug) ?? topics[0];
  const ready = publishedArticles().filter((a) => a.topic === topic.title);
  const drafts = comingSoon[topic.slug] ?? [];

  return (
    <div className="uni-scroll">
      <div className="uni-topline" style={{ marginBottom: 4 }}>
        <button className="uni-crumb" onClick={() => navigate('/university')}>
          <ChevronLeft size={13} /> Seller University
        </button>
        <span className="uni-langpill">
          <button className="on">EN</button>
          <button>اردو</button>
        </span>
      </div>

      <div style={{ margin: '12px 0 6px' }}>
        <SwingTag>{topic.title}</SwingTag>
      </div>
      <h1 className="uni-atitle">{topic.title}</h1>
      <div className="uni-ameta">
        <span>
          {ready.length} ready · {drafts.length} being written
        </span>
      </div>

      {ready.length > 0 && (
        <>
          <SectionLabel>Guides</SectionLabel>
          <div className="uni-list">
            {ready.map((a) => (
              <button key={a.slug} className="uni-row" onClick={() => navigate(`/university/article/${a.slug}`)}>
                {a.title}
                <span className="uni-arr">
                  <ChevronRight size={15} />
                </span>
              </button>
            ))}
          </div>
        </>
      )}

      {drafts.length > 0 && (
        <>
          <SectionLabel>Being written</SectionLabel>
          <div className="uni-list">
            {drafts.map((title) => (
              <button
                key={title}
                className="uni-row"
                style={{ color: 'var(--muted)' }}
                onClick={() => navigate(`/university/article/${slugify(title)}`)}
              >
                <PenLine size={14} />
                {title}
                <span className="uni-arr" style={{ fontSize: 10, fontWeight: 700 }}>
                  soon
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
