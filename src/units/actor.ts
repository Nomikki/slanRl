import { game } from "@/index";
import Container from "@/items/container";
import Equipments from "@/items/equipments";
import Pickable, {
  AiChangeEffect,
  HealthEffect,
  MapClearEffect,
  TargetSelector,
  Wearable,
} from "@/items/pickable";
import Fov from "@/map/fov";
import { Abilities } from "@/rpg/abilities";
import Armor from "@/rpg/armor";
import Attacker from "@/rpg/attacker";
import { createListOfClasses } from "@/rpg/classes";
import { createListOfRaces } from "@/rpg/races";
import Weapon from "@/rpg/weapon";
import { ConfusedAI, ConfusedMonsterAi, MonsterAI, PlayerAI } from "@/units/ai";
import Destructible from "@/units/destructible";
import { createListOfProficiencies, ensure, float2int } from "@/utils";
import { Colors } from "@/utils/colors";

export default class Actor {
  x: number;
  y: number;
  ch: string;
  name: string;
  color: string;

  race: number;
  class: number;
  proficiencies?: string[];

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

    this.race = 0;
    this.class = 0;
  }

  create(actorTemplate: Actor) {
    let fx: AiChangeEffect | HealthEffect | Wearable | MapClearEffect | void =
      undefined;
    this.blocks = false;

    //console.log(actorTemplate);

    if (actorTemplate.pickable?.effectName === "Wearable") {
      fx = new Wearable(actorTemplate.pickable.effect.type);
    }

    if (actorTemplate.pickable?.effectName === "AiChangeEffect") {
      fx = new AiChangeEffect(
        new ConfusedMonsterAi(
          parseInt(actorTemplate.pickable.effect.newAi.nbTurns),
        ),
        actorTemplate.pickable.effect.message,
      );
    }
    if (actorTemplate.pickable?.effectName === "MapClearEffect") {
      fx = new MapClearEffect(actorTemplate.pickable.effect.message);
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
    if (fovValue === 2 || (!this.fovOnly && fovValue !== 0)) {
      game.drawChar(
        this.ch,
        this.x + game.camera.x,
        this.y + game.camera.y,
        fovValue === 2 ? this.color : Colors.WALL_DARK,
      );
    }
  }

  async update(speed: number) {
    if (this.ai) {
      await this.ai.update(this, speed);
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

  getProfiencies() {
    const listOfRaces = createListOfRaces();
    const listOfClasses = createListOfClasses();

    this.proficiencies = createListOfProficiencies(
      listOfRaces[this.race],
      listOfClasses[this.class],
    );
  }

  pushAwayFrom(tileX: number, tileY: number, distance: number) {
    const d = this.getDistance(tileX, tileY);
    const dx = float2int((this.x - tileX) / d);
    const dy = float2int((this.y - tileY) / d);

    //console.log(tileX, tileY);
    //console.log(dx, dy, d);

    for (let i = 0; i < distance; i++) {
      if (game.map?.canWalk(this.x + dx, this.y + dy)) {
        this.x += dx;
        this.y += dy;
      }
    }
  }

  doorOpenOrClose() {
    this.blocks = !this.blocks;
    if (this.blocks) {
      this.ch = "D";
      game.log.add("A door is closed.");
    } else {
      if (this.ch === "#") {
        this.color = Colors.DOOR;
        this.ch = "+";
        game.log.add("A secret door is opened!", Colors.HILIGHT_TEXT);
      } else {
        this.ch = "+";
        game.log.add("A door is opened.");
      }
    }
  }
}
