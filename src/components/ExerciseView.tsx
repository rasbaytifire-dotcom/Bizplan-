import React, { useState, useEffect } from 'react';
import { SwotItem, MarketingCampaign, BudgetItem, OrgNode } from '../types';
import { 
  getSwotItems, saveSwotItem, deleteSwotItem,
  getSingleSetting, saveSingleSetting,
  getBudgetItems, saveBudgetItem,
  getOrgNodes, saveOrgNode, deleteOrgNode
} from '../lib/db';
import { Plus, Trash2, Award, ArrowRight, UserPlus, Users, DollarSign, BarChart2, Lightbulb, CheckCircle2, ChevronRight, HelpCircle, Download, FileText, Printer } from 'lucide-react';
import { 
  exportSwotMatrix, 
  exportMarketingCampaign, 
  exportBudgetForecast, 
  exportOrgChartReport, 
  exportCombinedBusinessPlan 
} from '../lib/pdfExport';

export default function ExerciseView({ onProgressChange }: { onProgressChange?: (inProgress: boolean) => void }) {
  const [activeTab, setActiveTab] = useState<'swot' | 'marketing' | 'budget' | 'org_chart'>('swot');

  // STATE: SWOT
  const [swotList, setSwotList] = useState<SwotItem[]>([]);
  const [swotText, setSwotText] = useState('');
  const [swotType, setSwotType] = useState<'strength' | 'weakness' | 'opportunity' | 'threat'>('strength');

  // STATE: Marketing
  const [campaign, setCampaign] = useState<MarketingCampaign>({
    slogan: 'Réveillez votre journée avec Café Vert',
    channel: 'influence',
    target: 'Citadins trentenaires éco-sensibles',
    estimatedReach: 0,
    conversionRate: 0
  });
  const [initialCampaign, setInitialCampaign] = useState<MarketingCampaign | null>(null);
  const [mktScore, setMktScore] = useState<{ score: number, comment: string, calculatedClients: number } | null>(null);

  // STATE: Budget
  const [budgetList, setBudgetList] = useState<BudgetItem[]>([]);

  // STATE: Org Nodes
  const [orgNodes, setOrgNodes] = useState<OrgNode[]>([]);
  const [newNode, setNewNode] = useState<{ name: string; role: string; department: OrgNode['department']; parentId: string }>({
    name: '',
    role: '',
    department: 'Direction',
    parentId: ''
  });

  const [notification, setNotification] = useState('');

  // S'assurer qu'un changement de saisie ou d'édition est identifié comme en cours
  useEffect(() => {
    const isSwotActive = swotText.trim() !== '';
    const isOrgNodeActive = newNode.name.trim() !== '' || newNode.role.trim() !== '';
    const isMarketingDirty = initialCampaign !== null && (
      campaign.slogan !== initialCampaign.slogan ||
      campaign.channel !== initialCampaign.channel ||
      campaign.target !== initialCampaign.target
    );
    
    onProgressChange?.(isSwotActive || isOrgNodeActive || isMarketingDirty);
  }, [swotText, newNode.name, newNode.role, campaign, initialCampaign, onProgressChange]);

  // ----------------------------------------------------
  // CALCULATOR HELPER FOR ON-DEMAND AND INITIAL BHYDRATION
  // ----------------------------------------------------
  const calculateMktScoreStatic = (campaignData: MarketingCampaign) => {
    let multiplier = 1.0;
    let baseReach = 2000;
    let baseConv = 1.5; // en %

    switch (campaignData.channel) {
      case 'influence':
        multiplier = 1.4;
        baseReach = 8000;
        baseConv = 2.4;
        break;
      case 'socials':
        multiplier = 1.6;
        baseReach = 15000;
        baseConv = 1.8;
         break;
      case 'street':
        multiplier = 1.1;
        baseReach = 5000;
        baseConv = 0.8;
        break;
      case 'sampling':
        multiplier = 1.8;
        baseReach = 1500;
        baseConv = 7.5;
        break;
      case 'radio':
        multiplier = 0.9;
        baseReach = 20000;
        baseConv = 0.3;
        break;
    }

    const sloganLen = campaignData.slogan.length;
    let sloganBonus = 0;
    if (sloganLen > 15 && sloganLen < 45) {
      sloganBonus = 0.6;
    } else if (sloganLen >= 45) {
      sloganBonus = 0.2;
    } else {
      sloganBonus = -0.4;
    }

    const calculatedReach = Math.round(baseReach * multiplier);
    const calculatedConv = parseFloat((baseConv + sloganBonus).toFixed(2));
    const clients = Math.round(calculatedReach * (calculatedConv / 100));

    let tempScore = 50;
    if (campaignData.slogan.trim().length > 10) tempScore += 15;
    if (campaignData.target.trim().length > 15) tempScore += 15;
    if (campaignData.channel === 'influence' || campaignData.channel === 'socials') {
      tempScore += 20; 
    } else {
      tempScore += 10;
    }

    let comment = 'Analyse de votre mix : Campagne intéressante. ';
    if (tempScore >= 80) {
      comment += 'Excellente synergie ! Le slogan est percutant et le canal numérique moderne cadre parfaitement avec la cible urbaine choisie.';
    } else if (tempScore >= 60) {
      comment += 'Bons choix. Pensez à peaufiner l’accroche de votre slogan pour maximiser le taux de conversion du canal sélectionné.';
    } else {
      comment += 'La cible est peut-être trop diffuse pour ce mode traditionnel. Privilégiez le ciblage digital ou l’échantillonnage pour un café fin.';
    }

    return {
      score: Math.min(tempScore, 100),
      comment: comment,
      calculatedClients: clients
    };
  };

  // ----------------------------------------------------
  // INITIALIZATIONS & LOAD DATA (HYDRATE ALL IN PARALLEL)
  // ----------------------------------------------------
  useEffect(() => {
    loadAllExerciseData();
  }, []);

  const loadAllExerciseData = async () => {
    try {
      // 1. SWOT
      const sw = await getSwotItems();
      if (sw.length === 0) {
        const seeds: SwotItem[] = [
          { id: 'sw1', type: 'strength', text: 'Chloé est maîtresse torréfactrice certifiée' },
          { id: 'sw2', type: 'strength', text: 'Café de première fraîcheur livré par vélo sous 2h' },
          { id: 'sw3', type: 'weakness', text: 'Faible capacité initiale des machines (10kg max)' },
          { id: 'sw4', type: 'opportunity', text: 'Volonté croissante des consommateurs pour le zéro déchet' },
          { id: 'sw5', type: 'threat', text: 'Variations saisonnières du prix du café brut importé' }
        ];
        for (const item of seeds) {
          await saveSwotItem(item);
        }
        setSwotList(seeds);
      } else {
        setSwotList(sw);
      }

      // 2. Marketing
      const savedCampaign = await getSingleSetting<MarketingCampaign>('mkt_settings', campaign);
      setCampaign(savedCampaign);
      setInitialCampaign(savedCampaign);
      const computedScore = calculateMktScoreStatic(savedCampaign);
      setMktScore(computedScore);

      // 3. Budget
      const bd = await getBudgetItems();
      if (bd.length === 0) {
        const seeds: BudgetItem[] = [
          { id: 'b_yr1', year: 1, revenues: 54000, cogs: 16200, salaries: 15000, marketing: 10000, rent: 4000, other: 2000 },
          { id: 'b_yr2', year: 2, revenues: 82000, cogs: 24600, salaries: 18000, marketing: 12000, rent: 4000, other: 2000 },
          { id: 'b_yr3', year: 3, revenues: 125000, cogs: 37500, salaries: 24000, marketing: 14000, rent: 4000, other: 2000 }
        ];
        for (const item of seeds) {
          await saveBudgetItem(item);
        }
        setBudgetList(seeds);
      } else {
        setBudgetList(bd.sort((a,b) => a.year - b.year));
      }

      // 4. Org Nodes
      const nodes = await getOrgNodes();
      if (nodes.length === 0) {
        const seeds: OrgNode[] = [
          { id: 'n1', name: 'Arthur L.', role: 'Directeur Général & Finance', department: 'Direction' },
          { id: 'n2', name: 'Chloé D.', role: 'Chef de Torréfaction & CTO', department: 'R&D', parentId: 'n1' },
          { id: 'n3', name: 'Sam B.', role: 'Responsable Livraison logistique', department: 'Opérations', parentId: 'n1' },
          { id: 'n4', name: 'Zoe R.', role: 'Consultante Marketing', department: 'Marketing', parentId: 'n2' }
        ];
        for (const item of seeds) {
          await saveOrgNode(item);
        }
        setOrgNodes(seeds);
      } else {
        setOrgNodes(nodes);
      }
    } catch (err) {
      console.error('Erreur de chargement d’exercice:', err);
    }
  };

  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 2000);
  };

  // ----------------------------------------------------
  // SWOT ACTIONS
  // ----------------------------------------------------
  const handleAddSwot = async () => {
    if (!swotText.trim()) return;
    const newItem: SwotItem = {
      id: 'swot_' + Date.now(),
      type: swotType,
      text: swotText.trim()
    };
    try {
      await saveSwotItem(newItem);
      setSwotList((prev) => [...prev, newItem]);
      setSwotText('');
      triggerNotification('Facteur SWOT enregistré !');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSwot = async (id: string) => {
    try {
      await deleteSwotItem(id);
      setSwotList((prev) => prev.filter((i) => i.id !== id));
      triggerNotification('Facteur supprimé de la matrice');
    } catch (err) {
      console.error(err);
    }
  };

  const getSwotByCategory = (type: SwotItem['type']) => {
    return swotList.filter((i) => i.type === type);
  };

  // ----------------------------------------------------
  // MARKETING ACTIONS
  // ----------------------------------------------------
  const handleSimulateCampaign = async () => {
    // Calcul de score théorique basé sur le canal et la pertinence
    let multiplier = 1.0;
    let baseReach = 2000;
    let baseConv = 1.5; // en %

    switch (campaign.channel) {
      case 'influence':
        multiplier = 1.4;
        baseReach = 8000;
        baseConv = 2.4;
        break;
      case 'socials':
        multiplier = 1.6;
        baseReach = 15000;
        baseConv = 1.8;
        break;
      case 'street':
        multiplier = 1.1;
        baseReach = 5000;
        baseConv = 0.8;
        break;
      case 'sampling':
        multiplier = 1.8;
        baseReach = 1500;
        baseConv = 7.5;
        break;
      case 'radio':
        multiplier = 0.9;
        baseReach = 20000;
        baseConv = 0.3;
        break;
    }

    // Le slogan affecte le taux de conversion s’il est inspirant (entre 10 et 100 caractères)
    const sloganLen = campaign.slogan.length;
    let sloganBonus = 0;
    if (sloganLen > 15 && sloganLen < 45) {
      sloganBonus = 0.6;
    } else if (sloganLen >= 45) {
      sloganBonus = 0.2;
    } else {
      sloganBonus = -0.4;
    }

    const calculatedReach = Math.round(baseReach * multiplier);
    const calculatedConv = parseFloat((baseConv + sloganBonus).toFixed(2));
    const clients = Math.round(calculatedReach * (calculatedConv / 100));

    // Calcul d’un score académique sur 100
    let tempScore = 50;
    if (campaign.slogan.trim().length > 10) tempScore += 15;
    if (campaign.target.trim().length > 15) tempScore += 15;
    if (campaign.channel === 'influence' || campaign.channel === 'socials') {
      tempScore += 20; // Plus adapté au café responsable
    } else {
      tempScore += 10;
    }

    let comment = 'Analyse de votre mix : Campagne intéressante. ';
    if (tempScore >= 80) {
      comment += 'Excellente synergie ! Le slogan est percutant et le canal numérique moderne cadre parfaitement avec la cible urbaine choisie.';
    } else if (tempScore >= 60) {
      comment += 'Bons choix. Pensez à peaufiner l’accroche de votre slogan pour maximiser le taux de conversion du canal sélectionné.';
    } else {
      comment += 'La cible est peut-être trop diffuse pour ce mode traditionnel. Privilégiez le ciblage digital ou l’échantillonnage pour un café fin.';
    }

    setMktScore({
      score: Math.min(tempScore, 100),
      comment: comment,
      calculatedClients: clients
    });

    const updated = {
      ...campaign,
      estimatedReach: calculatedReach,
      conversionRate: calculatedConv
    };
    setCampaign(updated);
    setInitialCampaign(updated);
    await saveSingleSetting('mkt_settings', updated);
    triggerNotification('Simulation complétée et sauvegardée !');
  };

  // ----------------------------------------------------
  // BUDGET ACTIONS
  // ----------------------------------------------------
  const handleBudgetChange = async (yearIdx: number, field: keyof BudgetItem, value: number) => {
    const updated = [...budgetList];
    updated[yearIdx] = {
      ...updated[yearIdx],
      [field]: value
    };
    setBudgetList(updated);

    // Save item straight away
    try {
      await saveBudgetItem(updated[yearIdx]);
    } catch (err) {
      console.error(err);
    }
  };

  // ----------------------------------------------------
  // ORG CHART ACTIONS
  // ----------------------------------------------------
  const handleAddOrgNode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNode.name.trim() || !newNode.role.trim()) return;

    const item: OrgNode = {
      id: 'node_' + Date.now(),
      name: newNode.name.trim(),
      role: newNode.role.trim(),
      department: newNode.department,
      parentId: newNode.parentId || undefined
    };

    try {
      await saveOrgNode(item);
      setOrgNodes((prev) => [...prev, item]);
      setNewNode({ name: '', role: '', department: 'Direction', parentId: '' });
      triggerNotification('Poste ajouté à l’organigramme !');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteNode = async (id: string) => {
    try {
      await deleteOrgNode(id);
      // Réajuster les enfants orphelins (supprimer parentId ou les lier au parent supérieur)
      const cleanedNodes = orgNodes
        .filter((n) => n.id !== id)
        .map((n) => {
          if (n.parentId === id) {
            return { ...n, parentId: undefined };
          }
          return n;
        });
      setOrgNodes(cleanedNodes);
      triggerNotification('Poste retiré');
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportActiveExercise = () => {
    if (activeTab === 'swot') {
      exportSwotMatrix(swotList);
    } else if (activeTab === 'marketing') {
      exportMarketingCampaign(campaign, mktScore);
    } else if (activeTab === 'budget') {
      exportBudgetForecast(budgetList);
    } else if (activeTab === 'org_chart') {
      exportOrgChartReport(orgNodes);
    }
  };

  return (
    <div className="space-y-6" id="exercise-section">
      {/* Pills Horizontal Menu */}
      <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3 no-print">
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveTab('swot')}
            id="btn-tab-swot"
            className={`px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition ${
              activeTab === 'swot' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            1. Analyse SWOT
          </button>
          <button
            onClick={() => setActiveTab('marketing')}
            id="btn-tab-mkt"
            className={`px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition ${
              activeTab === 'marketing' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            2. Campagne Marketing
          </button>
          <button
            onClick={() => setActiveTab('budget')}
            id="btn-tab-budget"
            className={`px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition ${
              activeTab === 'budget' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            3. Budget Prévisionnel
          </button>
          <button
            onClick={() => setActiveTab('org_chart')}
            id="btn-tab-org"
            className={`px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition ${
              activeTab === 'org_chart' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            4. Organigramme Interactif
          </button>
        </div>

        {/* Boutons d'export PDF */}
        <div className="flex flex-wrap items-center gap-2 border-t lg:border-t-0 pt-2 lg:pt-0 border-slate-100 justify-end">
          <button
            onClick={() => window.print()}
            className="no-print inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer"
            title="Imprimer l'espace de travail"
            id="btn-print-exercise"
          >
            <Printer className="w-3.5 h-3.5" />
            Imprimer
          </button>
          <button
            onClick={handleExportActiveExercise}
            id="btn-export-active-exercise"
            className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer"
            title="Exporter l'exercice actuellement visible en PDF"
          >
            <Download className="w-3.5 h-3.5" />
            Exporter cet exercice
          </button>
          <button
            onClick={() => exportCombinedBusinessPlan(swotList, campaign, mktScore, budgetList, orgNodes)}
            id="btn-export-combined-bp"
            className="inline-flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer"
            title="Exporter le Business Plan complet consolidé en format PDF"
          >
            <FileText className="w-3.5 h-3.5" />
            Dossier Complet BP (PDF)
          </button>
        </div>
      </div>

      {notification && (
        <div className="bg-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow/50 flex items-center justify-between z-50">
          <span>{notification}</span>
          <span className="text-[10px] bg-emerald-600 px-2 py-0.5 rounded">IndexedDB</span>
        </div>
      )}

      {/* ----------------------------------------------------
          TAB 1: MATRIX SWOT
          ---------------------------------------------------- */}
      {activeTab === 'swot' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-800">Exercice Académique - Matrice SWOT d’un Projeteur</h3>
            <p className="text-xs text-slate-500">
              Formulez les forces internes pour lever des garanties bancaires et les opportunités externes pour capturer le marché d'étude.
            </p>
          </div>

          {/* Formulaire SWOT */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100 grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Axe d’analyse :</label>
              <select
                value={swotType}
                onChange={(e) => setSwotType(e.target.value as any)}
                className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg outline-none font-medium text-slate-700"
                id="swot-select-type"
              >
                <option value="strength">Forces (Strengths - Interne)</option>
                <option value="weakness">Faiblesses (Weaknesses - Interne)</option>
                <option value="opportunity">Opportunités (Opportunities - Externe)</option>
                <option value="threat">Menaces (Threats - Externe)</option>
              </select>
            </div>
            <div className="md:col-span-7">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Formuler l’axe (max 100 caractères) :</label>
              <input
                type="text"
                value={swotText}
                onChange={(e) => setSwotText(e.target.value)}
                placeholder="Ex : Torréfaction verte de première qualité sous label Commerce Équitable"
                className="w-full text-xs p-2.5 bg-white border border-slate-200 focus:border-indigo-500 rounded-lg outline-none"
                id="swot-input-text"
              />
            </div>
            <div className="md:col-span-2">
              <button
                onClick={handleAddSwot}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 rounded-lg transition shrink-0"
                id="btn-add-swot"
              >
                Intégrer l'élément
              </button>
            </div>
          </div>

          {/* Matrix Quadrants Visual design */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* STRENGTHS */}
            <div className="border border-emerald-100 bg-emerald-50/15 rounded-xl p-4 space-y-3">
              <h4 className="font-bold text-sm text-emerald-800 flex items-center justify-between">
                <span>➕ FORCES <span className="text-[10px] font-normal text-emerald-600">(Facteurs Internes Utiles)</span></span>
                <span className="w-5 h-5 bg-emerald-100 rounded text-emerald-700 text-xs flex items-center justify-center font-bold font-mono">
                  {getSwotByCategory('strength').length}
                </span>
              </h4>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {getSwotByCategory('strength').map((v) => (
                  <div key={v.id} className="flex justify-between items-center text-xs p-2 bg-white border border-emerald-100/50 rounded-lg">
                    <span className="text-slate-700 font-medium">{v.text}</span>
                    <button onClick={() => handleDeleteSwot(v.id)} className="text-slate-300 hover:text-red-500 transition">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* WEAKNESSES */}
            <div className="border border-red-100 bg-red-50/15 rounded-xl p-4 space-y-3">
              <h4 className="font-bold text-sm text-red-800 flex items-center justify-between">
                <span>⚠ FAIBLESSES <span className="text-[10px] font-normal text-red-600">(Facteurs Internes Nocifs)</span></span>
                <span className="w-5 h-5 bg-red-100 rounded text-red-700 text-xs flex items-center justify-center font-bold font-mono">
                  {getSwotByCategory('weakness').length}
                </span>
              </h4>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {getSwotByCategory('weakness').map((v) => (
                  <div key={v.id} className="flex justify-between items-center text-xs p-2 bg-white border border-red-100/50 rounded-lg">
                    <span className="text-slate-700 font-medium">{v.text}</span>
                    <button onClick={() => handleDeleteSwot(v.id)} className="text-slate-300 hover:text-red-500 transition">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* OPPORTUNITIES */}
            <div className="border border-indigo-100 bg-indigo-50/15 rounded-xl p-4 space-y-3">
              <h4 className="font-bold text-sm text-indigo-800 flex items-center justify-between">
                <span>↗ OPPORTUNITÉS <span className="text-[10px] font-normal text-indigo-600">(Facteurs Externes Utiles)</span></span>
                <span className="w-5 h-5 bg-indigo-100 rounded text-indigo-700 text-xs flex items-center justify-center font-bold font-mono">
                  {getSwotByCategory('opportunity').length}
                </span>
              </h4>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {getSwotByCategory('opportunity').map((v) => (
                  <div key={v.id} className="flex justify-between items-center text-xs p-2 bg-white border border-indigo-100/50 rounded-lg">
                    <span className="text-slate-700 font-medium">{v.text}</span>
                    <button onClick={() => handleDeleteSwot(v.id)} className="text-slate-300 hover:text-red-500 transition">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* THREATS */}
            <div className="border border-orange-100 bg-orange-50/15 rounded-xl p-4 space-y-3">
              <h4 className="font-bold text-sm text-orange-800 flex items-center justify-between">
                <span>↘ MENACES <span className="text-[10px] font-normal text-orange-600">(Facteurs Externes Nocifs)</span></span>
                <span className="w-5 h-5 bg-orange-100 rounded text-orange-700 text-xs flex items-center justify-center font-bold font-mono">
                  {getSwotByCategory('threat').length}
                </span>
              </h4>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {getSwotByCategory('threat').map((v) => (
                  <div key={v.id} className="flex justify-between items-center text-xs p-2 bg-white border border-orange-100/50 rounded-lg">
                    <span className="text-slate-700 font-medium">{v.text}</span>
                    <button onClick={() => handleDeleteSwot(v.id)} className="text-slate-300 hover:text-red-500 transition">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          TAB 2: MARKETING CAMPAIGN CONSTRUCTOR
          ---------------------------------------------------- */}
      {activeTab === 'marketing' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-800">2. Simulateur de Campagne Marketing</h3>
            <p className="text-xs text-slate-500 font-medium">
              Ajustez les paramètres de votre stratégie d'acquisition client de "Café Vert" pour calculer l'exposition (Reach) théorique et le niveau de clients générés.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
            
            {/* Panel de configuration */}
            <div className="space-y-4 bg-slate-50/60 p-5 rounded-2xl border border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Plan d'action d'exposition</h4>
              
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600">Slogan publicitaire de la marque :</label>
                <input
                  type="text"
                  value={campaign.slogan}
                  onChange={(e) => setCampaign({ ...campaign, slogan: e.target.value })}
                  placeholder="Écrivez une phrase accrocheuse"
                  className="w-full text-xs md:text-sm p-3 bg-white border border-slate-200 focus:border-indigo-500 rounded-xl outline-none"
                  id="mkt-input-slogan"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600">Canal marketing de communication :</label>
                <select
                  value={campaign.channel}
                  onChange={(e) => setCampaign({ ...campaign, channel: e.target.value })}
                  className="w-full text-xs md:text-sm p-3 bg-white border border-slate-200 rounded-xl outline-none"
                  id="mkt-select-channel"
                >
                  <option value="influence">Campagne Influenceurs locaux d'Hypercentre</option>
                  <option value="socials">Publicité Réseaux Sociaux ciblés (Instagram/LinkedIn)</option>
                  <option value="street">Campagne tractage écomobilité gare & bureaux</option>
                  <option value="sampling">Échantillonnage en direct aux bureaux de Coworking</option>
                  <option value="radio">Sponsoring Radio et Podcasts locaux d'activité</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600">Cible de clientèle visée :</label>
                <input
                  type="text"
                  value={campaign.target}
                  onChange={(e) => setCampaign({ ...campaign, target: e.target.value })}
                  placeholder="Ex : Bureaux d’études et coworkers écoresponsables"
                  className="w-full text-xs md:text-sm p-3 bg-white border border-slate-200 rounded-xl outline-none"
                  id="mkt-input-target"
                />
              </div>

              <button
                onClick={handleSimulateCampaign}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 rounded-xl transition"
                id="btn-run-mkt"
              >
                Lancer la Simulation de Impact
              </button>
            </div>

            {/* Résultats de l'analyse */}
            <div className="border border-indigo-100 bg-indigo-50/10 rounded-2xl p-5 md:p-6 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700 flex items-center justify-between pb-2 border-b border-indigo-100">
                  <span>Rapport d'efficacité stratégique</span>
                  <span className="bg-indigo-100 text-indigo-800 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                    Académie
                  </span>
                </h4>
                
                {mktScore ? (
                  <div className="space-y-5 pt-4">
                    <div className="flex items-center gap-4">
                      {/* Score circle */}
                      <div className="w-14 h-14 rounded-full bg-indigo-600 text-white flex flex-col items-center justify-center font-bold">
                        <span className="text-lg line-clamp-1">{mktScore.score}</span>
                        <span className="text-[8px] uppercase tracking-tighter">/ 100</span>
                      </div>
                      
                      <div>
                        <div className="text-xs font-bold text-slate-800">
                          {mktScore.score >= 80 ? '⭐ Campagne Excellente' : mktScore.score >= 60 ? '👍 Projet Qualitatif' : '💡 Améliorations possibles'}
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">Calcul validé par l'algorithme d'adéquation</p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed bg-white border border-indigo-100/50 p-3 rounded-xl italic">
                      « {mktScore.comment} »
                    </p>

                    {/* Funnel simulation metrics */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-white p-2.5 border border-slate-100 rounded-xl text-center">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Audience atteint</div>
                        <div className="text-sm font-mono font-bold text-indigo-900 mt-1">
                          {campaign.estimatedReach.toLocaleString()}
                        </div>
                        <div className="text-[8px] text-slate-400">Prospects (Reach)</div>
                      </div>
                      <div className="bg-white p-2.5 border border-slate-100 rounded-xl text-center">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Taux Convert</div>
                        <div className="text-sm font-mono font-bold text-emerald-600 mt-1">
                          {campaign.conversionRate}%
                        </div>
                        <div className="text-[8px] text-slate-400">de prospects</div>
                      </div>
                      <div className="bg-white p-2.5 border border-slate-100 rounded-xl text-center">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Clients acquis</div>
                        <div className="text-sm font-mono font-bold text-amber-600 mt-1">
                          {mktScore.calculatedClients}
                        </div>
                        <div className="text-[8px] text-slate-400">Abonnés directs</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-400 text-xs italic space-y-2">
                    <Lightbulb className="w-10 h-10 text-indigo-200 mx-auto" />
                    <p>Saisissez vos caractéristiques à gauche puis cliquez sur simuler pour générer le score académique de votre pitch marketing !</p>
                  </div>
                )}
              </div>

              {mktScore && (
                <div className="mt-4 pt-3 border-t border-indigo-100 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                  <span>Modèle mathématique : Réseaux éco-urbains v1.2</span>
                  <span className="flex items-center gap-0.5 text-emerald-600 font-bold">
                    <CheckCircle2 className="w-3 h-3" /> Validé
                  </span>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          TAB 3: BUDGET PRÉVISIONNEL SIMPLIFIÉ
          ---------------------------------------------------- */}
      {activeTab === 'budget' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-800">3. Budget Prévisionnel sur 3 Ans</h3>
            <p className="text-xs text-slate-500">
              Modélisez l’avenir financier du projet. Saisissez ou modifiez les prévisions (Revenus, logistique, communication) pour recalculer automatiquement les profits nets consolidés.
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="min-w-full divide-y divide-slate-100 text-xs md:text-sm">
              <thead className="bg-slate-50 font-bold text-slate-500 uppercase">
                <tr>
                  <th className="px-4 py-3.5 text-left">Poste budgétaire (EUR)</th>
                  {budgetList.map((item, idx) => (
                    <th key={idx} className="px-4 py-3.5 text-center">
                      Année {item.year}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100 font-medium text-slate-700">
                {/* REVENUES */}
                <tr className="bg-emerald-50/20">
                  <td className="px-4 py-3 font-bold text-emerald-800">
                    📈 Chiffre d’affaires (Revenus)
                  </td>
                  {budgetList.map((item, idx) => (
                    <td key={idx} className="px-4 py-3 text-center">
                      <input
                        type="number"
                        value={item.revenues}
                        onChange={(e) => handleBudgetChange(idx, 'revenues', parseInt(e.target.value) || 0)}
                        className="w-24 text-center p-1 border border-slate-200 rounded font-mono font-semibold"
                      />
                    </td>
                  ))}
                </tr>

                {/* COGS */}
                <tr>
                  <td className="px-4 py-3">
                    🍂 Coûts des marchandises (Café vert brut, sachets)
                  </td>
                  {budgetList.map((item, idx) => (
                    <td key={idx} className="px-4 py-3 text-center">
                      <input
                        type="number"
                        value={item.cogs}
                        onChange={(e) => handleBudgetChange(idx, 'cogs', parseInt(e.target.value) || 0)}
                        className="w-24 text-center p-1 border border-slate-200 rounded font-mono"
                      />
                    </td>
                  ))}
                </tr>

                {/* SALARIES */}
                <tr>
                  <td className="px-4 py-3">
                    👥 Salaires & Charges sociales (Mains d'œuvre)
                  </td>
                  {budgetList.map((item, idx) => (
                    <td key={idx} className="px-4 py-3 text-center">
                      <input
                        type="number"
                        value={item.salaries}
                        onChange={(e) => handleBudgetChange(idx, 'salaries', parseInt(e.target.value) || 0)}
                        className="w-24 text-center p-1 border border-slate-200 rounded font-mono"
                      />
                    </td>
                  ))}
                </tr>

                {/* MARKETING */}
                <tr>
                  <td className="px-4 py-3">
                    📢 Publicité, E-Commerce, Influence locale
                  </td>
                  {budgetList.map((item, idx) => (
                    <td key={idx} className="px-4 py-3 text-center">
                      <input
                        type="number"
                        value={item.marketing}
                        onChange={(e) => handleBudgetChange(idx, 'marketing', parseInt(e.target.value) || 0)}
                        className="w-24 text-center p-1 border border-slate-200 rounded font-mono"
                      />
                    </td>
                  ))}
                </tr>

                {/* RENT */}
                <tr>
                  <td className="px-4 py-3">
                    🏢 Loyers de local technique, Assurance, Électricité
                  </td>
                  {budgetList.map((item, idx) => (
                    <td key={idx} className="px-4 py-3 text-center">
                      <input
                        type="number"
                        value={item.rent}
                        onChange={(e) => handleBudgetChange(idx, 'rent', parseInt(e.target.value) || 0)}
                        className="w-24 text-center p-1 border border-slate-200 rounded font-mono"
                      />
                    </td>
                  ))}
                </tr>

                {/* OTHER */}
                <tr>
                  <td className="px-4 py-3">
                    📦 Divers, banques, abonnements logiciels
                  </td>
                  {budgetList.map((item, idx) => (
                    <td key={idx} className="px-4 py-3 text-center">
                      <input
                        type="number"
                        value={item.other}
                        onChange={(e) => handleBudgetChange(idx, 'other', parseInt(e.target.value) || 0)}
                        className="w-24 text-center p-1 border border-slate-200 rounded font-mono"
                      />
                    </td>
                  ))}
                </tr>

                {/* TOTAL OUTS */}
                <tr className="bg-slate-50 font-bold text-slate-500">
                  <td className="px-4 py-3.5">
                    Coûts Opérationnels Globaux (Total)
                  </td>
                  {budgetList.map((item) => {
                    const totalCosts = item.cogs + item.salaries + item.marketing + item.rent + item.other;
                    return (
                      <td key={item.id} className="px-4 py-3.5 text-center font-mono">
                        {totalCosts.toLocaleString()} €
                      </td>
                    );
                  })}
                </tr>

                {/* CONSOLIDATED PROFIT */}
                <tr className="bg-slate-100 font-bold">
                  <td className="px-4 py-4 text-xs md:text-sm text-slate-800">
                    💰 RÉSULTAT NET PRÉVISIONNEL (Bénéfice)
                  </td>
                  {budgetList.map((item) => {
                    const totalCosts = item.cogs + item.salaries + item.marketing + item.rent + item.other;
                    const profit = item.revenues - totalCosts;
                    const margin = item.revenues > 0 ? Math.round((profit / item.revenues) * 100) : 0;
                    return (
                      <td key={item.id} className="px-4 py-4 text-center font-mono text-xs md:text-sm">
                        <span className={profit >= 0 ? 'text-emerald-700' : 'text-rose-600'}>
                          {profit >= 0 ? '+' : ''}{profit.toLocaleString()} €
                        </span>
                        <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                          Marge : {margin}%
                        </div>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Graphical Representation of Profit: Custom Responsive SVG Chart */}
          <div className="bg-slate-50 rounded-2xl border border-slate-150 p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-indigo-500" />
                Tableau consolidé des bénéfices (Marge nette / an)
              </h4>
              <span className="text-[10px] text-slate-400 font-bold">Mis à jour dynamique</span>
            </div>

            <div className="h-40 w-full bg-white border border-slate-100 rounded-xl p-3">
              <svg viewBox="0 0 500 120" className="w-full h-full">
                {/* Horizontal baseline Y=60 for Zero profit balance */}
                <line x1="30" y1="60" x2="470" y2="60" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3,1" />
                <text x="5" y="63" fill="#94a3b8" fontSize="8" fontFamily="monospace">0€</text>

                {budgetList.map((item, idx) => {
                  const totalCosts = item.cogs + item.salaries + item.marketing + item.rent + item.other;
                  const profit = item.revenues - totalCosts;
                  
                  // Scale coordinates: max absolute range is disons 60,000 EUR
                  const scaleY = 40 / 60000; // factor
                  const barHeight = Math.min(Math.abs(profit) * scaleY, 45);
                  
                  // X coordinates
                  const blockWidth = 140;
                  const startX = 65 + (idx * blockWidth);

                  // Bar dimensions
                  const isPositive = profit >= 0;
                  const y = isPositive ? (60 - barHeight) : 60;

                  return (
                    <g key={item.id}>
                      {/* Bar body */}
                      <rect
                        x={startX}
                        y={y}
                        width="30"
                        height={barHeight}
                        fill={isPositive ? '#10b981' : '#f43f5e'}
                        rx="3"
                        className="transition-all duration-300"
                      />
                      
                      {/* Annotation value top of positive / under of negative */}
                      <text
                        x={startX + 15}
                        y={isPositive ? y - 6 : y + barHeight + 11}
                        fill={isPositive ? '#047857' : '#be123c'}
                        fontSize="8"
                        fontWeight="bold"
                        fontFamily="monospace"
                        textAnchor="middle"
                      >
                        {profit >= 0 ? '+' : ''}{Math.round(profit / 1000)} k€
                      </text>

                      {/* Tick Label */}
                      <text
                        x={startX + 15}
                        y="112"
                        fill="#475569"
                        fontSize="9"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        Année {item.year}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          TAB 4: DYNAMIC ORGANIGRAMME INTERACTIF
          ---------------------------------------------------- */}
      {activeTab === 'org_chart' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-800">4. Structure & Organigramme Académique</h3>
            <p className="text-xs text-slate-500">
              Définissez la répartition logistique des rôles. Ajoutez des collaborateurs et reliez-les hiérarchiquement pour visualiser la direction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Formulaire d'ajout de poste */}
            <form onSubmit={handleAddOrgNode} className="md:col-span-4 bg-slate-50/60 border border-slate-100 p-5 rounded-2xl space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <UserPlus className="w-4 h-4 text-indigo-600" />
                Embrayer un nouveau poste
              </h4>
              
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-600">Nom du titulaire :</label>
                <input
                  type="text"
                  required
                  value={newNode.name}
                  onChange={(e) => setNewNode({ ...newNode, name: e.target.value })}
                  placeholder="Ex : Maxime P."
                  className="w-full text-xs p-2.5 bg-white border border-slate-200 focus:border-indigo-500 rounded-lg outline-none"
                  id="org-input-name"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-600">Fiche de Poste / Rôle :</label>
                <input
                  type="text"
                  required
                  value={newNode.role}
                  onChange={(e) => setNewNode({ ...newNode, role: e.target.value })}
                  placeholder="Ex : Chargé d’Affaires B2B"
                  className="w-full text-xs p-2.5 bg-white border border-slate-200 focus:border-indigo-500 rounded-lg outline-none"
                  id="org-input-role"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-600">Département :</label>
                <select
                  value={newNode.department}
                  onChange={(e) => setNewNode({ ...newNode, department: e.target.value as any })}
                  className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg outline-none font-medium text-slate-700"
                  id="org-select-dep"
                >
                  <option value="Direction">Direction</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Opérations">Opérations</option>
                  <option value="Finance">Finance</option>
                  <option value="R&D">R&D</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-600">Rattachement Hiérarchique (Supérieur) :</label>
                <select
                  value={newNode.parentId}
                  onChange={(e) => setNewNode({ ...newNode, parentId: e.target.value })}
                  className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg outline-none font-medium text-slate-700"
                  id="org-select-parent"
                >
                  <option value="">Aucun supérieur direct (Top Niveau)</option>
                  {orgNodes.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.name} ({n.role})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 rounded-lg transition"
                id="btn-add-org-node"
              >
                Inscrire le collaborateur
              </button>
            </form>

            {/* Visualisation Hiérarchique & Arborescence */}
            <div className="md:col-span-8 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                <span>Organigramme institutionnel</span>
                <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-mono">
                  {orgNodes.length} effectifs cumulés
                </span>
              </h4>

              {/* Arborescence en cascade simple et esthétique */}
              <div className="bg-slate-50 border border-slate-150 p-5 rounded-2xl min-h-[300px] space-y-4 overflow-x-auto">
                {/* 1. Find root level nodes (without parents) */}
                {orgNodes.filter(n => !n.parentId).length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-12">
                    Aucun poste de pilotage racine défini. Créez un poste sans supérieur d’appui.
                  </p>
                ) : (
                  orgNodes.filter(n => !n.parentId).map((rootNode) => (
                    <div key={rootNode.id} className="space-y-4">
                      {/* Root Card wrapper */}
                      <div className="flex items-center gap-3">
                        <div className="relative border-l-4 border-indigo-600 bg-white shadow-sm p-3.5 rounded-xl flex justify-between items-center w-full max-w-md border border-slate-100">
                          <div>
                            <div className="font-bold text-xs text-slate-800">{rootNode.name}</div>
                            <div className="text-[11px] text-slate-500">{rootNode.role}</div>
                            <span className="text-[8px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-bold uppercase mt-1 inline-block">
                              {rootNode.department}
                            </span>
                          </div>
                          
                          <button
                            onClick={() => handleDeleteNode(rootNode.id)}
                            className="text-slate-300 hover:text-rose-500 transition-colors p-1"
                            title="Licencier / Supprimer"
                            id={`btn-delete-node-${rootNode.id}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Render Children under root node */}
                      <div className="pl-8 border-l border-indigo-100/70 border-dashed space-y-3">
                        {orgNodes.filter(child => child.parentId === rootNode.id).map((childNode) => (
                          <div key={childNode.id} className="relative flex items-center gap-2">
                            {/* Horizontal guide bracket */}
                            <span className="absolute -left-4 w-4 h-px bg-indigo-100 border-dashed"></span>
                            
                            <div className="border-l-4 border-slate-400 bg-white shadow-sm p-3 rounded-xl flex justify-between items-center w-full max-w-sm border border-slate-100 ml-1">
                              <div>
                                <div className="font-bold text-xs text-slate-700">{childNode.name}</div>
                                <div className="text-[10px] text-slate-500">{childNode.role}</div>
                                <span className="text-[8px] bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded font-bold uppercase mt-1 inline-block">
                                  {childNode.department}
                                </span>
                              </div>
                              <button
                                onClick={() => handleDeleteNode(childNode.id)}
                                className="text-slate-300 hover:text-rose-500 transition-colors p-1"
                                id={`btn-delete-node-${childNode.id}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                    </div>
                  ))
                )}
              </div>

              <div className="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100 text-[11px] text-indigo-900 leading-relaxed max-w-md">
                💡 <strong>Règle académique :</strong> L’alignement des fonctions RH justifie notre capacité d’absorption logistique. Chaque collaborateur ajouté est instantanément enregistré dans l'IndexedDB du navigateur.
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
