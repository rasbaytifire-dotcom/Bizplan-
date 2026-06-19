import React, { useState, useEffect } from 'react';
import { QuizQuestion, QuizAttempt } from '../types';
import { quizQuestions } from '../data/quizzes';
import { chapters } from '../data/chapters';
import { saveQuizAttempt, getQuizAttempts, clearQuizHistory } from '../lib/db';
import { HelpCircle, CheckCircle2, AlertTriangle, RotateCcw, Award, Trash2, Calendar, BookOpen, Clock, FileText } from 'lucide-react';
import { exportSingleQuizAttempt, exportAcademicTranscript } from '../lib/pdfExport';
import ConfirmModal from './ConfirmModal';

interface QuizViewProps {
  initialChapterId?: string;
  onNavigateToChapter: (chapterId: string) => void;
  onProgressChange?: (inProgress: boolean) => void;
}

export default function QuizView({ initialChapterId = 'intro', onNavigateToChapter, onProgressChange }: QuizViewProps) {
  const [selectedChapterId, setSelectedChapterId] = useState<string>(initialChapterId);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);
  const [history, setHistory] = useState<QuizAttempt[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  
  // States for confirming chapter leave
  const [pendingChapterId, setPendingChapterId] = useState<string | null>(null);
  const [showConfirmLeave, setShowConfirmLeave] = useState<boolean>(false);

  // Sépare les questions par rapport au chapitre
  useEffect(() => {
    const chapterQuestions = quizQuestions.filter((q) => q.chapterId === selectedChapterId);
    setQuestions(chapterQuestions);
    setUserAnswers(new Array(chapterQuestions.length).fill(null));
    resetQuizState(chapterQuestions.length);
  }, [selectedChapterId]);

  // Charge l'historique au montage
  useEffect(() => {
    loadHistory();
  }, []);

  // Notifier le parent (App.tsx) d'un quiz en cours
  useEffect(() => {
    const hasAnswers = Array.isArray(userAnswers) && userAnswers.some(ans => ans !== null);
    const inProgress = !quizFinished && (hasAnswers || selectedOption !== null || hasSubmitted);
    onProgressChange?.(inProgress);
  }, [userAnswers, quizFinished, selectedOption, hasSubmitted, onProgressChange]);

  const handleChapterSelect = (chapterId: string) => {
    if (chapterId === selectedChapterId) return;
    
    const hasAnswers = Array.isArray(userAnswers) && userAnswers.some(ans => ans !== null);
    const isQuizDirty = !quizFinished && (hasAnswers || selectedOption !== null || hasSubmitted);
    
    if (isQuizDirty) {
      setPendingChapterId(chapterId);
      setShowConfirmLeave(true);
    } else {
      setSelectedChapterId(chapterId);
    }
  };

  const loadHistory = async () => {
    try {
      const savedHistory = await getQuizAttempts();
      // Trier par date décroissante
      setHistory(savedHistory.reverse());
    } catch (err) {
      console.error('Impossible de charger l’historique des scores:', err);
    }
  };

  const resetQuizState = (customLen?: number) => {
    setCurrentQuestionIdx(0);
    setSelectedOption(null);
    setHasSubmitted(false);
    setScore(0);
    setQuizFinished(false);
    setStatusMessage('');
    const len = customLen !== undefined ? customLen : questions.length;
    setUserAnswers(new Array(len).fill(null));
  };

  const handleOptionSelect = (index: number) => {
    if (hasSubmitted) return; // Impossible d'éditer après soumission
    setSelectedOption(index);
    setUserAnswers((prev) => {
      const updated = [...prev];
      updated[currentQuestionIdx] = index;
      return updated;
    });
  };

  const handleSubmit = () => {
    if (selectedOption === null || hasSubmitted) return;
    setHasSubmitted(true);

    const question = questions[currentQuestionIdx];
    if (selectedOption === question.correctAnswerIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = async () => {
    if (!hasSubmitted) return;

    if (currentQuestionIdx + 1 < questions.length) {
      setCurrentQuestionIdx((prev) => prev + 1);
      setSelectedOption(null);
      setHasSubmitted(false);
    } else {
      // Quiz fini : enregistrer dans IndexedDB
      setQuizFinished(true);
      const percent = Math.round((score / questions.length) * 100);
      const isPassed = percent >= 70; // 70% pour réussir à l'académie
      
      const newAttempt: QuizAttempt = {
        chapterId: selectedChapterId,
        score: score,
        total: questions.length,
        date: new Date().toLocaleString('fr-FR', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        passed: isPassed
      };

      try {
        await saveQuizAttempt(newAttempt);
        setStatusMessage('Résultats enregistrés hors ligne avec succès !');
        loadHistory();
      } catch (err) {
        console.error('Erreur de sauvegarde IndexedDB:', err);
      }
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm('Voulez-vous réinitialiser l’historique de vos notes ?')) {
      await clearQuizHistory();
      loadHistory();
    }
  };

  const currentChapter = chapters.find((c) => c.id === selectedChapterId) || chapters[0];
  const activeQuestion = questions[currentQuestionIdx];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="quiz-section">
      {/* Colonne de gauche: Liste des Quiz et Historique */}
      <div className="lg:col-span-4 space-y-6">
        {/* Sélecteur de Chapitre */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <h3 className="text-sm font-semibold text-slate-400 tracking-wider uppercase mb-3">
            Sélectionner un Module
          </h3>
          <div className="space-y-1.5">
            {chapters.map((ch) => {
              const chQuestions = quizQuestions.filter(q => q.chapterId === ch.id);
              const isSelected = ch.id === selectedChapterId;
              return (
                <button
                  key={ch.id}
                  id={`btn-select-quiz-${ch.id}`}
                  onClick={() => handleChapterSelect(ch.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-sm transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-medium shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <span className="truncate">{ch.shortTitle}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${
                    isSelected ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {chQuestions.length} QCM
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Historique des essais sauvegardés */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-400 tracking-wider uppercase">
              Notes Académiques
            </h3>
            <div className="flex items-center gap-2">
              {history.length > 0 && (
                <button
                  onClick={() => exportAcademicTranscript(history, chapters)}
                  className="text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1 text-xs font-semibold"
                  title="Exporter le relevé de notes en PDF"
                  id="btn-export-transcript"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Exporter
                </button>
              )}
              {history.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="text-red-500 hover:text-red-700 transition flex items-center gap-1 text-xs font-semibold"
                  title="Effacer l'historique"
                  id="btn-clear-history"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Effacer
                </button>
              )}
            </div>
          </div>

          {history.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs italic">
              Aucune évaluation effectuée pour le moment.
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {history.map((att, idx) => {
                const chMap = chapters.find((c) => c.id === att.chapterId);
                const scorePercent = Math.round((att.score / att.total) * 100);
                return (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100/80 transition text-xs flex justify-between items-center border border-slate-100"
                  >
                    <div className="space-y-0.5">
                      <div className="font-semibold text-slate-700 truncate max-w-[150px]">
                        {chMap ? chMap.shortTitle : att.chapterId}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {att.date}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`font-mono font-bold text-sm ${
                        att.passed ? 'text-emerald-600' : 'text-amber-600'
                      }`}>
                        {att.score}/{att.total}
                      </span>
                      <div className="text-[9px] font-semibold text-slate-400">
                        ({scorePercent}%)
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Colonne de droite: Interface du Quiz Actif */}
      <div className="lg:col-span-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 md:p-8">
          
          {/* Si aucun quiz disponible */}
          {questions.length === 0 ? (
            <div className="text-center py-12">
              <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h2 className="text-lg font-bold text-slate-700">Aucune question chargée</h2>
              <p className="text-slate-400 text-sm mt-1">Veuillez sélectionner un autre module stratégique.</p>
            </div>
          ) : quizFinished ? (
            /* Écran de réussite final d'un quiz */
            <div className="text-center py-8 space-y-6">
              <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-inner shadow-indigo-100">
                <Award className="w-10 h-10" />
              </div>
              
              <div className="space-y-2">
                <span className="text-xs font-semibold text-indigo-600 tracking-widest uppercase">Évaluation Module {currentChapter.num}</span>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-800">
                  Quiz Terminé !
                </h2>
                <p className="text-slate-500 max-w-md mx-auto text-sm leading-relaxed">
                  Félicitations pour avoir complété les questions de révision théorique sur l’unité : <br />
                  <strong className="text-indigo-900">{currentChapter.title}</strong>.
                </p>
              </div>

              {/* Rendu des Scores */}
              <div className="bg-slate-50 max-w-sm mx-auto p-5 rounded-2xl border border-slate-100 space-y-2">
                <div className="text-slate-400 font-semibold text-xs uppercase tracking-wider">Votre Note Finale</div>
                <div className="text-4xl font-mono font-bold text-slate-800">
                  {score} <span className="text-slate-400">/ {questions.length}</span>
                </div>
                <div className="text-xs font-semibold">
                  Taux de réussite : <span className={score / questions.length >= 0.7 ? 'text-emerald-600' : 'text-amber-600'}>
                    {Math.round((score / questions.length) * 100)} %
                  </span>
                </div>
                {score / questions.length >= 0.7 ? (
                  <div className="text-[11px] bg-emerald-50 text-emerald-800 font-medium px-3 py-1 rounded-full inline-block mt-2">
                    ✓ Validation obtenue (Seuil académique validé)
                  </div>
                ) : (
                  <div className="text-[11px] bg-amber-50 text-amber-800 font-medium px-3 py-1 rounded-full inline-block mt-2">
                    ⚠ Recommandé : Relire le cours de l'unité
                  </div>
                )}
              </div>

              {statusMessage && (
                <div className="text-xs text-blue-600 font-medium">{statusMessage}</div>
              )}

              {/* Actions de redirection */}
              <div className="flex flex-col sm:flex-row justify-center items-center gap-3 pt-4">
                <button
                  onClick={() => {
                    const percent = Math.round((score / questions.length) * 100);
                    const passed = percent >= 70;
                    const dateStr = new Date().toLocaleString('fr-FR', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    });
                    exportSingleQuizAttempt(
                      currentChapter,
                      score,
                      questions.length,
                      dateStr,
                      passed,
                      questions,
                      userAnswers
                    );
                  }}
                  id="btn-export-quiz-pdf"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-5 rounded-xl text-sm font-semibold transition shadow-md shadow-emerald-100"
                >
                  <FileText className="w-4 h-4" />
                  Exporter Corrigé (PDF)
                </button>

                <button
                  onClick={() => resetQuizState()}
                  id="btn-restart-quiz"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 px-5 rounded-xl text-sm font-semibold transition"
                >
                  <RotateCcw className="w-4 h-4" />
                  Recommencer le Quiz
                </button>
                <button
                  onClick={() => onNavigateToChapter(selectedChapterId)}
                  id="btn-return-course"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-5 rounded-xl text-sm font-semibold transition shadow-md shadow-indigo-100"
                >
                  <BookOpen className="w-4 h-4" />
                  Retourner au cours
                </button>
              </div>
            </div>
          ) : (
            /* Formulaire interactif de questions */
            <div className="space-y-6">
              {/* Entête de progression */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
                  <span className="uppercase">Chapitre {currentChapter.num} : Évaluation</span>
                  <span>Question {currentQuestionIdx + 1} sur {questions.length}</span>
                </div>
                {/* Barre de progression */}
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 transition-all duration-300"
                    style={{ width: `${((currentQuestionIdx + 1) / questions.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Intitulé de la question */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 md:p-6">
                <h3 className="font-bold text-slate-800 text-base md:text-lg leading-relaxed flex gap-3">
                  <span className="w-7 h-7 bg-indigo-600 text-white text-xs font-bold rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                    Q
                  </span>
                  {activeQuestion.question}
                </h3>
              </div>

              {/* Liste d'options QCM */}
              <div className="space-y-2.5">
                {activeQuestion.options.map((option, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrectAnswer = idx === activeQuestion.correctAnswerIndex;
                  
                  // Calcul de couleur post-vérification
                  let optionClass = 'border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 bg-white';
                  if (isSelected && !hasSubmitted) {
                    optionClass = 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-semibold';
                  } else if (hasSubmitted) {
                    if (isCorrectAnswer) {
                      optionClass = 'border-emerald-500 bg-emerald-50/70 text-emerald-900 font-bold';
                    } else if (isSelected && !isCorrectAnswer) {
                      optionClass = 'border-red-500 bg-red-50/70 text-red-900 font-bold';
                    } else {
                      optionClass = 'border-slate-100 bg-slate-50/30 text-slate-400';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      id={`quiz-option-btn-${idx}`}
                      disabled={hasSubmitted}
                      onClick={() => handleOptionSelect(idx)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left text-xs md:text-sm transition-all duration-150 ${optionClass}`}
                    >
                      <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        isSelected && !hasSubmitted
                          ? 'bg-indigo-600 text-white'
                          : hasSubmitted && isCorrectAnswer
                            ? 'bg-emerald-500 text-white'
                            : hasSubmitted && isSelected && !isCorrectAnswer
                              ? 'bg-red-500 text-white'
                              : 'bg-slate-100 text-slate-600'
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="leading-normal">{option}</span>
                    </button>
                  );
                })}
              </div>

              {/* Rétroaction explicative après soumission */}
              {hasSubmitted && (
                <div className={`p-4 rounded-xl border flex gap-3 ${
                  selectedOption === activeQuestion.correctAnswerIndex 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
                    : 'bg-amber-50 text-amber-800 border-amber-100'
                }`}>
                  <div className="shrink-0 mt-0.5">
                    {selectedOption === activeQuestion.correctAnswerIndex ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-xs uppercase tracking-wider">
                      {selectedOption === activeQuestion.correctAnswerIndex ? 'Bonne réponse !' : 'Réponse erronée'}
                    </h4>
                    <p className="text-xs leading-relaxed font-medium">
                      {activeQuestion.explanation}
                    </p>
                  </div>
                </div>
              )}

              {/* Pied de carte avec les CTAs de validation */}
              <div className="border-t border-slate-100 pt-5 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Dossier d’évaluation
                </span>

                <div>
                  {!hasSubmitted ? (
                    <button
                      onClick={handleSubmit}
                      disabled={selectedOption === null}
                      id="btn-quiz-submit"
                      className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-semibold text-xs md:text-sm py-2 px-5 rounded-lg transition shadow-sm"
                    >
                      Valider ma réponse
                    </button>
                  ) : (
                    <button
                      onClick={handleNext}
                      id="btn-quiz-next"
                      className="bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs md:text-sm py-2 px-5 rounded-lg transition"
                    >
                      {currentQuestionIdx + 1 < questions.length ? 'Question Suivante' : 'Terminer l’évaluation'}
                    </button>
                  )}
                </div>
              </div>

            </div>
          )}

        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirmLeave}
        title="Changer de module ?"
        message="Vous avez débuté ce quiz d'évaluation. Si vous changez de module maintenant, vos réponses à cette session d'évaluation seront perdues."
        confirmText="Changer de module"
        cancelText="Continuer le quiz"
        onConfirm={() => {
          if (pendingChapterId) {
            setSelectedChapterId(pendingChapterId);
          }
          setPendingChapterId(null);
          setShowConfirmLeave(false);
        }}
        onCancel={() => {
          setPendingChapterId(null);
          setShowConfirmLeave(false);
        }}
      />
    </div>
  );
}
