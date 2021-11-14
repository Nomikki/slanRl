import { game } from "@/index";
import { capitalize, dimmerColor, wordWrap } from "@/utils";
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
    //let a = 0;
    let l = this.texts.length;
    if (l > 10) l = 10;

    game.ctx.fillStyle = Colors.LOG_BACKGROUND;
    let ll = this.texts.length;
    if (ll > 10) ll = 10;

    game.ctx.fillRect(
      0.5 * game.fontSize,
      (game.height - ll) * game.fontSize,
      28 * game.fontSize,
      (0.5 + ll) * game.fontSize,
    );

    for (let i = this.texts.length - 10; i < this.texts.length; i++) {
      if (i >= 0) {
        game.drawText(
          this.texts[i].text,
          1,
          game.height - l,
          dimmerColor(this.texts[i].color, (20 - l) * 0.05),
        );
        //a++;
        l--;
      }
    }
  }

  add(text: string, color = Colors.DEFAULT_TEXT) {
    const toLog = wordWrap(text, 64);
    for (const c of toLog as string[]) {
      this.texts.push(new LogText(capitalize(c), color));
      if (this.texts.length > this.SIZE_OF_LOG) {
        this.texts.splice(0, 1);
      }
    }
  }
}
