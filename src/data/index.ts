import armorsJson from "./armors.json";
import weaponsJson from "./weapons.json";

interface Armor {
  name: string;
  defense: number;
}

interface Weapon {
  name: string;
  attack: number;
}

export const armors: Armor[] = armorsJson;
export const weapons: Weapon[] = weaponsJson;
