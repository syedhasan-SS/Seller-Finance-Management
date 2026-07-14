import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  Compass,
  MessageCircle,
  Package,
  Play,
  Rocket,
  Search,
  Sprout,
  Tag,
  TrendingUp,
  Wallet,
  Wrench,
} from 'lucide-react';
import { Marker, SectionLabel, StrokeProgress } from './kit';
import { courses, quickAnswers, topics } from './data';
import HelpSheet from './HelpSheet';

const topicIcons = {
  rocket: Rocket,
  tag: Tag,
  package: Package,
  wallet: Wallet,
  wrench: Wrench,
  sprout: Sprout,
} as const;

/**
 * Launch gate: the course/lesson content is still placeholder material.
 * Flip to true once real lessons are written (PRD P6, Nov) — the lesson
 * player, quiz and progress UI are already built and route-reachable.
 */
const SHOW_COURSES = false;

interface Props {
  lang: 'en' | 'ur';
  setLang: (l: 'en' | 'ur') => void;
}

export default function UniversityHome({ lang, setLang }: Props) {
  const navigate = useNavigate();
  const [helpOpen, setHelpOpen] = useState(false);
  const ur = lang === 'ur';

  return (
    <>
      <div className="uni-scroll">
        <div className="uni-topline">
          <span className="uni-greet">{ur ? 'سلام! 👋' : 'Salaam! 👋'}</span>
          <span className="uni-langpill">
            <button className={ur ? '' : 'on'} onClick={() => setLang('en')}>
              EN
            </button>
            <button className={ur ? 'on' : ''} onClick={() => setLang('ur')}>
              اردو
            </button>
          </span>
        </div>

        <div className="uni-hero">
          <span className="uni-heropill">SELLER UNIVERSITY</span>
          <div className="uni-herotitle" dir={ur ? 'rtl' : 'ltr'}>
            {ur ? (
              <>
                سیکھیں۔ زیادہ بیچیں۔ <Marker>پیسے پائیں۔</Marker>
              </>
            ) : (
              <>
                Learn it. Sell more.
                <br />
                <Marker>Get paid.</Marker>
              </>
            )}
          </div>
          <button className="uni-search" onClick={() => navigate('/university/search')}>
            <Search size={15} />
            {ur ? 'تلاش کریں — “پیمنٹ”، “بینک”، “شپنگ”…' : 'Search — try “payment”, “bank”, “shipping”…'}
          </button>
          <div className="uni-chiprow">
            {['payout', 'bank', 'grading'].map((c) => (
              <button key={c} className="uni-chip" onClick={() => navigate(`/university/search?q=${c}`)}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {SHOW_COURSES && (
          <>
            <SectionLabel>{ur ? 'سیکھنا جاری رکھیں' : 'Continue learning'}</SectionLabel>
            <button className="uni-resume" onClick={() => navigate('/university/course/new-seller-journey')}>
              <span className="uni-thumb">
                <Play size={18} fill="currentColor" />
              </span>
              <span style={{ flex: 1 }}>
                <b>New Seller Journey</b>
                <small>Lesson 3 of 7 · Price your lots to win</small>
                <StrokeProgress pct={43} label="New Seller Journey progress" />
              </span>
              <span style={{ fontSize: 11, fontWeight: 800 }}>Resume ›</span>
            </button>
          </>
        )}

        <SectionLabel>{ur ? 'موضوع چنیں' : 'Browse by topic'}</SectionLabel>
        <div className="uni-topics">
          {topics.map((t) => {
            const Icon = topicIcons[t.icon];
            return (
              <button key={t.slug} className="uni-topic" onClick={() => navigate(`/university/topic/${t.slug}`)}>
                <span className="c" style={{ background: t.tint }}>
                  <Icon size={20} />
                </span>
                {ur ? t.titleUr : t.title}
              </button>
            );
          })}
        </div>

        {SHOW_COURSES && (
          <>
            <SectionLabel>{ur ? 'سیکھنے کے راستے' : 'Learning paths'}</SectionLabel>
            {courses.map((c, i) => (
              <button key={c.slug} className="uni-path" onClick={() => navigate(`/university/course/${c.slug}`)}>
                <span className="pthumb" style={{ background: c.tint }}>
                  {i === 0 ? <Compass size={20} /> : <TrendingUp size={20} />}
                </span>
                <span>
                  <b>{c.title}</b>
                  <small>{c.subtitle}</small>
                </span>
                <span className="uni-badge" style={{ background: c.badge.bg, color: c.badge.color }}>
                  {c.badge.text}
                </span>
              </button>
            ))}
          </>
        )}

        <SectionLabel>{ur ? 'فوری جواب' : 'Quick answers'}</SectionLabel>
        <div className="uni-list">
          {quickAnswers.map((q) => (
            <button key={q.rank} className="uni-row" onClick={() => navigate(`/university/article/${q.articleSlug}`)}>
              <span className="uni-rank">#{q.rank}</span>
              {q.title}
              <span className="uni-arr">
                <ChevronRight size={15} />
              </span>
            </button>
          ))}
        </div>

        <button
          className="uni-banner"
          style={{ width: '100%', textAlign: 'left', border: 0, fontFamily: 'inherit', cursor: 'pointer' }}
          onClick={() => navigate('/university/updates')}
        >
          <b>📣 {ur ? 'عید کی چھٹیوں کا پک اپ شیڈول' : 'Eid holiday pickup schedule'}</b>
          <span>{ur ? 'پک اپ 27–29 جولائی بند۔ پیمنٹ متاثر نہیں ہوگی۔' : 'Pickups pause 27–29 Jul. Payouts are not affected. Tap for all updates ›'}</span>
        </button>

        <button className="uni-btn uni-btn--ghost" style={{ marginTop: 16 }} onClick={() => setHelpOpen(true)}>
          <MessageCircle size={16} /> {ur ? 'پھر بھی مسئلہ؟ ہم سے بات کریں' : 'Still stuck? Talk to us'}
        </button>
      </div>
      {helpOpen && <HelpSheet onClose={() => setHelpOpen(false)} />}
    </>
  );
}
