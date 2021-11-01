import { game } from "@/index";
import Container from "@/items/container";
import Equipments from "@/items/equipments";
import Pickable, {
  AiChangeEffect,
  HealthEffect,
  TargetSelector,
  Wearable
} from "@/items/pickable";
import Fov from "@/map/fov";
import { Abilities } from "@/rpg/abilities";
import Armor from "@/rpg/armor";
import Attacker from "@/rpg/attacker";
import Weapon from "@/rpg/weapon";
import { ConfusedAI, ConfusedMonsterAi, MonsterAI, PlayerAI } from "@/units/ai";
import Destructible from "@/units/destructible";
import { ensure, float2int } from "@/utils/utils";

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

  // Equipments: All equipments
  equipments?: Equipments;

  abilities?: Abilities;

  //Armor: Something that can deal all armor items.
  armor?: Armor;

  //Weapon: This item can be used as weapon.
  weapon?: Weapon;

  constructor(x: number, y: number, ch: string, name: string, color: string) {
    this.x = float2int(x);
    this.y = float2int(y);
    this.ch = ch;
    this.color = color;
    this.name = name;
  }

  create(actorTemplate: Actor) {
    let fx: AiChangeEffect | HealthEffect | Wearable | void = undefined;

    if (actorTemplate.pickable?.effectName === "Wearable") {
      fx = new Wearable(actorTemplate.pickable.effect.type);
      //console.log(actorTemplate);
    }

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
      //console.log(actorTemplate.pickable.selectorName);
      this.pickable = new Pickable({
        selector: new TargetSelector(
          ensure(actorTemplate.pickable.selector).type,
          ensure(actorTemplate.pickable.selector).range,
        ),
        effect: fx,
        weight: actorTemplate.pickable.weight,
      });
    } else {
      this.pickable = new Pickable({
        selector: undefined,
        effect: fx,
        weight: ensure(actorTemplate.pickable?.weight),
      });
    }
  }

  render() {
    const fovValue = game.player?.fov?.getMapped(this.x, this.y);
    if (fovValue === 2 || (fovValue != 0 && !this.fovOnly)) {
      game.drawChar(
        this.ch,
        this.x + game.camera.x,
        this.y + game.camera.y,
        this.color,
      );
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
