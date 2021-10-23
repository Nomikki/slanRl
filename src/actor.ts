import { game } from '.';
import { ConfusedAI, MonsterAI, PlayerAI } from './ai';
import Attacker from './attacker';
import Container from './container';
import Destructible from './destructible';
import Fov from './fov';
import {
  Confuser,
  Fireball,
  Healer,
  LightningBolt,
  PickableType,
} from './pickable';
import { ensure } from './utils';

export default class Actor {
  // Ai: Something that is self-updating
  ai?: PlayerAI | MonsterAI | ConfusedAI;

  // Attacker: Something that can deal damage to a Destructible
  attacker?: Attacker;
  blocks = true; //can we walk on this actor?
  ch: string;
  color: string;

  // Container: Something that can contain actors
  container?: Container;

  // Destructible: Something that can take damage and potentially break or die
  destructible?: Destructible;
  fov?: Fov;
  fovOnly = true;
  name: string;

  // Pickable: Something that can be picked and used
  pickable?: PickableType;
  x: number;
  y: number;

  constructor(x: number, y: number, ch: string, name: string, color: string) {
    this.x = x || 0;
    this.y = y || 0;
    this.ch = ch;
    this.color = color;
    this.name = name;
  }

  create(actorTemplate: Actor) {
    const pickable = ensure(actorTemplate.pickable);

    if (pickable.type === 'lightingBolt')
      this.pickable = new LightningBolt(pickable.range, pickable.damage);

    if (pickable.type === 'fireBall')
      this.pickable = new Fireball(pickable.range, pickable.damage);

    if (pickable.type === 'healer') this.pickable = new Healer(pickable.amount);

    if (pickable.type === 'confuser')
      this.pickable = new Confuser(pickable.nbTurns, pickable.range);
  }

  render() {
    const fovValue = game.player?.fov?.getMapped(this.x, this.y);
    if (fovValue === 2 || (fovValue != 0 && !this.fovOnly)) {
      game.drawChar(this.ch, this.x, this.y, this.color);
    }
  }

  async update() {
    await this.ai?.update(this);
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
