import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { initSyncPublic } from './store';
import { GraduationCap, Home as HomeIcon, Package, Tag, User } from 'lucide-react';
import './university.css';
import UniversityHome from './UniversityHome';
import LessonPlayer from './LessonPlayer';
import ArticleView from './ArticleView';
import TopicView from './TopicView';
import SearchView from './SearchView';
import QuizView from './QuizView';
import UpdatesView from './UpdatesView';

/**
 * Seller University — mobile prototype (wireframes v3).
 * Mounted at /university. Mock data only; no auth, no API.
 * Renders as a phone-width shell so it can be reviewed on desktop too.
 */
export default function UniversityApp() {
  const [lang, setLang] = useState<'en' | 'ur'>('en');
  const [, setSynced] = useState(false);
  useEffect(() => {
    // Pull published content from the server when the API is available
    initSyncPublic().then(() => setSynced(true));
  }, []);

  return (
    <div className="uni-app">
      {import.meta.env.DEV && <span className="uni-proto">DEV PREVIEW</span>}
      <div className="uni-shell">
        <Routes>
          <Route index element={<UniversityHome lang={lang} setLang={setLang} />} />
          <Route path="course/:courseSlug" element={<LessonPlayer />} />
          <Route path="quiz/:courseSlug" element={<QuizView />} />
          <Route path="topic/:topicSlug" element={<TopicView />} />
          <Route path="search" element={<SearchView />} />
          <Route path="updates" element={<UpdatesView />} />
          <Route path="article/:articleSlug" element={<ArticleView />} />
        </Routes>
        <nav className="uni-tabbar" aria-label="App navigation (visual only in prototype)">
          <button className="uni-tab">
            <HomeIcon size={17} />
            Home
          </button>
          <button className="uni-tab">
            <Tag size={17} />
            Listings
          </button>
          <button className="uni-tab">
            <Package size={17} />
            Orders
          </button>
          <button className="uni-tab on">
            <GraduationCap size={17} />
            Help
          </button>
          <button className="uni-tab">
            <User size={17} />
            Account
          </button>
        </nav>
      </div>
    </div>
  );
}
