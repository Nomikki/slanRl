import { game } from "@/index";
import { ABILITIES, Abilities } from "@/rpg/abilities";
import { createListOfClasses, getClass } from "@/rpg/classes";
import { AbilitiesIntercace, createListOfRaces, getRace } from "@/rpg/races";
import { createListOfProficiencies, ensure, wordWrap } from "@/utils";
import { Colors } from "@/utils/colors";

enum phases {
  choose_race = 0,
  choose_class = 1,
  choose_abilities = 2,
  phases_max,
}

export const prepareNewJourney = async () => {
  let phase = phases.choose_race;
  let selectedRace = 0;
  let selectedClass = 0;
  let selectedAbilities = 0;

  let selectDirection = 0;
  let unusedPoints = 14;

  let hpStart = 0;
  let hpPerLevel = 0;

  let toughnessIncrease = 0;

  let wordWrappedFlavourText: string[];

  const listOfRaces = createListOfRaces();
  const listOfClasses = createListOfClasses();
  const tempAbies = new Abilities(10, 10, 10, 10, 10);
  const finalAbies = new Abilities(10, 10, 10, 10, 10);

  const renderPreparingInfo = (
    resiliences: string,
    proficiencies: string[],
    abies: AbilitiesIntercace,
  ) => {
    game.clear();
    game.drawText("New game", 10, 1, Colors.HILIGHT_TEXT);

    for (let i = 0; i < 3; i++) {
      const color = phase === i ? Colors.HILIGHT_TEXT : Colors.DEFAULT_TEXT;
      if (i == 0) game.drawText("Choose race", 10, 10, color);
      if (i == 1) game.drawText("Choose class", 20, 10, color);
      if (i == 2) game.drawText("Set abilities", 30, 10, color);
    }

    game.drawText(
      "Enter) Next   Backspace) Back   Use arrow keys to navigate",
      11,
      game.height,
      Colors.DEFAULT_TEXT,
    );

    game.drawChar(">", 8, 12 + selectedRace, Colors.DEFAULT_TEXT);
    for (let i = 0; i < listOfRaces.length; i++) {
      game.drawText(listOfRaces[i], 10, 12 + i);
    }

    game.drawChar(">", 18, 12 + selectedClass, Colors.DEFAULT_TEXT);
    for (let i = 0; i < listOfClasses.length; i++) {
      game.drawText(listOfClasses[i], 20, 12 + i);
    }

    game.drawText(
      toughnessIncrease > 0
        ? `hp increase: ${toughnessIncrease} per level`
        : "",
      10,
      18,
      Colors.DEFAULT_TEXT,
    );

    game.drawText(
      resiliences !== "none" ? `Resiliences: ${resiliences}` : "",
      10,
      19,
      Colors.DEFAULT_TEXT,
    );

    if (phase === phases.choose_abilities) {
      wordWrappedFlavourText = [];

      wordWrappedFlavourText.push(
        "Use left and right arrows to change ability scores.",
      );
      wordWrappedFlavourText.push("");

      if (selectedAbilities === 0)
        wordWrappedFlavourText.push("Strength: Measuring physical power.");
      if (selectedAbilities === 1)
        wordWrappedFlavourText.push("Dexterity: Measuring agility.");
      if (selectedAbilities === 2)
        wordWrappedFlavourText.push("Constitution: Measuring endurance.");
      if (selectedAbilities === 3)
        wordWrappedFlavourText.push(
          "Intelligence: Measuring reasoning and memory.",
        );
      if (selectedAbilities === 4)
        wordWrappedFlavourText.push(
          "Wisdom: Measuring perception and insight.",
        );
    }

    game.drawChar(">", 28, 12 + selectedAbilities, Colors.DEFAULT_TEXT);

    game.drawText("Strength", 30, 12);
    game.drawText("Dexterity", 30, 13);
    game.drawText("Constitution", 30, 14);
    game.drawText("Intelligence", 30, 15);
    game.drawText("Wisdom", 30, 16);
    game.drawText("Unused points", 30, 17);

    game.drawText(`${tempAbies.str}`, 37, 12);
    game.drawText(`${tempAbies.dex}`, 37, 13);
    game.drawText(`${tempAbies.con}`, 37, 14);
    game.drawText(`${tempAbies.int}`, 37, 15);
    game.drawText(`${tempAbies.wis}`, 37, 16);
    game.drawText(`${unusedPoints}`, 37, 17);

    game.drawText(abies.str !== 0 ? `+${abies.str.toString()}` : "", 39, 12);
    game.drawText(abies.dex !== 0 ? `+${abies.dex.toString()}` : "", 39, 13);
    game.drawText(abies.con !== 0 ? `+${abies.con.toString()}` : "", 39, 14);
    game.drawText(abies.int !== 0 ? `+${abies.int.toString()}` : "", 39, 15);
    game.drawText(abies.wis !== 0 ? `+${abies.wis.toString()}` : "", 39, 16);

    game.drawText(
      `= ${finalAbies.str.toString()} (${finalAbies.getBonusWithSign(
        ABILITIES.STR,
      )})`,
      41,
      12,
    );
    game.drawText(
      `= ${finalAbies.dex.toString()} (${finalAbies.getBonusWithSign(
        ABILITIES.DEX,
      )})`,
      41,
      13,
    );
    game.drawText(
      `= ${finalAbies.con.toString()} (${finalAbies.getBonusWithSign(
        ABILITIES.CON,
      )})`,
      41,
      14,
    );
    game.drawText(
      `= ${finalAbies.int.toString()} (${finalAbies.getBonusWithSign(
        ABILITIES.INT,
      )})`,
      41,
      15,
    );
    game.drawText(
      `= ${finalAbies.wis.toString()} (${finalAbies.getBonusWithSign(
        ABILITIES.WIS,
      )})`,
      41,
      16,
    );

    for (let i = 0; i < wordWrappedFlavourText.length; i++) {
      game.drawText(wordWrappedFlavourText[i], 10, 21 + i, Colors.DEFAULT_TEXT);
    }

    game.drawText("Profiencies: ", 55, 20);
    if (proficiencies.length > 0) {
      for (let i = 0; i < proficiencies.length; i++) {
        game.drawText(proficiencies[i], 55, 22 + i);
      }
    }

    const conModi = finalAbies.getBonus(ABILITIES.CON);
    const finalHP = hpStart + conModi;
    const finalHPperLevel = hpPerLevel + conModi;

    game.drawText(
      `Health at start: ${hpStart} + ${conModi} (CON) = ${finalHP}`,
      50,
      12,
    );
    game.drawText(
      `Health increase per level +${hpPerLevel} + ${conModi} (CON) = ${finalHPperLevel}`,
      50,
      13,
    );
  };

  const usePoints = (abiD: number) => {
    if (unusedPoints - abiD >= 0) {
      if (selectedAbilities === 0) {
        if (tempAbies.inRange(tempAbies.str + abiD)) tempAbies.str += abiD;
        else abiD = 0;
      }
      if (selectedAbilities === 1) {
        if (tempAbies.inRange(tempAbies.dex + abiD)) tempAbies.dex += abiD;
        else abiD = 0;
      }
      if (selectedAbilities === 2) {
        if (tempAbies.inRange(tempAbies.con + abiD)) tempAbies.con += abiD;
        else abiD = 0;
      }
      if (selectedAbilities === 3) {
        if (tempAbies.inRange(tempAbies.int + abiD)) tempAbies.int += abiD;
        else abiD = 0;
      }
      if (selectedAbilities === 4) {
        if (tempAbies.inRange(tempAbies.wis + abiD)) tempAbies.wis += abiD;
        else abiD = 0;
      }

      unusedPoints -= abiD;
    }
  };

  while (true) {
    toughnessIncrease = ensure(
      getRace(listOfRaces[selectedRace])?.toughnessIncrease,
    );
    const resiliences = ensure(getRace(listOfRaces[selectedRace])?.resilience);

    const proficiencies = createListOfProficiencies(
      listOfRaces[selectedRace],
      listOfClasses[selectedClass],
    );

    if (phase === phases.choose_race) {
      const flavourText = ensure(
        getRace(listOfRaces[selectedRace])?.flavourText,
      );

      wordWrappedFlavourText = ensure(wordWrap(flavourText, 48));
    } else if (phase === phases.choose_class) {
      const flavourText = ensure(
        getClass(listOfClasses[selectedClass])?.flavourText,
      );
      wordWrappedFlavourText = ensure(wordWrap(flavourText, 48));
    }

    const abies = ensure(getRace(listOfRaces[selectedRace])?.abilityIncrease);

    renderPreparingInfo(resiliences, proficiencies, abies);

    finalAbies.str = tempAbies.str + abies.str;
    finalAbies.dex = tempAbies.dex + abies.dex;
    finalAbies.con = tempAbies.con + abies.con;
    finalAbies.int = tempAbies.int + abies.int;
    finalAbies.wis = tempAbies.wis + abies.wis;

    hpStart = ensure(getClass(listOfClasses[selectedClass])?.healthAtStart);
    hpPerLevel = ensure(
      getClass(listOfClasses[selectedClass])?.healthIncreasePerLevel,
    );

    selectDirection = 0;
    const ch = await game.getch();
    let readyToStart = false;

    switch (ch) {
      case "q":
        break;
      case "Enter":
        phase++;
        if (phase >= phases.phases_max) readyToStart = true;
        break;
      case "Backspace":
        phase--;
        if (phase < 0) phase = 0;
        break;
      case "ArrowUp":
        selectDirection = -1;
        break;
      case "ArrowDown":
        selectDirection = 1;
        break;
      case "ArrowLeft":
        if (phase === phases.choose_abilities) usePoints(-1);
        break;
      case "ArrowRight":
        if (phase === phases.choose_abilities) usePoints(1);
        break;
      default:
        break;
    }

    if (readyToStart) break;

    if (phase === phases.choose_race) {
      selectedRace += selectDirection;
      if (selectedRace < 0) selectedRace = listOfRaces.length - 1;
      if (selectedRace > listOfRaces.length - 1) selectedRace = 0;
    }

    if (phase === phases.choose_class) {
      selectedClass += selectDirection;
      if (selectedClass < 0) selectedClass = listOfClasses.length - 1;
      if (selectedClass > listOfClasses.length - 1) selectedClass = 0;
    }

    if (phase === phases.choose_abilities) {
      selectedAbilities += selectDirection;
      if (selectedAbilities < 0) selectedAbilities = 4;
      if (selectedAbilities > 4) selectedAbilities = 0;
    }
  }

  return [
    finalAbies,
    selectedRace,
    selectedClass,
    hpStart,
    hpPerLevel,
    toughnessIncrease,
  ];
};
