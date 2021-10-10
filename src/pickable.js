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