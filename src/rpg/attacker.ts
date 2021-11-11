import { game } from "@/index";
import { ABILITIES } from "@/rpg/abilities";
import Actor from "@/units/actor";
import { random } from "@/units/ai";
import { ensure, float2int, sleep } from "@/utils";
import { Colors } from "@/utils/colors";

export default class Attacker {
  power_melee: string;
  power_range: string;
  rangeAttack_range: number;

  constructor(power_melee: string, power_range: string) {
    this.power_melee = power_melee;
    this.power_range = power_range;
    this.rangeAttack_range = 0;
  }

  async attack(owner: Actor, target: Actor) {
    this.meleeAttack(owner, target);
  }

  attackPhase(
    attacker: Actor,
    target: Actor,
    modifier: ABILITIES,
    power: string,
  ) {
    if (target.destructible && !target.destructible.isDead()) {
      //check if damage roll is succesful
      //its just calculated hit or miss
      const hitOrMiss = random.dice(1, 20, 0);

      const attackModifier = ensure(attacker.abilities).getBonus(modifier);
      let bonus = false;

      if (hitOrMiss === 1) {
        game.log.add(`${target.name} miss attack by ${attacker.name}`);
        return;
      }

      if (hitOrMiss === 20) {
        bonus = true;
        game.log.add(
          `${attacker.name} makes critical attack to ${target.name}!`,
          Colors.HILIGHT_TEXT,
        );
      }

      if (hitOrMiss >= target.destructible.defense) {
        const [numberOfDices, numberOfEyes] = power.split("d");
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
          `${attacker.name} attacks ${
            target.name
          } for ${diceDmg} hit points (${dices}d${eyes}${
            attackModifier > 0 ? "+" : "-"
          }${Math.abs(attackModifier)}).`,
          attacker === game.player ? Colors.PLAYER_ATTACK : Colors.ENEMY_ATTACK,
        );
        let finalDamage = diceDmg + attackModifier;
        if (finalDamage < 0) finalDamage = 0;

        target.destructible.takeDamage(target, finalDamage);
      }
    }
  }

  async rangeAttack(owner: Actor, x: number, y: number) {
    const target = game.getActor(x, y);

    const distance = float2int(owner.getDistance(x, y));
    const dx = (x - owner.x) / distance;
    const dy = (y - owner.y) / distance;

    let arrowX = owner.x;
    let arrowY = owner.y;
    let arrowCh = "-";

    const angle = float2int(((Math.atan2(dy, dx) / 3.1415) * 180 + 360) % 360);
    console.log(angle);

    if (angle >= 270 - 25 && angle <= 270 + 25) arrowCh = "|";
    else if (angle >= 90 - 25 && angle <= 90 + 25) arrowCh = "|";
    else if (angle > 25 && angle < 45 + 25) arrowCh = "\\";
    else if (angle > 180 + 25 && angle < 180 + 45) arrowCh = "\\";
    else arrowCh = "/";

    for (let i = 0; i < distance; i++) {
      await sleep(100);
      arrowX += dx;
      arrowY += dy;

      game.render();
      game.drawChar(
        arrowCh,
        float2int(arrowX) + game.camera.x,
        float2int(arrowY) + game.camera.y,
        Colors.HILIGHT_TEXT,
      );
    }

    game.render();

    if (target && game.player?.fov?.isInFov(x, y)) {
      this.attackPhase(owner, target, ABILITIES.DEX, this.power_range);
    }
  }

  meleeAttack(owner: Actor, target: Actor) {
    if (target.destructible && !target.destructible.isDead()) {
      this.attackPhase(owner, target, ABILITIES.STR, this.power_melee);
    }
  }
}
