//import colors from "@/css/colors.module.scss";
import spellJson from "@/data/spells";
import { game } from "@/index";
import { ABILITIES } from "@/rpg/abilities";
import Actor from "@/units/actor";
import { random } from "@/units/ai";
import { ensure, float2int } from "@/utils";
import { Colors } from "@/utils/colors";
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

export const getSpell = (name: string): SpellInterface | undefined => {
  const isSpell = (name: string): boolean =>
    !!spells.find(n => n.name === name);

  if (isSpell(name)) {
    const spellTemplate = ensure(getSpellUsingFind(name));
    return spellTemplate;
  }

  console.log(`There is no spell called ${name}`);
  return undefined;
};

export const createSpell = async (
  spell: SpellInterface,
  caster: Actor,
  level: number,
) => {
  console.log("caster", caster);
  console.log(`spell level: ${level}`);
  console.log(JSON.stringify(spell, null, 2));

  const amounts = spell.amount.split(";");
  const effectValues = spell.effectValues.split(";");

  const amount = parseInt(amounts[level - 1]);
  const effectValue = effectValues[level - 1];

  for (let i = 0; i < amount; i++) {
    let target;

    if (spell.range > 0) {
      const [inRange, tileX, tileY] = await game.pickATile(
        caster.x,
        caster.y,
        spell.range,
      );
      if (inRange) {
        target = game.getActor(tileX as number, tileY as number);
        if (target) {
          //console.log("xy: ", tileX, tileY);
        }
      }
    } else {
      //self effect
      target = caster;
    }

    if (target) {
      //console.log("effecttype: ", spell.effectType);

      const effects = spell.effectType.split(";");
      for (const effect of effects) {
        console.log(`effect: ${effect}`);
        console.log(`effect value: ${effectValue}`);
        const [dices, eyes, bonus] = random.parseDice(effectValue);
        let effectValueModBonus = 0;

        if (spell.effectValue_mod.length > 0) {
          if (spell.effectValue_mod === "str")
            effectValueModBonus = ensure(
              caster.abilities?.getBonus(ABILITIES.STR),
            );
          if (spell.effectValue_mod === "dex")
            effectValueModBonus = ensure(
              caster.abilities?.getBonus(ABILITIES.DEX),
            );
          if (spell.effectValue_mod === "con")
            effectValueModBonus = ensure(
              caster.abilities?.getBonus(ABILITIES.CON),
            );
          if (spell.effectValue_mod === "int")
            effectValueModBonus = ensure(
              caster.abilities?.getBonus(ABILITIES.INT),
            );
          if (spell.effectValue_mod === "win")
            effectValueModBonus = ensure(
              caster.abilities?.getBonus(ABILITIES.WIS),
            );
        }

        let savingThrowSuccess = false;
        let savingThrowbonus = 0;
        if (spell.target_saving_throw_type === "str")
          savingThrowbonus = ensure(target.abilities?.getBonus(ABILITIES.STR));
        if (spell.target_saving_throw_type === "dex")
          savingThrowbonus = ensure(target.abilities?.getBonus(ABILITIES.DEX));
        if (spell.target_saving_throw_type === "con")
          savingThrowbonus = ensure(target.abilities?.getBonus(ABILITIES.CON));
        if (spell.target_saving_throw_type === "int")
          savingThrowbonus = ensure(target.abilities?.getBonus(ABILITIES.INT));
        if (spell.target_saving_throw_type === "wis")
          savingThrowbonus = ensure(target.abilities?.getBonus(ABILITIES.WIS));

        const saveDC = random.dice(1, 20, savingThrowbonus);
        const attackDC = random.dice(
          1,
          20,
          caster.abilities?.getBonus(ABILITIES.INT),
        );

        if (spell.target_saving_throw_type !== "") {
          game.log.add(
            `Attack roll ${attackDC} (1d20 ${caster.abilities?.getBonusWithSign(
              ABILITIES.INT,
            )}) against ${saveDC} (${spell.target_saving_throw_type} 1d20 ${
              savingThrowbonus > 0 ? "+" + savingThrowbonus : savingThrowbonus
            })`,
          );

          if (saveDC >= attackDC) {
            savingThrowSuccess = true;
          }
        }

        const value = random.dice(dices, eyes, bonus) + effectValueModBonus;
        const effectBonusSigned =
          effectValueModBonus > 0
            ? `+${effectValueModBonus}`
            : `${effectValueModBonus}`;
        const effectValueFinal =
          effectValue +
          (spell.effectValue_mod.length > 0
            ? ` with ${spell.effectValue_mod.toUpperCase()} ${effectBonusSigned}`
            : "");

        if (effect === "heal") {
          game.log.add(
            `${caster.name} cast a ${spell.name} and heals for ${value} hit points (${effectValueFinal}).`,
          );

          target.destructible?.heal(value);
        } else if (
          effect === "force" ||
          effect === "acid" ||
          effect === "lightning"
        ) {
          if (spell.target_saving_throw_type !== "") {
            if (
              savingThrowSuccess === true &&
              spell.if_target_saving_throw_success === "half_damage"
            ) {
              game.log.add(
                `${caster.name} cast a ${spell.name} to ${
                  target.name
                } for ${float2int(
                  value / 2,
                )} hit points (${effectValueFinal} / 2).`,
              );
              target.destructible?.takeDamage(target, float2int(value / 2));
            } else {
              game.log.add(
                `${caster.name} cast a ${spell.name} to ${
                  target.name
                } for ${float2int(value)} hit points (${effectValueFinal}).`,
              );
              target.destructible?.takeDamage(target, float2int(value));
            }
          } else {
            game.log.add(
              `${caster.name} cast a ${spell.name} to ${target.name} for ${value} hit points (${effectValueFinal}).`,
            );
            target.destructible?.takeDamage(target, value);
          }
        } else {
          game.log.add(`unkow effect type ${effect}`, Colors.DISALLOWED);
        }
      }
    }
  }
};
