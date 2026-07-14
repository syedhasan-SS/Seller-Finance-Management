import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, Check, Play } from 'lucide-react';
import { SectionLabel, StrokeProgress } from './kit';
import { courses } from './data';

export default function LessonPlayer() {
  const navigate = useNavigate();
  const { courseSlug } = useParams();
  const course = courses.find((c) => c.slug === courseSlug) ?? courses[0];
  // Prototype progress state: index of the current lesson (earlier = done).
  const [current, setCurrent] = useState(2);

  const lesson = course.lessons[current];
  const pct = (current / course.lessons.length) * 100;

  const isQuiz = (i: number) => course.lessons[i].title.toLowerCase().startsWith('quiz');

  const markDone = () => {
    console.info('[university] lesson_completed', course.slug, lesson.id);
    const next = Math.min(current + 1, course.lessons.length - 1);
    if (isQuiz(next)) {
      navigate(`/university/quiz/${course.slug}`);
      return;
    }
    setCurrent(next);
  };

  return (
    <div className="uni-scroll" style={{ padding: 0, paddingBottom: 96 }}>
      <div className="uni-player">
        <button className="uni-back" aria-label="Back" onClick={() => navigate('/university')}>
          <ArrowLeft size={16} />
        </button>
        <span className="uni-play">
          <Play size={20} fill="currentColor" />
        </span>
        <span className="uni-ptag uni-ptag--l">
          Lesson {current + 1} · {lesson.duration}
        </span>
        <span className="uni-ptag uni-ptag--r">اردو voice-over ▾</span>
      </div>

      <div style={{ padding: '16px 16px 0' }}>
        <div className="uni-greet" style={{ marginBottom: 2 }}>
          {course.title} · Lesson {current + 1} of {course.lessons.length}
        </div>
        <div className="uni-atitle" style={{ fontSize: 19, margin: '0 0 10px' }}>
          {lesson.title}
        </div>
        <StrokeProgress pct={pct} label={`${course.title} progress`} />
        <div className="uni-greet" style={{ margin: '6px 0 14px' }}>
          {Math.round(pct)}% of this path done — keep going! 🔥
        </div>

        <div className="uni-inshort">
          <b>In short:</b> price by grade and weight, check the &ldquo;similar lots&rdquo; range, and leave room for
          bulk offers.
        </div>

        <SectionLabel>In this path</SectionLabel>
        <div className="uni-list">
          {course.lessons.map((l, i) => {
            const state = i < current ? 'done' : i === current ? 'now' : 'todo';
            return (
              <button
                key={l.id}
                className={`uni-lessonrow${state === 'now' ? ' now' : ''}`}
                onClick={() => (isQuiz(i) ? navigate(`/university/quiz/${course.slug}`) : setCurrent(i))}
              >
                <span className={`uni-lst uni-lst--${state}`}>
                  {state === 'done' ? <Check size={12} /> : state === 'now' ? <Play size={10} fill="currentColor" /> : i + 1}
                </span>
                {l.title}
                <span className="uni-dur">{l.duration}</span>
              </button>
            );
          })}
        </div>

        <button className="uni-btn" style={{ marginTop: 16 }} onClick={markDone}>
          <Check size={16} /> Mark done · Next lesson
        </button>
        <button
          className="uni-btn uni-btn--ghost"
          style={{ marginTop: 8 }}
          onClick={() => navigate('/university/article/change-your-bank-account')}
        >
          <BookOpen size={16} /> Read this lesson as an article
        </button>
      </div>
    </div>
  );
}
