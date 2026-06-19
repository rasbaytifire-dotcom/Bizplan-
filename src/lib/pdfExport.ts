import { jsPDF } from 'jspdf';
import { SwotItem, MarketingCampaign, BudgetItem, OrgNode, QuizAttempt, Chapter } from '../types';

// Helper to draw clean header on pages
function drawHeader(doc: jsPDF, title: string, pageNum: number, totalPages?: number) {
  // Top Primary background band for title
  doc.setFillColor(30, 27, 75); // Indigo-900 / Navy
  doc.rect(0, 0, 210, 32, 'F');

  // Decorative border
  doc.setFillColor(79, 70, 229); // Indigo-600
  doc.rect(0, 32, 210, 2, 'F');

  // Academy Name
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('BIZPLAN ACADEMY', 15, 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(199, 210, 254);
  doc.text('Outil Académique & Simulation d\'Entreprise', 15, 22);

  // Report title right-aligned
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  const textWidth = doc.getTextWidth(title);
  doc.text(title, 195 - textWidth, 15);

  // Date
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(199, 210, 254);
  const dateStr = `Généré le : ${new Date().toLocaleDateString('fr-FR')} ${new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}`;
  const dateWidth = doc.getTextWidth(dateStr);
  doc.text(dateStr, 195 - dateWidth, 22);

  // Footer page number
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('BizPlan Academy - Confidentiel & Certifié', 15, 288);
  
  const pageStr = totalPages ? `Page ${pageNum} / ${totalPages}` : `Page ${pageNum}`;
  const pageStrWidth = doc.getTextWidth(pageStr);
  doc.text(pageStr, 195 - pageStrWidth, 288);

  // Restore defaults
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
}

// Helper to wrap and print text with page overflow safety
function printWrappedText(doc: jsPDF, text: string, x: number, y: number, maxWidth: number, lineHeight: number = 6): number {
  const lines = doc.splitTextToSize(text, maxWidth);
  lines.forEach((line: string) => {
    if (y > 270) {
      doc.addPage();
      drawHeader(doc, 'Rapport de Validation', doc.getNumberOfPages());
      y = 45;
    }
    doc.text(line, x, y);
    y += lineHeight;
  });
  return y;
}

/**
 * 1. Export a single Quiz evaluation attempt
 */
export function exportSingleQuizAttempt(
  chapter: Chapter,
  score: number,
  total: number,
  date: string,
  passed: boolean,
  questions: { question: string; options: string[]; correctAnswerIndex: number; explanation: string }[],
  userAnswers?: (number | null)[]
) {
  const doc = new jsPDF('p', 'mm', 'a4');
  let currentY = 45;

  // Header
  drawHeader(doc, `Quiz : Module ${chapter.num}`, 1);

  // Result Card Banner
  doc.setFillColor(248, 250, 252); // grey background
  doc.rect(15, currentY, 180, 42, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(15, currentY, 180, 42, 'S');

  // Title inside card
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text(`RÉSULTAT DE L'ÉVALUATION THÉORIQUE`, 20, currentY + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Chapitre ${chapter.num} : ${chapter.title}`, 20, currentY + 15);
  doc.text(`Date de complétion : ${date}`, 20, currentY + 21);

  // Draw Score block
  doc.setFillColor(passed ? 209 : 254, passed ? 250 : 243, passed ? 229 : 199); // light green or orange
  doc.rect(130, currentY + 6, 55, 30, 'F');
  doc.setDrawColor(passed ? 167 : 251, passed ? 243 : 207, passed ? 193 : 156);
  doc.rect(130, currentY + 6, 55, 30, 'S');

  doc.setTextColor(passed ? 6 : 146, passed ? 95 : 64, passed ? 70 : 14); // text color
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(`${score} / ${total} Corrects`, 134, currentY + 15);
  
  const scorePercent = Math.round((score / total) * 100);
  doc.setFontSize(10);
  doc.text(`Taux : ${scorePercent}%`, 134, currentY + 22);
  
  doc.setFontSize(8);
  doc.text(passed ? '✓ Validé (Académie)' : '⚠ Insuffisant parait-il', 134, currentY + 29);

  currentY += 52;

  // Question lists
  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`CORRIGÉ DÉTAILLÉ DU FORMULAIRE :`, 15, currentY);
  currentY += 6;

  questions.forEach((q, qIdx) => {
    if (currentY > 255) {
      doc.addPage();
      drawHeader(doc, `Quiz : Module ${chapter.num}`, doc.getNumberOfPages());
      currentY = 45;
    }

    // Question Box Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);
    
    // Draw question label
    currentY = printWrappedText(doc, `Question ${qIdx + 1} : ${q.question}`, 15, currentY, 180, 5.5);
    
    // Draw Options with a mark on correct and selected
    q.options.forEach((opt, oIdx) => {
      const isCorrect = oIdx === q.correctAnswerIndex;
      const isUserChoice = userAnswers ? userAnswers[qIdx] === oIdx : false;

      let prefix = '[ ] ';
      if (isCorrect) prefix = '[V] ';
      else if (isUserChoice) prefix = '[X] ';

      doc.setFont('helvetica', isCorrect ? 'bold' : 'normal');
      if (isCorrect) doc.setTextColor(16, 124, 65); // green
      else if (isUserChoice) doc.setTextColor(220, 38, 38); // red
      else doc.setTextColor(100, 116, 139); // slate-500
      
      currentY = printWrappedText(doc, `  ${prefix} ${String.fromCharCode(65 + oIdx)}. ${opt}`, 18, currentY, 175, 4.5);
    });

    // Explanation block
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(8.5);
    currentY = printWrappedText(doc, `Explication : ${q.explanation}`, 20, currentY + 1.5, 170, 4.2);
    
    // Thin separating line
    doc.setDrawColor(241, 245, 249);
    doc.line(15, currentY + 1.5, 195, currentY + 1.5);
    currentY += 5;
  });

  doc.save(`BizPlanAcademy_Quiz_Module_${chapter.num}_${date.replace(/\s+/g, '_')}.pdf`);
}

/**
 * 2. Export whole Academic transcript (relevé de notes)
 */
export function exportAcademicTranscript(history: QuizAttempt[], chaptersList: Chapter[]) {
  const doc = new jsPDF('p', 'mm', 'a4');
  let currentY = 45;

  drawHeader(doc, 'Relevé Général de Notes', 1);

  // Student details Card
  doc.setFillColor(241, 245, 249);
  doc.rect(15, currentY, 180, 24, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text('PROFIL DE L\'ÉLEVRE : AUDITEUR LIBRE', 20, currentY + 7);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text(`Sessions d'évaluation complétées : ${history.length}`, 20, currentY + 13);
  
  // Calculate average
  let validatedCount = 0;
  let runningSum = 0;
  history.forEach(h => {
    if (h.passed) validatedCount++;
    runningSum += (h.score / h.total);
  });
  const avg = history.length > 0 ? Math.round((runningSum / history.length) * 100) : 0;

  doc.text(`Moyenne académique consolidée : ${avg}% (${validatedCount} modules validés)`, 20, currentY + 18);
  currentY += 34;

  // Table header
  doc.setFillColor(79, 70, 229); // Indigo background
  doc.rect(15, currentY, 180, 8, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Module / Chapitre d\'évaluation', 18, currentY + 5.5);
  doc.text('Date de passage', 110, currentY + 5.5);
  doc.text('Note obtenue', 150, currentY + 5.5);
  doc.text('Statut', 178, currentY + 5.5);

  currentY += 8;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  
  if (history.length === 0) {
    doc.text('Aucune note enregistrée pour le moment.', 20, currentY + 10);
  } else {
    history.forEach((att, idx) => {
      if (currentY > 265) {
        doc.addPage();
        drawHeader(doc, 'Relevé Général de Notes', doc.getNumberOfPages());
        currentY = 45;
      }

      // Zebra alternation
      if (idx % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(15, currentY, 180, 7.5, 'F');
      }

      const matchingCh = chaptersList.find(c => c.id === att.chapterId);
      const title = matchingCh ? `${matchingCh.num}. ${matchingCh.shortTitle}` : att.chapterId;
      const pct = Math.round((att.score / att.total) * 100);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text(title, 18, currentY + 5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(att.date || 'N/A', 110, currentY + 5);
      
      doc.setFont('helvetica', 'bold');
      doc.text(`${att.score} / ${att.total} (${pct}%)`, 150, currentY + 5);

      // Status text
      doc.setFont('helvetica', 'bold');
      if (att.passed) {
        doc.setTextColor(22, 101, 52); // green
        doc.text('VALIDÉ', 178, currentY + 5);
      } else {
        doc.setTextColor(217, 119, 6); // amber
        doc.text('RÉVISER', 178, currentY + 5);
      }
      doc.setTextColor(51, 65, 85); // reset

      currentY += 7.5;
    });
  }

  doc.save(`BizPlanAcademy_Releve_Notes.pdf`);
}

/**
 * 3. Export SWOT Matrix Report
 */
export function exportSwotMatrix(swotList: SwotItem[]) {
  const doc = new jsPDF('p', 'mm', 'a4');
  let currentY = 45;

  drawHeader(doc, '1. Analyse SWOT', 1);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('MATRICE DIAGNOSTIC STRATÉGIQUE (SWOT) - CAFÉ VERT', 15, currentY);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  currentY = printWrappedText(doc, 'La matrice SWOT permet de croiser l’analyse interne des forces et faiblesses opérationnelles du projet avec l’analyse externe des opportunités du marché régional et des menaces d\'approvisionnement.', 15, currentY + 5, 180, 5);
  
  currentY += 8;

  // Let's print each category in a highly structured bento card box
  const categories: { type: SwotItem['type']; title: string; color: [number, number, number], lightColor: [number, number, number] }[] = [
    { type: 'strength', title: '➕ FORCES (Points Forts Internes)', color: [16, 124, 65], lightColor: [240, 253, 244] },
    { type: 'weakness', title: '⚠ FAIBLESSES (Limites Internes)', color: [220, 38, 38], lightColor: [254, 242, 242] },
    { type: 'opportunity', title: '↗ OPPORTUNITÉS (Leviers Externes)', color: [79, 70, 229], lightColor: [245, 243, 255] },
    { type: 'threat', title: '↘ MENACES (Risques Externes)', color: [217, 119, 6], lightColor: [255, 251, 235] }
  ];

  categories.forEach((cat) => {
    if (currentY > 235) {
      doc.addPage();
      drawHeader(doc, '1. Analyse SWOT', doc.getNumberOfPages());
      currentY = 45;
    }

    // Box Header
    doc.setFillColor(cat.lightColor[0], cat.lightColor[1], cat.lightColor[2]);
    doc.rect(15, currentY, 180, 8, 'F');
    doc.setDrawColor(cat.color[0], cat.color[1], cat.color[2]);
    doc.rect(15, currentY, 180, 8, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(cat.color[0], cat.color[1], cat.color[2]);
    doc.text(cat.title, 18, currentY + 5.5);

    currentY += 8;

    // List items
    const catItems = swotList.filter(item => item.type === cat.type);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);

    if (catItems.length === 0) {
      doc.text('  - Aucun élément formalisé dans cette catégorie.', 18, currentY + 5);
      currentY += 8;
    } else {
      catItems.forEach((it) => {
        currentY = printWrappedText(doc, `• ${it.text}`, 18, currentY + 1.5, 175, 4.8);
      });
      currentY += 4;
    }
  });

  // Academic conclusion footer notes
  if (currentY < 230) {
    currentY = 240;
    doc.setFillColor(248, 250, 252);
    doc.rect(15, currentY, 180, 24, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(15, currentY, 180, 24, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    doc.text('Commentaire d\'Analyse Académique :', 20, currentY + 6);
    
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text('Les forces recensées doivent servir de levier pour exploiter les opportunités.', 20, currentY + 12);
    doc.text('Chaque faiblesse répertoriée demande la mise en place d\'une procédure corrective pour contourner les menaces du marché.', 20, currentY + 17);
  }

  doc.save('BizPlanAcademy_Analyse_SWOT.pdf');
}

/**
 * 4. Export Marketing Campaign Simulator Report
 */
export function exportMarketingCampaign(campaign: MarketingCampaign, score: { score: number; comment: string; calculatedClients: number } | null) {
  const doc = new jsPDF('p', 'mm', 'a4');
  let currentY = 45;

  drawHeader(doc, '2. Campagne Marketing', 1);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text('RAPPORT SIMULATEUR DE CAMPAGNE ET MIX ACQUISITION', 15, currentY);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);
  currentY = printWrappedText(doc, 'Ce rapport restitue la simulation d\'impact d\'un plan média en fonction du slogan choisi, de la cible visée et du canal d\'acquisition prioritaire.', 15, currentY + 5, 180, 5);

  currentY += 8;

  // Config Details Grid
  doc.setFillColor(248, 250, 252);
  doc.rect(15, currentY, 180, 46, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(15, currentY, 180, 46, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(79, 70, 229);
  doc.text('PARAMÈTRES DÉBUTÉS :', 20, currentY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.setFontSize(9);
  
  doc.text('Slogan de Campagne :', 20, currentY + 15);
  doc.setFont('helvetica', 'bold');
  const sloganLines = doc.splitTextToSize(`"${campaign.slogan}"`, 115);
  doc.text(sloganLines, 60, currentY + 15);

  const sloganOffset = sloganLines.length * 4.5;

  doc.setFont('helvetica', 'normal');
  doc.text('Canal Publicitaire :', 20, currentY + 19 + sloganOffset);
  doc.setFont('helvetica', 'bold');
  let prettyChannel = campaign.channel;
  if(campaign.channel === 'influence') prettyChannel = 'Influenceurs locaux d\'Hypercentre';
  if(campaign.channel === 'socials') prettyChannel = 'Réseaux Sociaux (Instagram/LinkedIn)';
  if(campaign.channel === 'street') prettyChannel = 'Tractage de proximité (Éco-mobilité)';
  if(campaign.channel === 'sampling') prettyChannel = 'Échantillonnage de coworking (Spécialité)';
  if(campaign.channel === 'radio') prettyChannel = 'Sponsoring Radio & Podcasts locaux';
  doc.text(prettyChannel, 60, currentY + 19 + sloganOffset);

  doc.setFont('helvetica', 'normal');
  doc.text('Segment Cible visé :', 20, currentY + 25 + sloganOffset);
  doc.setFont('helvetica', 'bold');
  doc.text(campaign.target, 60, currentY + 25 + sloganOffset);

  currentY += 56;

  // Simulation Metrics Banner
  if (score) {
    // Score Badge
    doc.setFillColor(238, 242, 255);
    doc.rect(15, currentY, 180, 34, 'F');
    doc.setDrawColor(199, 210, 254);
    doc.rect(15, currentY, 180, 34, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 27, 75);
    doc.text(`SCORE D'ADÉQUATION STRATÉGIQUE : ${score.score} / 100`, 20, currentY + 8);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    currentY = printWrappedText(doc, score.comment, 20, currentY + 14, 170, 4.5);

    currentY += 12;

    // Funnel Statistics
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text('FONCTION D’EXTRAPOLATION DU TUNNEL (PRÉVISIONS SEMESTRE 1) :', 15, currentY);
    currentY += 6;

    const stats = [
      { label: 'Exposition estimée (Reach)', value: `${campaign.estimatedReach.toLocaleString()} personnes`, desc: 'Volume global de prospects qualifiés exposés au message.' },
      { label: 'Taux de conversion estimé', value: `${campaign.conversionRate}%`, desc: 'Pourcentage de prospects convertis en abonnés ou clients actifs.' },
      { label: 'Abonnés / Clients nets acquis', value: `${score.calculatedClients.toLocaleString()} clients`, desc: 'Nouveaux clients récurrents fidélisés consécutivement au plan.' }
    ];

    stats.forEach(st => {
      doc.setFillColor(248, 250, 252);
      doc.rect(15, currentY, 180, 14, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(79, 70, 229);
      doc.text(st.label, 18, currentY + 5);
      
      const vWidth = doc.getTextWidth(st.value);
      doc.text(st.value, 192 - vWidth, currentY + 5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(st.desc, 18, currentY + 10);

      currentY += 16;
    });

  } else {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.text('Aucune simulation de campagne lancée ou enregistrée pour le moment.', 15, currentY + 10);
  }

  doc.save('BizPlanAcademy_Strategie_Marketing.pdf');
}

/**
 * 5. Export Budget Forecast Report
 */
export function exportBudgetForecast(budgetList: BudgetItem[]) {
  const doc = new jsPDF('p', 'mm', 'a4');
  let currentY = 45;

  drawHeader(doc, '3. Budget Prévisionnel', 1);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text('BUDGET PRÉVISIONNEL ET SOLVABILITÉ SUR 3 ANS', 15, currentY);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);
  currentY = printWrappedText(doc, 'La simulation d\'exploitation financière calcule les charges fixes structurelles et mensuelles (charges locatives, salariales, marketing) pour les soustraire aux prévisions de ventes.', 15, currentY + 5, 180, 5);

  currentY += 8;

  // Draws table
  // Columns coordinates: Description, A1, A2, A3
  const cols = [15, 120, 145, 170];
  
  // Header row
  doc.setFillColor(30, 41, 59);
  doc.rect(15, currentY, 180, 8, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('Indicateurs (EUR)', cols[0] + 2, currentY + 5.5);
  doc.text('Année 1', cols[1] - 3, currentY + 5.5);
  doc.text('Année 2', cols[2] - 3, currentY + 5.5);
  doc.text('Année 3', cols[3] - 3, currentY + 5.5);

  currentY += 8;

  const rows = [
    { label: '📈 Chiffre d’affaires (Revenus de vente)', val: (b: BudgetItem) => b.revenues, style: 'bold-green' },
    { label: '🍂 Coûts des marchandises vendues (COGS)', val: (b: BudgetItem) => b.cogs, style: 'normal' },
    { label: '👥 Salaires & Charges du personnel', val: (b: BudgetItem) => b.salaries, style: 'normal' },
    { label: '📢 Budget Marketing & Impact publicitaire', val: (b: BudgetItem) => b.marketing, style: 'normal' },
    { label: '🏢 Loyers logistiques et administratifs', val: (b: BudgetItem) => b.rent, style: 'normal' },
    { label: '📦 Diverses charges d’infrastructure', val: (b: BudgetItem) => b.other, style: 'normal' },
  ];

  rows.forEach((r, rIdx) => {
    // Zebra background
    if (rIdx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(15, currentY, 180, 8, 'F');
    } else if (r.style === 'bold-green') {
      doc.setFillColor(240, 253, 244);
      doc.rect(15, currentY, 180, 8, 'F');
    }

    doc.setFont('helvetica', r.style === 'bold-green' ? 'bold' : 'normal');
    doc.setTextColor(r.style === 'bold-green' ? 21 : 51, r.style === 'bold-green' ? 128 : 65, r.style === 'bold-green' ? 61 : 85);
    doc.setFontSize(8);
    doc.text(r.label, cols[0] + 2, currentY + 5.5);

    budgetList.forEach((bItem, bIdx) => {
      const v = r.val(bItem);
      doc.text(`${v.toLocaleString()} €`, cols[bIdx + 1], currentY + 5.5);
    });

    currentY += 8;
  });

  // Global costs row
  doc.setFillColor(241, 245, 249);
  doc.rect(15, currentY, 180, 8, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Coûts Opérationnels Totaux', cols[0] + 2, currentY + 5.5);

  budgetList.forEach((bItem, bIdx) => {
    const sum = bItem.cogs + bItem.salaries + bItem.marketing + bItem.rent + bItem.other;
    doc.text(`${sum.toLocaleString()} €`, cols[bIdx + 1], currentY + 5.5);
  });

  currentY += 8;

  // NET Margin row
  doc.setFillColor(224, 242, 254);
  doc.rect(15, currentY, 180, 10, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(3, 105, 161);
  doc.text('💰 RÉSULTAT NET PRÉVISIONNEL (Profits)', cols[0] + 2, currentY + 6.5);

  budgetList.forEach((bItem, bIdx) => {
    const sum = bItem.cogs + bItem.salaries + bItem.marketing + bItem.rent + bItem.other;
    const profit = bItem.revenues - sum;
    const margin = bItem.revenues > 0 ? Math.round((profit / bItem.revenues) * 100) : 0;
    
    doc.setFont('helvetica', 'bold');
    doc.text(`${profit >= 0 ? '+' : ''}${profit.toLocaleString()} €`, cols[bIdx + 1], currentY + 5.5);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(`Marge : ${margin}%`, cols[bIdx + 1], currentY + 9);
    doc.setTextColor(3, 105, 161); // restore
  });

  currentY += 18;

  // Strategic viability notes
  doc.setFillColor(248, 250, 252);
  doc.rect(15, currentY, 180, 28, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(15, currentY, 180, 28, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text('Indications de Viabilité Opérationnelle :', 20, currentY + 6);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  
  const yr1 = budgetList[0];
  const yr3 = budgetList[2];
  if (yr1 && yr3) {
    const yr1Prof = yr1.revenues - (yr1.cogs + yr1.salaries + yr1.marketing + yr1.rent + yr1.other);
    const yr3Prof = yr3.revenues - (yr3.cogs + yr3.salaries + yr3.marketing + yr3.rent + yr3.other);

    doc.text(`- Année 1 : ${yr1Prof >= 0 ? 'Rentable dès le départ.' : 'Déficitaire prévu (normal en phase de calage initial). Ressource d\'amorçage requise.'}`, 20, currentY + 12);
    doc.text(`- Année 3 : ${yr3Prof > yr1Prof ? 'Croissance positive consolidée.' : 'Attention à stabiliser l\'augmentation des charges d\'exploitation.'}`, 20, currentY + 17);
    doc.text(`- Ratio d'Efficacité préconisé : Marge nette cible supérieure à 15% pour intéresser les Business Angels.`, 20, currentY + 22);
  } else {
    doc.text('- Données de prévisions 3 ans requises pour un audit rigoureux.', 20, currentY + 12);
  }

  doc.save('BizPlanAcademy_Previsions_Budget.pdf');
}

/**
 * 6. Export Organizational Chart Report
 */
export function exportOrgChartReport(orgNodes: OrgNode[]) {
  const doc = new jsPDF('p', 'mm', 'a4');
  let currentY = 45;

  drawHeader(doc, '4. Organigramme RH', 1);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text('STRUCTURE COLLABORATIVE ET GESTION DES RESSOURCES HUMAINES', 15, currentY);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);
  currentY = printWrappedText(doc, 'L\'organigramme institutionnel cartographie les pôles de compétences requis (R&D, Logistique, Commercial, Finance) sous l\'autorité du directeur d\'établissement.', 15, currentY + 5, 180, 5);

  currentY += 8;

  // Render root levels and their child structures
  const roots = orgNodes.filter(n => !n.parentId);

  if (roots.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.text('Aucun poste de pilotage racine défini dans votre organigramme.', 15, currentY + 10);
  } else {
    roots.forEach((rt) => {
      if (currentY > 235) {
        doc.addPage();
        drawHeader(doc, '4. Organigramme RH', doc.getNumberOfPages());
        currentY = 45;
      }

      // Draw Root Block card
      doc.setFillColor(30, 41, 59); // deep dark blue for roots
      doc.rect(15, currentY, 110, 16, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.text(rt.name, 19, currentY + 6);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.text(`${rt.role} [Pôle ${rt.department}]`, 19, currentY + 11);

      currentY += 16;

      const children = orgNodes.filter(c => c.parentId === rt.id);
      children.forEach((ch, chIdx) => {
        if (currentY > 255) {
          doc.addPage();
          drawHeader(doc, '4. Organigramme RH', doc.getNumberOfPages());
          currentY = 45;
        }

        // Branch drawing line
        doc.setDrawColor(148, 163, 184);
        doc.setLineWidth(0.5);
        // Vertical line left
        doc.line(25, currentY - 5, 25, currentY + 8);
        // Horizontal line to the card
        doc.line(25, currentY + 8, 32, currentY + 8);

        // Child Card body
        doc.setFillColor(248, 250, 252);
        doc.rect(32, currentY + 2, 95, 12, 'F');
        doc.setDrawColor(226, 232, 240);
        doc.rect(32, currentY + 2, 95, 12, 'S');

        doc.setTextColor(51, 65, 85);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.text(ch.name, 36, currentY + 7);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(100, 116, 139);
        doc.text(`${ch.role} (${ch.department})`, 36, currentY + 11);

        currentY += 15;
      });

      // Space between nodes
      currentY += 5;
    });
  }

  doc.save('BizPlanAcademy_Organigramme_Equipe.pdf');
}

/**
 * 7. Combined Full Business Plan Dossier
 * Generates a beautiful multi-page combined PDF portfolio of all exercises!
 */
export function exportCombinedBusinessPlan(
  swotList: SwotItem[],
  campaign: MarketingCampaign,
  mktScore: { score: number; comment: string; calculatedClients: number } | null,
  budgetList: BudgetItem[],
  orgNodes: OrgNode[]
) {
  const doc = new jsPDF('p', 'mm', 'a4');
  
  // Page 1: COVER PAGE
  // Draw premium solid elegant cover background
  doc.setFillColor(30, 27, 75); // Navy
  doc.rect(0, 0, 210, 297, 'F');

  // Decorative vector bands
  doc.setFillColor(79, 70, 229); // Indigo
  doc.rect(0, 100, 210, 10, 'F');
  doc.setFillColor(244, 63, 94); // Rose accent
  doc.rect(0, 110, 140, 2.5, 'F');

  // Title text
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.text('DOSSIER DE MODÉLISATION', 20, 75);
  doc.text('D\'ENTREPRISE', 20, 87);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(13);
  doc.setTextColor(199, 210, 254);
  doc.text('Projet Pilote : Café Vert', 20, 130);
  doc.text('Recueil complet des ateliers pratiques universitaires', 20, 137);

  // Student attribution
  doc.setFillColor(31, 41, 55, 0.4);
  doc.rect(20, 190, 170, 32, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('RÉDACTEUR & ÉLEVRE COMPTABLE :', 25, 198);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(209, 213, 219);
  doc.text('- Statut : Auditeur libre en école d\'administration des entreprises', 25, 205);
  doc.text(`- Date d'édition : ${new Date().toLocaleDateString('fr-FR')}`, 25, 211);
  doc.text(`- Certification : BizPlan Academy Blockchain Ledger`, 25, 217);

  // Minimal footer
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Document certifié conforme pour présentation d\'examen de soutenance.', 20, 280);


  // Page 2: SWOT Matrix
  doc.addPage();
  let currentY = 45;
  drawHeader(doc, 'Partie 1 : Diagnostic SWOT', 2, 5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text('1. ANALYSE SWOT DUMY ET ADEQUATION DES AXES', 15, currentY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  currentY = printWrappedText(doc, 'Le croisement analytique des facteurs internes (Forces/Faiblesses) et externes (Opportunités/Menaces) consolide le plan d\'ancrage d\'acquisition.', 15, currentY + 5, 180, 4.5);
  currentY += 6;

  const categoriesSwot: { type: SwotItem['type']; title: string; color: [number, number, number], lightColor: [number, number, number] }[] = [
    { type: 'strength', title: 'FORCES (Forces internes exploitables)', color: [16, 124, 65], lightColor: [240, 253, 244] },
    { type: 'weakness', title: 'FAIBLESSES (Limites correctives)', color: [220, 38, 38], lightColor: [254, 242, 242] },
    { type: 'opportunity', title: 'OPPORTUNITÉS (Leviers extérieurs de croissance)', color: [79, 70, 229], lightColor: [245, 243, 255] },
    { type: 'threat', title: 'MENACES (Risques de marché à mitiger)', color: [217, 119, 6], lightColor: [255, 251, 235] }
  ];

  categoriesSwot.forEach((cat) => {
    doc.setFillColor(cat.lightColor[0], cat.lightColor[1], cat.lightColor[2]);
    doc.rect(15, currentY, 180, 7, 'F');
    doc.setDrawColor(cat.color[0], cat.color[1], cat.color[2]);
    doc.rect(15, currentY, 180, 7, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(cat.color[0], cat.color[1], cat.color[2]);
    doc.text(cat.title, 18, currentY + 5);

    currentY += 7.5;

    const catItems = swotList.filter(item => item.type === cat.type);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);

    if (catItems.length === 0) {
      doc.text('  - Pas de facteur référencé.', 18, currentY + 4);
      currentY += 6;
    } else {
      catItems.forEach((it) => {
        currentY = printWrappedText(doc, `• ${it.text}`, 18, currentY + 1, 175, 4.2);
      });
      currentY += 2;
    }
  });


  // Page 3: Marketing Mix Simulation
  doc.addPage();
  currentY = 45;
  drawHeader(doc, 'Partie 2 : Plan Marketing', 3, 5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text('2. PLAN D\'ACQUISITION DE CLIENTS ET MIX GÉOMARKETING', 15, currentY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);
  currentY = printWrappedText(doc, 'Analyse d\'exposition issue du simulateur d\'impact numérique de l\'établissement d\'apprentissage.', 15, currentY + 5, 180, 5);
  currentY += 6;

  // Box config
  doc.setFillColor(248, 250, 252);
  doc.rect(15, currentY, 180, 36, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(15, currentY, 180, 36, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(79, 70, 229);
  doc.text('VECTEURS STRATÉGIQUES RETENUS :', 20, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text(`- Slogan : "${campaign.slogan}"`, 20, currentY + 14);
  doc.text(`- Canal d'acquisition : ${campaign.channel}`, 20, currentY + 20);
  doc.text(`- Cible : ${campaign.target}`, 20, currentY + 26);

  currentY += 45;

  if (mktScore) {
    doc.setFillColor(240, 253, 244);
    doc.rect(15, currentY, 180, 25, 'F');
    doc.setDrawColor(187, 247, 208);
    doc.rect(15, currentY, 180, 25, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(21, 128, 61);
    doc.setFontSize(10);
    doc.text(`Vérification d'Adéquation Globale : ${mktScore.score} / 100`, 20, currentY + 6);
    
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    printWrappedText(doc, mktScore.comment, 20, currentY + 12, 170, 4.5);

    currentY += 34;

    // Metrics
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(30, 41, 59);
    doc.text('PROJECTIONS NUMÉRIQUES DE CONVERSION : ', 15, currentY);
    currentY += 6;

    const itemsM = [
      { l: 'Couverture médiatique estimée (Reach) :', v: `${campaign.estimatedReach.toLocaleString()} prospects` },
      { l: 'Adhésion / Taux de clic unitaire :', v: `${campaign.conversionRate}%` },
      { l: 'Abonnés récurrents générés :', v: `${mktScore.calculatedClients} clients actifs` }
    ];

    itemsM.forEach(st => {
      doc.setFillColor(248, 250, 252);
      doc.rect(15, currentY, 180, 7, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text(st.l, 18, currentY + 5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      const wV = doc.getTextWidth(st.v);
      doc.text(st.v, 192 - wV, currentY + 5);
      currentY += 9;
    });
  }


  // Page 4: Financial Plan
  doc.addPage();
  currentY = 45;
  drawHeader(doc, 'Partie 3 : Budget Prévisionnel', 4, 5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text('3. PRÉVISIONS FINANCIÈRES - COMPTE DE RÉSULTAT CORRIGÉ', 15, currentY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);
  currentY = printWrappedText(doc, 'Les rentabilités sont déduites des investissements initiaux cumulés et du roulement de cash mathématique.', 15, currentY + 4, 180, 4.5);
  currentY += 6;

  const bCols = [15, 115, 140, 165];
  doc.setFillColor(30, 41, 59);
  doc.rect(15, currentY, 180, 7.5, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('Poste indicatif (EUR)', bCols[0] + 2, currentY + 5);
  doc.text('Année 1', bCols[1], currentY + 5);
  doc.text('Année 2', bCols[2], currentY + 5);
  doc.text('Année 3', bCols[3], currentY + 5);

  currentY += 7.5;

  const listRows = [
    { label: 'Revenus Bruts de Ventes', val: (b: BudgetItem) => b.revenues, isH: true },
    { label: 'Coût des denrées (CAF)', val: (b: BudgetItem) => b.cogs },
    { label: 'Ressources humaines', val: (b: BudgetItem) => b.salaries },
    { label: 'Dotation Marketing', val: (b: BudgetItem) => b.marketing },
    { label: 'Frais fixes (Loyer administrative)', val: (b: BudgetItem) => b.rent },
    { label: 'Énergie & Abonnements', val: (b: BudgetItem) => b.other }
  ];

  listRows.forEach((row, ri) => {
    if (ri % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(15, currentY, 180, 7, 'F');
    }
    doc.setFont('helvetica', row.isH ? 'bold' : 'normal');
    doc.setTextColor(row.isH ? 30 : 60, row.isH ? 41 : 70, row.isH ? 59 : 80);
    doc.setFontSize(8);
    doc.text(row.label, bCols[0] + 2, currentY + 4.5);

    budgetList.forEach((bi, bIdx) => {
      doc.text(`${row.val(bi).toLocaleString()} €`, bCols[bIdx + 1], currentY + 4.5);
    });
    currentY += 7;
  });

  // Profit Total
  doc.setFillColor(241, 245, 249);
  doc.rect(15, currentY, 180, 10, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(3, 105, 161);
  doc.text('RÉSULTAT NET COMPTABLE (Bénéfices)', bCols[0] + 2, currentY + 6.5);

  budgetList.forEach((bi, bIdx) => {
    const sumC = bi.cogs + bi.salaries + bi.marketing + bi.rent + bi.other;
    const profit = bi.revenues - sumC;
    const mar = bi.revenues > 0 ? Math.round((profit / bi.revenues) * 100) : 0;
    doc.text(`${profit >= 0 ? '+' : ''}${profit.toLocaleString()} € (${mar}%)`, bCols[bIdx + 1], currentY + 6.5);
  });


  // Page 5: HR Team
  doc.addPage();
  currentY = 45;
  drawHeader(doc, 'Partie 4 : Structure RH', 5, 5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text('4. REPARTITION DES COMPETENCES ET SQUELETTE RH', 15, currentY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);
  currentY = printWrappedText(doc, 'La hiérarchie désigne la chaîne décisionnelle pour absorber le flux d’activité sans goulot d\'étranglement opérationnel.', 15, currentY + 5, 180, 5);
  currentY += 6;

  const bpRoots = orgNodes.filter(n => !n.parentId);
  if (bpRoots.length === 0) {
    doc.text('Aucun profil RH défini.', 15, currentY + 10);
  } else {
    bpRoots.forEach(rt => {
      doc.setFillColor(30, 41, 59);
      doc.rect(15, currentY, 180, 9, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text(`Directeur : ${rt.name} - ${rt.role} (${rt.department})`, 18, currentY + 65/10);

      currentY += 10.5;

      const kids = orgNodes.filter(x => x.parentId === rt.id);
      kids.forEach(kd => {
        doc.setFillColor(248, 250, 252);
        doc.rect(25, currentY, 170, 7.5, 'F');
        doc.setDrawColor(226, 232, 240);
        doc.rect(25, currentY, 170, 7.5, 'S');
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(71, 85, 105);
        doc.text(`  • Sous-ordonné : ${kd.name}`, 27, currentY + 5);
        
        doc.setFont('helvetica', 'normal');
        doc.text(`${kd.role} [Pôle ${kd.department}]`, 95, currentY + 5);

        currentY += 8.5;
      });
      currentY += 3;
    });
  }

  // Save full Business Plan
  doc.save('BizPlanAcademy_BusinessPlan_Consolide.pdf');
}
