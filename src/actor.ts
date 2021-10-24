import { game } from ".";
import { Abilities } from "./abilities";
import { ConfusedAI, ConfusedMonsterAi, MonsterAI, PlayerAI } from "./ai";
import Attacker from "./attacker";
import Container from "./container";
import Destructible from "./destructible";
import Fov from "./fov";
import Pickable, {
  AiChangeEffect,
  HealthEffect,
  TargetSelector,
} from "./pickable";
import { ensure, float2int } from "./utils";

export default class Actor {
  x: number;
  y: number;
  ch: string;
  name: string;
  color: string;

  fov?: Fov;
  fovOnly = true;
  blocks = true; //can we walk on this actor?

  // Destructible: Something that can take damage and potentially break or die
  destructible?: Destructible;

  // Attacker: Something that can deal damage to a Destructible
  attacker?: Attacker;

  // Ai: Something that is self-updating
  ai?: PlayerAI | MonsterAI | ConfusedAI;

  // Pickable: Something that can be picked and used
  pickable?: Pickable;

  // Container: Something that can contain actors
  container?: Container;

  abilities?: Abilities;

  constructor(x: number, y: number, ch: string, name: string, color: string) {
    this.x = float2int(x);
    this.y = float2int(y);
    this.ch = ch;
    this.color = color;
    this.name = name;
  }

  create(actorTemplate: Actor) {
    //console.log(actorTemplate);

    let fx: AiChangeEffect | HealthEffect | void = undefined;
    if (actorTemplate.pickable?.effectName === "AiChangeEffect") {
      fx = new AiChangeEffect(
        new ConfusedMonsterAi(
          parseInt(actorTemplate.pickable.effect.newAi.nbTurns),
        ),
        actorTemplate.pickable.effect.message,
      );
    }
    if (actorTemplate?.pickable?.effectName === "HealthEffect")
      fx = new HealthEffect(actorTemplate.pickable?.effect.amount, undefined);

    if (actorTemplate?.pickable?.selectorName) {
      console.log(actorTemplate.pickable.selectorName);
      this.pickable = new Pickable(
        new TargetSelector(
          ensure(actorTemplate.pickable.selector).type,
          ensure(actorTemplate.pickable.selector).range,
        ),
        fx,
      );
    } else {
      this.pickable = new Pickable(undefined, fx);
    }
  }

  render() {
    const fovValue = game.player?.fov?.getMapped(this.x, this.y);
    if (fovValue === 2 || (fovValue != 0 && !this.fovOnly)) {
      game.drawChar(this.ch, this.x, this.y, this.color);
    }
  }

  async update() {
    if (this.ai) {
      await this.ai.update(this);
    }
  }

  computeFov() {
    if (this.fov) {
      this.fov.compute(this.x, this.y, 10);
    }
  }

  getDistance(x: number, y: number) {
    const dx = this.x - x;
    const dy = this.y - y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
