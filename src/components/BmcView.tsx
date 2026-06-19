import React, { useState, useEffect } from 'react';
import { getBmcItems, saveBmcSegment } from '../lib/db';
import { BmcCell } from '../types';
import { Network, ClipboardList, Hammer, Package, HeartHandshake, Truck, Users, Tag, CreditCard, RotateCcw, Plus, Trash2, HelpCircle } from 'lucide-react';

export default function BmcView() {
  const [segments, setSegments] = useState<BmcCell[]>([]);
  const [selectedSegmentId, setSelectedSegmentId] = useState<string>('vp');
  const [newItemText, setNewItemText] = useState<string>('');
  const [statusMsg, setStatusMsg] = useState<string>('');

  // Suffix descriptions & seeds
  const segmentDefinitions: Record<string, { titleFr: string, titleEn: string, def: string, placeholder: string, icon: any, colSpan: string, rawSeed: string[] }> = {
    kp: {
      titleFr: 'Partenaires Clés',
      titleEn: 'Key Partners',
      def: 'Qui sont vos partenaires stratégiques extérieurs et vos fournisseurs majeurs ?',
      placeholder: 'Ex: Coopérative équitable de producteurs, Transporteur écologique...',
      icon: Network,
      colSpan: 'col-span-1 border-r border-[#6366f1]/20',
      rawSeed: ['Coopératives de café bio d’Éthiopie', 'Service de coursiers vélos locaux engagés', 'Fabricant d’emballages kraft 100% compostables']
    },
    ka: {
      titleFr: 'Activités Clés',
      titleEn: 'Key Activities',
      def: 'Quelles actions indispensables l’entreprise mène-t-elle pour faire fonctionner son modèle d’affaires ?',
      placeholder: 'Ex: Torréfaction artisanale, Développement web de l’e-shop...',
      icon: ClipboardList,
      colSpan: 'col-span-1 border-r border-[#6366f1]/20',
      rawSeed: ['Torréfaction artisanale quotidienne', 'Livraison rapide en hypercentre', 'Animation de la communauté d’abonnés']
    },
    kr: {
      titleFr: 'Ressources Clés',
      titleEn: 'Key Resources',
      def: 'Quels actifs physiques, intellectuels, humains ou financiers sont requis ?',
      placeholder: 'Ex: Machine de torréfaction industrielle, Chloé maîtresse torréfactrice...',
      icon: Hammer,
      colSpan: 'col-span-1 border-r border-[#6366f1]/20',
      rawSeed: ['Torréfacteur de précision au gaz', 'Local commercial équipé aux normes', 'Grains verts certifiés Commerce Équitable']
    },
    vp: {
      titleFr: 'Propositions de Valeur',
      titleEn: 'Value Propositions',
      def: 'Quel problème résolvez-vous et quelle valeur unique apportez-vous aux clients ?',
      placeholder: 'Ex: Café d’exception de fraîcheur absolue livré sans émission...',
      icon: Package,
      colSpan: 'col-span-1 border-r border-[#6366f1]/20',
      rawSeed: ['Café d’exception fraîchement torréfié localement', 'Livraison bas carbone sous 2h garantie', 'Sachet à bilan carbone zéro et encre végétale']
    },
    cr: {
      titleFr: 'Relations Clients',
      titleEn: 'Customer Relationships',
      def: 'Quel type de relation établissez-vous avec chaque segment de clientèle ?',
      placeholder: 'Ex: Self-service en ligne, Service clients hyper-réactif...',
      icon: HeartHandshake,
      colSpan: 'col-span-1 border-r border-[#6366f1]/20',
      rawSeed: ['Abonnement en ligne agile et résiliable', 'Transparence totale via newsletters', 'Événements dégustations mensuels au local']
    },
    ch: {
      titleFr: 'Canaux de Distribution',
      titleEn: 'Channels',
      def: 'Par quels canaux communiquez-vous et délivrez-vous vos propositions de valeur ?',
      placeholder: 'Ex: Site e-commerce propre, Cafés bio de quartier...',
      icon: Truck,
      colSpan: 'col-span-1 border-r border-[#6366f1]/20',
      rawSeed: ['Boutique en ligne (Mobile/Desktop)', 'Épiceries fines et marchés bio locaux', 'Réseaux sociaux et influenceurs locaux']
    },
    cs: {
      titleFr: 'Segments de Clientèle',
      titleEn: 'Customer Segments',
      def: 'Pour qui créez-vous de la valeur ? Qui sont vos acheteurs cibles prioritaires ?',
      placeholder: 'Ex: Salariés de bureau pressés, Amateurs écoresponsables...',
      icon: Users,
      colSpan: 'col-span-1',
      rawSeed: ['Actifs citadins soucieux de leur impact', 'Entreprises & Espaces de coworking (B2B)', 'Amateurs de cafés fins de spécialité']
    },
    cost: {
      titleFr: 'Structure de Coûts',
      titleEn: 'Cost Structure',
      def: 'Quels sont les coûts fixes et variables inhérents à l’activité commerciale ?',
      placeholder: 'Ex: Achat café vert, Loyer boutique, Énergie torréfacteur...',
      icon: Tag,
      colSpan: 'col-span-1 md:col-span-1 border-r border-[#6366f1]/20 border-t',
      rawSeed: ['Achat et importation du café arabica vert', 'Machines de production et maintenance', 'Frais logistiques de livraison urbaine']
    },
    rev: {
      titleFr: 'Flux de Revenus',
      titleEn: 'Revenue Streams',
      def: 'Comment l’entreprise gagne-t-elle de l’argent ? Quels sont les modèles de revenus ?',
      placeholder: 'Ex: Récurrence d’abonnements, Vente directe au sachet...',
      icon: CreditCard,
      colSpan: 'col-span-1 md:col-span-1 border-t',
      rawSeed: ['Abonnement récurrent mensuel (B2C/B2B)', 'Ventes de sachets individuels de 250g/1kg', 'Prestations d’ateliers de dégustation']
    }
  };

  useEffect(() => {
    loadBmcData();
  }, []);

  const loadBmcData = async () => {
    try {
      const records = await getBmcItems();
      const loadedSegments: BmcCell[] = [];

      Object.keys(segmentDefinitions).forEach((key) => {
        const matchingRecord = records.find(r => r.id === key);
        const def = segmentDefinitions[key];
        
        loadedSegments.push({
          id: key,
          titleFr: def.titleFr,
          titleEn: def.titleEn,
          descriptionFr: def.def,
          placeholderFr: def.placeholder,
          items: matchingRecord ? matchingRecord.items : def.rawSeed
        });
      });

      setSegments(loadedSegments);
    } catch (err) {
      console.error("Erreur de lecture BMC dans IndexedDB", err);
    }
  };

  const handleAddItem = async () => {
    if (!newItemText.trim()) return;

    const updatedSegments = segments.map((seg) => {
      if (seg.id === selectedSegmentId) {
        const newItems = [...seg.items, newItemText.trim()];
        
        // Enregistrer la mise à jour dans IndexedDB
        saveBmcSegment(seg.id, newItems).catch(err => {
          console.error("Échec de mise à jour IndexedDB BMC:", err);
        });

        return { ...seg, items: newItems };
      }
      return seg;
    });

    setSegments(updatedSegments);
    setNewItemText('');
    setStatusMsg('Saisie sauvegardée dans IndexedDB !');
    setTimeout(() => setStatusMsg(''), 2000);
  };

  const handleDeleteItem = async (segId: string, itemIdxIdx: number) => {
    const updatedSegments = segments.map((seg) => {
      if (seg.id === segId) {
        const newItems = seg.items.filter((_, i) => i !== itemIdxIdx);
        
        saveBmcSegment(seg.id, newItems).catch(err => {
          console.error("Échec de suppression IndexedDB BMC:", err);
        });

        return { ...seg, items: newItems };
      }
      return seg;
    });

    setSegments(updatedSegments);
  };

  const handleResetToSeeds = async () => {
    if (window.confirm('Voulez-vous restaurer les données d’exemple (Café Vert) pour réinitialiser le tableau ?')) {
      const updatedSegments = segments.map((seg) => {
        const seedItems = segmentDefinitions[seg.id].rawSeed;
        saveBmcSegment(seg.id, seedItems).catch(err => {
          console.error("Échec du reset BMC dans IndexedDB:", err);
        });
        return { ...seg, items: seedItems };
      });
      setSegments(updatedSegments);
      setStatusMsg('Données réinitialisées !');
      setTimeout(() => setStatusMsg(''), 2000);
    }
  };

  const activeSegment = segments.find(s => s.id === selectedSegmentId);

  return (
    <div className="space-y-6" id="bmc-section">
      {/* Intro section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-800">
            Business Model Canvas Interactif
          </h2>
          <p className="text-xs text-slate-500 max-w-2xl">
            L'outil canonique récapitulant les 9 dimensions fondamentales de votre proposition de valeur. <strong>Sélectionnez un cadrant</strong> ou ajoutez-y vos propres éléments d’exercice.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleResetToSeeds}
            id="btn-reset-bmc"
            className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Réinitialiser au Cas Pratique
          </button>
        </div>
      </div>

      {/* Main Grid: Layout of Business Model Canvas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-0 bg-white border border-[#4f46e5]/20 rounded-2xl shadow-sm overflow-hidden text-xs md:text-sm">
        
        {/* Colonne 1: KP */}
        <div 
          onClick={() => setSelectedSegmentId('kp')}
          className={`p-4 cursor-pointer transition-colors ${selectedSegmentId === 'kp' ? 'bg-[#4f46e5]/5' : 'hover:bg-slate-50/50'} ${segmentDefinitions['kp'].colSpan}`}
        >
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-slate-800 flex items-center gap-1">
              <Network className="w-4 h-4 text-[#4f46e5]" /> Partenaires Clés
            </h4>
            <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-mono font-bold">
              {segments.find(s => s.id === 'kp')?.items.length || 0}
            </span>
          </div>
          <ul className="space-y-1.5 text-[11px] text-slate-600 max-h-48 overflow-y-auto pr-1">
            {segments.find(s => s.id === 'kp')?.items.map((item, i) => (
              <li key={i} className="bg-slate-50/80 p-1.5 border border-slate-100 rounded flex justify-between items-start">
                <span className="leading-tight shrink-1">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Colonne 2: KA & KR stacked vertically */}
        <div className="col-span-1 border-r border-[#4f46e5]/20 flex flex-col justify-between">
          {/* KA */}
          <div 
            onClick={() => setSelectedSegmentId('ka')}
            className={`p-4 cursor-pointer flex-1 border-b border-[#4f46e5]/20 transition-colors ${selectedSegmentId === 'ka' ? 'bg-[#4f46e5]/5' : 'hover:bg-slate-50/50'}`}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-slate-800 flex items-center gap-1">
                <ClipboardList className="w-4 h-4 text-[#4f46e5]" /> Activités Clés
              </h4>
              <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-mono font-bold">
                {segments.find(s => s.id === 'ka')?.items.length || 0}
              </span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-slate-600 max-h-32 overflow-y-auto">
              {segments.find(s => s.id === 'ka')?.items.map((item, i) => (
                <li key={i} className="bg-slate-50/80 p-1.5 border border-slate-100 rounded">
                  {item}
                </li>
              ))}
            </ul>
          </div>
          {/* KR */}
          <div 
            onClick={() => setSelectedSegmentId('kr')}
            className={`p-4 cursor-pointer flex-1 transition-colors ${selectedSegmentId === 'kr' ? 'bg-[#4f46e5]/5' : 'hover:bg-slate-50/50'}`}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-slate-800 flex items-center gap-1">
                <Hammer className="w-4 h-4 text-[#4f46e5]" /> Ressources Clés
              </h4>
              <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-mono font-bold">
                {segments.find(s => s.id === 'kr')?.items.length || 0}
              </span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-slate-600 max-h-32 overflow-y-auto">
              {segments.find(s => s.id === 'kr')?.items.map((item, i) => (
                <li key={i} className="bg-slate-50/80 p-1.5 border border-slate-100 rounded">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Colonne 3: VP */}
        <div 
          onClick={() => setSelectedSegmentId('vp')}
          className={`p-4 cursor-pointer transition-colors ${selectedSegmentId === 'vp' ? 'bg-[#4f46e5]/5' : 'hover:bg-slate-50/50'} ${segmentDefinitions['vp'].colSpan}`}
        >
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-indigo-900 flex items-center gap-1">
              <Package className="w-4 h-4 text-indigo-700" /> Proposition de Valeur
            </h4>
            <span className="text-[10px] bg-indigo-50 px-1.5 py-0.5 rounded text-indigo-700 font-mono font-bold">
              {segments.find(s => s.id === 'vp')?.items.length || 0}
            </span>
          </div>
          <ul className="space-y-1.5 text-[11px] text-slate-600 max-h-48 overflow-y-auto pr-1">
            {segments.find(s => s.id === 'vp')?.items.map((item, i) => (
              <li key={i} className="bg-indigo-50/30 p-1.5 border border-indigo-100/50 rounded flex justify-between items-start font-medium text-slate-700">
                <span className="leading-tight shrink-1">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Colonne 4: CR & CH stacked vertically */}
        <div className="col-span-1 border-r border-[#4f46e5]/20 flex flex-col justify-between">
          {/* CR */}
          <div 
            onClick={() => setSelectedSegmentId('cr')}
            className={`p-4 cursor-pointer flex-1 border-b border-[#4f46e5]/20 transition-colors ${selectedSegmentId === 'cr' ? 'bg-[#4f46e5]/5' : 'hover:bg-slate-50/50'}`}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-slate-800 flex items-center gap-1">
                <HeartHandshake className="w-4 h-4 text-[#4f46e5]" /> Relations Clients
              </h4>
              <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-mono font-bold">
                {segments.find(s => s.id === 'cr')?.items.length || 0}
              </span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-slate-600 max-h-32 overflow-y-auto">
              {segments.find(s => s.id === 'cr')?.items.map((item, i) => (
                <li key={i} className="bg-slate-50/80 p-1.5 border border-slate-100 rounded">
                  {item}
                </li>
              ))}
            </ul>
          </div>
          {/* CH */}
          <div 
            onClick={() => setSelectedSegmentId('ch')}
            className={`p-4 cursor-pointer flex-1 transition-colors ${selectedSegmentId === 'ch' ? 'bg-[#4f46e5]/5' : 'hover:bg-slate-50/50'}`}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-slate-800 flex items-center gap-1">
                <Truck className="w-4 h-4 text-[#4f46e5]" /> Canaux
              </h4>
              <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-mono font-bold">
                {segments.find(s => s.id === 'ch')?.items.length || 0}
              </span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-slate-600 max-h-32 overflow-y-auto">
              {segments.find(s => s.id === 'ch')?.items.map((item, i) => (
                <li key={i} className="bg-slate-50/80 p-1.5 border border-slate-100 rounded">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Colonne 5: CS */}
        <div 
          onClick={() => setSelectedSegmentId('cs')}
          className={`p-4 cursor-pointer transition-colors ${selectedSegmentId === 'cs' ? 'bg-[#4f46e5]/5' : 'hover:bg-slate-50/50'} ${segmentDefinitions['cs'].colSpan}`}
        >
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-slate-800 flex items-center gap-1">
              <Users className="w-4 h-4 text-[#4f46e5]" /> Part de Marché / Clients
            </h4>
            <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-mono font-bold">
              {segments.find(s => s.id === 'cs')?.items.length || 0}
            </span>
          </div>
          <ul className="space-y-1.5 text-[11px] text-slate-600 max-h-48 overflow-y-auto pr-1">
            {segments.find(s => s.id === 'cs')?.items.map((item, i) => (
              <li key={i} className="bg-slate-50/80 p-1.5 border border-slate-100 rounded flex justify-between items-start">
                <span className="leading-tight shrink-1">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Rangée du bas: Structure de Coûts & Flux de revenus */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 bg-white border-x border-b border-[#4f46e5]/20 rounded-b-2xl overflow-hidden -mt-6">
        {/* Cost Structure */}
        <div 
          onClick={() => setSelectedSegmentId('cost')}
          className={`p-4 cursor-pointer transition-colors ${selectedSegmentId === 'cost' ? 'bg-[#4f46e5]/5' : 'hover:bg-slate-50/50'} border-r border-[#4f46e5]/20`}
        >
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-slate-800 flex items-center gap-1 text-xs">
              <Tag className="w-4 h-4 text-rose-500" /> Structure de Coûts
            </h4>
            <span className="text-[10px] bg-rose-50 px-1.5 py-0.5 rounded text-rose-600 font-mono font-bold">
              {segments.find(s => s.id === 'cost')?.items.length || 0} items
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 max-h-36 overflow-y-auto pr-1">
            {segments.find(s => s.id === 'cost')?.items.map((item, i) => (
              <div key={i} className="bg-slate-50/80 p-1.5 border border-slate-100 rounded">
                • {item}
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Streams */}
        <div 
          onClick={() => setSelectedSegmentId('rev')}
          className={`p-4 cursor-pointer transition-colors ${selectedSegmentId === 'rev' ? 'bg-[#4f46e5]/5' : 'hover:bg-slate-50/50'}`}
        >
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-slate-800 flex items-center gap-1 text-xs">
              <CreditCard className="w-4 h-4 text-emerald-500" /> Flux de Revenus
            </h4>
            <span className="text-[10px] bg-emerald-50 px-1.5 py-0.5 rounded text-emerald-600 font-mono font-bold">
              {segments.find(s => s.id === 'rev')?.items.length || 0} items
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 max-h-36 overflow-y-auto pr-1">
            {segments.find(s => s.id === 'rev')?.items.map((item, i) => (
              <div key={i} className="bg-slate-50/80 p-1.5 border border-slate-100 rounded">
                • {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Editor Panel: interact with selected block */}
      {activeSegment && (
        <div className="bg-indigo-50/20 border border-indigo-100 rounded-2xl p-5 md:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100/50 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                {String.fromCharCode(64 + Object.keys(segmentDefinitions).indexOf(activeSegment.id) + 1)}
              </span>
              <div>
                <h3 className="font-bold text-slate-800 text-sm md:text-base">
                  Gestionnaire : {activeSegment.titleFr} <span className="text-slate-400 font-normal">({activeSegment.titleEn})</span>
                </h3>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5" />
                  {activeSegment.descriptionFr}
                </p>
              </div>
            </div>
            {statusMsg && (
              <span className="font-semibold text-xs text-[#4f46e5] animate-pulse bg-[#4f46e5]/10 px-2 py-1 rounded-md shrink-0">
                {statusMsg}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Form list creator */}
            <div className="md:col-span-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Ajouter un élément stratégique
              </h4>
              <div className="space-y-2">
                <textarea
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  placeholder={activeSegment.placeholderFr}
                  rows={2}
                  className="w-full text-xs md:text-sm p-3 bg-white border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl transition duration-150 outline-none"
                  id="bmc-textarea"
                />
                <button
                  onClick={handleAddItem}
                  className="w-full inline-flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2 px-4 rounded-lg transition"
                  id="btn-add-bmc-item"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Ajouter au Cadrant
                </button>
              </div>
            </div>

            {/* List with deletion options */}
            <div className="md:col-span-8 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Éléments actuels enregistrés :
              </h4>
              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-2">
                {activeSegment.items.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-4">
                    Aucun élément d'exercice dans cette partie. Utilisez l'éditeur à gauche pour en formuler.
                  </p>
                ) : (
                  activeSegment.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-xs p-2.5 bg-white border border-slate-100 rounded-lg shadow-sm hover:border-slate-200 hover:shadow-cyan-100/10 transition"
                    >
                      <span className="font-medium text-slate-700">{item}</span>
                      <button
                        onClick={() => handleDeleteItem(activeSegment.id, index)}
                        className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                        id={`btn-delete-bmc-${activeSegment.id}-${index}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
