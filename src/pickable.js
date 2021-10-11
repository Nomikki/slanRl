import { game } from ".";

export default class Pickable {
  constructor() {}

  pick(owner, wearer) {
    if (wearer.container && wearer.container.add(owner))
    {
      game.removeActor(owner);
      return true;
    }
    return false;
  }

  use(owner, wearer) {
    game.log.add("You use a " + owner.name);
    if (wearer.container)
    {
      wearer.container.remove(owner);
      return true;
    }
    return false;
  }
}


export class Healer extends Pickable {
  constructor(amount) {
    super();
    this.amount = amount;
  }

  use(owner, wearer) {

    if (wearer.destructible) {
      const amountHealed = wearer.destructible.heal(this.amount);
      if (amountHealed > 0) {
        return super.use(owner, wearer);
      }
    }
    return false;
  }
}


export class LightningBolt extends Pickable {
  constructor(range, damage) {
    super();
    this.range = range;
    this.damage = damage;
  }

  use(owner, wearer) {
    const closestMonster = game.getClosestMonster(wearer.x, wearer.y, this.range);
    if (!closestMonster)
    {
      game.log.add("No enemy is close enough to strike.");
      return false;
    }

    game.log.add("A lighting bolt strikes the " + closestMonster.name + " with a loud thunder!", "#0FF");
    game.log.add("The damage is " + this.damage + " hit points.", "#0FF");

    closestMonster.destructible.takeDamage(closestMonster, this.damage);
    return super.use(owner, wearer);
  }
}