import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { courses } from '@/app/data/courses';
import { courseQuizzes, type SectionQuiz } from '@/app/data/quizzes';
import { Button } from '@/app/components/ui/button';
import { ArrowLeft, CheckCircle, PlayCircle } from 'lucide-react';
import { toast } from 'sonner';

interface LectureProgress {
  completedLectures: string[];
}

function QuizIdle({ quiz, courseId, onStart }: { quiz: SectionQuiz; courseId: string; onStart: () => void }) {
  const stored = JSON.parse(localStorage.getItem(`quiz_${courseId}_${quiz.sectionIndex}`) ?? 'null');
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-700 rounded-xl p-8 text-center">
        <div className="text-5xl mb-4">📝</div>
        <h2 className="text-2xl font-bold mb-2">{quiz.title}</h2>
        <p className="text-gray-400 mb-6">{quiz.questions.length} questions · Multiple choice · Pass with 60%</p>
        {stored && (
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6 ${stored.passed ? 'bg-green-900/50 text-green-300' : 'bg-yellow-900/50 text-yellow-300'}`}>
            {stored.passed ? '✅' : '⚠️'} Best score: {stored.score}/{stored.total} ({Math.round((stored.score / stored.total) * 100)}%)
          </div>
        )}
        <button onClick={onStart} className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors">
          {stored ? 'Retake Quiz' : 'Start Quiz'}
        </button>
      </div>
    </div>
  );
}

function QuizTaking({ quiz, selectedAnswers, submitted, onSelect, onSubmit }: {
  quiz: SectionQuiz; selectedAnswers: Record<number, number>; submitted: boolean;
  onSelect: (qId: number, optIdx: number) => void; onSubmit: () => void;
}) {
  const answered = Object.keys(selectedAnswers).length;
  const total = quiz.questions.length;
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold">{quiz.title}</h2>
        <span className="text-sm text-gray-400">{answered}/{total} answered</span>
      </div>
      {quiz.questions.map((q, idx) => {
        const selected = selectedAnswers[q.id];
        return (
          <div key={q.id} className="bg-gray-700 rounded-xl p-5">
            <p className="font-medium mb-4 text-sm leading-relaxed">
              <span className="text-purple-400 font-bold mr-2">Q{idx + 1}.</span>{q.question}
            </p>
            <div className="space-y-2">
              {q.options.map((opt, oIdx) => {
                let cls = 'border border-gray-600 text-gray-300 hover:border-purple-400 hover:text-white';
                if (submitted) {
                  if (oIdx === q.correctIndex) cls = 'border-green-500 bg-green-900/30 text-green-300';
                  else if (selected === oIdx) cls = 'border-red-500 bg-red-900/30 text-red-300';
                  else cls = 'border-gray-700 text-gray-500';
                } else if (selected === oIdx) {
                  cls = 'border-purple-500 bg-purple-900/30 text-purple-300';
                }
                return (
                  <button key={oIdx} onClick={() => onSelect(q.id, oIdx)}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all ${cls} ${submitted ? 'cursor-default' : 'cursor-pointer'}`}>
                    <span className="font-bold mr-2">{String.fromCharCode(65 + oIdx)}.</span>{opt}
                  </button>
                );
              })}
            </div>
            {submitted && (
              <p className="mt-3 text-xs text-gray-400 bg-gray-800 rounded p-2">
                💡 <strong>Explanation:</strong> {q.explanation}
              </p>
            )}
          </div>
        );
      })}
      {!submitted && (
        <button onClick={onSubmit} disabled={answered < total}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-colors">
          {answered < total ? `Answer all questions (${answered}/${total})` : 'Submit Quiz'}
        </button>
      )}
    </div>
  );
}

