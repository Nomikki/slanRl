import { Abilities } from "./abilities";
import Actor from "./actor";
import { MonsterAI } from "./ai";
import Attacker from "./attacker";
import { MonsterDestructible } from "./destructible";

export const createMonster = (name: string, x: number, y: number): Actor => {
  let power = "1d4";
  let xp = 0;
  let hp = 1;
  let defense = 0;
  let ch = "?";
  let color = "#F0F";

  let abi = new Abilities(2, 2, 2, 2, 2);

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
  if (name === "rat") {
    ch = "r";
    color = "#999";
    power = "1d3";
    defense = 0;
    hp = 5;
    xp = 5;
    abi = new Abilities(2, 2, 2, 2, 2);
  } else if (name === "ghoul") {
    //medium, undead
    //ac: 12
    //hp: 22
    //str, dex, con, int, wis
    //13,  15,  10,  7,   10
    //Immunities: poison
    //challenge: 1, 200xp
    //actions:
    //bite: melee, +2 hit, reach 5ft, 2d6+2 pierc
    //claws: melee, +4, reach 5ft, 2d+2, slash
    abi = new Abilities(13, 15, 10, 7, 10);
  } else if (name === "giant rat") {
    //small, beast
    //ac: 12
    //hp: 7
    //str, dex, con, int, wis
    //7,   15,  11,   2,  10
    //challenge: 1 / 8: 25xp
    //actions:
    //bite: melee, +4, reach 5ft, 1d4+2, pierc
    abi = new Abilities(7, 15, 11, 2, 10);
  } else if (name === "ogre") {
    //large, giant
    //ac: 11
    //hp:59
    //str, dex, con, int, wis
    //19,   8,  16,   5,  7
    //challenge: 2: 450xp
    //actions:
    //creatclub: +6, reach 5ft, 2d8+4, bludg
    abi = new Abilities(19, 8, 16, 5, 7);
  } else if (name === "orc") {
    //medium humanoid
    //ac: 13
    //hp:15
    //str, dex, con, int, wis
    //16,   12,  16,  7,  11
    //challenge: 1 / 2: 100xp
    //actions:
    //greataxe: +5, reach 5ft, 1d12+3, slash
    abi = new Abilities(16, 12, 16, 7, 11);
    power = "1d4";
    xp = 10;
    hp = 10;
    defense = 0;
    ch = "o";
    color = "#00AA00";
  } else if (name === "troll") {
    power = "1d6";
    xp = 15;
    hp = 15;
    defense = 1;
    ch = "t";
    color = "#008800";
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
