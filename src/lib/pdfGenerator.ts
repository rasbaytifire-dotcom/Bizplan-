import { jsPDF } from 'jspdf';
import { QuizAttempt, LexiconTerm, SwotItem, BudgetItem, OrgNode } from '../types';

interface BmcItem {
  id: string;
  items: string[];
}

interface AcademicReportData {
  progressPercentage: number;
  avgScore: number;
  completedChapters: string[];
  quizAttempts: QuizAttempt[];
  lexiconTerms: LexiconTerm[];
  swotItems: SwotItem[];
  bmcItems: BmcItem[];
  budgetItems: BudgetItem[];
  orgNodes: OrgNode[];
}

export function generateAcademicReport(data: AcademicReportData) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  let y = 20;
  const margin = 15;
  const pageWidth = 210;
  const pageHeight = 297;
  const printableWidth = pageWidth - 2 * margin;
  let pageNum = 1;

  // Colors
  const primaryColor = [63, 55, 201];     // indigo 700
  const neutralDark = [15, 23, 42];       // slate 900
  const neutralMedium = [71, 85, 105];    // slate 600
  const neutralLight = [148, 163, 184];    // slate 400
  const emeraldColor = [5, 150, 105];     // emerald 600
  const amberColor = [217, 119, 6];       // amber 600

  // Standard chapters definitions to map IDs
  const chaptersMap: Record<string, string> = {
    intro: '1. Introduction au Business Plan',
    market: '2. L’Étude de Marché',
    strategy: '3. La Stratégie Générale & Marketing',
    org: '4. Organisation, Équipe & Ressources Humaines',
    ops: '5. Le Plan Opérationnel',
    finance: '6. Le Plan Financier Prévisionnel',
    annexes: '7. Les Annexes & Pitch',
  };

  const getDayMonthYear = () => {
    const today = new Date();
    return today.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const drawBorderAndHeaders = (isFirstPage: boolean) => {
    // 1. Draw outer boundary frame
    doc.setDrawColor(226, 232, 240); // slate 200
    doc.setLineWidth(0.4);
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

    if (isFirstPage) {
      // Background gradient header plate
      doc.setFillColor(248, 250, 252); // slate 50
      doc.rect(11, 11, pageWidth - 22, 28, 'F');

      // Top line accent
      doc.setDrawColor(63, 55, 201); // indigo 700
      doc.setLineWidth(1.5);
      doc.line(11, 39, pageWidth - 11, 39);

      // Title branding
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('BIZPLAN ACADEMY', margin, 21);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(neutralMedium[0], neutralMedium[1], neutralMedium[2]);
      doc.text('FORMATION ACADÉMIQUE & SIMULATEUR ENTREPRENEURIAL', margin, 26);
      doc.text(`Édition du rapport : ${getDayMonthYear()}`, margin, 31);

      // Mini brand label top-right
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(neutralDark[0], neutralDark[1], neutralDark[2]);
      doc.text('THERIDIALART VISION', pageWidth - margin - 42, 21);
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(neutralLight[0], neutralLight[1], neutralLight[2]);
      doc.text('ATELIER DE PRODUCTION ARTISTIQUE', pageWidth - margin - 42, 25);
    } else {
      // Inner running top secondary header line
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.line(11, 20, pageWidth - 11, 20);

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('Rapport Académique individuel', margin, 16);

      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(neutralLight[0], neutralLight[1], neutralLight[2]);
      doc.text('BizPlan Academy', pageWidth - margin - 25, 16);
    }

    // Standard footer running text
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(neutralLight[0], neutralLight[1], neutralLight[2]);
    doc.text('Rapport personnel d’apprentissage — Entrepreneuriat culturel et ingénierie de projet.', margin, 287);
    doc.text(`Page ${pageNum}`, pageWidth - margin - 10, 287);
  };

  const checkPageSpace = (heightNeeded: number) => {
    if (y + heightNeeded > 270) {
      doc.addPage();
      pageNum++;
      y = 25;
      drawBorderAndHeaders(false);
    }
  };

  const drawSectionTitle = (title: string) => {
    checkPageSpace(14);
    y += 4;
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(title.toUpperCase(), margin, y);
    y += 2.5;

    // Small underscore rule
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(0.6);
    doc.line(margin, y, margin + 25, y);
    y += 5.5;
  };

  // 1. First Page setup
  drawBorderAndHeaders(true);
  y = 48;

  // Introduction / Professional Banner
  checkPageSpace(25);
  doc.setFillColor(243, 244, 246); // gray 100
  doc.rect(margin, y, printableWidth, 18, 'F');
  doc.setFont('Helvetica', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(neutralDark[0], neutralDark[1], neutralDark[2]);
  
  const introTxtLines = doc.splitTextToSize(
    "Ce rapport certifie votre engagement académique au sein de la BizPlan Academy. Il regroupe l’état actuel de votre progression théorique, vos exploits aux questionnaires d’évaluation (quiz), ainsi que l’élaboration opérationnelle et financière de votre projet de création artistique et culturelle.",
    printableWidth - 6
  );
  doc.text(introTxtLines, margin + 3, y + 5);
  y += 24;

  // --- SECTION 1: BILAN DE PROGRESSION GLOBAL ---
  drawSectionTitle('1. Bilan Académique Global');
  
  // Dashboard indicators boxed
  checkPageSpace(45);
  const indWidth = printableWidth / 3;
  
  // Box 1 : Progression
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, y, indWidth - 2, 28, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, y, indWidth - 2, 28, 'S');
  
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(neutralMedium[0], neutralMedium[1], neutralMedium[2]);
  doc.text('SCORE ACADÉMIQUE', margin + 4, y + 6);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(`${data.progressPercentage}%`, margin + 4, y + 16);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(neutralMedium[0], neutralMedium[1], neutralMedium[2]);
  doc.text('Théorie & simulations validées', margin + 4, y + 23);

  // Box 2 : Chapitres Complétés
  const cOffset = indWidth;
  doc.setFillColor(248, 250, 252);
  doc.rect(margin + cOffset, y, indWidth - 2, 28, 'F');
  doc.rect(margin + cOffset, y, indWidth - 2, 28, 'S');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(neutralMedium[0], neutralMedium[1], neutralMedium[2]);
  doc.text('MODULES TERMINÉS', margin + cOffset + 4, y + 6);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(emeraldColor[0], emeraldColor[1], emeraldColor[2]);
  doc.text(`${data.completedChapters.length} / 7`, margin + cOffset + 4, y + 16);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(neutralMedium[0], neutralMedium[1], neutralMedium[2]);
  doc.text('Unités d’études validées', margin + cOffset + 4, y + 23);

  // Box 3 : Moyenne Quiz & Lexique
  const rOffset = indWidth * 2;
  doc.setFillColor(248, 250, 252);
  doc.rect(margin + rOffset, y, indWidth, 28, 'F');
  doc.rect(margin + rOffset, y, indWidth, 28, 'S');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(neutralMedium[0], neutralMedium[1], neutralMedium[2]);
  doc.text('SUCCÈS MOYEN QUIZ', margin + rOffset + 4, y + 6);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(amberColor[0], amberColor[1], amberColor[2]);
  doc.text(`${data.avgScore}%`, margin + rOffset + 4, y + 16);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(neutralMedium[0], neutralMedium[1], neutralMedium[2]);
  doc.text(`${data.lexiconTerms.length} termes enregistrés`, margin + rOffset + 4, y + 23);

  y += 34;

  // --- SECTION 2: SUIVI COMPLET DE CHACUN DES MODULES ACADÉMIQUES ---
  drawSectionTitle('2. État détaillé des modules constitutifs');

  // Table header
  checkPageSpace(12);
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, printableWidth, 7, 'F');
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(neutralDark[0], neutralDark[1], neutralDark[2]);
  doc.text('MODULE', margin + 3, y + 4.8);
  doc.text('STATUT D’APPRENTISSAGE', margin + 85, y + 4.8);
  doc.text('RÉSULTAT DU QUIZ', margin + 145, y + 4.8);
  y += 7;

  // Rows of modules
  Object.keys(chaptersMap).forEach((id) => {
    checkPageSpace(10);
    const title = chaptersMap[id];
    const isCompleted = data.completedChapters.includes(id);
    
    // Find latest quiz attempt
    const attempt = data.quizAttempts.find(a => a.chapterId === id);
    let quizResult = 'Aucune tentative';
    if (attempt) {
      quizResult = `${attempt.score} / ${attempt.total} (${Math.round((attempt.score / attempt.total) * 100)}%)`;
    }

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(neutralDark[0], neutralDark[1], neutralDark[2]);
    doc.text(title, margin + 3, y + 5.5);

    // Status formatted pill
    if (isCompleted) {
      doc.setFillColor(209, 250, 229); // emerald 100
      doc.rect(margin + 85, y + 1.5, 28, 4.5, 'F');
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(emeraldColor[0], emeraldColor[1], emeraldColor[2]);
      doc.text('COMPLÉTÉ  ', margin + 87.5, y + 4.8);
    } else {
      doc.setFillColor(254, 243, 199); // amber 100
      doc.rect(margin + 85, y + 1.5, 28, 4.5, 'F');
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(amberColor[0], amberColor[1], amberColor[2]);
      doc.text('EN APPRENTISSAGE', margin + 86.5, y + 4.8);
    }

    // Quiz result representation
    doc.setFont('Helvetica', attempt ? 'bold' : 'normal');
    doc.setFontSize(8);
    doc.setTextColor(attempt ? neutralDark[0] : neutralLight[0]);
    doc.text(quizResult, margin + 145, y + 5.5);

    // Row separator line
    doc.setDrawColor(241, 245, 249);
    doc.setLineWidth(0.2);
    doc.line(margin, y + 7.5, margin + printableWidth, y + 7.5);

    y += 7.5;
  });

  y += 5;

  // --- SECTION 3: MODÉLISATION STRATÉGIQUE (SWOT & BMC) ---
  drawSectionTitle('3. Modélisation opérationnelle & Simulation');

  // Business Model Canvas Subsection
  checkPageSpace(15);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(neutralDark[0], neutralDark[1], neutralDark[2]);
  doc.text('Segments Saisis du Business Model Canvas (BMC)', margin, y);
  y += 5;

  const bmcHeaderTextsByCell: Record<string, string> = {
    partners: 'Partenaires Clés',
    activities: 'Activités Clés',
    resources: 'Ressources Clés',
    propositions: 'Propositions de Valeur',
    relationships: 'Relations Clients',
    channels: 'Canaux de Distribution',
    segments: 'Segments de Clientèle Target',
    costs: 'Structure de Coûts',
    revenues: 'Sources de Revenus'
  };

  if (data.bmcItems && data.bmcItems.length > 0) {
    let itemsFoundCount = 0;
    data.bmcItems.forEach((segment) => {
      if (segment.items && segment.items.length > 0 && segment.items.some(it => it.trim())) {
        checkPageSpace(16);
        const nameFr = bmcHeaderTextsByCell[segment.id] || segment.id;
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text(`⊙ ${nameFr} :`, margin + 3, y);
        y += 4;

        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(neutralDark[0], neutralDark[1], neutralDark[2]);
        
        const validItems = segment.items.filter(it => it.trim());
        const listText = validItems.map(it => `• ${it}`).join('    ');
        const lines = doc.splitTextToSize(listText, printableWidth - 8);
        doc.text(lines, margin + 6, y);
        y += lines.length * 4 + 1.5;
        itemsFoundCount++;
      }
    });

    if (itemsFoundCount === 0) {
      checkPageSpace(10);
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(neutralLight[0], neutralLight[1], neutralLight[2]);
      doc.text("Aucun élément n'a encore été saisi dans le Business Model Canvas interactif.", margin + 3, y);
      y += 6;
    }
  } else {
    checkPageSpace(10);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(neutralLight[0], neutralLight[1], neutralLight[2]);
    doc.text("Aucun élément n'a encore été saisi dans le Business Model Canvas interactif.", margin + 3, y);
    y += 6;
  }

  y += 4;

  // SWOT Analysis Subsection
  checkPageSpace(15);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(neutralDark[0], neutralDark[1], neutralDark[2]);
  doc.text('Synthèse de l’Analyse Matricielle SWOT', margin, y);
  y += 5;

  const categoriesSwot = {
    strength: { title: 'Forces (Facteurs Internes)', icon: '↳ S', color: emeraldColor },
    weakness: { title: 'Faiblesses (Facteurs Internes)', icon: '↳ W', color: amberColor },
    opportunity: { title: 'Opportunités (Facteurs Externes)', icon: '↳ O', color: primaryColor },
    threat: { title: 'Menaces (Facteurs Externes)', icon: '↳ T', color: [-200, 50, 50] as [number, number, number] }
  };

  const hasSwot = data.swotItems && data.swotItems.length > 0;
  if (hasSwot) {
    let itemsFound = false;
    for (const [key, meta] of Object.entries(categoriesSwot)) {
      const items = data.swotItems.filter(item => item.type === key);
      if (items.length > 0) {
        checkPageSpace(15);
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(meta.color[0], meta.color[1], meta.color[2]);
        doc.text(`${meta.icon} - ${meta.title} :`, margin + 3, y);
        y += 4;

        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(neutralDark[0], neutralDark[1], neutralDark[2]);
        
        const listText = items.map(it => `• ${it.text}`).join(' | ');
        const lines = doc.splitTextToSize(listText, printableWidth - 8);
        doc.text(lines, margin + 6, y);
        y += lines.length * 4 + 2;
        itemsFound = true;
      }
    }

    if (!itemsFound) {
      checkPageSpace(10);
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(neutralLight[0], neutralLight[1], neutralLight[2]);
      doc.text("Aucun point SWOT n'a encore été formalisé pour le projet d'entreprise.", margin + 3, y);
      y += 6;
    }
  } else {
    checkPageSpace(10);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(neutralLight[0], neutralLight[1], neutralLight[2]);
    doc.text("Aucune analyse stratégique SWOT de l’environnement n'a été saisie pour le moment.", margin + 3, y);
    y += 6;
  }

  y += 4;

  // --- SECTION 4: BUDGET & ORGANISATION OPÉRATIONNELLE ---
  drawSectionTitle('4. Planification Opérationnelle & Financière');

  // Budget Simulation table
  checkPageSpace(15);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(neutralDark[0], neutralDark[1], neutralDark[2]);
  doc.text('Plan Prévisionnel d’Exploitation (Synthèse du Budget)', margin, y);
  y += 5;

  const validBudgetItems = data.budgetItems && data.budgetItems.length > 0;
  if (validBudgetItems) {
    checkPageSpace(28);
    // Table headers for budget
    doc.setFillColor(248, 250, 252);
    doc.rect(margin, y, printableWidth, 5.5, 'F');
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(neutralDark[0], neutralDark[1], neutralDark[2]);
    
    doc.text('Poste Budgétaire', margin + 3, y + 4);
    doc.text('Année 1', margin + 65, y + 4);
    doc.text('Année 2', margin + 105, y + 4);
    doc.text('Année 3', margin + 145, y + 4);
    y += 5.5;

    // Create rows
    const categoriesBudget = [
      { key: 'revenues', label: 'Chiffre d’Affaires Prévisionnel (Ventes)' },
      { key: 'cogs', label: 'Coût des Matières Premières & Approvisionnements (COGS)' },
      { key: 'salaries', label: 'Frais de Personnel & Charges Sociales' },
      { key: 'marketing', label: 'Investissements Marketing & Promotion web' },
      { key: 'rent', label: 'Loyer Commercial & Charges Immobilières' },
      { key: 'other', label: 'Frais Généraux, Assurances & Autres Charges' },
    ];

    const getVal = (yearNum: number, key: string) => {
      const item = data.budgetItems.find(it => it.year === yearNum);
      if (!item) return 0;
      return (item as any)[key] || 0;
    };

    categoriesBudget.forEach((cat) => {
      checkPageSpace(7.5);
      doc.setFont('Helvetica', cat.key === 'revenues' ? 'bold' : 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(neutralDark[0], neutralDark[1], neutralDark[2]);
      
      doc.text(cat.label, margin + 3, y + 5);
      doc.text(`${getVal(1, cat.key).toLocaleString()} €`, margin + 65, y + 5);
      doc.text(`${getVal(2, cat.key).toLocaleString()} €`, margin + 105, y + 5);
      doc.text(`${getVal(3, cat.key).toLocaleString()} €`, margin + 145, y + 5);
      
      doc.setDrawColor(241, 245, 249);
      doc.setLineWidth(0.15);
      doc.line(margin, y + 6.5, margin + printableWidth, y + 6.5);
      y += 6.5;
    });

    // Net Result Calculation Row
    checkPageSpace(9);
    doc.setFillColor(240, 253, 244); // light green
    doc.rect(margin, y, printableWidth, 6.5, 'F');
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(emeraldColor[0], emeraldColor[1], emeraldColor[2]);

    const calcNetResult = (yr: number) => {
      const item = data.budgetItems.find(it => it.year === yr);
      if (!item) return 0;
      return item.revenues - (item.cogs + item.salaries + item.marketing + item.rent + item.other);
    };

    doc.text('Résultat Opérationnel Net Brut Estimé', margin + 3, y + 4.5);
    doc.text(`${calcNetResult(1).toLocaleString()} €`, margin + 65, y + 4.5);
    doc.text(`${calcNetResult(2).toLocaleString()} €`, margin + 105, y + 4.5);
    doc.text(`${calcNetResult(3).toLocaleString()} €`, margin + 145, y + 4.5);
    y += 9;
  } else {
    checkPageSpace(10);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(neutralLight[0], neutralLight[1], neutralLight[2]);
    doc.text("Aucun budget prévisionnel n'a encore été configuré dans l'atelier financier.", margin + 3, y);
    y += 6;
  }

  y += 3;

  // Org Chart Node list
  checkPageSpace(15);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(neutralDark[0], neutralDark[1], neutralDark[2]);
  doc.text('Plan de Ressources Humaines (Gouvernance)', margin, y);
  y += 5;

  const hasNodes = data.orgNodes && data.orgNodes.length > 0;
  if (hasNodes) {
    checkPageSpace(12);
    // Print roles structured
    let listDesc = data.orgNodes.map(node => `• ${node.name} — ${node.role} (${node.department})`).join('  |  ');
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(neutralDark[0], neutralDark[1], neutralDark[2]);

    const lines = doc.splitTextToSize(listDesc, printableWidth - 6);
    doc.text(lines, margin + 3, y);
    y += lines.length * 4 + 4;
  } else {
    checkPageSpace(10);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(neutralLight[0], neutralLight[1], neutralLight[2]);
    doc.text("L'organigramme de l'équipe fondatrice et des collaborateurs n'a pas encore été structuré.", margin + 3, y);
    y += 6;
  }

  y += 4;

  // --- SECTION 5: RECOMMENDATIONS CONSULTANT / EVALUATEUR ---
  drawSectionTitle('5. Recommandations de l’expert culturel');

  checkPageSpace(35);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.setFillColor(255, 255, 255);
  doc.rect(margin, y, printableWidth, 24, 'F');
  
  // Indigo border stroke indicator
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(margin, y, 1.5, 24, 'F');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('ORIENTATIONS CONSEILLÉES :', margin + 4, y + 5.5);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(neutralDark[0], neutralDark[1], neutralDark[2]);
  
  let expertAdvice = '';
  if (data.progressPercentage === 100) {
    expertAdvice = 'Félicitations ! Vous possédez désormais une maîtrise académique globale et un business plan complet. Nous vous encourageons à confronter vos hypothèses à la dure réalité du marché en effectuant de premiers tests de concept ou en soumettant ce dossier à vos partenaires financiers.';
  } else if (data.progressPercentage > 60) {
    expertAdvice = 'Votre projet prend une tournure très professionnelle et l’essentiel des fondamentaux est acquis. Consolidez les simulations financières et organigrammes restants afin de garantir une totale cohérence globale de votre architecture d’entreprise.';
  } else {
    expertAdvice = 'Vous êtes sur la bonne voie d’apprentissage. L’accès au marché artistique exige de bien comprendre vos personas, d’isoler consciencieusement votre proposition de valeur et d’étudier le point mort opérationnel. Prenez le temps de revoir les cours et compléter chaque quiz.';
  }

  const adviceLines = doc.splitTextToSize(expertAdvice, printableWidth - 8);
  doc.text(adviceLines, margin + 4, y + 10);

  y += 35;

  // Final Signature Block
  checkPageSpace(25);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(neutralDark[0], neutralDark[1], neutralDark[2]);
  doc.text('Le Directeur de la Formation', pageWidth - margin - 55, y);
  
  doc.setFont('Helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(neutralMedium[0], neutralMedium[1], neutralMedium[2]);
  doc.text('Theridialart Vision - Académie', pageWidth - margin - 55, y + 4.5);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(neutralLight[0], neutralLight[1], neutralLight[2]);
  doc.text('Document certifié authentique', pageWidth - margin - 55, y + 8.5);

  // Download PDF
  doc.save('BizPlan_Academy_Rapport_Progress.pdf');
}
