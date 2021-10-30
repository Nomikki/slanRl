import { game, GameStatus } from ".";
import Actor from "./actor";
import { Colors } from "./colors";
import { ensure } from "./utils";

export default class Destructible {
  maxHP: number;
  hp: number;
  defense: number;
  corpseName: string;
  type: string;
  xp: number;

  constructor(
    maxHP: number,
    defense: number,
    corpseName: string,
    type: string,
    xp: number,
  ) {
    this.maxHP = maxHP;
    this.hp = this.maxHP;
    this.defense = defense;
    this.corpseName = corpseName;
    this.type = type;
    this.xp = xp;
  }

  isDead(): boolean {
    return this.hp <= 0;
  }

  heal(amount: number): number {
    this.hp += amount;
    if (this.hp > this.maxHP) {
      amount -= this.hp - this.maxHP;
      this.hp = this.maxHP;
    }
    return amount;
  }

  takeDamage(owner: Actor, damage: number): number {
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

  die(owner: Actor) {
    //owner.ch = owner;
    owner.color = Colors.DEAD_BODY;
    owner.name = this.corpseName;
    owner.blocks = false;
    game.sendToBack(owner);
  }
}

export class MonsterDestructible extends Destructible {
  constructor(maxHP: number, defense: number, corpseName: string, xp: number) {
    super(maxHP, defense, corpseName, "monster", xp);
    this.xp = xp;
  }

  die(owner: Actor) {
    game.log.add(`${owner.name} is dead. You gain ${this.xp} xp`);
    ensure(game.player?.destructible).xp += this.xp;
    super.die(owner);
  }
}

export class PlayerDestructible extends Destructible {
  constructor(maxHP: number, defense: number, corpseName: string) {
    super(maxHP, defense, corpseName, "player", 0);
  }

  die(owner: Actor) {
    game.log.add("You died", Colors.DEFEAT);
    super.die(owner);
    game.gameStatus = GameStatus.DEFEAT;
  }
}
