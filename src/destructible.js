"use strict";

import { game } from ".";

export default class Destructible {
  constructor(maxHP, defense, corpseName, type, xp) {
    this.maxHP = maxHP;
    this.hp = this.maxHP;
    this.defense = defense;
    this.corpseName = corpseName;
    this.type = type;
    this.xp = xp;
  }

  isDead() {
    return this.hp <= 0;
  }

  heal(amount) {
    this.hp += amount;
    if (this.hp > this.maxHP) {
      amount -= this.hp - this.maxHP;
      this.hp = this.maxHP;
    }
    return amount;
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
  constructor(maxHP, defense, corpseName, xp) {
    super(maxHP, defense, corpseName, "monster", xp);
    this.xp = xp;
  }

  die(owner) {
    game.log.add(owner.name + " is dead. You gain " + this.xp + " xp");
    game.player.destructible.xp += this.xp;
    super.die(owner);
  }
}

export class PlayerDestructible extends Destructible {
  constructor(maxHP, defense, corpseName) {
    super(maxHP, defense, corpseName, "player", 0);
  }

  die(owner) {
    game.log.add("You died", "#A00");
    super.die(owner);
    game.gameStatus = game.GameStatus.DEFEAT;
  }
}
