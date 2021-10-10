import { game } from ".";

class LogText {
  constructor(text, color) {
    this.text = text;
    this.color = color;
  }
}

export default class Log {
  constructor() {
    this.constants = Object.freeze({
      SIZE_OF_LOG: 100,
    });

    this.texts = new Array();
  }

  render() {
    let a = 0;
    for (let i = this.texts.length - 16; i < this.texts.length; i++) {
      if (i >= 0) {
        game.drawText(
          this.texts[i].text,
          1,
          game.height + 3 + a,
          this.texts[i].color
        );
        a++;
      }
    }
  }

  add(text, color = "#AAA") {
    //console.log(text);
    this.texts.push(new LogText(text, color));
    if (this.texts.length > this.constants.SIZE_OF_LOG) {
      this.texts.splice(0, 1);
    }
  }
}
