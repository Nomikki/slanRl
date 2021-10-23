import { game } from ".";
import { Character, Color, Name } from "./destructible";
import { Confuser, Fireball, Healer, LightningBolt } from "./pickable";

export type ActorTemplate = {
  moi: string;
};

export type X = number;
export type Y = number;

export default class Actor {
  x: X;
  y: Y;
  ch: Character;
  color: Color;
  name: Name;
  fov: any = null;
  fovOnly: boolean = true;
  blocks: boolean = true;
  destructible: any = null;
  attacker: any = null;
  ai: any = null;
  pickable: any = null;
  container: any = null;

  constructor(x: X, y: Y, ch: Character, name: Name, color: Color) {
    this.x = x;
    this.y = y;
    this.ch = ch;
    this.name = name;
    this.color = color;
  }

  create(actorTemplate: Actor) {
    //console.log(actorTemplate);
    if (actorTemplate.pickable.type === "lightingBolt")
      this.pickable = new LightningBolt(
        actorTemplate.pickable.range,
        actorTemplate.pickable.damage
      );

    if (actorTemplate.pickable.type === "fireBall")
      this.pickable = new Fireball(
        actorTemplate.pickable.range,
        actorTemplate.pickable.damage
      );

    if (actorTemplate.pickable.type === "healer")
      this.pickable = new Healer(actorTemplate.pickable.amount);

    if (actorTemplate.pickable.type === "confuser")
      this.pickable = new Confuser(
        actorTemplate.pickable.nbTurns,
        actorTemplate.pickable.range
      );
  }

  render() {
    const fovValue = game.player.fov.getMapped(this.x, this.y);
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

  getDistance(x: X, y: Y) {
    const dx = this.x - x;
    const dy = this.y - y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
