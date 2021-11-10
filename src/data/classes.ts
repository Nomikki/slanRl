export default [
  {
    name: "bard",
    flavourText:
      "Whether poet, scholar, or scroundrel, a bard weaves magic through words and music manipulate minds, and heal wounds. The bard is a master of song, speech and the magic they contain.",

    healthAtStart: 8,
    healthIncreasePerLevel: 5,

    savingThrows: [
      {
        type: "dex",
      },
    ],

    proficiencies: [
      {
        type: "light armor",
      },
      {
        type: "simple weapon",
      },
      {
        type: "hand crossbow",
      },
      {
        type: "longsword",
      },
      {
        type: "rapier",
      },
      {
        type: "shortsword",
      },
    ],
  },

  {
    name: "cleric",
    flavourText:
      "Clerics are intermediaries between the mortal world and the distant of planes of the gods. As varied as the gods they serve, clerics strive to embody the handiwork of their deities and are imbued with magic.",

    healthAtStart: 8,
    healthIncreasePerLevel: 5,

    savingThrows: [
      {
        type: "wis",
      },
    ],

    proficiencies: [
      {
        type: "light armor",
      },
      {
        type: "simple weapon",
      },
      {
        type: "medium armor",
      },
      {
        type: "shield",
      },
    ],
  },

  {
    name: "fighter",
    flavourText:
      "Every fighter can pick up a weapon and wield it ably. Likewise, a fighter is adept with shields and every form of armor. Beyond that basic degree of familiarity, each fighter specializes in a certain style of combat. Some concentrate on archery, some on fighting with two weapons at once, and some on augmenting on their martial skills with magic.",

    healthAtStart: 10,
    healthIncreasePerLevel: 6,

    savingThrows: [
      {
        type: "con",
      },
      {
        type: "str",
      },
    ],

    proficiencies: [
      {
        type: "light armor",
      },
      {
        type: "medium armor",
      },
      {
        type: "heavy armor",
      },
      {
        type: "shield",
      },
      {
        type: "simple weapons",
      },
      {
        type: "martial weapons",
      },
    ],
  },

  {
    name: "rogue",
    flavourText:
      "Rogues rely on skill, stealth, and thei foes' vulnarabilities to get the upper hand in any situation. They have a knack for finding the solution to just about any problem.",

    healthAtStart: 8,
    healthIncreasePerLevel: 5,

    savingThrows: [
      {
        type: "dex",
      },
      {
        type: "int",
      },
    ],

    proficiencies: [
      {
        type: "light armor",
      },
      {
        type: "simple weapon",
      },
      {
        type: "hand crossbow",
      },
      {
        type: "longsword",
      },
      {
        type: "rapier",
      },
      {
        type: "shortsword",
      },
    ],
  },

  {
    name: "wizard",
    flavourText:
      "Drawing on the subtle weave of magic that permeates the cosmos, wizards casts spells of explosive fire, arcing lightning, subtle deception and brute-force mind control.",

    healthAtStart: 6,
    healthIncreasePerLevel: 4,

    savingThrows: [
      {
        type: "wis",
      },
      {
        type: "int",
      },
    ],

    proficiencies: [
      {
        type: "dagger",
      },
      {
        type: "dart",
      },
      {
        type: "sling",
      },
      {
        type: "quarterstaff",
      },
      {
        type: "light crossbow",
      },
    ],
  },
];
