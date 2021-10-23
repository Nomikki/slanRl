import { game } from '.';
import Actor from './actor';

export default class Attacker {
  power: number;

  constructor(power: number) {
    this.power = power;
  }

  attack(owner: Actor, target: Actor) {
    if (target.destructible && !target.destructible.isDead()) {
      const damage = this.power - target.destructible.defense;
      if (damage > 0) {
        game.log.add(
          `${owner.name} attacks ${target.name} for ${damage} hit points.`,
          owner === game.player ? '#DDD' : '#AAA',
        );
      } else {
        game.log.add(
          `${owner.name} attacks ${target.name} but it has no effect!`,
        );
      }
      target.destructible.takeDamage(target, this.power);
    } else {
      game.log.add(`${owner.name} attacks ${target.name} in vain.`);
    }
  }
}
