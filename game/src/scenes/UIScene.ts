import {io, Socket} from "socket.io-client";
import {getQueryParameter, getRandomString, updateQueryParameter} from "../prefabs/utils";
import {url} from "socket.io-client/build/url";

export default class UIScene extends Phaser.Scene {
  gameScene: Phaser.Scene;
  private background: any;
  private canvas: any;
  private pid: string;
  private socket: Socket;
  private room: string = getQueryParameter('room') || getRandomString(5);
  private backImage: Phaser.GameObjects.Image;
  private loadingText: any;
  private loadingTextArray: string[] = ['Loading.','Loading..','Loading...'];
  private textArrayCount: number = 1;
  private loadingLoop: any;
  private gameStarted: boolean = false;
  private logo: Phaser.GameObjects.Image;


  constructor() {
    super("UI"); // Name of the scene
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
    this.setupInitial();

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

  startGame(pid: string, socket: any): void {
    console.log(pid,socket);
    this.loadingLoop.destroy();
    this.scene.start("Game", { id: pid, socket: socket });
    console.log('başladıı');
  }

  resize(): void {
    this.background.width = this.canvas.width;
    this.background.height = this.canvas.height;
  }

  shutdown(): void {
    this.background.destroy();
  }

  setupInitial() {
    console.log('buoda',this.room);
    this.socket = io(`https://game-server-staging.zapapa.gamedistribution.com:3001/?room=${this.room}`, {
      path: "/gunnightio",
    });

    this.socket.on('Error', (text: string) => {
      console.log(text);
      this.createPopup(text);
    });

    this.pid = localStorage.getItem('zapapaUserID');

      this.socket.emit('verifyPlayer', localStorage.getItem('zapapaToken'));
      this.socket.on('verifiedPlayer', (pid: string) => {
        if (this.pid === pid) {
          this.loadingLoop = this.time.addEvent({
            delay: 2000,                // ms
            callback:  this.startGame,
            args: [this.pid,this.socket],
            callbackScope: this,
            loop: true
          });
        }
      });


  }

  public createPopup(text: string): any {
    // let box: any = this.add.sprite(250,550, Atlases.Buttons,'box-bar.png');
    console.log(text);
    this.loadingLoop.destroy();
    this.loadingText.destroy();
    let ErrorText = this.add.text(this.scale.width/2,600,text,{
      fontSize: "24px",
      color: "white",
    });
    ErrorText.setOrigin(0.45,0.45);
    // box.fixedToCamera = true;
    // box.addChild(ErrorText);
  }
}
