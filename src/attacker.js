import { game } from ".";

export default class Attacker {
  constructor(power) {
    this.power = power;
  }

  attack(owner, target) {
    if (target.destructible && !target.destructible.isDead()) {
      if (this.power - target.destructible.defense > 0) {
        game.log.add(
          owner.name +
            " attacks " +
            target.name +
            " for " +
            (this.power - target.destructible.defense) +
            " hit points."
        );
      } else {
        game.log.add(
          owner.name + " attacks " + target.name + " but it has no effect!"
        );
      }
      target.destructible.takeDamage(target, this.power);
    } else {
      game.log.add(owner.name + " attacks " + target.name + " in vain.");
    }
  }
}
