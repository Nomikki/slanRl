import colors from "@/css/colors.module.scss";

export default [
  {
    name: "health potion",
    message: "gulp gulp gulp...",
    ch: "!",
    color: colors.pickup_healthpotion,
    weight: 0.1,
    selector: {
      type: "none",
      range: 0,
    },
    effect: {
      type: "health",
      amount: 4,
    },
  },
  {
    name: "nutella bun",
    message: "omnomnom...",
    ch: "@",
    color: colors.pickup_nutellabun,
    weight: 0.1,
    selector: {
      type: "none",
      range: 0,
    },
    effect: {
      type: "health",
      amount: 30,
    },
  },

  {
    name: "scroll of fireball",
    message: "Everything burns.",
    ch: "#",
    color: colors.pickup_scroll_of_fireball,
    weight: 0.05,
    selector: {
      type: "selected range",
      range: 3,
    },
    effect: {
      type: "health",
      amount: -12,
    },
  },
  {
    name: "scroll of confusion",
    message: "Confused af.",
    ch: "#",
    color: colors.pickup_scroll_of_confusion,
    weight: 0.05,
    selector: {
      type: "selected monster",
      range: 5,
    },
    effect: {
      type: "change ai",
      amount: 10,
    },
  },
  {
    name: "scroll of map",
    message: "All is clear!",
    ch: "#",
    color: colors.pickup_scroll_of_map,
    weight: 0.05,
    selector: {
      type: "none",
      range: 0,
    },
    effect: {
      type: "map clear",
      amount: 0,
    },
  },
  {
    name: "scroll of lighting bolt",
    message: "A lighting bolt strikes!",
    ch: "#",
    color: colors.pickup_scroll_of_lightning,
    weight: 0.05,
    selector: {
      type: "closest monster",
      range: 5,
    },
    effect: {
      type: "health",
      amount: -20,
    },
  },
];
