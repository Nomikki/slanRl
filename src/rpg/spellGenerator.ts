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

  console.error(`There is no spell called ${name}`);
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
  const amount = parseInt(amounts[level - 1]);
  let spellX = 0;
  let spellY = 0;

  for (let i = 0; i < amount; i++) {
    let targets: Actor[] = [];

    if (spell.range > 0) {
      const [inRange, tileX, tileY] = await game.pickATile(
        caster.x,
        caster.y,
        spell.range,
      );

      spellX = tileX as number;
      spellY = tileY as number;

      if (inRange) {
        if (spell.effectShape === "cube") {
          const tt = game.getActorsInCube(
            tileX as number,
            tileY as number,
            spell.effectSize,
            caster,
          );
          if (tt as Actor[]) {
            targets = tt as Actor[];
          }
        } else if (spell.effectShape === "cone") {
          //TODO
        } else if (spell.effectShape === "sphere") {
          const tt = game.getActorsInSphere(
            tileX as number,
            tileY as number,
            spell.effectSize,
            caster,
          );
          if (tt as Actor[]) {
            targets = tt as Actor[];
          }
        } else {
          const tt = game.getActor(tileX as number, tileY as number);
          if (tt as Actor) targets.push(tt as Actor);
        }
      }
    } else {
      spellX = caster.x;
      spellY = caster.y;
      targets.push(caster);
    }

    for (const t of targets as Actor[]) {
      applySpellTo(t as Actor, caster, spell, level, spellX, spellY);
      game.player?.computeFov();
      game.render();
    }
    if (targets.length === 0) {
      applySpellTo(undefined, caster, spell, level, spellX, spellY);
      game.player?.computeFov();
      game.render();
    }
  }
};

const getEffectValueBonus = (mod: string, caster: Actor): number => {
  if (mod.length > 0) {
    if (mod === "str") return ensure(caster.abilities?.getBonus(ABILITIES.STR));
    if (mod === "dex") return ensure(caster.abilities?.getBonus(ABILITIES.DEX));
    if (mod === "con") return ensure(caster.abilities?.getBonus(ABILITIES.CON));
    if (mod === "int") return ensure(caster.abilities?.getBonus(ABILITIES.INT));
    if (mod === "win") return ensure(caster.abilities?.getBonus(ABILITIES.WIS));
  }

  return 0;
};

const isDamageEffect = (effect: string): boolean => {
  if (
    effect === "force" ||
    effect === "acid" ||
    effect === "lightning" ||
    effect === "fire" ||
    effect === "cold" ||
    effect === "radiant" ||
    effect === "necrotic" ||
    effect === "poison"
  )
    return true;
  return false;
};

const applySpellTo = (
  target: Actor | undefined,
  caster: Actor,
  spell: SpellInterface,
  level: number,
  x: number,
  y: number,
) => {
  const effectValues = spell.effectValues.split(";");
  const effectValue = effectValues[level - 1];

  if (target) {
    const effects = spell.effectType.split(";");
    for (const effect of effects) {
      const [dices, eyes, bonus] = random.parseDice(effectValue);
      const effectValueModBonus = getEffectValueBonus(
        spell.effectValue_mod,
        caster,
      );

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
          )}) against ${saveDC} (${spell.target_saving_throw_type} 1d20 ${savingThrowbonus > 0 ? "+" + savingThrowbonus : savingThrowbonus
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
      } else if (isDamageEffect(effect)) {
        //if there's any saving throws, check them first
        if (spell.target_saving_throw_type !== "") {
          const successList = spell.if_target_saving_throw_success.split(";");
          if (savingThrowSuccess === true) {
            for (const success of successList) {
              if (success === "half_damage") {
                game.log.add(
                  `${caster.name} cast a ${spell.name} to ${target.name
                  } for ${float2int(
                    value / 2,
                  )} hit points (${effectValueFinal} / 2).`,
                );
                target.destructible?.takeDamage(target, float2int(value / 2));
              } else if (success === "") {
                game.log.add(`${target.name} dodged the spell!`);
              }
            }
          } else {
            const failList = spell.if_target_saving_throw_fail.split(";");
            for (const fail of failList) {
              if (fail === "full_damage") {
                game.log.add(
                  `${caster.name} cast a ${spell.name} to ${target.name
                  } for ${float2int(value)} hit points (${effectValueFinal}).`,
                );
                target.destructible?.takeDamage(target, float2int(value));
              }
              if (fail === "pushing_away") {
                target.pushAwayFrom(x, y, 2);
              }
            }
          }
        } else {
          //no saving throws, so just make damage
          game.log.add(
            `${caster.name} cast a ${spell.name} to ${target.name} for ${value} hit points (${effectValueFinal}).`,
          );
          target.destructible?.takeDamage(target, value);
        }
      } else {
        game.log.add(`unkow effect type ${effect}`, Colors.DISALLOWED);
      }
    }
  } else {
    const effects = spell.effectType.split(";");
    for (const effect of effects) {
      if (effect === "transmutation") {
        const toCaster = spell.toCaster.split(";");
        for (const c of toCaster) {
          if (c === "teleport_to_selected_location") {
            if (game.map?.canWalk(x, y)) {
              caster.x = x;
              caster.y = y;
              game.log.add(`${caster.name} teleported!`);
              game.player?.computeFov();
              game.camera.compute(
                ensure(game.player?.x),
                ensure(game.player?.y),
              );
            } else {
              game.log.add("Can't teleport there.");
            }
          }
        }
      }
    }
  }
};
