import classesJson from "@/data/classes";
import { ensure, Proficience, SavingThrow } from "@/utils";

interface ClassInterface {
  name: string;
  flavourText: string;

  healthAtStart: number;
  healthIncreasePerLevel: number;

  savingThrows: SavingThrow[];
  proficiencies: Proficience[];
}

const classes: ClassInterface[] = classesJson;

const getClassUsingFind = (name: string): ClassInterface | undefined => {
  return classes.find(item => item.name === name);
};

export const getClass = (name: string): ClassInterface | undefined => {
  const isClass = (name: string): boolean => {
    for (const n of classes) {
      if (n.name === name) return true;
    }
    return false;
  };

  if (isClass(name)) {
    const classTemplate = ensure(getClassUsingFind(name));
    return classTemplate;
  }

  return undefined;
};

export const createListOfClasses = (): string[] => {
  const classList = [];
  for (const c of classesJson) {
    classList.push(c.name);
  }
  return classList;
};

export const createListOfProficiencies_byClass = (
  className: string,
): string[] => {
  const tempClass = ensure(getClassUsingFind(className));

  const proficiencies = [];
  for (const c of tempClass.proficiencies) {
    proficiencies.push(c.type);
  }

  return proficiencies;
};

export const getClassNameByIndex = (index: number): string => {
  return classes[index].name;
};
