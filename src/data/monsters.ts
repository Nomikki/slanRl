import colors from "@/css/colors.module.scss";

export default [
  {
    name: "bat",
    "size:": "tiny",
    type: "beast",
    movingSpeed: 2,

    ch: "b",
    color: colors.monster_bat,
    hp: 1,
    ac: 12,
    xp: 5,

    abilities: {
      str: 2,
      dex: 15,
      con: 8,
      int: 2,
      wis: 12,
    },

    attacks: [
      {
        name: "bite",
        damage: "1d1",
        damageType: "piercing",
      },
    ],
  },

  {
    name: "jackal",
    "size:": "small",
    type: "beast",

    ch: "j",
    color: colors.monster_jackal,
    hp: 3,
    ac: 12,
    xp: 10,
    movingSpeed: 1,

    abilities: {
      str: 8,
      dex: 15,
      con: 11,
      int: 3,
      wis: 12,
    },

    attacks: [
      {
        name: "bite",
        damage: "1d4",
        damageType: "piercing",
      },
    ],
  },

  {
    name: "lizard",
    "size:": "tiny",
    type: "beast",
    movingSpeed: 1,

    ch: "l",
    color: colors.monster_lizard,
    hp: 2,
    ac: 10,
    xp: 10,

    abilities: {
      str: 2,
      dex: 11,
      con: 10,
      int: 1,
      wis: 8,
    },

    attacks: [
      {
        name: "bite",
        damage: "1d1",
        damageType: "piercing",
      },
    ],
  },

  {
    name: "kobold",
    "size:": "small",
    type: "humanoid",
    movingSpeed: 1,

    ch: "k",
    color: colors.monster_kobold,
    hp: 5,
    ac: 12,
    xp: 25,

    abilities: {
      str: 7,
      dex: 15,
      con: 9,
      int: 8,
      wis: 7,
    },

    attacks: [
      {
        name: "dagger",
        damage: "1d4",
        damageType: "piercing",
      },
      {
        name: "sling",
        damage: "1d4",
        damageType: "bludgeoning",
      },
    ],
  },

  {
    name: "rat",
    "size:": "tiny",
    type: "beast",
    movingSpeed: 1.5,

    ch: "r",
    color: colors.monster_rat,
    hp: 1,
    ac: 10,
    xp: 5,

    abilities: {
      str: 2,
      dex: 11,
      con: 9,
      int: 2,
      wis: 10,
    },

    attacks: [
      {
        name: "bite",
        damage: "1d1",
        damageType: "piercing",
      },
    ],
  },
  {
    name: "giant rat",
    "size:": "small",
    type: "beast",
    movingSpeed: 1.5,

    ch: "R",
    color: colors.monster_giant_rat,
    hp: 7,
    ac: 12,
    xp: 25,

    abilities: {
      str: 7,
      dex: 15,
      con: 11,
      int: 2,
      wis: 10,
    },

    attacks: [
      {
        name: "bite",
        damage: "1d4",
        damageType: "piercing",
      },
    ],
  },
  {
    name: "ghoul",
    size: "medium",
    type: "undead",
    ch: "G",
    movingSpeed: 0.75,
    color: colors.monster_ghoul,
    hp: 22,
    ac: 12,
    xp: 200,

    abilities: {
      str: 13,
      dex: 15,
      con: 10,
      int: 7,
      wis: 10,
    },

    attacks: [
      {
        name: "bite",
        damage: "2d6",
        damageType: "piercing",
      },
      {
        name: "claws",
        damage: "2d4",
        damageType: "slashing",
      },
    ],
  },
  {
    name: "orc",
    size: "medium",
    type: "humanoid",
    movingSpeed: 0.9,
    ch: "o",
    color: colors.monster_orc,
    hp: 15,
    ac: 13,
    xp: 100,

    abilities: {
      str: 16,
      dex: 12,
      con: 16,
      int: 7,
      wis: 11,
    },

    attacks: [
      {
        name: "greataxe",
        damage: "1d12",
        damageType: "slashing",
      },
      {
        name: "javelin",
        damage: "1d6",
        damageType: "piercing",
      },
    ],
  },
  {
    name: "troll",
    size: "large",
    type: "giant",
    movingSpeed: 0.9,
    ch: "t",
    color: colors.monster_troll,
    hp: 84,
    ac: 15,
    xp: 1800,

    abilities: {
      str: 18,
      dex: 13,
      con: 20,
      int: 7,
      wis: 9,
    },

    attacks: [
      {
        name: "bite",
        damage: "1d16",
        damageType: "piercing",
      },
      {
        name: "claw",
        damage: "2d6",
        damageType: "slashing",
      },
    ],
  },
];
