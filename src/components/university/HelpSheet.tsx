import { MessageCircle, Phone, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SectionLabel } from './kit';
import { publishedArticles } from './store';

interface Props {
  onClose: () => void;
}

/**
 * Deflection sheet — replaces the bare "Contact support" action.
 * Prototype logs the events that define the deflection metric.
 */
export default function HelpSheet({ onClose }: Props) {
  const navigate = useNavigate();

  // Real published articles, payout topics first — the #1 contact driver.
  const published = publishedArticles();
  const suggestions = [
    ...published.filter((a) => a.topic === 'Get Paid'),
    ...published.filter((a) => a.topic !== 'Get Paid'),
  ].slice(0, 3);

  const openSuggestion = (slug: string) => {
    console.info('[university] deflection: suggestion_opened', slug);
    onClose();
    navigate(`/university/article/${slug}`);
  };

  const escalate = (channel: 'chat' | 'whatsapp') => {
    console.info('[university] deflection: escalated', channel);
    onClose();
  };

  return (
    <div className="uni-dim" role="dialog" aria-label="Get help" onClick={onClose}>
      <div className="uni-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="uni-grabber" />
        <div className="uni-atitle" style={{ fontSize: 19, margin: '0 0 2px' }}>
          Tell us what&rsquo;s wrong
        </div>
        <div className="uni-greet" style={{ marginBottom: 12 }}>
          We&rsquo;ll try to fix it right now.
        </div>
        <div className="uni-search">
          <Search size={15} />
          my payment is late…
        </div>
        <SectionLabel>These usually solve it</SectionLabel>
        {suggestions.map((s) => (
          <button key={s.slug} className="uni-sug" onClick={() => openSuggestion(s.slug)}>
            <span className="si">
              <Search size={14} />
            </span>
            <span>
              <b>{s.title}</b>
              <span>
                {s.topic} · {s.readMins} min
              </span>
            </span>
          </button>
        ))}
        <div className="uni-or">or</div>
        <button className="uni-btn" style={{ marginTop: 8 }} onClick={() => escalate('chat')}>
          <MessageCircle size={16} /> Chat with support
        </button>
        <button className="uni-btn uni-btn--ghost" style={{ marginTop: 8 }} onClick={() => escalate('whatsapp')}>
          <Phone size={16} /> WhatsApp us
        </button>
        <div className="uni-sla">Replies in ~15 min, 9am–9pm PKT</div>
      </div>
    </div>
  );
}