function QuizResults({ quiz, selectedAnswers, courseId, sectionIdx, onRetake, onContinue }: {
  quiz: SectionQuiz; selectedAnswers: Record<number, number>; courseId: string; sectionIdx: number;
  onRetake: () => void; onContinue: () => void;
}) {
  const correct = quiz.questions.filter(q => selectedAnswers[q.id] === q.correctIndex).length;
  const total = quiz.questions.length;
  const pct = Math.round((correct / total) * 100);
  const passed = pct >= 60;
  return (
    <div className="max-w-2xl mx-auto">
      <div className={`rounded-xl p-8 text-center mb-6 ${passed ? 'bg-green-900/30 border border-green-700' : 'bg-yellow-900/30 border border-yellow-700'}`}>
        <div className="text-5xl mb-3">{passed ? '🎉' : '📚'}</div>
        <h2 className="text-2xl font-bold mb-1">{passed ? 'Quiz Passed!' : 'Keep Studying!'}</h2>
        <p className="text-gray-400 mb-4">{quiz.title}</p>
        <div className="text-5xl font-black mb-2" style={{ color: passed ? '#4ade80' : '#facc15' }}>{pct}%</div>
        <p className="text-gray-400 text-sm">{correct} out of {total} correct</p>
        <p className="text-xs text-gray-500 mt-1">{passed ? 'Minimum 60% to pass' : 'You need 60% to pass — review the material and try again'}</p>
      </div>
      <div className="flex gap-3 justify-center">
        <button onClick={onRetake} className="px-6 py-3 border border-gray-600 text-gray-300 hover:border-white hover:text-white rounded-lg font-medium transition-colors">
          Retake Quiz
        </button>
        <button onClick={onContinue} className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
          Continue Learning →
        </button>
      </div>
    </div>
  );
}

