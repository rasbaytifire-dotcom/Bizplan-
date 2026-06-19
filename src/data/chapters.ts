import { Chapter } from '../types';

export const chapters: Chapter[] = [
  {
    id: 'intro',
    title: 'Introduction au Business Plan',
    shortTitle: '1. Introduction',
    icon: 'BookOpen',
    num: 1,
    introduction: 'Le Business Plan (plan d’affaires) est le document de référence synthétisant la vision, la stratégie et les prévisions financières d’un futur projet entrepreneurial. Il sert de boussole au créateur d’entreprise et d’outil de conviction face aux investisseurs, partenaires et banques.',
    sections: [
      {
        title: 'Définition & Utilité Fondamentale',
        theory: 'Un Business Plan est un document structuré d’environ 20 à 40 pages visant à démontrer la viabilité commerciale, technique, humaine et financière d’un projet de création ou de reprise d’entreprise. Il répond à trois besoins cruciaux : formaliser et structurer la pensée de l’entrepreneur, valider la cohérence opérationnelle et financière du projet, et servir de document de communication externe pour lever des fonds, obtenir des prêts ou convaincre des partenaires stratégiques.',
        example: 'Prenons "Café Vert", un projet de torréfaction de café biologique local avec livraison zéro émission. Le business plan va permettre au fondateur de valider si la marge de revente couvre les frais fixes de livraison électrique.',
        table: {
          headers: ['Destinataire', 'Ce qu’il recherche dans le Business Plan', 'Indicateurs clés clés'],
          rows: [
            ['L’Entrepreneur', 'Cohérence du modèle, feuille de route opérationnelle', 'BFR, Seuil de rentabilité, SWOT'],
            ['Le Banquier', 'Capacité de remboursement, solidité financière, garanties', 'Ratio d’endettement, Cash-flow global'],
            ['L’Investisseur (Venture Capital)', 'Potentiel de croissance, retour sur investissement rapide, scalabilité', 'TRI (Taux de Rentabilité Interne), EBITDA, Taille du marché']
          ]
        }
      },
      {
        title: 'La Structure Standard d’un Business Plan académique',
        theory: 'Un bon plan d’affaires suit un enchaînement logique et progressif. On y retrouve l’Executive Summary (résumé rédigé à la toute fin), la description des fondateurs, l’étude de marché, la stratégie marketing et commerciale, l’organisation technique et logistique, le plan juridique et humain, et enfin, le dossier de modélisation financière globale sur 3 à 5 ans.',
        example: 'Pour notre projet "Café Vert", l’Executive Summary en page 1 devra résumer en 2 minutes : concept (café bio local), marché (15M€ en région), équipe (un torréfacteur diplômé, un financier d’école de commerce), et le besoin financier (80 000€).',
      }
    ],
    conclusion: 'Maîtriser l’introduction au Business Plan permet de poser le cadre d’une analyse structurée sans griller les étapes indispensables que sont l’étude terrain et l’alignement opérationnel.'
  },
  {
    id: 'market',
    title: 'L’Étude de Marché',
    shortTitle: '2. Étude de marché',
    icon: 'Compass',
    num: 2,
    introduction: 'L’étude de marché valide l’existence d’un besoin réel, qualifie le profil des clients potentiels (personas), analyse l’intensité concurrentielle et quantifie le chiffre d’affaires prévisionnel réalisable.',
    sections: [
      {
        title: 'L’Analyse PESTEL du Macro-environnement',
        theory: 'Avant d’analyser ses clients, il faut étudier le macro-environnement via l’outil PESTEL (Politique, Économique, Sociologique, Technologique, Écologique, Légal). Cette grille permet d’isoler les grandes opportunités et menaces du marché concerné.',
        example: 'Pour "Café Vert", la législation interdisant le plastique à usage unique (Légal/Écologique) est une opportunité majeure qui justifie le modèle zéro déchet.',
        table: {
          headers: ['Facteur PESTEL', 'Exemple d’impact sur le projet "Café Vert"', 'Intensité'],
          rows: [
            ['Politique', 'Subventions régionales pour la transition écologique (Opportunité)', 'Élevée'],
            ['Économique', 'Inflation sur le prix du café brut importé (Menace)', 'Très élevée'],
            ['Sociologique', 'Sensibilité accrue des consommateurs à l’approvisionnement éthique (Opportunité)', 'Élevée'],
            ['Technologique', 'Plateforme de commande en ligne optimisée pour les vélos-cargos (Opportunité)', 'Moyenne'],
            ['Écologique', 'Réchauffement climatique affectant les terroirs de café Arabica (Menace)', 'À long terme'],
            ['Légal', 'Normes sanitaires strictes sur les processus de torréfaction (Contrainte)', 'Élevée']
          ]
        }
      },
      {
        title: 'L’Analyse Concurrentielle & Offre vs. Demande',
        theory: 'L’analyse de l’offre étudie les concurrents directs (proposant un produit similaire) et indirects (répondant au même besoin par un autre produit). L’étude de la demande passe par la définition de Personas (clients cibles idéaux), la taille de la zone de chalandise et le calcul de la part de marché réaliste via la méthode du "SAM" et "SOM".',
        example: 'Concurrent direct de "Café Vert" : brûleries locales traditionnelles. Concurrent indirect : cafés Nespresso industriels. La valeur unique de Café Vert est la livraison fraîche par abonnement mensuel écoresponsable.',
      }
    ],
    conclusion: 'Une étude de marché solide évite de créer un produit parfait que personne ne veut acheter. Elle dicte l’orientation de la gamme de prix.'
  },
  {
    id: 'strategy',
    title: 'La Stratégie Générale & Marketing',
    shortTitle: '3. Stratégie',
    icon: 'TrendingUp',
    num: 3,
    introduction: "La stratégie détermine comment l’entreprise va s'imposer sur son marché. Elle formalise la vision, détaille le positionnement stratégique et structure l'offre à travers l'incontournable mix marketing (les 4P).",
    sections: [
      {
        title: 'La Matrice SWOT & Avantage Concurrentiel',
        theory: "La matrice SWOT (Forces, Faiblesses, Opportunités, Menaces) fait la transition entre l'analyse externe (marché) et interne (entreprise). L'objectif est d'exploiter ses forces internes pour saisir des opportunités, tout en corrigeant les faiblesses internes pour parer aux menaces. C'est de là qu'émerge l'Avantage Concurrentiel (ou USP - Unique Selling Proposition).",
        example: "USP de notre Café : 'Le seul café torréfié au feu de bois local et livré sous 2 heures en vélo cargo dans la métropole.'",
        table: {
          headers: ['Facteurs Internes (Contrôlables)', 'Facteurs Externes (Incontrôlables)'],
          rows: [
            ['FORCES : Savoir-faire artisanal de torréfaction unique, excellent réseau avec les producteurs coopératifs.', 'OPPORTUNITÉS : Forte poussée de la consommation responsable en centre de table.'],
            ['FAIBLESSES : Capacité de production limitée au début par un seul torréfacteur de 10kg.', 'MENACES : Fluctuations importantes des cours de change USD/EUR sur le café brut vert.']
          ]
        }
      },
      {
        title: 'Le Mix Marketing (Les 4P)',
        theory: "Pour réussir son lancement, le produit doit s'accorder selon quatre piliers : Produit (caractéristiques, packaging), Prix (pénétration, écrémage ou alignement), Place (canaux de distribution : direct, e-shop, boutiques spécialisées) et Promotion (communication, réseaux sociaux, parrainage).",
        example: "Mix marketing de Café Vert : Produit = Sachet kraft compostable 250g. Prix = Premium par abonnement (9€/sachet). Place = Boutique en ligne propre et cafés bio du centre-ville. Promotion = Marketing d’influence local et échantillonnage dans les espaces de coworking.",
      }
    ],
    conclusion: 'Le mix marketing est le bras armé de la stratégie. Il traduit le positionnement de marque dans la réalité du produit physique.'
  },
  {
    id: 'org',
    title: 'Organisation, Équipe & Ressources Humaines',
    shortTitle: '4. Organisation',
    icon: 'Users',
    num: 4,
    introduction: 'Un beau projet sans exécution n’est rien. Cette section cartographie le capital humain requis, définit les rôles de gouvernance clés et justifie l’adéquation Homme/Projet indispensable pour les investisseurs.',
    sections: [
      {
        title: 'L’Équipe Fondatrice & Profils de Compétences',
        theory: 'Les investisseurs évaluent l’équipe avant l’idée. Le plan d’affaires doit de ce fait prouver la complémentarité des profils (Génie technique, Stratégie/Vente, Gestion financière). Idéalement, chaque compétence critique doit être portée par un associé ou un conseiller de premier rang.',
        example: 'Pour Café Vert : Chloé est maîtresse torréfactrice certifiée (profil technique). Arthur est diplômé de gestion hôtelière (profil commercial, opérations et logistique).',
        table: {
          headers: ['Fonction cible', 'Compétences requises', 'Statut au lancement (An 1)'],
          rows: [
            ['Direction Générale & Finance', 'Négociation banques, gestion des coûts, stratégie globale', 'Arthur (Associé Co-fondateur)'],
            ['Torréfaction & Logistique de production', 'Gestion des stocks, sélection de grains certifiés, maintenance machine', 'Chloé (Associée Co-fondatrice)'],
            ['Livreurs / Ambassadeurs', 'Permis de conduire / Vélo, excellent sens du contact client de proximité', '2 CDI temps partiel à recruter']
          ]
        }
      },
      {
        title: 'L’Organigramme & Plan de Recrutement',
        theory: 'En phase de démarrage, l’organigramme est horizontal mais doit prévoir une gouvernance claire. À mesure que le chiffre d’affaires progresse, on planifie de nouveaux recrutements afin de soulager les fondateurs et de structurer la croissance opérationnelle.',
        example: 'Lancement An 1 : 2 associés + 2 livreurs saisonniers. An 3 : Ajout d’un responsable marketing e-commerce à temps complet pour piloter la communauté nationale.',
      }
    ],
    conclusion: 'L’adéquation des hommes au projet rassure profondément les financeurs en prouvant la capacité d’exécuter le calendrier prévu.'
  },
  {
    id: 'ops',
    title: 'Le Plan Opérationnel',
    shortTitle: '5. Plan opérationnel',
    icon: 'Truck',
    num: 5,
    introduction: 'Le plan opérationnel détaille les coulisses industrielles et physiques du service. Il décrit comment le produit est fabriqué, stocké et expédié au client final.',
    sections: [
      {
        title: 'La Chaîne d’Approvisionnement & Logistique',
        theory: 'Cette partie présente la cartographie des processus opérationnels clefs. On doit y documenter les délais de livraison des fournisseurs, la politique de gestion des stocks (flux tendu ou de sécurité), les équipements de production nécessaires, le choix des locaux techniques et la logistique du "dernier kilomètre".',
        example: 'Pour Café Vert : café vert brut importé via une coopérative équitable basée au port du Havre. Stockage : sac en toile de jute dans notre local ventilé de 60m². Capacité de production : 50kg par jour.',
        table: {
          headers: ['Étape de production', 'Équipement impliqué', 'Indicateur de suivi opérationnel'],
          rows: [
            ['Torréfaction', 'Torréfacteur à gaz professionnel (Investissement de 18 000€)', 'Température idéale & Courbe de cuisson'],
            ['Conditionnement', 'Balance de précision + ensacheuse manuelle scellante', 'Nombre de paquets étiquetés par heure'],
            ['Livraison urbaine', 'Vélos-cargos électriques avec caisse isotherme de marque française', 'Respect de la fenêtre horaire (12h-14h)']
          ]
        }
      }
    ],
    conclusion: 'Un plan opérationnel robuste sécurise la productivité et minimise les goulets d’étranglement qui grèvent la trésorerie au démarrage.'
  },
  {
    id: 'finance',
    title: 'Le Plan Financier Prévisionnel',
    shortTitle: '6. Plan financier',
    icon: 'DollarSign',
    num: 6,
    introduction: 'Le plan financier traduit l’ensemble de vos choix marketing, RH, et opérationnels en chiffres. C’est le juge de paix prouvant l’équilibre financier à court et long terme.',
    sections: [
      {
        title: 'Les 4 Tableaux Financiers Cardinaux',
        theory: 'Un plan financier académique d’une entreprise doit contenir au minimum : 1) Le plan de financement initial (besoin de démarrage vs. apports), 2) Le compte de résultat prévisionnel (chiffre d’affaires, charges d’exploitation, bénéfice), 3) Le plan de trésorerie mensuel (entrées/sorties de cash mensuelles pour éviter la cessation de paiements), et 4) Le calcul du point mort / seuil de rentabilité (le niveau de CA obligatoire pour faire un profit nul).',
        example: 'Point mort de Café Vert : Charges fixes = 27 000€ par an (loyer + assurances + amortissements). Marge sur coûts variables = 60%. Seuil de rentabilité = 27 000 / 0.60 = 45 000€ de chiffre d’affaires annuel minimum (soit 5 000 sachets de café).',
        table: {
          headers: ['Agrégat financier', 'Année 1', 'Année 2', 'Année 3'],
          rows: [
            ['Chiffre d’Affaires (CA)', '54 000 €', '82 000 €', '125 000 €'],
            ['Charges Variables (Matières)', '16 200 €', '24 600 €', '37 500 €'],
            ['Marge Brute Globale (70%)', '37 800 €', '57 400 €', '87 500 €'],
            ['Charges Fixes (RH, loyer, pub)', '31 000 €', '36 000 €', '44 000 €'],
            ['Résultat Net Prévisionnel', '+ 6 800 €', '+ 21 400 €', '+ 43 500 €']
          ]
        }
      }
    ],
    conclusion: 'Ne péchez pas par optimisme excessif. Les banquiers préfèrent un plan financier prudent avec des hypothèses de ventes documentées.'
  },
  {
    id: 'annexes',
    title: 'Les Annexes & Pitch',
    shortTitle: '7. Annexes & Pitch',
    icon: 'FileText',
    num: 7,
    introduction: 'Les annexes enrichissent le document principal sans l’alourdir. C’est ici que vous insérez les CV détaillés, le bail commercial, les devis clés et la présentation de votre elevator pitch orale.',
    sections: [
      {
        title: 'Sélectionner ses Annexes & Pitcher son projet',
        theory: 'Constituez votre dossier d’annexes stratégiquement. Ajoutez-y l’étude de marché détaillée de terrain (questionnaire d’enquête), les devis d’équipement (pro forma de la machine à torréfier), et les photos de vos prototypes. Enfin, préparez votre "Executive Pitch Deck" de 10 diapositives qui résume visuellement votre business plan pour les jurys ou appels d’offres.',
        example: 'Arthur et Chloé ont inclus le contrat exclusif signé avec la coopérative de producteurs bio éthiopiens, garantissant la stabilité des prix du café brut sur 18 mois.',
        table: {
          headers: ['Composante Pitch Deck', 'Objectif de la diapositive', 'Temps de parole conseillé'],
          rows: [
            ['Le Problème & La Solution', 'Accrocher le jury avec un problème de société clair', '45 secondes'],
            ['La Démonstration Produit', 'Montrer l’excellence gustative et l’éthique de l’emballage', '60 secondes'],
            ['Les Chiffres clés (Finances)', 'Afficher le CA visé, le point mort et le besoin de financement', '45 secondes'],
            ['L’Équipe & "L’Appel à l’action"', 'Présenter pourquoi vous êtes les meilleurs et ce que vous demandez', '30 secondes']
          ]
        }
      }
    ],
    conclusion: 'Les annexes apportent la preuve matérielle de tout ce qui a été affirmé dans les chapitres précédents.'
  }
];
