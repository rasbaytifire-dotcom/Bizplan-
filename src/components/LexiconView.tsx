import React, { useState, useEffect } from 'react';
import { LexiconTerm } from '../types';
import { getLexicon, addLexiconTerm, deleteLexiconTerm } from '../lib/db';
import { Search, Plus, Languages, Tag, Trash2, HelpCircle, BookOpen, AlertCircle, RefreshCw } from 'lucide-react';

export default function LexiconView() {
  const [lexicon, setLexicon] = useState<LexiconTerm[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('Tous');
  const [lang, setLang] = useState<'fr' | 'en'>('fr');

  // Input states for adding a custom term
  const [newTermFr, setNewTermFr] = useState('');
  const [newDefFr, setNewDefFr] = useState('');
  const [newTermEn, setNewTermEn] = useState('');
  const [newDefEn, setNewDefEn] = useState('');
  const [newTagInput, setNewTagInput] = useState('Général');

  const [notification, setNotification] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadLexiconData();
  }, []);

  const loadLexiconData = async () => {
    try {
      const data = await getLexicon();
      setLexicon(data);
    } catch (err) {
      console.error('Erreur au chargement du lexique:', err);
    }
  };

  const handleAddTerm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTermFr.trim() || !newDefFr.trim()) return;

    const term: Omit<LexiconTerm, 'id'> = {
      termFr: newTermFr.trim(),
      defFr: newDefFr.trim(),
      termEn: newTermEn.trim() || newTermFr.trim(),
      defEn: newDefEn.trim() || newDefFr.trim(),
      tags: [newTagInput.trim() || 'Custom']
    };

    try {
      await addLexiconTerm(term);
      await loadLexiconData();
      
      // Réinitialiser les champs
      setNewTermFr('');
      setNewDefFr('');
      setNewTermEn('');
      setNewDefEn('');
      setNewTagInput('Général');
      setShowAddForm(false);
      
      triggerNotification('Nouveau terme enregistré !');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTerm = async (id: string | undefined) => {
    if (!id) return;
    if (window.confirm('Voulez-vous supprimer ce terme du lexique ?')) {
      try {
        await deleteLexiconTerm(id);
        await loadLexiconData();
        triggerNotification('Terme supprimé du glossaire');
      } catch (err) {
        console.error(err);
      }
    }
  };

  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 2000);
  };

  // Liste globale de tous les tags existants
  const allTags = ['Tous', ...Array.from(new Set(lexicon.flatMap(item => item.tags)))];

  // Filtrer la liste du lexique en fonction de la sélection et recherche
  const filteredLexicon = lexicon.filter((item) => {
    const termToMatch = lang === 'fr' ? item.termFr : item.termEn;
    const defToMatch = lang === 'fr' ? item.defFr : item.defEn;
    
    const matchesSearch = termToMatch.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          defToMatch.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTag = selectedTag === 'Tous' || item.tags.includes(selectedTag);

    return matchesSearch && matchesTag;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="lexicon-section">
      {/* Column Left: Actions, Filtres et Formulaire */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* Toggle Langue & Barre de recherche */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 space-y-4">
          <div className="flex justify-between items-center bg-slate-50 p-1.5 rounded-xl border border-slate-100">
            <span className="text-xs font-bold text-slate-500 pl-2">Langue active :</span>
            <button
              onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
              id="btn-toggle-lang"
              className="inline-flex items-center gap-1.5 bg-indigo-600 text-white hover:bg-indigo-700 px-3 py-1 rounded-lg text-xs font-semibold transition"
            >
              <Languages className="w-3.5 h-3.5" />
              {lang === 'fr' ? 'Français (FR)' : 'English (EN)'}
            </button>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un concept..."
              className="w-full text-xs md:text-sm pl-9 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 outline-none rounded-xl focus:border-indigo-500 transition"
              id="lexicon-search-input"
            />
          </div>
        </div>

        {/* Categories / Tags Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-3 flex items-center gap-1">
            <Tag className="w-3.5 h-3.5" />
            Filtrer par Catégorie
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                id={`btn-lexicon-tag-${tag}`}
                className={`text-xs px-2.5 py-1.5 rounded-lg transition font-medium ${
                  selectedTag === tag 
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' 
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Formulaire d'ajout bilingue */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            id="btn-show-add-lexicon"
            className="w-full inline-flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs py-2 px-4 rounded-lg transition"
          >
            <Plus className="w-4 h-4" />
            {showAddForm ? 'Fermer l’éditeur' : 'Ajouter un mot au dictionnaire'}
          </button>

          {showAddForm && (
            <form onSubmit={handleAddTerm} className="mt-4 space-y-3.5 border-t border-slate-100 pt-4" id="lexicon-add-form">
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide">Ajouter un concept bilingue</h4>
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400">Terme (Français) :</label>
                <input
                  type="text"
                  required
                  value={newTermFr}
                  onChange={(e) => setNewTermFr(e.target.value)}
                  placeholder="Ex : Plan de Trésorerie"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400">Définition (Français) :</label>
                <textarea
                  required
                  value={newDefFr}
                  onChange={(e) => setNewDefFr(e.target.value)}
                  placeholder="Ex : Document recensant l'intégralité des flux financiers rentrants et sortants d'exploitation..."
                  rows={2}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400">Term (Anglais) - Facultatif :</label>
                <input
                  type="text"
                  value={newTermEn}
                  onChange={(e) => setNewTermEn(e.target.value)}
                  placeholder="Ex : Cash-flow forecast"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400">Definition (Anglais) - Facultatif :</label>
                <textarea
                  value={newDefEn}
                  onChange={(e) => setNewDefEn(e.target.value)}
                  placeholder="English meaning..."
                  rows={2}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400">Catégorie / Thème :</label>
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  placeholder="Ex : Finance, Logistique..."
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-4 rounded-lg transition"
                id="btn-submit-lexicon"
              >
                Valider l'ajout (IndexedDB)
              </button>
            </form>
          )}
        </div>

      </div>

      {/* Column Right: Lexicon Term cards */}
      <div className="lg:col-span-8 space-y-4">
        {notification && (
          <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 text-xs px-4 py-2 rounded-xl text-center font-medium animate-bounce shadow-sm">
            {notification}
          </div>
        )}

        {filteredLexicon.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 text-center text-slate-400 italic">
            <AlertCircle className="w-10 h-10 text-slate-200 mx-auto mb-2" />
            <p className="text-xs">Aucun concept ne concorde avec la recherche active ou le filtre. Veuillez formuler un autre mot clé.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredLexicon.map((concept, index) => {
              const isFrench = lang === 'fr';
              const title = isFrench ? concept.termFr : concept.termEn;
              const def = isFrench ? concept.defFr : concept.defEn;
              const contraryTitle = isFrench ? concept.termEn : concept.termFr;

              return (
                <div
                  key={concept.id || index}
                  id={`lexicon-card-${concept.id || index}`}
                  className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm space-y-3 hover:border-indigo-150 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    {/* Header: Vocab item + category tag */}
                    <div className="flex outline-none justify-between items-start gap-2">
                      <div>
                        <h4 className="font-bold text-slate-800 text-base flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4 text-indigo-600" />
                          {title}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-medium italic">
                          Équivalent : {contraryTitle}
                        </span>
                      </div>
                      
                      {concept.id?.toString().startsWith('custom_') && (
                        <button
                          onClick={() => handleDeleteTerm(concept.id)}
                          className="text-slate-300 hover:text-rose-500 transition-colors p-1 shrink-0"
                          title="Supprimer ce terme personnalisé"
                          id={`btn-delete-lexicon-${concept.id}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Definition */}
                    <p className="text-xs text-slate-600 leading-relaxed pt-1.5 border-t border-slate-50 font-medium">
                      {def}
                    </p>
                  </div>

                  {/* Foot tags list */}
                  <div className="flex flex-wrap gap-1 pt-2">
                    {concept.tags.map((tg, tIdx) => (
                      <span key={tIdx} className="text-[9px] font-bold bg-slate-50 text-slate-500 px-2 py-0.5 rounded uppercase">
                        {tg}
                      </span>
                    ))}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
