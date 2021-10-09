import { game } from ".";

export default class Destructible {
  constructor(maxHP, defense, corpseName) {
    this.maxHP = maxHP;
    this.hp = this.maxHP;
    this.defense = defense;
    this.corpseName = corpseName;
  }

  isDead() {
    return this.hp <= 0;
  }

  takeDamage(owner, damage) {
    damage -= this.defense;

    if (damage > 0) {
      this.hp -= damage;
      if (this.hp <= 0) {
        this.die(owner);
      }
    } else {
      damage = 0;
    }
    return damage;
  }

  die(owner) {
    owner.ch = "%";
    owner.color = "#AA0000";
    owner.name = this.corpseName;
    owner.blocks = false;
    game.sendToBack(owner);
  }
}

export class MonsterDestructible extends Destructible {
  constructor(maxHP, defense, corpseName) {
    super(maxHP, defense, corpseName);
  }

  die(owner) {
    console.log(owner.name + " is dead");
    super.die(owner);
  }
}

export class PlayerDestructible extends Destructible {
  constructor(maxHP, defense, corpseName) {
    super(maxHP, defense, corpseName);
  }

  die(owner) {
    console.log("You died");
    super.die(owner);
    game.gameStatus = game.GameStatus.DEFEAT;
  }
}
