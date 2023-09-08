import GameScene from "./GameScene";

export default class TextInfoScene extends Phaser.Scene {
  gameScene: Phaser.Scene;
  scoreText: Phaser.GameObjects.Text;
  timerText: Phaser.GameObjects.Text;
  infoText1: Phaser.GameObjects.Text;
  infoText2: Phaser.GameObjects.Text;
  infoText3: Phaser.GameObjects.Text;
  infoText4: Phaser.GameObjects.Text;
  infoText5: Phaser.GameObjects.Text;
  scoreTopRate0: Phaser.GameObjects.Text;
  scoreTopRate1: Phaser.GameObjects.Text;
  scoreTopRate2: Phaser.GameObjects.Text;
  scoreTopRate3: Phaser.GameObjects.Text;
  scoreTopRate4: Phaser.GameObjects.Text;
  scoreTopRate5: Phaser.GameObjects.Text;
  coinIcon: Phaser.GameObjects.Image;
  private timerBackground: Phaser.GameObjects.Image;
  private bulletBackground: Phaser.GameObjects.Image;

  constructor() {
    super("TextInfo"); // Name of the scene
  }

  init(): void {
    this.gameScene = this.scene.get("Game");
  }

  create(): void {
    this.setupUIElements();
    this.setupEvents();
  }

  setupUIElements(): void {


    this.infoText1 = this.add.text(25, 25, "", {
      fontSize: "13px",
      color: "white",
    });
    this.infoText2 = this.add.text(25, 50, "", {
      fontSize: "13px",
      color: "white",
    });
    this.infoText3 = this.add.text(25, 75, "", {
      fontSize: "13px",
      color: "white",
    });
    this.infoText4 = this.add.text(25, 100, "", {
      fontSize: "13px",
      color: "white",
    });
    this.infoText5 = this.add.text(25, 125, "", {
      fontSize: "13px",
      color: "white",
    });
    
    this.timerBackground = this.add.image(this.scale.width-60,this.scale.height/6,'ui','info-panel.png');
    this.timerText = this.add.text(this.scale.width-125,this.scale.height/6 - 15, "",{
      fontSize: "36px",
      color: "black",
    });

    this.bulletBackground = this.add.image(30,this.scale.height/6*5,'ui','info-panel.png');
    this.bulletBackground.angle = 180;
    this.coinIcon = this.add.image(20,this.scale.height/6*5, "weapons", 'ammo1.png');
    this.coinIcon.setScale(0.4,0.4);
    this.scoreText = this.add.text(45, this.scale.height/6*5 - 15, "24", {
      fontSize: "36px",
      color: "black",
    });

    this.scoreTopRate0 = this.add.text(this.scale.width/2 - 180, 200, "", {
      fontSize: "16px",
      color: "white",
    });
    this.scoreTopRate1 = this.add.text(this.scale.width/2 - 180, 240, "", {
      fontSize: "16px",
      color: "white",
    });
    this.scoreTopRate2 = this.add.text(this.scale.width/2 - 180, 280, "", {
      fontSize: "16px",
      color: "white",
    });
    this.scoreTopRate3 = this.add.text(this.scale.width/2 - 180, 320, "", {
      fontSize: "16px",
      color: "white",
    });
    this.scoreTopRate4 = this.add.text(this.scale.width/2 - 180, 360, "", {
      fontSize: "16px",
      color: "white",
    });
    this.scoreTopRate5 = this.add.text(270, 400, "", {
      fontSize: "16px",
      color: "white",
    });
  }

  setupEvents(): void {
    this.gameScene.events.on("updateScore", (score: any) => {
      this.scoreText.setText(`${score}`,);
    });
    this.gameScene.events.on(
      "updateInfo",
      (infoCount: any, killer: any, death: any) => {
        if (infoCount == 1) {
          this.infoText1.setText(`${killer} killed ${death}`);
        }
        if (infoCount == 2) {
          this.infoText2.setText(`${killer} killed ${death}`);
        }
        if (infoCount == 3) {
          this.infoText3.setText(`${killer} killed ${death}`);
        }
        if (infoCount == 4) {
          this.infoText4.setText(`${killer} killed ${death}`);
        }
        if (infoCount == 5) {
          this.infoText5.setText(`${killer} killed ${death}`);
        }
      }
    );
    this.gameScene.events.on("updateCountDownTimer", (time: any) => {
      let minute = Math.floor(time / 60);
      let seconds = time % 60;
      this.timerText.setText(`${minute}:${seconds}`);
    });
    this.gameScene.events.on("updateTopRateKeys", (topRateKeys: any) => {
      this.scoreTopRate0.setText(`${topRateKeys}`);
    });
    this.gameScene.events.on(
      "updateTopRate",
      (textControl: any, rank: any, id: any, kills: any, deaths: any) => {
        if (textControl == 1) {
          this.scoreTopRate1.setText(
            `${rank}     ${id}         ${kills}      ${deaths}`
          );
        }
        if (textControl == 2) {
          this.scoreTopRate2.setText(
            `${rank}     ${id}         ${kills}      ${deaths}`
          );
        }
        if (textControl == 3) {
          this.scoreTopRate3.setText(
            `${rank}     ${id}         ${kills}      ${deaths}`
          );
        }
        if (textControl == 4) {
          this.scoreTopRate4.setText(
            `${rank}     ${id}         ${kills}      ${deaths}`
          );
        }
        if (textControl == 5) {
          this.scoreTopRate5.setText(
            `${rank}     ${id}         ${kills}      ${deaths}`
          );
        }
      }
    );
  }
}
