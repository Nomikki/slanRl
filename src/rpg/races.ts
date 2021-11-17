import racesJson from "@/data/races";
import { ensure, Proficience } from "@/utils";

export interface AbilitiesIntercace {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
}

interface RacesInterface {
  name: string;
  flavourText: string;
  toughnessIncrease: number;

  abilityIncrease: AbilitiesIntercace;
  resilience: string;
  proficiencies: Proficience[];
}

const races: RacesInterface[] = racesJson;

const getRaceUsingFind = (name: string): RacesInterface | undefined => {
  return races.find(item => item.name === name);
};

export const getRace = (name: string): RacesInterface | undefined => {
  const isRace = (name: string): boolean => {
    for (const n of races) {
      if (n.name === name) return true;
    }
    return false;
  };

  if (isRace(name)) {
    const raceTemplate = ensure(getRaceUsingFind(name));
    return raceTemplate;
  }

  return undefined;
};

export const createListOfRaces = (): string[] => {
  const raceList = [];
  for (const c of racesJson) raceList.push(c.name);
  return raceList;
};

export const createListOfProficiencies_byRace = (race: string): string[] => {
  const tempRace = ensure(getRaceUsingFind(race));

  const proficiencies = [];
  for (const c of tempRace.proficiencies) proficiencies.push(c.type);
  return proficiencies;
};

export const getRaceNameByIndex = (index: number): string => {
  return races[index].name;
};
