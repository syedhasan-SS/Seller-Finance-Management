import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { SectionLabel } from './kit';
import { listUpdates } from './store';

/** What's new — announcements feed, targeted per seller in production. */
export default function UpdatesView() {
  const navigate = useNavigate();
  return (
    <div className="uni-scroll">
      <div className="uni-topline" style={{ marginBottom: 4 }}>
        <button className="uni-crumb" onClick={() => navigate('/university')}>
          <ChevronLeft size={13} /> Seller University
        </button>
      </div>
      <h1 className="uni-atitle">What&rsquo;s new</h1>
      <div className="uni-greet">Changes that affect your shop — newest first.</div>
      <SectionLabel>Latest</SectionLabel>
      {listUpdates().map((u) => (
        <div key={u.id} className="uni-update">
          <span className="udate">{u.date}</span>
          {u.important && <span className="uni-imp">Important</span>}
          <b>{u.title}</b>
          <p>{u.body}</p>
        </div>
      ))}
    </div>
  );
}