export default function Learn() {
  const { courseId } = useParams<{ courseId: string }>();
  const course = courses.find(c => c.id === courseId);
  const [currentSection, setCurrentSection] = useState(0);
  const [currentLecture, setCurrentLecture] = useState(0);
  const [progress, setProgress] = useState<LectureProgress>(() => {
    try {
      const stored = localStorage.getItem(`progress_${courseId}`);
      return stored ? JSON.parse(stored) : { completedLectures: [] };
    } catch { return { completedLectures: [] }; }
  });

  const [activeView, setActiveView] = useState<'video' | 'quiz'>('video');
  const [quizState, setQuizState] = useState<'idle' | 'taking' | 'results'>('idle');
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  useEffect(() => {
    localStorage.setItem(`progress_${courseId}`, JSON.stringify(progress));
  }, [progress, courseId]);

  if (!course) return <div className="p-8 text-center">Course not found</div>;

  const totalLectures = course.curriculum.reduce((sum, s) => sum + s.lectures, 0);
  const completedCount = progress.completedLectures.length;
  const completionPercent = totalLectures > 0 ? Math.round((completedCount / totalLectures) * 100) : 0;

  const lectureKey = `${currentSection}-${currentLecture}`;
  const isCompleted = progress.completedLectures.includes(lectureKey);

  const markComplete = () => {
    if (!isCompleted) {
      setProgress(prev => ({ completedLectures: [...prev.completedLectures, lectureKey] }));
      toast.success('Lecture marked as complete!');
    }
  };

  const sectionQuiz = courseQuizzes[courseId ?? '']?.[currentSection];

  const bestScore = sectionQuiz
    ? JSON.parse(localStorage.getItem(`quiz_${courseId}_${currentSection}`) ?? 'null')
    : null;

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col overflow-hidden">
      {/* Top header bar */}
      <div className="bg-gray-800 px-4 py-3 flex items-center gap-4 border-b border-gray-700 flex-shrink-0">
        <Link to={`/course/${course.id}`}>
          <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold truncate text-sm">{course.title}</h1>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400 flex-shrink-0">
          <div className="w-24 bg-gray-600 rounded-full h-2">
            <div className="bg-purple-500 h-2 rounded-full transition-all" style={{ width: `${completionPercent}%` }} />
          </div>
          <span>{completionPercent}% complete</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          {/* Tab bar */}
          <div className="flex border-b border-gray-700 bg-gray-800 flex-shrink-0">
            <button onClick={() => { setActiveView('video'); setQuizState('idle'); }}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeView === 'video' ? 'border-purple-400 text-white' : 'border-transparent text-gray-400 hover:text-white'}`}>
              📹 Video Lecture
            </button>
            <button onClick={() => setActiveView('quiz')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeView === 'quiz' ? 'border-purple-400 text-white' : 'border-transparent text-gray-400 hover:text-white'}`}>
              📝 Section Quiz
              {bestScore?.passed && (
                <span className="ml-2 text-xs bg-green-800 text-green-300 px-1.5 py-0.5 rounded-full">
                  {Math.round((bestScore.score / bestScore.total) * 100)}%
                </span>
              )}
            </button>
          </div>

          {/* Video view */}
          {activeView === 'video' && (
            <>
              <div className="bg-black flex items-center justify-center flex-shrink-0" style={{ height: '60%' }}>
                <div className="text-center">
                  <PlayCircle className="w-20 h-20 text-purple-400 mx-auto mb-4" />
                  <p className="text-gray-400">
                    {course.curriculum[currentSection]?.section} — Lecture {currentLecture + 1}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Video content here</p>
                </div>
              </div>
              <div className="p-6 bg-gray-800 overflow-y-auto flex-1 min-h-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold">{course.curriculum[currentSection]?.section}</h2>
                    <p className="text-gray-400 text-sm mt-1">Lecture {currentLecture + 1} of {course.curriculum[currentSection]?.lectures}</p>
                  </div>
                  <Button
                    onClick={markComplete}
                    className={isCompleted ? 'bg-green-600 hover:bg-green-700 flex-shrink-0' : 'bg-purple-600 hover:bg-purple-700 flex-shrink-0'}
                    size="sm"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    {isCompleted ? 'Completed' : 'Mark Complete'}
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Quiz view */}
          {activeView === 'quiz' && (
            <div className="flex-1 overflow-y-auto p-6 bg-gray-800 min-h-0">
              {!sectionQuiz ? (
                <div className="text-center py-16 text-gray-400">
                  <p className="text-4xl mb-4">📝</p>
                  <p className="text-lg">No quiz available for this section yet.</p>
                </div>
              ) : quizState === 'idle' ? (
                <QuizIdle quiz={sectionQuiz} courseId={courseId!} onStart={() => { setQuizState('taking'); setSelectedAnswers({}); setQuizSubmitted(false); }} />
              ) : quizState === 'taking' ? (
                <QuizTaking quiz={sectionQuiz} selectedAnswers={selectedAnswers} submitted={quizSubmitted}
                  onSelect={(qId, optIdx) => !quizSubmitted && setSelectedAnswers(prev => ({ ...prev, [qId]: optIdx }))}
                  onSubmit={() => {
                    setQuizSubmitted(true);
                    const correct = sectionQuiz.questions.filter(q => selectedAnswers[q.id] === q.correctIndex).length;
                    const total = sectionQuiz.questions.length;
                    const passed = correct / total >= 0.6;
                    const existing = JSON.parse(localStorage.getItem(`quiz_${courseId}_${currentSection}`) ?? '{}');
                    if (!existing.passed || correct > (existing.correct ?? 0)) {
                      localStorage.setItem(`quiz_${courseId}_${currentSection}`, JSON.stringify({ score: correct, total, passed, correct }));
                    }
                    setTimeout(() => setQuizState('results'), 800);
                  }} />
              ) : (
                <QuizResults quiz={sectionQuiz} selectedAnswers={selectedAnswers} courseId={courseId!} sectionIdx={currentSection}
                  onRetake={() => { setQuizState('taking'); setSelectedAnswers({}); setQuizSubmitted(false); }}
                  onContinue={() => { setActiveView('video'); setQuizState('idle'); }} />
              )}
            </div>
          )}
        </div>

        {/* Sidebar: course content */}
        <div className="w-80 bg-gray-800 border-l border-gray-700 overflow-y-auto flex-shrink-0">
          <div className="p-4 border-b border-gray-700 sticky top-0 bg-gray-800">
            <h3 className="font-semibold">Course Content</h3>
            <p className="text-sm text-gray-400">{completedCount}/{totalLectures} completed</p>
          </div>
          {course.curriculum.map((section, sIdx) => (
            <div key={sIdx}>
              <div className="px-4 py-3 bg-gray-900 border-b border-gray-700">
                <p className="font-medium text-sm">{section.section}</p>
                <p className="text-xs text-gray-400">{section.lectures} lectures • {section.duration}</p>
              </div>
              {Array.from({ length: section.lectures }).map((_, lIdx) => {
                const key = `${sIdx}-${lIdx}`;
                const done = progress.completedLectures.includes(key);
                const active = currentSection === sIdx && currentLecture === lIdx;
                return (
                  <button
                    key={lIdx}
                    onClick={() => { setCurrentSection(sIdx); setCurrentLecture(lIdx); setActiveView('video'); setQuizState('idle'); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm hover:bg-gray-700 transition-colors border-b border-gray-700/50 ${active ? 'bg-gray-700 border-l-2 border-purple-400' : ''}`}
                  >
                    {done
                      ? <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      : <PlayCircle className={`w-4 h-4 flex-shrink-0 ${active ? 'text-purple-400' : 'text-gray-500'}`} />
                    }
                    <span className={`${done ? 'text-gray-400' : ''} truncate`}>Lecture {lIdx + 1}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
