import Actor from "./actor";
import { MonsterAI } from "./ai";
import Attacker from "./attacker";
import { MonsterDestructible } from "./destructible";

export const createMonster = (name: string, x: number, y: number): Actor => {
  let power = 0;
  let xp = 0;
  let hp = 0;
  let defense = 0;
  let ch = "?";
  let color = "#F0F";

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

  if (name === "ghoul") {
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
  } else if (name === "giant rat") {
    //small, beast
    //ac: 15
    //hp: 13
    } else if (name === "orc") {
    power = 3;
    xp = 10;
    hp = 10;
    defense = 0;
    ch = "o";
    color = "#00AA00";
  } else if (name === "troll") {
    power = 5;
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
    `death ${name} `,
    xp,
  );
  monster.attacker = new Attacker(power);
  monster.ai = new MonsterAI();

  return monster;
};
