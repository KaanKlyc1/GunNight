
import {getQueryParameter, getRandomString, updateQueryParameter} from "../prefabs/utils";

export default class ForwardingScene extends Phaser.Scene {
  gameScene: Phaser.Scene;
  private background: any;
  private canvas: any;
  private room: string = getQueryParameter('room') || getRandomString(5);
  private loadingText: any;
  private loadingTextArray: string[] = ['Loading.','Loading..','Loading...'];
  private textArrayCount: number = 1;
  private loadingLoop: any;
  private check: Phaser.Time.TimerEvent;
  private logo: Phaser.GameObjects.Image;


  constructor() {
    super("ForwardingScene"); // Name of the scene
  }

  init(): void {
    this.gameScene = this.scene.get("Game");
    this.canvas = this.sys.game.canvas;
  }

  preload(): void {
    if (typeof window !== 'undefined') {
      window.history.replaceState(
          {},
          document.title,
          updateQueryParameter('room', this.room)
      );
    }
  }

  create(): void {
    this.setupUIElements();
    this.check = this.time.addEvent({
      delay: 500,                // ms
      callback:  this.setupInitial,
      //args: [],
      callbackScope: this,
      loop: true
    });
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


    this.loadingText = this.add.text(this.canvas.width/2 - 100,this.canvas.height/2 + 200, ' Loading.', { font: '46px RenoMono' });

    this.loadingLoop = this.time.addEvent({
      delay: 500,                // ms
      callback:  this.loadingTextLoop,
      //args: [],
      callbackScope: this,
      loop: true
    });
    this.scale.on("resize", this.resize, this);
  }


  public loadingTextLoop(): any {
    this.loadingText.setText(this.loadingTextArray[this.textArrayCount % 3]);
    this.textArrayCount++;
  }


  resize(): void {
    this.background.width = this.canvas.width;
    this.background.height = this.canvas.height;
  }

  shutdown(): void {
    this.background.destroy();
  }
  startUI(): void {
    console.log('nasıl yani');
    this.loadingLoop.destroy();
    this.check.destroy();
    this.scene.start("UI");
    console.log('başladıı');
  }
  setupInitial() {
    console.log("heyy");
    console.log(this.checkForwarded());
   if (this.checkForwarded()){
     this.startUI();
   }
  }

  checkForwarded(){
    let urlRoom = localStorage.getItem('zapapaRoom');
    console.log('urlroom',urlRoom,this.room);
    return this.room == urlRoom;
  }
}
