import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Award, RotateCcw } from 'lucide-react';
import { GradeStack, StrokeProgress } from './kit';
import { courses, quizQuestions } from './data';

/** End-of-course quiz → badge. Nothing locks; retry freely (wireframes S3 rule). */
export default function QuizView() {
  const navigate = useNavigate();
  const { courseSlug } = useParams();
  const course = courses.find((c) => c.slug === courseSlug) ?? courses[0];
  const [answers, setAnswers] = useState<(number | null)[]>(quizQuestions.map(() => null));
  const [submitted, setSubmitted] = useState(false);

  const score = answers.filter((a, i) => a === quizQuestions[i].correct).length;
  const allAnswered = answers.every((a) => a !== null);
  const passed = submitted && score === quizQuestions.length;

  const pick = (qi: number, oi: number) => {
    if (submitted) return;
    setAnswers((prev) => prev.map((a, i) => (i === qi ? oi : a)));
  };

  return (
    <div className="uni-scroll">
      <div className="uni-topline" style={{ marginBottom: 10 }}>
        <button className="uni-crumb" onClick={() => navigate(`/university/course/${course.slug}`)}>
          <ArrowLeft size={13} /> {course.title}
        </button>
      </div>

      <h1 className="uni-atitle" style={{ marginTop: 0 }}>
        Quiz — earn your badge
      </h1>
      <div className="uni-greet" style={{ marginBottom: 10 }}>
        {quizQuestions.length} quick questions. Wrong answers show the right one — retry anytime.
      </div>
      <StrokeProgress pct={(answers.filter((a) => a !== null).length / quizQuestions.length) * 100} label="Quiz progress" />

      {quizQuestions.map((qq, qi) => (
        <div key={qq.q} style={{ marginTop: 20 }}>
          <div className="uni-qnum">QUESTION {qi + 1} OF {quizQuestions.length}</div>
          <div style={{ fontWeight: 800, fontSize: 14.5, margin: '4px 0 2px' }}>{qq.q}</div>
          {qq.options.map((opt, oi) => {
            let cls = 'uni-opt';
            if (submitted) {
              if (oi === qq.correct) cls += ' correct';
              else if (answers[qi] === oi) cls += ' wrong';
            } else if (answers[qi] === oi) {
              cls += ' sel';
            }
            return (
              <button key={opt} className={cls} onClick={() => pick(qi, oi)}>
                {opt}
              </button>
            );
          })}
        </div>
      ))}

      {!submitted ? (
        <button
          className="uni-btn"
          style={{ marginTop: 22, opacity: allAnswered ? 1 : 0.5 }}
          disabled={!allAnswered}
          onClick={() => {
            setSubmitted(true);
            console.info('[university] quiz_submitted', course.slug, `${score}/${quizQuestions.length}`);
          }}
        >
          <Award size={16} /> Check my answers
        </button>
      ) : passed ? (
        <div className="uni-badgecard">
          <span className="uni-bigstamp">Badge earned</span>
          <div style={{ margin: '16px 0 6px', fontWeight: 800, fontSize: 15 }}>
            {score}/{quizQuestions.length} — you know your grades!
          </div>
          <div style={{ marginBottom: 12 }}>
            <GradeStack />
          </div>
          <button className="uni-btn" onClick={() => navigate('/university')}>
            Back to Seller University
          </button>
        </div>
      ) : (
        <>
          <div className="uni-noresult" style={{ marginTop: 22 }}>
            {score}/{quizQuestions.length} correct — the green answers show what to remember.
          </div>
          <button
            className="uni-btn uni-btn--ghost"
            style={{ marginTop: 10 }}
            onClick={() => {
              setAnswers(quizQuestions.map(() => null));
              setSubmitted(false);
            }}
          >
            <RotateCcw size={15} /> Try again
          </button>
        </>
      )}
    </div>
  );
}
