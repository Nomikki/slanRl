import { game } from ".";
import Actor from "./actor";
import { random } from "./ai";
import { Colors } from "./colors";

export default class Attacker {
  power: string;

  constructor(power: string) {
    this.power = power;
  }

  attack(owner: Actor, target: Actor) {
    if (target.destructible && !target.destructible.isDead()) {
      //1. check if damage roll is succesful
      //its just calculated hit or miss

      const hitOrMiss = random.dice(1, 20, 0);
      let bonus = false;

      //game.log.add(`${owner.name} roll 1d20 = ${hitOrMiss}`);
      //miss
      if (hitOrMiss === 1) {
        game.log.add(`${target.name} miss attack by ${owner.name}`);
        return;
      }

      if (hitOrMiss === 20) {
        bonus = true;
      }

      if (hitOrMiss >= 20) {
        game.log.add(
          `${owner.name} makes critical to ${target.name}!`,
          Colors.HILIGHT_TEXT,
        );
      }

      if (hitOrMiss >= target.destructible.defense) {
        const [numberOfDices, numberOfEyes] = this.power.split("d");
        const diceDmg = random.dice(
          bonus ? parseInt(numberOfDices) * 2 : parseInt(numberOfDices),
          parseInt(numberOfEyes),
          0,
        );

        game.log.add(
          `${owner.name} attacks ${target.name} for ${diceDmg} hit points (${this.power}).`,
          owner === game.player ? Colors.PLAYER_ATTACK : Colors.ENEMY_ATTACK,
        );

        target.destructible.takeDamage(target, diceDmg);
      }

      /*
     

     

      if (diceDmg - target.destructible.defense > 0) {
        const dmg = diceDmg - target.destructible.defense;

      
      } else {
        game.log.add(
          `${owner.name} attacks ${target.name} but it has no effect!`,
        );
      }
      
    } else {
      game.log.add(`${owner.name} attacks ${target.name} in vain.`);
    }
    
      */
    }
  }
}
