import React, { useState } from 'react';
import { Chapter } from '../types';
import { chapters } from '../data/chapters';
import { BookOpen, Compass, TrendingUp, Users, Truck, DollarSign, FileText, ChevronRight, Play, CheckCircle } from 'lucide-react';

interface CourseViewProps {
  onStartQuiz: (chapterId: string) => void;
  onStartExercise: (exerciseType: string) => void;
}

export default function CourseView({ onStartQuiz, onStartExercise }: CourseViewProps) {
  const [selectedChapterId, setSelectedChapterId] = useState<string>('intro');

  const selectedChapter = chapters.find(c => c.id === selectedChapterId) || chapters[0];

  // Map icon names to Lucide components
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'BookOpen': return <BookOpen className="w-5 h-5 text-indigo-600" />;
      case 'Compass': return <Compass className="w-5 h-5 text-indigo-600" />;
      case 'TrendingUp': return <TrendingUp className="w-5 h-5 text-indigo-600" />;
      case 'Users': return <Users className="w-5 h-5 text-indigo-600" />;
      case 'Truck': return <Truck className="w-5 h-5 text-indigo-600" />;
      case 'DollarSign': return <DollarSign className="w-5 h-5 text-indigo-600" />;
      case 'FileText': return <FileText className="w-5 h-5 text-indigo-600" />;
      default: return <BookOpen className="w-5 h-5 text-indigo-600" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="course-section">
      {/* Sidebar: Navigation des Chapitres */}
      <div className="lg:col-span-3 space-y-3">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
          <h3 className="text-sm font-semibold text-slate-400 tracking-wider uppercase mb-3">
            Syllabus Académique
          </h3>
          <div className="space-y-1">
            {chapters.map((ch) => {
              const isSelected = ch.id === selectedChapterId;
              return (
                <button
                  key={ch.id}
                  id={`btn-chapter-${ch.id}`}
                  onClick={() => setSelectedChapterId(ch.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-all duration-200 ${
                    isSelected
                      ? 'bg-indigo-50 text-indigo-700 font-medium border-l-4 border-indigo-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <span className="shrink-0">{getIcon(ch.icon)}</span>
                  <span className="truncate">{ch.shortTitle}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Diagnostic shortcuts inside sidebar */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-xl p-4 text-white shadow-sm">
          <h4 className="text-xs font-semibold text-indigo-200 uppercase tracking-wider mb-2">
            Ressources Liées
          </h4>
          <p className="text-xs text-indigo-100 mb-3 leading-relaxed">
            Évaluez vos compétences théoriques ou lancez la modélisation à l'aide des raccourcis ci-dessous :
          </p>
          <div className="space-y-2">
            <button
              onClick={() => onStartQuiz(selectedChapter.id)}
              className="w-full flex items-center justify-between bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg text-xs font-medium text-white transition-all duration-150"
            >
              <span>Lancer le Quiz n°{selectedChapter.num}</span>
              <Play className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                if (selectedChapter.id === 'strategy') onStartExercise('swot');
                else if (selectedChapter.id === 'finance') onStartExercise('budget');
                else if (selectedChapter.id === 'org') onStartExercise('org_chart');
                else onStartExercise('bmc');
              }}
              className="w-full flex items-center justify-between bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg text-xs font-medium text-white transition-all duration-150"
            >
              <span>Atelier d'application</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area: Chapitre Sélectionné */}
      <div className="lg:col-span-9 space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 md:p-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full uppercase tracking-wider">
                Chapitre {selectedChapter.num} sur {chapters.length}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-800" id="chapter-title">
                {selectedChapter.title}
              </h1>
            </div>
            <button
              id={`quiz-button-${selectedChapter.id}`}
              onClick={() => onStartQuiz(selectedChapter.id)}
              className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm py-2 px-4 rounded-xl transition-all duration-150 shadow-sm shadow-indigo-100 shrink-0"
            >
              <CheckCircle className="w-4 h-4" />
              Lancer le Quiz du Chapitre
            </button>
          </div>

          {/* Module Introduction */}
          <div className="bg-slate-50 border-l-4 border-slate-400 p-4 rounded-r-xl mb-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Introduction du module
            </h4>
            <p className="text-slate-600 text-sm leading-relaxed italic">
              « {selectedChapter.introduction} »
            </p>
          </div>

          {/* Sections Loop */}
          <div className="space-y-8">
            {selectedChapter.sections.map((sec, sIdx) => (
              <div key={sIdx} className="space-y-4" id={`section-block-${sIdx}`}>
                <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold">
                    {sIdx + 1}
                  </span>
                  {sec.title}
                </h2>

                {/* Grid layout for theory and case study */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* theory block */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                      Fondements théoriques
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed p-4 bg-white border border-slate-100 rounded-xl">
                      {sec.theory}
                    </p>
                  </div>

                  {/* application block */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                      Cas pratique d'étude (Eco-Coffee "Café Vert")
                    </h3>
                    <div className="text-slate-600 text-sm leading-relaxed p-4 bg-emerald-50/50 border border-emerald-100/70 rounded-xl">
                      <p className="font-semibold text-emerald-800 mb-1">Exemple concret :</p>
                      {sec.example}
                    </div>
                  </div>
                </div>

                {/* Synthesis and Interactive Tables if present */}
                {sec.table && (
                  <div className="space-y-2 mt-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Tableau de synthèse & Modèle de données académique
                    </h3>
                    <div className="overflow-x-auto rounded-xl border border-slate-100">
                      <table className="min-w-full divide-y divide-slate-100 text-xs">
                        <thead className="bg-slate-50 text-slate-600 font-semibold uppercase">
                          <tr>
                            {sec.table.headers.map((h, hIdx) => (
                              <th key={hIdx} className="px-4 py-3 text-left tracking-wider">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100 text-slate-600">
                          {sec.table.rows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-slate-50/70 transition-all duration-150">
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} className="px-4 py-3 font-medium">
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
          </div>

          {/* Chapter Growth Curve / SVG Visualization (Dynamic for Financial/Business Expansion info) */}
          {selectedChapter.id === 'finance' && (
            <div className="mt-8 border border-slate-100 rounded-xl p-5 bg-gradient-to-b from-slate-50 to-white space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                    Visualisation : Courbe de croissance du CA vs Charges fixes & variables
                  </h3>
                  <p className="text-xs text-slate-500">
                    Calcul théorique du Point Mort d'exploitation de notre cas pratique "Café Vert"
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded-full font-medium">
                  Seuil : 45 k€ / an
                </span>
              </div>

              {/* Vector responsive SVG chart */}
              <div className="w-full h-64 bg-white rounded-xl border border-slate-100/80 p-3 overflow-hidden relative">
                <svg viewBox="0 0 500 240" className="w-full h-full">
                  {/* Grid lines */}
                  <line x1="40" y1="20" x2="40" y2="200" stroke="#cbd5e1" strokeWidth="1.5" />
                  <line x1="40" y1="200" x2="480" y2="200" stroke="#cbd5e1" strokeWidth="1.5" />
                  
                  {/* Horizontal Guideline lines */}
                  <line x1="40" y1="140" x2="480" y2="140" stroke="#f1f5f9" strokeDasharray="3,3" />
                  <line x1="40" y1="80" x2="480" y2="80" stroke="#f1f5f9" strokeDasharray="3,3" />
                  <line x1="40" y1="20" x2="480" y2="20" stroke="#f1f5f9" strokeDasharray="3,3" />

                  {/* Legend Y labels */}
                  <text x="5" y="25" fill="#94a3b8" fontSize="8" fontFamily="monospace">150 k€</text>
                  <text x="5" y="85" fill="#94a3b8" fontSize="8" fontFamily="monospace">100 k€</text>
                  <text x="5" y="145" fill="#94a3b8" fontSize="8" fontFamily="monospace">50 k€</text>
                  <text x="5" y="203" fill="#94a3b8" fontSize="8" fontFamily="monospace">0 k€</text>

                  {/* Legend X labels */}
                  <text x="40" y="215" fill="#64748b" fontSize="9" fontWeight="bold">Lancement</text>
                  <text x="180" y="215" fill="#64748b" fontSize="9" fontWeight="bold">Année 1 (54k€)</text>
                  <text x="320" y="215" fill="#64748b" fontSize="9" fontWeight="bold">Année 2 (82k€)</text>
                  <text x="450" y="215" fill="#64748b" fontSize="9" fontWeight="bold">Année 3 (125k€)</text>

                  {/* Fixed cost line (Plat à 31k, puis 36k... disons droite horizontale moyenne à 36k€ pour simplification) */}
                  {/* Y = 160 (correspond à ~33k€) */}
                  <line x1="40" y1="160" x2="480" y2="150" stroke="#ef4444" strokeWidth="2" strokeDasharray="4,2" />
                  <text x="410" y="145" fill="#ef4444" fontSize="8" fontWeight="bold">Charges Fixes</text>

                  {/* Total Cost area and line (Fixed + variable) */}
                  <path d="M 40 160 L 180 145 L 320 130 L 480 110" fill="none" stroke="#f97316" strokeWidth="2.5" />
                  <text x="325" y="118" fill="#f97316" fontSize="8" fontWeight="bold">Charges Totales</text>

                  {/* Revenue line (0 -> 54k -> 82k -> 125k) */}
                  {/* 0k = Y=200; 54k = 140; 82k = 100; 125k = 50 */}
                  <path d="M 40 200 L 180 140 L 320 100 L 480 50" fill="none" stroke="#10b981" strokeWidth="3" />
                  <path d="M 40 200 L 180 140 L 320 100 L 480 50 L 480 200 Z" fill="url(#grad-revenue)" opacity="0.06" />
                  <text x="325" y="88" fill="#10b981" fontSize="9" fontWeight="bold">Revenus (CA)</text>

                  {/* Intersect point (Break-evenpoint) ~ around Year 1 */}
                  {/* X=150, Y=145 pour intersection de 45k€ */}
                  <circle cx="150" cy="148" r="5" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
                  <text x="160" y="152" fill="#ef4444" fontSize="8" fontWeight="bold">Point Mort</text>

                  {/* Definition of color gradients */}
                  <defs>
                    <linearGradient id="grad-revenue" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#ffffff" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute right-3 bottom-12 bg-white/90 shadow-sm border border-slate-100 p-2 rounded text-[10px] space-y-1">
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-1.5 bg-emerald-500 rounded-full inline-block"></span>Chiffre d’affaires</div>
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-1.5 bg-orange-400 rounded-full inline-block"></span>Coût total (Fixes+Var)</div>
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-1.5 bg-red-500 rounded-full inline-block"></span>Charges Fixes</div>
                </div>
              </div>
              <p className="text-xs text-slate-500 italic p-3 bg-indigo-50/50 rounded-lg text-center">
                <strong>Analyse académique :</strong> Le Point Mort est formalisé au croisement de la droite d'exploitation du CA et de l'agrégat des charges globales. Avant ce point, chaque produit vendu génère une marge de contribution qui rembourse les charges de structures initiales. Une fois le cap franchi, l’entreprise bascule en phase bénéficiaire nette.
              </p>
            </div>
          )}

          {/* Conclusion */}
          <div className="border-t border-slate-100 pt-5 mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-slate-500 text-xs italic leading-relaxed max-w-lg">
              <strong>Retenons :</strong> {selectedChapter.conclusion}
            </p>
            
            <div className="flex items-center gap-2">
              <button
                id="prev-chapter-btn"
                disabled={selectedChapter.num === 1}
                onClick={() => {
                  const prev = chapters.find(c => c.num === selectedChapter.num - 1);
                  if (prev) setSelectedChapterId(prev.id);
                }}
                className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs hover:bg-slate-50 disabled:opacity-40 transition-all font-medium"
              >
                Précédent
              </button>
              <button
                id="next-chapter-btn"
                disabled={selectedChapter.num === chapters.length}
                onClick={() => {
                  const next = chapters.find(c => c.num === selectedChapter.num + 1);
                  if (next) setSelectedChapterId(next.id);
                }}
                className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs hover:bg-indigo-700 disabled:opacity-40 transition-all font-medium inline-flex items-center gap-1"
              >
                Suivant <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
