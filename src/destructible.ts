import { game } from '.';
import Actor from './actor';
import { ensure } from './utils';

export type Name = string;

export type CorpseName = string;
export type Defense = number;
export type MaxHP = number;
export type HP = number;
export type DestructibleType = 'player' | 'monster';
export type XP = number;

export type HealAmount = number;

export type Character = string;
export type Color = string;

export type Damage = number;

export default class Destructible {
  corpseName: CorpseName;
  defense: Defense;
  hp: HP;
  maxHP: MaxHP;
  type: DestructibleType;
  xp: XP;

  constructor(
    maxHP: MaxHP,
    defense: Defense,
    corpseName: CorpseName,
    type: DestructibleType,
    xp: XP,
  ) {
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

  heal(amount: HealAmount) {
    this.hp += amount;
    if (this.hp > this.maxHP) {
      amount -= this.hp - this.maxHP;
      this.hp = this.maxHP;
    }
    return amount;
  }

  takeDamage(owner: Actor, damage: Damage) {
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
    owner.ch = '%';
    owner.color = '#AA0000';
    owner.name = this.corpseName;
    owner.blocks = false;
    game.sendToBack(owner);
  }
}

export class MonsterDestructible extends Destructible {
  xp: number;

  constructor(
    maxHP: MaxHP,
    defense: Defense,
    corpseName: CorpseName,
    xp: XP = 0,
  ) {
    super(maxHP, defense, corpseName, 'monster', xp);
    this.xp = xp;
  }

  die(owner: Actor) {
    game.log.add(`${owner.name} is dead. You gain ${this.xp} xp`);
    ensure(game.player?.destructible).xp += this.xp;
    super.die(owner);
  }
}

export class PlayerDestructible extends Destructible {
  constructor(maxHP: MaxHP, defense: Defense, corpseName: CorpseName) {
    super(maxHP, defense, corpseName, 'player', 0);
  }

  die(owner: Actor) {
    game.log.add('You died', '#A00');
    super.die(owner);
    game.gameStatus = game.GameStatus.DEFEAT;
  }
}
