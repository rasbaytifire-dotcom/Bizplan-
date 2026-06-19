import { useState, useEffect } from 'react';
import { BookOpen, CheckSquare, Award, FileText, Compass, LogOut, Sliders, Globe, Wifi, WifiOff, HelpCircle, GraduationCap, Sun, Moon } from 'lucide-react';
import CourseView from './components/CourseView';
import QuizView from './components/QuizView';
import ExerciseView from './components/ExerciseView';
import LexiconView from './components/LexiconView';
import BmcView from './components/BmcView';
import ConfirmModal from './components/ConfirmModal';
import { initDB, getQuizAttempts, getLexicon } from './lib/db';
import { chapters } from './data/chapters';

export default function App() {
  const [activeTab, setActiveTab] = useState<'cours' | 'quiz' | 'bmc' | 'exercices' | 'lexique'>('cours');
  const [quizChapterFocus, setQuizChapterFocus] = useState<string>('intro');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  
  // Theme state settings (Local Storage persistence)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  // Track if a sub-activity is dirty/in-progress
  const [quizInProgress, setQuizInProgress] = useState<boolean>(false);
  const [exerciseInProgress, setExerciseInProgress] = useState<boolean>(false);

  // Leave active confirmation modal states
  const [showConfirmLeaveTab, setShowConfirmLeaveTab] = useState<boolean>(false);
  const [pendingTabChange, setPendingTabChange] = useState<'cours' | 'quiz' | 'bmc' | 'exercices' | 'lexique' | null>(null);

  // Stats aggregated
  const [quizCount, setQuizCount] = useState<number>(0);
  const [lexCount, setLexCount] = useState<number>(0);
  const [avgScore, setAvgScore] = useState<number>(0);

  // Initialize IndexedDB and read status metrics
  useEffect(() => {
    initDB()
      .then(() => {
        refreshDashboardStats();
      })
      .catch((err) => {
        console.error('Échec d’initialisation de la base IndexedDB:', err);
      });

    // Event listeners for offline/online network change detection
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [activeTab]);

  const refreshDashboardStats = async () => {
    try {
      const attempts = await getQuizAttempts();
      const lex = await getLexicon();
      setQuizCount(attempts.length);
      setLexCount(lex.length);

      if (attempts.length > 0) {
        const sum = attempts.reduce((acc, curr) => acc + (curr.score / curr.total), 0);
        setAvgScore(Math.round((sum / attempts.length) * 100));
      } else {
        setAvgScore(0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // S'assurer qu'au changement d'état, la classe HTML dark soit injectée/retirée
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Listener d'anti-rechargement accidentel si un travail est en cours
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const isDirty = (activeTab === 'quiz' && quizInProgress) || (activeTab === 'exercices' && exerciseInProgress);
      if (isDirty) {
        e.preventDefault();
        e.returnValue = 'Vous avez une activité en cours. Si vous quittez la page, vos modifications seront perdues.';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [quizInProgress, exerciseInProgress, activeTab]);

  const tryNavigateToTab = (newTab: typeof activeTab) => {
    if (newTab === activeTab) return;
    const isQuizDirty = activeTab === 'quiz' && quizInProgress;
    const isExerciseDirty = activeTab === 'exercices' && exerciseInProgress;
    
    if (isQuizDirty || isExerciseDirty) {
      setPendingTabChange(newTab);
      setShowConfirmLeaveTab(true);
    } else {
      setActiveTab(newTab);
    }
  };

  // Navigations raccourcies inter-composants
  const selectQuizAndNavigate = (chapterId: string) => {
    setQuizChapterFocus(chapterId);
    tryNavigateToTab('quiz');
  };

  const selectExerciseAndNavigate = (exerciseType: string) => {
    tryNavigateToTab('exercices');
  };

  // Compute calculated general academic progress
  const computedProgressPercentage = Math.min(
    Math.round(((quizCount / 7) * 40) + ((avgScore > 0 ? 1 : 0) * 30) + (lexCount > 10 ? 30 : 15)),
    100
  );

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 flex flex-col font-sans transition-colors duration-300" id="applet-container">
      
      {/* Academy Top Header Navigation */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-100 dark:border-slate-800 shadow-sm no-print transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Logo & Brand title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 dark:from-indigo-500 dark:to-indigo-700 text-white flex items-center justify-center shadow-md shadow-indigo-100 dark:shadow-none">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white font-sans">
                  BizPlan Academy
                </h1>
                
                {/* Real-time Dynamic PWA Offline Indicator */}
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isOnline 
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-455 border border-emerald-100 dark:border-emerald-900/30' 
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-455 border border-amber-100 dark:border-amber-900/30 animate-pulse'
                }`}>
                  {isOnline ? (
                    <>
                      <Wifi className="w-3 h-3 text-emerald-500 animate-pulse" />
                      Client En ligne
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3 h-3 text-amber-500" />
                      Mode Hors-ligne (PWA)
                    </>
                  )}
                </span>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Progressive Web App d'Apprentissage & Simulation</p>
            </div>
          </div>

          {/* Quick Stats Widget Pills */}
          <div className="flex items-center gap-3 md:gap-3.5 text-xs">
            {/* Dark Mode Switcher */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 sm:p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-150 dark:border-slate-800 text-slate-600 dark:text-slate-350 transition-all cursor-pointer flex items-center justify-center shrink-0"
              title={isDarkMode ? "Passer au mode clair" : "Passer au mode sombre"}
              id="btn-toggle-dark-mode"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-500 animate-[spin_10s_linear_infinite]" />
              ) : (
                <Moon className="w-4 h-4 text-slate-500 hover:text-slate-700" />
              )}
            </button>

            <div className="hidden md:flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/40 px-2.5 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800/80">
              <span className="text-slate-400 dark:text-slate-500 font-bold uppercase text-[9px]">Savoirs :</span>
              <span className="font-mono font-bold text-indigo-700 dark:text-indigo-400">{lexCount} concepts</span>
            </div>
            
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/40 px-2.5 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800/80">
              <span className="text-slate-400 dark:text-slate-500 font-bold uppercase text-[9px]">Succès moyen :</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{avgScore}%</span>
            </div>

            <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-800 pl-3">
              <div className="text-right">
                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">PROGRÈS ACADÉMIQUE</div>
                <div className="w-20 h-1.5 bg-slate-150 dark:bg-slate-800 rounded-full overflow-hidden mt-0.5">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-indigo-700 rounded-full transition-all duration-500"
                    style={{ width: `${computedProgressPercentage}%` }}
                  ></div>
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-indigo-900 dark:text-indigo-300 ml-1">
                {computedProgressPercentage}%
              </span>
            </div>
          </div>

        </div>
      </header>

      {/* Primary Navigation System Tab selection */}
      <nav className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 py-2.5 no-print transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-1 sm:gap-2">
            <button
              onClick={() => tryNavigateToTab('cours')}
              id="tab-btn-cours"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs md:text-sm font-semibold transition ${
                activeTab === 'cours'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 dark:shadow-none'
                  : 'text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              Syllabus & Cours
            </button>

            <button
              onClick={() => tryNavigateToTab('quiz')}
              id="tab-btn-quiz"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs md:text-sm font-semibold transition ${
                activeTab === 'quiz'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 dark:shadow-none'
                  : 'text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Award className="w-4 h-4 shrink-0" />
              Quiz Interactifs
            </button>

            <button
              onClick={() => tryNavigateToTab('bmc')}
              id="tab-btn-bmc"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs md:text-sm font-semibold transition ${
                activeTab === 'bmc'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 dark:shadow-none'
                  : 'text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Compass className="w-4 h-4 shrink-0" />
              Model Canvas
            </button>

            <button
              onClick={() => tryNavigateToTab('exercices')}
              id="tab-btn-exercices"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs md:text-sm font-semibold transition ${
                activeTab === 'exercices'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 dark:shadow-none'
                  : 'text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sliders className="w-4 h-4 shrink-0" />
              Ateliers Pratiques
            </button>

            <button
              onClick={() => tryNavigateToTab('lexique')}
              id="tab-btn-lexique"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs md:text-sm font-semibold transition ${
                activeTab === 'lexique'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 dark:shadow-none'
                  : 'text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Globe className="w-4 h-4 shrink-0" />
              Glossaire Bilingue
            </button>
          </div>
        </div>
      </nav>

      {/* Main Workspace Frame container */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        
        {/* Dynamic route rendering */}
        <div>
          {activeTab === 'cours' && (
            <CourseView 
              onStartQuiz={selectQuizAndNavigate} 
              onStartExercise={selectExerciseAndNavigate} 
            />
          )}

          {activeTab === 'quiz' && (
            <QuizView 
              initialChapterId={quizChapterFocus} 
              onNavigateToChapter={(chId) => {
                tryNavigateToTab('cours');
              }}
              onProgressChange={setQuizInProgress}
            />
          )}

          {activeTab === 'bmc' && <BmcView />}

          {activeTab === 'exercices' && (
            <ExerciseView 
              onProgressChange={setExerciseInProgress}
            />
          )}

          {activeTab === 'lexique' && <LexiconView />}
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800 mt-12 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-white font-bold">
              <GraduationCap className="w-5 h-5 text-indigo-400" />
              BizPlan Academy
            </div>
            <p className="text-[11px] leading-relaxed">
              Outil universitaire de simulation et de formation accélérée. Conçu pour faciliter la modélisation à l'aide de bases de données internes IndexedDB locales et service worker Workbox offline.
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wide">Mode PWA Activé</h4>
            <p className="text-[11px] leading-relaxed">
              Toutes les données saisies au sein de l'école (SWOT, Budget, Organigrammes, Notes de quiz) sont historisées localement dans votre explorateur crypté et ne traversent aucune route de serveur.
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wide">Menu d'appoint</h4>
            <div className="flex flex-wrap gap-2.5">
              <button onClick={() => tryNavigateToTab('cours')} className="hover:text-white transition cursor-pointer">Cours</button>
              <span>•</span>
              <button onClick={() => tryNavigateToTab('quiz')} className="hover:text-white transition cursor-pointer">Évaluations</button>
              <span>•</span>
              <button onClick={() => tryNavigateToTab('exercices')} className="hover:text-white transition cursor-pointer">Exercices</button>
              <span>•</span>
              <button onClick={() => tryNavigateToTab('lexique')} className="hover:text-white transition cursor-pointer">Lexique</button>
            </div>
            <div className="text-[10px] text-slate-500 mt-2">
              © {new Date().getFullYear()} BizPlan Academy. Tout droit de reproduction académique réservé.
            </div>
          </div>
        </div>
      </footer>

      {/* Leave Warning Dialog */}
      <ConfirmModal
        isOpen={showConfirmLeaveTab}
        title="Quitter l'activité en cours ?"
        message="Vous avez débuté un quiz ou un exercice d'application pratique. Si vous quittez cet onglet maintenant, vos saisies non validées ou vos modifications temporaires seront perdues."
        confirmText="Quitter sans sauvegarder"
        cancelText="Continuer l'activité"
        onConfirm={() => {
          if (pendingTabChange) {
            setActiveTab(pendingTabChange);
          }
          setPendingTabChange(null);
          setShowConfirmLeaveTab(false);
        }}
        onCancel={() => {
          setPendingTabChange(null);
          setShowConfirmLeaveTab(false);
        }}
      />

    </div>
  );
}
