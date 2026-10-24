export const OFFICIAL_LOGO = "/assets/newlog/logo-newlog.png";
export const INSTAGRAM_URL = "https://www.instagram.com/newlogesports";
export const SOURCE_FILE = "COPANEWLOG-HISTÓRIA.xlsx";

export type RankingEntry = {
  name: string;
  points: number;
  scores: (number | null)[];
  rank: number;
  logo?: string | null;
};
export type PlayerEntry = {
  position: number | string;
  name: string;
  value: number;
};
export type CompetitionEntry = {
  edition: number;
  year: number | null;
  label: string;
  highlights: { role: string; name: string }[];
};

export const ranking: RankingEntry[] = [
  {
    name: "MADRID FC",
    points: 615,
    scores: [60, 80, 40, 10, 10, 30, 40, 60, 80, 80, 5, 80, 40],
    rank: 1,
    logo: "/assets/newlog/teams/madrid-fc.png",
  },
  {
    name: "ATLÉTICO GURIZES",
    points: 525,
    scores: [100, 60, 100, 15, 5, 50, null, 5, 100, 60, 20, null, 10],
    rank: 2,
    logo: "/assets/newlog/teams/atletico-gurizes.png",
  },
  {
    name: "RESENHA FTyP",
    points: 430,
    scores: [
      null,
      null,
      null,
      null,
      null,
      null,
      50,
      80,
      null,
      20,
      100,
      100,
      80,
    ],
    rank: 3,
    logo: "/assets/newlog/teams/resenha-ftyp.png",
  },
  {
    name: "INIMIGOS DA BOLA",
    points: 380,
    scores: [80, 100, 60, 40, 20, null, null, 10, 60, 10, null, null, null],
    rank: 4,
    logo: null,
  },
  {
    name: "CORAGEM NACIONAL",
    points: 335,
    scores: [null, null, 20, 5, 60, null, null, 40, 40, null, 10, 60, 100],
    rank: 5,
    logo: "/assets/newlog/teams/coragem-nacional.png",
  },
  {
    name: "PUMAS FUT 7",
    points: 280,
    scores: [null, null, null, 30, 40, 20, 30, 20, null, 100, 40, null, null],
    rank: 6,
    logo: "/assets/newlog/teams/pumas-fut-7.png",
  },
  {
    name: "DEPORTIVO SANTA MARIA",
    points: 250,
    scores: [40, 20, 80, null, null, 40, null, null, null, 40, 30, null, null],
    rank: 7,
    logo: "/assets/newlog/teams/deportivo-santa-maria.png",
  },
  {
    name: "PELADEIROS FC",
    points: 160,
    scores: [
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      100,
      null,
      null,
      60,
      null,
      null,
    ],
    rank: 8,
    logo: "/assets/newlog/teams/peladeiros-fc.png",
  },
  {
    name: "300 PRIME",
    points: 150,
    scores: [
      null,
      null,
      null,
      50,
      100,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    ],
    rank: 9,
    logo: "/assets/newlog/teams/300-prime.png",
  },
  {
    name: "RESENHA CELESTES",
    points: 110,
    scores: [
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      80,
      null,
      30,
    ],
    rank: 10,
    logo: "/assets/newlog/teams/resenha-celestes.png",
  },
  {
    name: "GLV",
    points: 100,
    scores: [
      null,
      null,
      null,
      20,
      80,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    ],
    rank: 11,
    logo: "/assets/newlog/teams/glv.png",
  },
  {
    name: "MERCENÁRIOS",
    points: 60,
    scores: [
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      40,
      20,
    ],
    rank: 12,
    logo: "/assets/newlog/teams/mercenarios-fc.png",
  },
  {
    name: "MURARI SPORTS",
    points: 60,
    scores: [
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      60,
    ],
    rank: 13,
    logo: "/assets/newlog/teams/murari-sports.png",
  },
  {
    name: "TRUPE SM",
    points: 5,
    scores: [
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      5,
    ],
    rank: 14,
    logo: "/assets/newlog/teams/trupe-sm.png",
  },
];
export const historicalPlayers: Record<string, PlayerEntry[]> = {
  participations: [
    {
      position: 1,
      name: "FERNANDO",
      value: 10,
    },
    {
      position: 2,
      name: "MATTEUS",
      value: 10,
    },
    {
      position: 3,
      name: "HOLKEM",
      value: 9,
    },
    {
      position: 4,
      name: "LUFEL",
      value: 9,
    },
    {
      position: 5,
      name: "RAFAEL CAMARGO",
      value: 8,
    },
    {
      position: 6,
      name: "RUIVO",
      value: 8,
    },
    {
      position: 7,
      name: "BRUNO",
      value: 7,
    },
    {
      position: 8,
      name: "BRUNO ENNES",
      value: 7,
    },
  ],
  goals: [
    {
      position: 1,
      name: "LUCAS PADYLHA",
      value: 20,
    },
    {
      position: 2,
      name: "ZÉ",
      value: 17,
    },
    {
      position: 3,
      name: "RODRIGO",
      value: 13,
    },
    {
      position: 4,
      name: "THIAGO SOBROSA",
      value: 12,
    },
    {
      position: 5,
      name: "RUIVO",
      value: 11,
    },
    {
      position: 6,
      name: "ADRIANO",
      value: 11,
    },
    {
      position: 7,
      name: "JOSÉ JESUS",
      value: 11,
    },
    {
      position: 8,
      name: "JACKSON",
      value: 10,
    },
  ],
  assists: [],
  value: [],
};
export const competitions: CompetitionEntry[] = [
  {
    edition: 1,
    year: 2022,
    label: "1ºCOPA - 2022",
    highlights: [
      {
        role: "GL",
        name: "CHARÃO",
      },
      {
        role: "ZG",
        name: "RAFAEL",
      },
      {
        role: "ZG",
        name: "SERAPIO",
      },
      {
        role: "AL",
        name: "MATTEUS",
      },
      {
        role: "AL",
        name: "BRUNO",
      },
      {
        role: "MC",
        name: "ZÉ",
      },
    ],
  },
  {
    edition: 2,
    year: 2022,
    label: "2ºCOPA - 2022",
    highlights: [
      {
        role: "GL",
        name: "CHARÃO",
      },
      {
        role: "ZG",
        name: "SERAPIO",
      },
      {
        role: "ZG",
        name: "CARLOS",
      },
      {
        role: "AL",
        name: "MATTEUS",
      },
      {
        role: "AL",
        name: "STECKEL",
      },
      {
        role: "MC",
        name: "CAETANO",
      },
    ],
  },
  {
    edition: 3,
    year: 2022,
    label: "3ºCOPA - 2022",
    highlights: [
      {
        role: "GL",
        name: "LUCAS SEVERO",
      },
      {
        role: "ZG",
        name: "PORTELLA",
      },
      {
        role: "ZG",
        name: "ALEX",
      },
      {
        role: "AL",
        name: "BRUNO ENNES",
      },
      {
        role: "AL",
        name: "BRUNO",
      },
      {
        role: "MC",
        name: "ZÉ",
      },
    ],
  },
  {
    edition: 4,
    year: 2023,
    label: "4ºCOPA - 2023",
    highlights: [
      {
        role: "GL",
        name: "TITO",
      },
      {
        role: "ZG",
        name: "TOM",
      },
      {
        role: "ZG",
        name: "CARVALHO",
      },
      {
        role: "AL",
        name: "DEDY",
      },
      {
        role: "AL",
        name: "GABRIEL VARGAS",
      },
      {
        role: "MC",
        name: "FELIPE TONETTO",
      },
    ],
  },
  {
    edition: 5,
    year: 2023,
    label: "5ºCOPA - 2023",
    highlights: [
      {
        role: "GL",
        name: "CASSÃO",
      },
      {
        role: "ZG",
        name: "LUCAS CORRÊA",
      },
      {
        role: "AL",
        name: "ELISANDRO",
      },
      {
        role: "AL",
        name: "ELISANDRO",
      },
      {
        role: "MC",
        name: "MARCOS PARISE",
      },
      {
        role: "AT",
        name: "JESSÉ",
      },
    ],
  },
  {
    edition: 6,
    year: 2023,
    label: "6ºCOPA - 2023",
    highlights: [
      {
        role: "GL",
        name: "TOM",
      },
      {
        role: "ZG",
        name: "CRISTIAN",
      },
      {
        role: "ZG",
        name: "HOLKEM",
      },
      {
        role: "AL",
        name: "RUIVO",
      },
      {
        role: "AL",
        name: "BARIN",
      },
      {
        role: "MC",
        name: "BRUNO VIEIRA",
      },
    ],
  },
  {
    edition: 7,
    year: 2025,
    label: "7ºCOPA - 2025",
    highlights: [
      {
        role: "GL",
        name: "JULIANO",
      },
      {
        role: "ZG",
        name: "VITOR JACARÉ",
      },
      {
        role: "ZG",
        name: "CARLOS",
      },
      {
        role: "ZG",
        name: "VINICIUS MICHELS",
      },
      {
        role: "MC",
        name: "FÁBIO",
      },
      {
        role: "MC",
        name: "DUTRA",
      },
    ],
  },
  {
    edition: 8,
    year: 2025,
    label: "8ºCOPA - 2025",
    highlights: [
      {
        role: "GL",
        name: "CASSÃO",
      },
      {
        role: "ZG",
        name: "RIGUI",
      },
      {
        role: "ZG",
        name: "ANDERSON RATO",
      },
      {
        role: "ZG",
        name: "MATHEUS BIANCHI",
      },
      {
        role: "MC",
        name: "RAFINHA",
      },
      {
        role: "MC",
        name: "JOSÉ DE JESUS",
      },
    ],
  },
  {
    edition: 9,
    year: 2026,
    label: "9ºCOPA - 2026",
    highlights: [
      {
        role: "GL",
        name: "ANDRIO",
      },
      {
        role: "ZG",
        name: "FERNANDO",
      },
      {
        role: "ZG",
        name: "LUCAS SAVIAN",
      },
      {
        role: "ZG",
        name: "RIGHI",
      },
      {
        role: "MC",
        name: "LUCAS CORRÊA",
      },
      {
        role: "MC",
        name: "DENIS",
      },
    ],
  },
  {
    edition: 10,
    year: 2026,
    label: "10ºCOPA - 2026",
    highlights: [
      {
        role: "GL",
        name: "IGOR AMARAL",
      },
      {
        role: "ZG",
        name: "LUCAS LOPES",
      },
      {
        role: "ZG",
        name: "CARLOS",
      },
      {
        role: "ZG",
        name: "PELISSER",
      },
      {
        role: "MC",
        name: "LUCAS GRECO",
      },
      {
        role: "MC",
        name: "JOSÉ DE JESUS",
      },
    ],
  },
];

export const teamDirectory = [
  ...ranking.map(entry => ({ name: entry.name, logo: entry.logo })),
  { name: "Deportivo Mazembe", logo: undefined },
  { name: "Inimigos da Bola", logo: undefined },
  { name: "Redbull SM", logo: undefined },
].filter(
  (team, index, list) =>
    list.findIndex(item => item.name === team.name) === index
);

export const workbookFacts = {
  sheetCount: 8,
  historicalCups: 10,
  rankingTeams: ranking.length,
  sourceSheets: [
    "PICKS - 11ª EDIÇÃO",
    "12º EDIÇÃO",
    "MAIORES NO GERAL",
    "RANKING GERAL NEWLOG",
    "TABELAS DAS COPAS",
    "TIMES E DESTAQUES DAS COPAS",
    "ESTATISTICAS GERAIS",
    "BID - 10ª EDIÇÃO",
  ],
  laterEditions: ["11ª EDIÇÃO", "12º EDIÇÃO"],
};
