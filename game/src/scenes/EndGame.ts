
export default class EndGame extends Phaser.Scene {
  gameScene: Phaser.Scene;
  private background: any;
  private canvas: any;
  private loadingText: any;

  private logo: Phaser.GameObjects.Image;


  constructor() {
    super("EndGame"); // Name of the scene
  }

  init(): void {
    this.gameScene = this.scene.get("Game");
    this.canvas = this.sys.game.canvas;
  }



  create(): void {
    this.setupUIElements();
  }

  setupUIElements(): void {
    this.background = this.add.image(
      0,
      0,
      "play-page"
    );
    this.background.setOrigin(0,0);
    this.background.setScale(this.canvas.width/this.background.width,this.canvas.height/this.background.height);

    this.logo = this.add.image(this.scale.width/2,this.scale.height/3,'ui','gun-night-logo.png');
    this.logo.setOrigin(0.5,0.5);
    this.logo.setScale(0.5,0.5);


    this.loadingText = this.add.text(this.canvas.width/2 - 100,this.canvas.height/2 + 200, ' Game Ended', { font: '46px RenoMono' });

    this.scale.on("resize", this.resize, this);
  }


  resize(): void {
    this.background.width = this.canvas.width;
    this.background.height = this.canvas.height;
  }

  shutdown(): void {
    this.background.destroy();
  }
}
