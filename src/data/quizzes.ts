import { QuizQuestion } from '../types';

export const quizQuestions: QuizQuestion[] = [
  // Intro Chapter
  {
    id: 'intro_q1',
    chapterId: 'intro',
    question: 'Quelle est la fonction principale d’un Business Plan ?',
    options: [
      'Fournir un bilan comptable d’exercice au service des impôts.',
      'Démontrer la viabilité globale et convaincre des partenaires opérationnels ou financiers.',
      'Rédiger le manuel d’utilisation des produits fabriqués.',
      'Valider légalement le statut de micro-entreprise auprès des greffes.'
    ],
    correctAnswerIndex: 1,
    explanation: 'Le business plan sert avant tout à démontrer la cohérence stratégique et la viabilité financière de votre future entreprise afin d’obtenir des financements ou rassurer des partenaires clefs.'
  },
  {
    id: 'intro_q2',
    chapterId: 'intro',
    question: 'À quel moment de la création d’entreprise est-il recommandé de rédiger l’Executive Summary ?',
    options: [
      'Au tout début, avant d’avoir fait l’étude de marché.',
      'Après 3 ans d’exercice commercial effectif.',
      'À la toute fin du processus de rédaction du Business Plan complet.',
      'Seulement si la banque refuse le dossier physique initial.'
    ],
    correctAnswerIndex: 2,
    explanation: 'L’Executive Summary étant le résumé condensé de toutes les parties du plan d’affaires, il ne peut être rédigé de manière pertinente et exacte qu’une fois la stratégie globale et le plan financier finalisés.'
  },

  // Market Chapter
  {
    id: 'market_q1',
    chapterId: 'market',
    question: 'Que signifie l’acronyme PESTEL dans l’analyse académique de l’environnement ?',
    options: [
      'Production, Exportation, Secrétariat, Trésorerie, Éthique, Logistique',
      'Population, Emploi, Salaire, Tantièmes, Épargne, Liquidités',
      'Politique, Économique, Sociologique, Technologique, Écologique, Légal',
      'Placement, Évaluation, Sous-traitance, Transport, Entreposage, Livraison'
    ],
    correctAnswerIndex: 2,
    explanation: 'PESTEL désigne l’analyse du macro-environnement à travers six dimensions : Politique, Économique, Sociologique, Technologique, Écologique et Légal.'
  },
  {
    id: 'market_q2',
    chapterId: 'market',
    question: 'Quelle est la différence fondamentale entre concurrents directs et concurrents indirects ?',
    options: [
      'Les concurrents directs vendent à l’étranger, les indirects vendent localement.',
      'Les concurrents directs proposent un produit similaire; les indirects proposent un produit différent répondant au même besoin.',
      'Les directs sont cotés en Bourse, les indirects sont des associations à but non lucratif.',
      'Les directs ont plus de 10 ans d’existence sur le sol national.'
    ],
    correctAnswerIndex: 1,
    explanation: 'Un concurrent direct vend un produit similaire (ex: deux cafés bio). Un concurrent indirect résout le même besoin par une autre technologie/méthode (ex: café en dosette industrielle vs. café fraîchement torréfié).'
  },

  // Strategy Chapter
  {
    id: 'strategy_q1',
    chapterId: 'strategy',
    question: 'Dans la matrice stratégique SWOT, quels quadrants représentent des facteurs internes contrôlables ?',
    options: [
      'Forces et Faiblesses',
      'Opportunités et Menaces',
      'Forces et Opportunités',
      'Faiblesses et Menaces'
    ],
    correctAnswerIndex: 0,
    explanation: 'Le SWOT se divise en facteurs internes (Forces et Faiblesses, liés directement aux performances et ressources internes de l’entreprise) et externes (Opportunités et Menaces, liés au marché et sur lesquels l’entreprise n’a pas d’emprise directe).'
  },
  {
    id: 'strategy_q2',
    chapterId: 'strategy',
    question: 'Quels sont les piliers fondamentaux constituants du traditionnel "Mix Marketing" (les 4P) ?',
    options: [
      'Performance, Profit, Planification, Pérennité',
      'Produit, Prix, Place (Distribution), Promotion (Communication)',
      'Personnel, Publicité, Partenariat, Posture de marque',
      'Presse, Production, Protection légale, Progression'
    ],
    correctAnswerIndex: 1,
    explanation: 'Le mix marketing opérationnel repose sur les 4 segments historiques : Produit (Product), Prix (Price), Distribution (Place) et Communication (Promotion).'
  },

  // Org Chapter
  {
    id: 'org_q1',
    chapterId: 'org',
    question: 'Pourquoi l’adéquation "Homme/Projet" est-elle examinée en priorité par les investisseurs en capital-risque ?',
    options: [
      'Pour vérifier que le dirigeant a un diplôme de doctorat.',
      'Parce qu’une idée brillante ne vaut rien sans une équipe capable de surmonter les obstacles opérationnels.',
      'Pour s’assurer que les fondateurs sont tous de la même famille.',
      'Pour imposer une réduction immédiate de la masse salariale au lancement.'
    ],
    correctAnswerIndex: 1,
    explanation: 'La flexibilité et l’expertise humaine sont le moteur de l’exécution. Les investisseurs savent qu’une équipe stable et complémentaire saura pivoter ou ajuster ses plans face aux réalités fluctuantes du marché.'
  },
  {
    id: 'org_q2',
    chapterId: 'org',
    question: 'Dans un organigramme d’entreprise en démarrage, qu’appelle-t-on la portée de contrôle ?',
    options: [
      'La distance géographique maximale autorisée pour le télétravail.',
      'Le nombre de subordonnés directs qu’un responsable gère efficacement.',
      'Le budget alloué à la surveillance vidéo des locaux de stockage.',
      'Le pourcentage d’actions détenu par le président du directoire.'
    ],
    correctAnswerIndex: 1,
    explanation: 'La portée ou amplitude de contrôle désigne le nombre d’employés rattachés directement à un manager unique.'
  },

  // Ops Chapter
  {
    id: 'ops_q1',
    chapterId: 'ops',
    question: 'Dans la gestion opérationnelle, que désigne le concept de flux tendu (Just-in-Time) ?',
    options: [
      'Garder un stock géant correspondant à 12 mois de ventes d’avance.',
      'Commander les matières premières uniquement au moment de la production pour minimiser les frais de stockage.',
      'Faire travailler les manutentionnaires la nuit sans rémunération supplémentaire.',
      'Une panne informatique majeure sur la chaîne de distribution.'
    ],
    correctAnswerIndex: 1,
    explanation: 'Le Just-in-Time (ou flux tendu) vise à réduire les stocks au strict minimum pour alléger le besoin en fonds de roulement (BFR), en calant l’approvisionnement sur la demande effective.'
  },
  {
    id: 'ops_q2',
    chapterId: 'ops',
    question: 'Quel est l’objectif d’un stock de sécurité en logistique de distribution ?',
    options: [
      'Éviter les ruptures de stock en cas de retard fournisseur ou d’augmentation subite de la demande ciblée.',
      'Diminuer artificiellement la valeur comptable de l’actif disponible.',
      'Se conformer à l’assurance incendie obligatoire pour les commerces physiques.',
      'Offrir gratuitement des marchandises aux clients fidèles de la marque.'
    ],
    correctAnswerIndex: 0,
    explanation: 'Le stock de sécurité agit comme un amortisseur logistique servant à encaisser les aléas de livraison ou les variations imprévues de la demande.'
  },

  // Finance Chapter
  {
    id: 'finance_q1',
    chapterId: 'finance',
    question: 'Qu’est-ce que le Point Mort (ou Break-Even Point) financier ?',
    options: [
      'La date à laquelle l’entreprise doit obligatoirement cesser ses activités par manque de fonds.',
      'La valeur brute d’une machine de production après 5 ans d’amortissement linéaire.',
      'Le niveau de chiffre d’affaires à atteindre pour couvrir l’intégralité des charges et dégager un résultat de zéro (ni perte, ni profit).',
      'Le taux d’intérêt appliqué au premier emprunt bancaire accordé.'
    ],
    correctAnswerIndex: 2,
    explanation: 'Le point mort (exprimé en jours) ou seuil de rentabilité (exprimé en euros) désigne le jalon d’activité commerciale théorique à partir duquel l’entreprise commence enfin à faire des bénéfices.'
  },
  {
    id: 'finance_q2',
    chapterId: 'finance',
    question: 'Comment se calcule mathématiquement le Besoin en Fonds de Roulement (BFR) ?',
    options: [
      'Chiffre d’affaires moins Charges variables',
      'Stocks + Créances clients - Dettes fournisseurs',
      'Intérêts d’emprunt divisé par le nombre de salariés permanents',
      'Apports des associés plus Prêts bancaires à long terme'
    ],
    correctAnswerIndex: 1,
    explanation: 'Le BFR découle des décalages de trésorerie inhérents au cycle d’exploitation : BFR = (Valeur des stocks + Créances accordées aux acheteurs) - Dettes de crédit accordées par les fournisseurs.'
  },

  // Annexes Chapter
  {
    id: 'annexes_q1',
    chapterId: 'annexes',
    question: 'Quelle est la durée moyenne recommandée d’un pitch de présentation orale devant des jurys (Elevator Pitch) ?',
    options: [
      'Entre 2 et 5 minutes maximum.',
      'Au moins une demi-journée d’explications techniques.',
      'Précisément une heure et trente minutes avec deux pauses café.',
      'De 24 à 48 heures d’évaluation continue en direct.'
    ],
    correctAnswerIndex: 0,
    explanation: 'Un elevator pitch est conçu pour synthétiser un projet de façon ultra-efficace. En général, le format académique et concours oscille entre 3 et 5 minutes pour aller droit au but.'
  },
  {
    id: 'annexes_q2',
    chapterId: 'annexes',
    question: 'Quel type de document a tout à fait sa place dans les annexes de votre Business Plan ?',
    options: [
      'Le journal intime du créateur de l’entreprise.',
      'Les CV des fondateurs principaux, un rapport d’étude terrain détaillé, et les devis pro format importants.',
      'L’intégralité du code source logiciel de votre outil de facturation interne.',
      'Les relevés fiscaux personnels de l’ensemble de vos clients potentiels.'
    ],
    correctAnswerIndex: 1,
    explanation: 'Les annexes accueillent les pièces factuelles et justificatives (comme un CV synthétique, les contrats d’intention ou les devis de machines de production) que les investisseurs souhaitent inspecter séparément.'
  }
];
