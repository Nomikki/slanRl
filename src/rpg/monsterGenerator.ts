import colors from "@/css/colors.module.scss";
import monsterJson from "@/data/monsters";
import { Abilities } from "@/rpg/abilities";
import Attacker from "@/rpg/attacker";
import Actor from "@/units/actor";
import { MonsterAI } from "@/units/ai";
import { MonsterDestructible } from "@/units/destructible";
import { ensure } from "@/utils";

interface AbilitiesIntercace {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
}

interface AttacksInterface {
  name: string;
  damage: string;
  damageType: string;
}

interface MonsterInterface {
  name: string;
  ch: string;
  color: string;
  hp: number;
  ac: number;
  xp: number;

  abilities: AbilitiesIntercace;
  attacks: AttacksInterface[];
}

export const monsters: MonsterInterface[] = monsterJson;

const getMonsterUsingFind = (name: string): MonsterInterface | undefined => {
  return monsters.find(item => item.name === name);
};

export const createMonster = (name: string, x: number, y: number): Actor => {
  let power = "1d4";
  let xp = 0;
  let hp = 1;
  let defense = 0;
  let ch = "?";
  let color = colors.default_monster;

  let abi = new Abilities(2, 2, 2, 2, 2);

  const isMonster = (name: string): boolean => {
    for (const n of monsters) {
      if (n.name === name) return true;
    }
    return false;
  };

  /*
    List of enemies (candidates)
    very Easy:    
      name,       depth:(1 - 5)
      rat, 
      kobold, 
      dog, 
      cat, 
      roach, 
      turtle, 
      jackal 
    easy:         depth: (3 - 10)
      hobgoblin, 
      imp, 
      jelly, 
      ooze, 
      lich, 
      lizard, 
      bat, 
      goblin 
    Medium:       depth: (8 - 15)
      bear, 
      wolf, 
      golem,
      insect,
      mummy,
      scorpion,
      orc,
      troll 
    Hard:         depth: (12 - 20)
      elemental,
      skeleton,
      zombie,
      lizardman,
      demon 
  */

  /*
    Size of enemies:
    tiny, small, medium, lardge, huge
  */
  //enemytypes:
  /*
    beasts,
    dragons,
    elementals,
    giants,
    humanoids,
    monstrosities,
    oozes,
    plants,
    undead,
  */

  if (isMonster(name)) {
    const monsterTemplate = ensure(getMonsterUsingFind(name));

    ch = monsterTemplate.ch;
    color = monsterTemplate.color;
    power = monsterTemplate.attacks[0].damage;
    defense = monsterTemplate.ac;
    hp = monsterTemplate.hp;
    xp = monsterTemplate.xp;
    abi = new Abilities(
      monsterTemplate.abilities.str,
      monsterTemplate.abilities.dex,
      monsterTemplate.abilities.con,
      monsterTemplate.abilities.int,
      monsterTemplate.abilities.wis,
    );
  }

  const monster = new Actor(x, y, ch, name, color);

  monster.destructible = new MonsterDestructible(
    hp,
    defense,
    `dead ${name}`,
    xp,
  );
  monster.attacker = new Attacker(power);
  monster.ai = new MonsterAI();
  monster.abilities = abi;

  return monster;
};
