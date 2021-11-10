export default [
  {
    name: "dwarf",
    flavourText:
      "Kingdoms richs in ancient grandeur, halls carved into the roots of mountains, the echoing of picks and hammers in deep mines and blazing forges, and a commitment to clan and tradition - these common threads unite all dwarves.",

    toughnessIncrease: 1,
    abilityIncrease: {
      str: 2,
      dex: 0,
      con: 2,
      int: 0,
      wis: 0,
    },

    resilience: "poison",

    proficiencies: [
      {
        type: "light armor",
      },
      {
        type: "medium armor",
      },
    ],
  },
  {
    name: "elf",
    flavourText:
      "A people of otherworldy grace, elves dwell in places of ethereal beauty, in the midst of ancient forest or in spires glittering with fearie light, where soft music drifts through the air and gentle fragrances waft on the breeze.",

    toughnessIncrease: 0,
    abilityIncrease: {
      str: 0,
      dex: 2,
      con: 0,
      int: 1,
      wis: 1,
    },

    resilience: "none",

    proficiencies: [
      {
        type: "longsword",
      },
      {
        type: "shortsword",
      },
      {
        type: "shortbow",
      },
      {
        type: "longbow",
      },
    ],
  },
  {
    name: "halfling",
    flavourText:
      "The diminutive halflings survive in a world full of larger creatures by avoiding notire or, barring that, avoiding offense. Standing about 3 feet tall, they appear relatively harmless and so have managed to survive for centuries in the shadow os empires and on the edges of wars.",

    toughnessIncrease: 0,
    abilityIncrease: {
      str: 0,
      dex: 2,
      con: 1,
      int: 0,
      wis: 0,
    },

    resilience: "poison",

    proficiencies: [],
  },
  {
    name: "human",
    flavourText:
      "Humans are the most adaptable and ambitious people among the common races. They have widely varying tastes, morals, and customs in different lands where they have settled. Wheyn they settle, though, they stay: they build cities to last for the ages.",

    toughnessIncrease: 0,
    abilityIncrease: {
      str: 1,
      dex: 1,
      con: 1,
      int: 1,
      wis: 1,
    },

    resilience: "none",

    proficiencies: [],
  },
];
