import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  BookOpen, CheckSquare, Award, FileText, Compass, LogOut, Sliders, Globe, Wifi, WifiOff, HelpCircle, GraduationCap, Sun, Moon, Download, Save, Printer 
} from 'lucide-react';
import CourseView from './components/CourseView';
import QuizView from './components/QuizView';
import ExerciseView from './components/ExerciseView';
import LexiconView from './components/LexiconView';
import BmcView from './components/BmcView';
import ConfirmModal from './components/ConfirmModal';
import { initDB, getQuizAttempts, getLexicon, getAllBackupData } from './lib/db';

export default function App() {
  // Navigation state
  const [activeTab, setActiveTab] = useState<'cours' | 'quiz' | 'bmc' | 'exercices' | 'lexique'>('cours');
  const [quizChapterFocus, setQuizChapterFocus] = useState<string>('intro');
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  
  // Theme state settings (Local Storage persistence)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('theme') === 'dark';
  });

  // Track if a sub-activity is dirty/in-progress
  const [quizInProgress, setQuizInProgress] = useState<boolean>(false);
  const [exerciseInProgress, setExerciseInProgress] = useState<boolean>(false);

  // Leave active confirmation modal states
  const [showConfirmLeaveTab, setShowConfirmLeaveTab] = useState<boolean>(false);
  const [pendingTabChange, setPendingTabChange] = useState<'cours' | 'quiz' | 'bmc' | 'exercices' | 'lexique' | null>(null);

  // Connectivity
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // Persistence for module progress
  const [completedChapters, setCompletedChapters] = useState<string[]>(() => {
    const saved = localStorage.getItem('completed_chapters');
    return saved ? JSON.parse(saved) : [];
  });

  // Persist progress
  useEffect(() => {
    localStorage.setItem('completed_chapters', JSON.stringify(completedChapters));
  }, [completedChapters]);

  // Stats aggregated
  const [quizCount, setQuizCount] = useState<number>(0);
  const [lexCount, setLexCount] = useState<number>(0);
  const [avgScore, setAvgScore] = useState<number>(0);

  // Dashboard Stats Refresh
  const refreshDashboardStats = useCallback(async () => {
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
      console.warn("Stats refresh skip (DB maybe not ready yet)");
    }
  }, []);

  // Initialize IndexedDB and read status metrics
  useEffect(() => {
    // Sync online status
    if (typeof navigator !== 'undefined') {
      setIsOnline(navigator.onLine);
    }

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
  }, [refreshDashboardStats]);

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

  const tryNavigateToTab = useCallback((newTab: 'cours' | 'quiz' | 'bmc' | 'exercices' | 'lexique') => {
    if (newTab === activeTab) return;
    const isQuizDirty = activeTab === 'quiz' && quizInProgress;
    const isExerciseDirty = activeTab === 'exercices' && exerciseInProgress;
    
    if (isQuizDirty || isExerciseDirty) {
      setPendingTabChange(newTab);
      setShowConfirmLeaveTab(true);
    } else {
      setActiveTab(newTab);
      window.scrollTo(0, 0);
    }
  }, [activeTab, quizInProgress, exerciseInProgress]);

  const handleExportData = useCallback(async () => {
    try {
      const backup = await getAllBackupData();
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `BizPlanAcademy-Backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erreur lors de l’export des données:', err);
      alert('Une erreur est survenue lors de l’exportation de vos données (Backup JSON).');
    }
  }, []);

  // Navigations raccourcies inter-composants
  const selectQuizAndNavigate = useCallback((chapterId: string) => {
    setQuizChapterFocus(chapterId);
    tryNavigateToTab('quiz');
  }, [tryNavigateToTab]);

  const markChapterAsCompleted = useCallback((chapterId: string) => {
    setCompletedChapters(prev => {
      if (prev.includes(chapterId)) return prev;
      return [...prev, chapterId];
    });
  }, []);

  const selectExerciseAndNavigate = useCallback(() => {
    tryNavigateToTab('exercices');
  }, [tryNavigateToTab]);

  // Calculated general academic progress
  const computedProgressPercentage = useMemo(() => {
    return Math.min(
      Math.round(((quizCount / 7) * 40) + ((avgScore > 0 ? 1 : 0) * 30) + (lexCount > 10 ? 30 : 15)),
      100
    );
  }, [quizCount, avgScore, lexCount]);

  return (
    <div className={`min-h-screen bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 flex flex-col font-sans transition-colors duration-300 ${isFocusMode ? 'focus-mode-active' : ''}`} id="applet-container">
      
      {/* Academy Top Header Navigation */}
      {!isFocusMode && (
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
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/30' 
                      : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-100 dark:border-amber-900/30 animate-pulse'
                  }`}>
                    {isOnline ? (
                      <>
                        <Wifi className="w-3 h-3 text-emerald-500 animate-pulse" />
                        En ligne
                      </>
                    ) : (
                      <>
                        <WifiOff className="w-3 h-3 text-amber-500" />
                        Mode Hors-ligne
                      </>
                    )}
                  </span>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Apprentissage & Simulation</p>
              </div>
            </div>

            {/* Quick Stats Widget Pills */}
            <div className="flex items-center gap-3 md:gap-3.5 text-xs">
              {/* Dark Mode Switcher */}
              <button
                onClick={() => setIsDarkMode(prev => !prev)}
                className="p-2 sm:p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-150 dark:border-slate-800 text-slate-600 dark:text-slate-350 transition-all cursor-pointer flex items-center justify-center shrink-0"
                title={isDarkMode ? "Passer au mode clair" : "Passer au mode sombre"}
                id="btn-toggle-dark-mode"
              >
                {isDarkMode ? (
                  <Sun className="w-4 h-4 text-amber-500" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-500" />
                )}
              </button>

              <div className="hidden md:flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/40 px-2.5 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800/80">
                <span className="text-slate-400 dark:text-slate-500 font-bold uppercase text-[9px]">Savoirs :</span>
                <span className="font-mono font-bold text-indigo-700 dark:text-indigo-400">{lexCount} concepts</span>
              </div>
              
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/40 px-2.5 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800/80">
                <span className="text-slate-400 dark:text-slate-500 font-bold uppercase text-[9px]">Moyenne :</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{avgScore}%</span>
              </div>

              <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-800 pl-3">
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Progrès</div>
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
      )}

      {/* Primary Navigation System Tab selection */}
      {!isFocusMode && (
        <nav className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 py-2.5 no-print transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
              <button
                onClick={() => tryNavigateToTab('cours')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs md:text-sm font-semibold transition ${
                  activeTab === 'cours'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Cours
              </button>

              <button
                onClick={() => tryNavigateToTab('quiz')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs md:text-sm font-semibold transition ${
                  activeTab === 'quiz'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Award className="w-4 h-4" />
                Quiz
              </button>

              <button
                onClick={() => tryNavigateToTab('bmc')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs md:text-sm font-semibold transition ${
                  activeTab === 'bmc'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Compass className="w-4 h-4" />
                Canvas
              </button>

              <button
                onClick={() => tryNavigateToTab('exercices')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs md:text-sm font-semibold transition ${
                  activeTab === 'exercices'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Sliders className="w-4 h-4" />
                Ateliers
              </button>

              <button
                onClick={() => tryNavigateToTab('lexique')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs md:text-sm font-semibold transition ${
                  activeTab === 'lexique'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Globe className="w-4 h-4" />
                Glossaire
              </button>

              {/* Print button specific to reading views */}
              {(activeTab === 'cours' || activeTab === 'exercices') && (
                <button
                  onClick={() => window.print()}
                  className="ml-auto flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-500 hover:text-indigo-600 transition h-9 border border-transparent hover:border-slate-200 rounded-lg dark:hover:border-slate-800"
                >
                  <Printer className="w-4 h-4" />
                  <span className="hidden sm:inline uppercase">Imprimer</span>
                </button>
              )}
            </div>
          </div>
        </nav>
      )}

      {/* Floating Exit Focus Mode Button */}
      {isFocusMode && (
        <button
          onClick={() => setIsFocusMode(false)}
          className="fixed bottom-8 right-8 z-[100] flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-bold rounded-2xl shadow-2xl border border-indigo-100 dark:border-indigo-900/50 hover:scale-105 transition-all active:scale-95 no-print"
          id="btn-exit-focus"
        >
          <LogOut className="w-5 h-5" />
          <span>Quitter le mode Lecture seule</span>
        </button>
      )}

      {/* Main Workspace Frame container */}
      <main className={`flex-grow w-full mx-auto px-4 sm:px-6 lg:px-8 ${isFocusMode ? 'py-4 max-w-5xl' : 'py-8 max-w-7xl'}`}>
        <div className="animate-in fade-in transition-all duration-300">
          
          {activeTab === 'cours' && (
            <CourseView 
              onStartQuiz={selectQuizAndNavigate} 
              onStartExercise={selectExerciseAndNavigate}
              isFocusMode={isFocusMode}
              onToggleFocus={() => setIsFocusMode(!isFocusMode)}
              completedChapters={completedChapters}
            />
          )}

          {activeTab === 'quiz' && (
            <QuizView 
              initialChapterId={quizChapterFocus} 
              onNavigateToChapter={selectQuizAndNavigate}
              onProgressChange={setQuizInProgress}
              onCompleteQuiz={markChapterAsCompleted}
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

      {/* Footer / Branding */}
      {!isFocusMode && (
        <footer className="bg-slate-900 border-t border-slate-800 no-print transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
              <div className="md:col-span-2 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-slate-900 text-xs font-black shadow-xl">TV</div>
                  <div>
                    <h3 className="text-white font-black text-sm uppercase tracking-widest">Theridialart Vision</h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                      Atelier de Production Artistique & Numérique
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed max-w-sm font-medium">
                  Concepteur de cet outil de formation pour les entrepreneurs de demain.
                  Alliant vision artistique et rigueur académique dans chaque module.
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-200 uppercase tracking-[0.2em]">Syllabus Académique</h4>
                <div className="grid grid-cols-1 gap-2 text-[11px] text-slate-400">
                  <button onClick={() => tryNavigateToTab('cours')} className="hover:text-indigo-400 transition text-left">Accéder aux Cours</button>
                  <button onClick={() => tryNavigateToTab('quiz')} className="hover:text-indigo-400 transition text-left">Démarrer Evaluation</button>
                  <button onClick={() => tryNavigateToTab('bmc')} className="hover:text-indigo-400 transition text-left">Canvas Stratégique</button>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-200 uppercase tracking-[0.2em]">Data Management</h4>
                <div className="space-y-4">
                   <p className="text-[10px] text-slate-500 leading-relaxed">Exportation JSON disponible pour l'archivage de vos sessions.</p>
                   <button 
                    onClick={handleExportData}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-[9px] font-black rounded-xl border border-white/10 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    BACKUP (.JSON)
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                © 2024 BizPlan Academy — Theridialart Vision
              </p>
              <div className="flex items-center gap-4">
                <div className="w-1 h-1 bg-indigo-500 rounded-full"></div>
                <div className="w-1 h-1 bg-indigo-500 rounded-full"></div>
                <div className="w-1 h-1 bg-indigo-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </footer>
      )}

      {/* Modal confirmation de sortie d'activité */}
      <ConfirmModal
        isOpen={showConfirmLeaveTab}
        title="Quitter l'activité ?"
        message="Une session est en cours. Si vous changez d'onglet maintenant, vos données de saisie non validées seront perdues."
        confirmText="Quitter quand même"
        cancelText="Rester ici"
        onConfirm={() => {
          if (pendingTabChange) {
            setActiveTab(pendingTabChange);
            setQuizInProgress(false);
            setExerciseInProgress(false);
          }
          setPendingTabChange(null);
          setShowConfirmLeaveTab(false);
          window.scrollTo(0, 0);
        }}
        onCancel={() => {
          setPendingTabChange(null);
          setShowConfirmLeaveTab(false);
        }}
      />

    </div>
  );
}
