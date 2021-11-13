//import colors from "@/css/colors.module.scss";
import spellJson from "@/data/spells";
import { ensure } from "@/utils";
//import { Colors } from "@/utils/colors";

export interface SpellInterface {
  name: string; //"thunderwave",
  effectType: string; //"lightning",
  effectValues: string; //"2d8;3d8;4d8;5d8",
  amount: string; //"3",
  effectValue_mod: string; //"",
  effectShape: string; //"cube",
  effectSize: number; //3,
  range: number; //0,
  target_saving_throw_type: string; //"con",
  if_target_saving_throw_success: string; //"half_damage",
  if_target_saving_throw_fail: string; //"full_damage;pushing_away",
  toCaster: string; //"",
  turns: number; //0,
}

export const spells: SpellInterface[] = spellJson;

const getSpellUsingFind = (name: string): SpellInterface | undefined => {
  return spells.find(item => item.name === name);
};

export const createSpell = (name: string) => {
  const isSpell = (name: string): boolean =>
    !!spells.find(n => n.name === name);

  if (isSpell(name)) {
    const spellTemplate = ensure(getSpellUsingFind(name));
    //if (spellTemplate.)
    console.log(JSON.stringify(spellTemplate, null, 2));
  } else {
    console.log(`There is no spell called ${name}`);
  }

  //return spell;
};
