import React, { useState } from 'react';
import { Chapter } from '../types';
import { chapters } from '../data/chapters';
import { BookOpen, Compass, TrendingUp, Users, Truck, DollarSign, FileText, ChevronRight, Play, CheckCircle, Printer, Award } from 'lucide-react';

interface CourseViewProps {
  onStartQuiz: (chapterId: string) => void;
  onStartExercise: (exerciseType: string) => void;
  isFocusMode?: boolean;
  onToggleFocus?: () => void;
  completedChapters?: string[];
}

export default function CourseView({ 
  onStartQuiz, 
  onStartExercise, 
  isFocusMode = false, 
  onToggleFocus,
  completedChapters = []
}: CourseViewProps) {
  const [selectedChapterId, setSelectedChapterId] = useState<string | 'syllabus'>('syllabus');

  const selectedChapter = chapters.find(c => c.id === selectedChapterId);

  // Map icon names to Lucide components
  const getIcon = (iconName: string, sizeClass: string = "w-5 h-5") => {
    switch (iconName) {
      case 'BookOpen': return <BookOpen className={`${sizeClass} text-indigo-600`} />;
      case 'Compass': return <Compass className={`${sizeClass} text-indigo-600`} />;
      case 'TrendingUp': return <TrendingUp className={`${sizeClass} text-indigo-600`} />;
      case 'Users': return <Users className={`${sizeClass} text-indigo-600`} />;
      case 'Truck': return <Truck className={`${sizeClass} text-indigo-600`} />;
      case 'DollarSign': return <DollarSign className={`${sizeClass} text-indigo-600`} />;
      case 'FileText': return <FileText className={`${sizeClass} text-indigo-600`} />;
      default: return <BookOpen className={`${sizeClass} text-indigo-600`} />;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Syllabus View (Landing Page)
  if (selectedChapterId === 'syllabus') {
    return (
      <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700" id="syllabus-home">
        <div className="text-center space-y-4 pt-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-[0.2em] rounded-full">
            Formation Professionnelle
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-none">
            Syllabus Académique
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto text-base font-medium leading-relaxed">
            Sélectionnez un module pour entamer votre apprentissage théorique et pratique.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto">
          {chapters.map((ch) => {
            const isCompleted = completedChapters.includes(ch.id);
            return (
              <button 
                key={ch.id} 
                onClick={() => setSelectedChapterId(ch.id)}
                className="group bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8 hover:shadow-2xl hover:border-indigo-200 transition-all duration-500 flex flex-col items-center text-center relative overflow-hidden"
              >
                {/* Decorative background element */}
                <div className={`absolute -top-10 -right-10 w-32 h-32 ${isCompleted ? 'bg-emerald-50' : 'bg-indigo-50'} rounded-full group-hover:scale-150 transition-transform duration-700 opacity-50`}></div>
                
                {isCompleted && (
                  <div className="absolute top-4 right-4 z-20 bg-emerald-500 text-white p-1 rounded-full shadow-lg">
                    <CheckCircle className="w-3 h-3" />
                  </div>
                )}

                <div className="relative z-10 space-y-5">
                  <div className={`w-16 h-16 ${isCompleted ? 'bg-emerald-600' : 'bg-slate-900'} text-white rounded-2xl flex items-center justify-center mx-auto shadow-xl group-hover:bg-indigo-600 transition-colors duration-500`}>
                    {getIcon(ch.icon, "w-8 h-8 text-white")}
                  </div>
                  
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">Module {ch.num}</span>
                    <h3 className="text-xl font-black text-slate-900 leading-tight">
                      {ch.title}
                    </h3>
                  </div>
                  
                  <div className="pt-2">
                    <div className={`inline-flex items-center gap-2 text-xs font-bold ${isCompleted ? 'text-emerald-600' : 'text-indigo-600'} group-hover:gap-4 transition-all`}>
                      {isCompleted ? 'REVOIR LE MODULE' : 'DÉMARRER LE MODULE'}
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Global Resources Footer Map */}
        <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-6xl mx-auto">
          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 flex items-center gap-4">
             <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center"><CheckCircle className="w-6 h-6 text-emerald-500" /></div>
             <div className="text-left"><p className="text-xs font-black text-slate-900 uppercase">Quiz Interactifs</p><p className="text-[10px] text-slate-500">Auto-évaluation par module</p></div>
          </div>
          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 flex items-center gap-4">
             <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center"><Compass className="w-6 h-6 text-indigo-500" /></div>
             <div className="text-left"><p className="text-xs font-black text-slate-900 uppercase">Supports PDF</p><p className="text-[10px] text-slate-500">Sauvegarde illimitée des cours</p></div>
          </div>
          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 flex items-center gap-4">
             <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center"><Users className="w-6 h-6 text-indigo-500" /></div>
             <div className="text-left"><p className="text-xs font-black text-slate-900 uppercase">Coaching Direct</p><p className="text-[10px] text-slate-500">Inclus dans votre syllabus</p></div>
          </div>
        </div>

        {/* Branding Credit */}
        <div className="pt-16 pb-8 text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
             <div className="h-[1px] w-12 bg-slate-200"></div>
             <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white text-[10px] font-black">TV</div>
             <div className="h-[1px] w-12 bg-slate-200"></div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
            Conçu par <span className="text-indigo-600">Theridialart Vision</span>
          </p>
          <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">
            Atelier de Production Artistique & Numérique
          </p>
        </div>
      </div>
    );
  }

  // Chapter Content View
  // Safeguard if chapter not found (shouldn't happen)
  if (!selectedChapter) return null;

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500" id="course-section">
      {/* Main Content Area: Chapitre Sélectionné */}
      <div className="w-full">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden print:shadow-none print:border-none">
          {/* Header */}
          <div className="p-6 md:p-10 border-b border-slate-50">
            <div className="flex flex-col gap-6 mb-8">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setSelectedChapterId('syllabus')}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 text-xs font-black uppercase tracking-widest rounded-xl transition-all no-print"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  RETOUR AU SYLLABUS
                </button>
                
                <div className="flex flex-wrap items-center gap-3 no-print">
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition shadow-lg shadow-slate-100"
                    id="btn-save-pdf"
                  >
                    <Printer className="w-4 h-4" />
                    ENREGISTRER EN PDF
                  </button>
                  
                  {!isFocusMode && (
                    <button
                      onClick={() => onStartQuiz(selectedChapter.id)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
                    >
                      <CheckCircle className="w-4 h-4" />
                      LANCER LE QUIZ
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-black rounded-full uppercase tracking-widest">
                  Module {selectedChapter.num} Académique
                </div>
                <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-slate-900 leading-tight" id="chapter-title">
                  {selectedChapter.title}
                </h1>
              </div>
            </div>

            {/* Module Introduction */}
            <div className="bg-slate-50/50 border-l-4 border-slate-900 p-6 rounded-r-3xl">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                Introduction au module
              </h4>
              <p className="text-slate-700 text-base leading-relaxed italic font-medium">
                « {selectedChapter.introduction} »
              </p>
            </div>
          </div>

          <div className="p-6 md:p-10 space-y-16">
            {/* Sections Loop */}
            {selectedChapter.sections.map((sec, sIdx) => (
              <div key={sIdx} className="space-y-6" id={`section-block-${sIdx}`}>
                <div className="flex items-center gap-4">
                  <span className="flex-shrink-0 w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-lg font-black italic shadow-lg shadow-slate-100">
                    {sIdx + 1}
                  </span>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">
                    {sec.title}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-600 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></div>
                      Fondements théoriques
                    </h3>
                    <div className="text-slate-600 text-sm leading-relaxed p-6 bg-white border border-slate-100 rounded-3xl shadow-sm">
                      {sec.theory}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></div>
                      Étude de cas : "Café Vert"
                    </h3>
                    <div className="text-slate-600 text-sm leading-relaxed p-6 bg-emerald-50/30 border border-emerald-100/50 rounded-3xl">
                      <p className="font-bold text-emerald-900 mb-3 text-xs uppercase tracking-wide">Application pratique :</p>
                      {sec.example}
                    </div>
                  </div>
                </div>

                {sec.table && (
                  <div className="mt-8 space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">
                      Synthèse & Données de référence
                    </h3>
                    <div className="overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
                      <table className="min-w-full divide-y divide-slate-100 text-[11px] md:text-xs">
                        <thead className="bg-slate-50 text-slate-900 font-black uppercase tracking-wider">
                          <tr>
                            {sec.table.headers.map((h, hIdx) => (
                              <th key={hIdx} className="px-6 py-4 text-left">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-50 text-slate-600">
                          {sec.table.rows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-slate-50/50 transition-colors">
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} className="px-6 py-4 font-medium">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {selectedChapter.id === 'finance' && (
              <div className="mt-12 border border-indigo-100 rounded-3xl p-6 md:p-8 bg-gradient-to-br from-indigo-50/50 to-white space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                      Visualisation : Seuil de Rentabilité
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Analyse dynamique du Point Mort (Cas Café Vert)
                    </p>
                  </div>
                  <div className="px-4 py-2 bg-white rounded-xl shadow-sm border border-indigo-100 text-indigo-700 text-sm font-black italic">
                    Seuil : 45 000€
                  </div>
                </div>

                <div className="w-full h-80 bg-white rounded-2xl border border-indigo-50 p-6 overflow-hidden relative shadow-inner">
                  <svg viewBox="0 0 500 240" className="w-full h-full font-mono">
                    <line x1="40" y1="20" x2="40" y2="200" stroke="#e2e8f0" strokeWidth="2" />
                    <line x1="40" y1="200" x2="480" y2="200" stroke="#e2e8f0" strokeWidth="2" />
                    <line x1="40" y1="140" x2="480" y2="140" stroke="#f8fafc" strokeDasharray="4" />
                    <line x1="40" y1="80" x2="480" y2="80" stroke="#f8fafc" strokeDasharray="4" />
                    <text x="5" y="25" fill="#94a3b8" fontSize="7">150k</text>
                    <text x="5" y="85" fill="#94a3b8" fontSize="7">100k</text>
                    <text x="5" y="145" fill="#94a3b8" fontSize="7">50k</text>
                    <text x="5" y="203" fill="#94a3b8" fontSize="7">0</text>
                    <text x="40" y="215" fill="#64748b" fontSize="8" fontWeight="bold">T0</text>
                    <text x="180" y="215" fill="#64748b" fontSize="8" fontWeight="bold">AN 1</text>
                    <text x="320" y="215" fill="#64748b" fontSize="8" fontWeight="bold">AN 2</text>
                    <text x="450" y="215" fill="#64748b" fontSize="8" fontWeight="bold">AN 3</text>
                    <line x1="40" y1="160" x2="480" y2="150" stroke="#ef4444" strokeWidth="2" strokeDasharray="5,2" opacity="0.6" />
                    <path d="M 40 160 L 180 145 L 320 130 L 480 110" fill="none" stroke="#f97316" strokeWidth="2" strokeDasharray="3" />
                    <path d="M 40 200 L 180 140 L 320 100 L 480 50" fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round" />
                    <path d="M 40 200 L 180 140 L 320 100 L 480 50 L 480 200 Z" fill="url(#grad-rev)" opacity="0.1" />
                    <circle cx="150" cy="148" r="6" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
                    <defs>
                      <linearGradient id="grad-rev" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#ffffff" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute right-6 bottom-16 bg-white/90 backdrop-blur-sm border border-slate-100 p-3 rounded-xl text-[9px] space-y-2 shadow-sm font-bold">
                    <div className="flex items-center gap-2"><div className="w-3 h-1 bg-emerald-500 rounded-full"></div> REVENUS</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-1 bg-orange-400 rounded-full border-dashed border"></div> COÛTS TOTAUX</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-full scale-50"></div> POINT MORT</div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-indigo-50 shadow-sm">
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    <span className="text-indigo-600 font-black tracking-widest uppercase mr-2">Focus :</span>
                    Le point mort est atteint lorsque la somme des marges sur coûts variables couvre l'intégralité des charges fixes. C'est l'instant T à partir duquel votre structure commence réellement à créer de la valeur nette.
                  </p>
                </div>
              </div>
            )}

            {/* Pagination / Conclusion */}
            <div className="border-t border-slate-50 pt-8 mt-12 mb-4">
              <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="hidden sm:flex w-12 h-12 rounded-2xl bg-white/10 items-center justify-center">
                    <Award className="w-6 h-6 text-indigo-300" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">À retenir</p>
                    <p className="text-sm font-medium text-indigo-50 leading-relaxed max-w-md italic">
                      « {selectedChapter.conclusion} »
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 no-print w-full md:w-auto">
                  <button
                    disabled={selectedChapter.num === 1}
                    onClick={() => {
                      const prev = chapters.find(c => c.num === selectedChapter.num - 1);
                      if (prev) setSelectedChapterId(prev.id);
                    }}
                    className="flex-1 md:flex-none px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-20 flex items-center justify-center gap-2 border border-white/10"
                  >
                    PRÉCÉDENT
                  </button>
                  <button
                    disabled={selectedChapter.num === chapters.length}
                    onClick={() => {
                      const next = chapters.find(c => c.num === selectedChapter.num + 1);
                      if (next) setSelectedChapterId(next.id);
                    }}
                    className="flex-1 md:flex-none px-6 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-bold font-sans transition-all disabled:opacity-20 flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/50"
                  >
                    SUIVANT
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
