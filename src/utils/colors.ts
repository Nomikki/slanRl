import colors from "@/css/colors.module.scss";

export const Colors = {
  //map
  BACKGROUND: colors.ui_map_background,
  WALL: colors.ui_wall,
  WALL_DARK: colors.ui_wall_dark,
  DOOR: colors.ui_door,

  //pickups
  HEALTHPOTION: colors.pickup_healthpotion,
  NUTELLABUN: colors.pickup_nutellabun,
  SCROLL_OF_LIGHTING: colors.pickup_scroll_of_lightning,
  SCROLL_OF_FIREBALL: colors.pickup_scroll_of_fireball,
  SCROLL_OF_CONFUSION: colors.pickup_scroll_of_confusion,
  SCROLL_OF_MAP: colors.pickup_scroll_of_map,

  ARMOR_ITEM: colors.pickup_armor_item,
  WEAPON_ITEM: colors.pickup_weapon_item,

  //ui
  LEVEL_UP: colors.ui_level_up,
  HEALED: colors.ui_healed,
  MENU_CURSOR: colors.ui_menu_cursor,
  GAME_SAVED: colors.ui_game_saved,
  PICKED_UP: colors.ui_picked_up,
  INVENTORY_FULL: colors.ui_inventory_full,
  MENU_BORDER: colors.ui_menu_border,

  ALLOWED: colors.ui_allowed,
  DISALLOWED: colors.ui_disallowed,

  HP_10_PERCENT: colors.ui_hp_10_percent,
  HP_25_PERCENT: colors.ui_hp_25_percent,
  HP_50_PERCENT: colors.ui_hp_50_percent,
  HP_95_PERCENT: colors.ui_hp_95_percent,
  HP_MAX: colors.ui_hp_max,

  //actors
  HERO: colors.actor_hero,
  STAIRS: colors.actor_stairs,

  //log
  PLAYER_ATTACK: colors.log_player_attack,
  ENEMY_ATTACK: colors.log_enemy_attack,
  DEAD_BODY: colors.log_dead_body,
  DEFAULT_TEXT: colors.log_default_text,
  HILIGHT_TEXT: colors.log_hilight_text,

  DEFEAT: colors.log_defeat,

  AMBIENCE_COLOR: [
    "#0088FF",
    "#CCAAFF",
    "#000000",
    "#CCCCCC",
    "#33AA33",
    "#AAFFAA",
    "#CC00CC",
    "#FFFF00",
    "#33AACC",
    "#FF0000",
  ],

  VERSION: colors.ui_version,
};
