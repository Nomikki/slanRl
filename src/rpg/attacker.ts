import { game } from "@/index";
import { ABILITIES } from "@/rpg/abilities";
import Actor from "@/units/actor";
import { random } from "@/units/ai";
import { Colors } from "@/utils/colors";
import { ensure } from "@/utils/utils";

export default class Attacker {
  power: string;

  constructor(power: string) {
    this.power = power;
  }

  async attack(owner: Actor, target: Actor) {
    this.meleeAttack(owner, target);
  }

  meleeAttack(owner: Actor, target: Actor) {
    if (target.destructible && !target.destructible.isDead()) {
      //check if damage roll is succesful
      //its just calculated hit or miss
      const hitOrMiss = random.dice(1, 20, 0);

      const attackModifier = ensure(owner.abilities).getBonus(ABILITIES.STR);
      let bonus = false;

      if (hitOrMiss === 1) {
        game.log.add(`${target.name} miss attack by ${owner.name}`);
        return;
      }

      if (hitOrMiss === 20) {
        bonus = true;
        game.log.add(
          `${owner.name} makes critical attack to ${target.name}!`,
          Colors.HILIGHT_TEXT,
        );
      }

      if (hitOrMiss >= target.destructible.defense) {
        const [numberOfDices, numberOfEyes] = this.power.split("d");
        let dices = 1;
        const diceDmg = random.dice(
          bonus === true
            ? (dices = parseInt(numberOfDices) * 2)
            : (dices = parseInt(numberOfDices)),
          parseInt(numberOfEyes),
          0,
        );
        const eyes = numberOfEyes;

        game.log.add(
          `${owner.name} attacks ${
            target.name
          } for ${diceDmg} hit points (${dices}d${eyes}${
            attackModifier > 0 ? "+" : "-"
          }${Math.abs(attackModifier)}).`,
          owner === game.player ? Colors.PLAYER_ATTACK : Colors.ENEMY_ATTACK,
        );
        let finalDamage = diceDmg + attackModifier;
        if (finalDamage < 0) finalDamage = 0;

        target.destructible.takeDamage(target, finalDamage);
      }
    }
  }
}
