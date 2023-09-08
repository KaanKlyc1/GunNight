import Phaser from "phaser";
import BootScene from "./scenes/BootScene";
import GameScene from "./scenes/GameScene";
import TextInfoScene from "./scenes/TextInfoScene";
import TitleScene from "./scenes/TitleScene";
import UIScene from "./scenes/UIScene";
import ForwardingScene from "./scenes/ForwardingScene";
import EndGame from "./scenes/EndGame";

const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [BootScene, ForwardingScene,EndGame, TitleScene, GameScene, UIScene, TextInfoScene],
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
};

export default class Game extends Phaser.Game {
  constructor(config: Phaser.Types.Core.GameConfig) {
    super(config);
  }
}

window.onload = (): void => {
  const game = new Game(gameConfig);
  // Allow Resize
  // resize();
  // window.addEventListener("resize", resize, true);
};

function resize(): void {
  const canvas = document.querySelector("canvas");
  const width = window.innerWidth;
  const height = window.innerHeight;
  const wratio = width / height;
  const ratio = Number(gameConfig.width) / Number(gameConfig.height);
  if (wratio < ratio) {
    canvas.style.width = width + "px";
    canvas.style.height = width / ratio + "px";
  } else {
    canvas.style.width = height * ratio + "px";
    canvas.style.height = height + "px";
  }
}
