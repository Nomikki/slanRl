import { game } from "@/index";
import { dimmerColor } from "@/utils";
import { Colors } from "@/utils/colors";

class LogText {
  text: string;
  color: string;

  constructor(text: string, color: string) {
    this.text = text;
    this.color = color;
  }
}

export default class Log {
  SIZE_OF_LOG = 100;
  texts: LogText[];

  constructor() {
    this.texts = [];
  }

  render() {
    let a = 0;
    let l = this.texts.length;
    if (l > 10) l = 10;

    for (let i = this.texts.length - 16; i < this.texts.length; i++) {
      if (i >= 0) {
        game.drawText(
          this.texts[i].text,
          1,
          game.height + 3 + a,
          dimmerColor(this.texts[i].color, (20 - l) * 0.05),
        );
        a++;
        l--;
      }
    }
  }

  add(text: string, color = Colors.DEFAULT_TEXT) {
    this.texts.push(new LogText(text, color));
    if (this.texts.length > this.SIZE_OF_LOG) {
      this.texts.splice(0, 1);
    }
  }
}
