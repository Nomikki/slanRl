import { game } from ".";

class LogText {
  color: string;
  text: string;

  constructor(text: string, color: string) {
    this.text = text;
    this.color = color;
  }
}

export default class Log {
  readonly SIZE_OF_LOG = 100;
  texts: LogText[] = [];

  render() {
    let a = 0;
    for (let i = this.texts.length - 16; i < this.texts.length; i++) {
      if (i >= 0) {
        game.drawText(
          this.texts[i].text,
          1,
          game.height + 3 + a,
          this.texts[i].color,
        );
        a++;
      }
    }
  }

  add(text: string, color = "#AAA") {
    this.texts.push(new LogText(text, color));
    if (this.texts.length > this.SIZE_OF_LOG) {
      this.texts.splice(0, 1);
    }
  }
}
