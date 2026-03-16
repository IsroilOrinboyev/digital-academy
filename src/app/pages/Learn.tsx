import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { courses } from '@/app/data/courses';
import { Button } from '@/app/components/ui/button';
import { ArrowLeft, CheckCircle, PlayCircle } from 'lucide-react';
import { toast } from 'sonner';

interface LectureProgress {
  completedLectures: string[];
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

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col overflow-hidden">
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
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
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
        </div>

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
                    onClick={() => { setCurrentSection(sIdx); setCurrentLecture(lIdx); }}
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
