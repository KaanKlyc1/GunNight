import Player from "../prefabs/Player";

import Bullet from "../prefabs/Bullet";
import {mapBounds} from "../prefabs/mapBounds";



export default class GameScene extends Phaser.Scene {
  gameLock: boolean = false;
  bulletCount: number;
  coordinatesCount: number;
  fireRate: number;
  nextFire: number;
  pid: string;

  player;
  keys: object;
  wall: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
  background: Phaser.GameObjects.Image;
  bullets: any;
  magazine: Phaser.Physics.Arcade.Image;
  goldPickupAudio: Phaser.Sound.BaseSound;
  bulletFireAudio: Phaser.Sound.BaseSound;
  socket: any;
  private playerMap: {};
  public currentPlayers: any;
  currentKills: any;
  currentDeaths: any;
  private playerCreated: boolean;
  private fireChecker: boolean;
  private socketChecker: number = 0;
  private rankCount = 1;
  private textController = 1;
  private space = "";
  private tableTitles = "Rank    Player                Kills  Deaths";
  private killerArray: any[] = [];
  private deathArray: any[] = [];
  private playerArrays: any[] = [];
  private rankArray: any[] = ["1st", "2nd", "3rd", "4th", "5th"];
  private x: number = 1;
  private borders: any;

  constructor() {
    super("Game"); // Name of the scene
  }

  init(data) {
    /* this.scene.launch("UI"); */
    this.scene.launch("TextInfo");
    this.pid = data.id;
    this.socket = data.socket;
  }

  create() {
    this.createPlayers();
    this.bulletCount = 24;
    this.coordinatesCount = 0;
    this.fireRate = 100;
    this.nextFire = 0;
    this.createAudio();
    this.createBackground();
    this.createWalls();
    this.createMagazines();
    this.createBulletGroup();
    this.socketOnListeners();
    this.createInput();
  }

  update() {
    if (this.playerCreated && !this.gameLock) {
      this.player.update(this.keys);
      let newX: number = this.player.x;
      let newY: number = this.player.y;
      if (this.player.oldPosition && (newX !== this.player.oldPosition.x || newY !== this.player.oldPosition.y || this.player.oldPosition.angle != this.player.angle)) {
        this.socket.emit('move', {
          id: this.player.pid,
          x: this.player.x,
          y: this.player.y,
          angle: this.player.angle
        });
      }

      // this.bulletCollider();

      this.checkBulletHitWall();

      // Save old position
      this.player.oldPosition = {
        id: this.player.pid,
        x: this.player.x,
        y: this.player.y,
        angle: this.player.angle
      };


      this.updateFire();
    }
  }

  isWithinMovementBoundaries(
      x: number,
      y: number
  ): any {
    if (!mapBounds[y]) {
      return true;
    } else {
      return !mapBounds[y].includes(x - 20);
    }
  }

  checkBulletHitWall(){
    if (this.bullets){
      this.bullets.children.each((bullet: any) => {
        if(!this.isWithinMovementBoundaries(Math.floor(bullet.x),Math.floor(bullet.y))){
          bullet.destroy();
        }
      }, this);
    }

  }

  socketOnListeners() {

    // @ts-ignore
    this.socket.on("move", ({ id, x, y, angle }: any) => {
      this.playerMap[id].x = x;
      this.playerMap[id].y = y;
      this.playerMap[id].angle = angle;
      this.playerMap[id].body.angle = angle;
    });


    this.socket.on("makeBullet", ({ id }: any) => {
      let EdirObj = this.getDirFromAngle(this.playerMap[id].angle - 90);
      let bullet = new Bullet(
        this,
        this.playerMap[id].x + EdirObj.tx * 20,
        this.playerMap[id].y + EdirObj.ty * 20,
        id
      );
      this.bulletFireAudio.play();
      bullet.setScale(0.5);
      this.bullets.add(bullet);
      bullet.angle = this.playerMap[id].angle - 90;
      // @ts-ignore
      bullet.body.setVelocity(EdirObj.tx * 700, EdirObj.ty * 700);
    });

    this.socket.on("bulletCollide", ({ killer, death }: any) => {
      console.log(this.playerMap[killer].nickname + " killed " + this.playerMap[death].nickname);
      this.killerArray.unshift(killer);
      this.deathArray.unshift(death);
      if (this.killerArray[0] != undefined) {
        this.events.emit(
          "updateInfo",
          1,
            this.playerMap[this.killerArray[0]].nickname,
                this.playerMap[this.deathArray[0]].nickname
        );
      }
      if (this.killerArray[1] != undefined) {
        this.events.emit(
          "updateInfo",
          2,
            this.playerMap[this.killerArray[1]].nickname,
                this.playerMap[this.deathArray[1]].nickname
        );
      }
      if (this.killerArray[2] != undefined) {
        this.events.emit(
          "updateInfo",
          3,
            this.playerMap[this.killerArray[2]].nickname,
                this.playerMap[this.deathArray[2]].nickname
        );
      }
      if (this.killerArray[3] != undefined) {
        this.events.emit(
          "updateInfo",
          4,
            this.playerMap[this.killerArray[3]].nickname,
                this.playerMap[this.deathArray[3]].nickname
        );
      }
      if (this.killerArray[4] != undefined) {
        this.events.emit(
          "updateInfo",
          5,
            this.playerMap[this.killerArray[4]].nickname,
                this.playerMap[this.deathArray[4]].nickname
        );
      }
      if (this.killerArray[5] != undefined) {
        delete this.killerArray[5];
      }
      this.killThePlayer(death);
    });

    this.socket.on("getKills", (kills: any) => {
      this.currentKills = kills;
    });
    this.socket.on("getDeaths", (deaths: any) => {
      this.currentDeaths = deaths;
      console.log("socketChecker çalıştı");
      this.printer(this.currentKills, this.currentDeaths);
    });

    this.socket.on("respawnPlayer", ({ id,x ,y }: any) => {
      this.playerMap[id].x = x;
      this.playerMap[id].y = y;
      this.playerMap[id].visible = true;
      this.playerMap[id].body.enable = true;
      this.playerMap[id].respawn();
      if (this.pid === id){
        this.fireChecker = true;
        console.log('fire',this.fireChecker);
      }
    });
    this.socket.on("countDownTimer", (counter) => {
      this.events.emit("updateCountDownTimer", counter);
      if (counter == 0) {
        console.log("GameOver!");
        this.fireChecker = false;
        this.scene.start('EndGame');
      }
    });
  }

  createBackground() {
    this.background = this.physics.add.image(0, 0, "map");
    console.log(this.background.width);
    console.log(this.background.height);
    // this.background.setScale(0.7,0.7);
    // this.background.displayHeight = this.background.height * 0.8;

    this.background.setOrigin(0, 0);
    this.physics.world.setBounds(
      0,
      0,
      this.background.displayWidth,
      this.background.displayHeight
    );

    this.background.setInteractive();
  }


  updateFire() {
    if (this.bulletCount > 0 && this.input.activePointer.isDown) {
      this.makeBullet();
    }
  }

  createCameraFunctions() {
    this.cameras.main.setBounds(
      0,
      0,
      this.background.displayWidth,
      this.background.displayHeight
    );
    this.cameras.main.zoom = 0.6;
    this.cameras.main.startFollow(this.player, true);
  }

  createPlayers() {
    this.playerMap = {};
    console.log(this.pid);
    this.socket.emit("newPlayer", this.pid);
    // @ts-ignore
    this.socket.on("currentPlayers", (players: any): any => {
      console.log("players", players);
      this.currentPlayers = players;
      // @ts-ignore
      Object.keys(players).forEach((id: string) => {
        if (players[id].pid === this.pid && !this.playerCreated) {
          let sprite: any = new Player(
            this,
            players[id].x,
            players[id].y,
            "deneme",
            players[id].pid,
            players[id].nickname
          );
          this.player = sprite;
          this.playerMap[id] = sprite;
          this.playerCreated = true;
          this.fireChecker = true;
        } else {
          if (!this.isPlayerExist(id)) {
            let sprite: any = new Player(
              this,
              players[id].x,
              players[id].y,
              "deneme",
              players[id].pid,
                players[id].nickname
            );
            this.playerMap[id] = sprite;
          }
        }
      });
      this.createAfterPlayerEvents();
    });

  }

  createAfterPlayerEvents(): any {
    this.followPointer();
    this.addCollisions();
    this.createCameraFunctions();
    this.bulletCollider();
  }

  createInput() {
    this.keys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });
  }

  followPointer() {
    this.input.setDefaultCursor('url(assets/images/cursor.gif), pointer');
    let angle = 0;
    this.input.on(
      "pointermove",
      (pointer): any => {
        pointer.x = pointer.worldX;
        pointer.y = pointer.worldY;
        angle = Phaser.Math.Angle.BetweenPoints(this.player, pointer);
        angle = (180 * angle) / Math.PI;
        this.player.setAngle(angle + 90);
      },
      this
    );

  }

  createWalls() {
    // this.wall = this.physics.add.image(900, 100, "button1");
    // this.wall.setCollideWorldBounds(true);
    // this.wall.setImmovable();
  }

  addCollisions() {
    this.physics.add.collider(this.player, this.wall);
    this.physics.add.overlap(
      this.player,
      this.magazine,
      this.collectMagazine,
      null,
      this
    );

  }

  bulletCollider() {
    Object.keys(this.playerMap).forEach((pID) => {
      if (pID != this.player.pid) {
        this.physics.add.collider(
          this.playerMap[pID],
          this.bullets,
          this.hitPlayer,
          null,
          this
        );
      }
    });

  }

  bulletDestroy(borders, bullets) {
    bullets.destroy();
  }
  createBulletGroup() {
    this.bullets = this.physics.add.group();
    this.bullets.enableBody = true;
    this.bullets.physicsBodyType = Phaser.Physics.Arcade;
  }
  makeBullet() {
    if (
      this.bulletCount > 0 &&
      this.time.now > this.nextFire &&
      this.fireChecker
    ) {
      this.bulletCount--;
      this.events.emit("updateScore", this.bulletCount);
      this.nextFire = this.time.now + this.fireRate;
      let dirObj = this.getDirFromAngle(this.player.angle - 90);
      let bullet = new Bullet(
        this,
        this.player.x + dirObj.tx * 20,
        this.player.y + dirObj.ty * 20,
        this.player.pid
      );
      this.bulletFireAudio.play();
      bullet.setScale(0.5);
      this.bullets.add(bullet);
      bullet.angle = this.player.angle - 90;
      // @ts-ignore
      bullet.body.setVelocity(dirObj.tx * 1000, dirObj.ty * 1000);

      this.socket.emit("makeBullet", {
        id: this.player.pid,
      });
    }
  }

  getDirFromAngle(angle) {
    let rads = (angle * Math.PI) / 180;
    let tx = Math.cos(rads);
    let ty = Math.sin(rads);
    return { tx, ty };
  }

  createAudio() {
    this.goldPickupAudio = this.sound.add("goldSound");
    this.bulletFireAudio = this.sound.add("bulletAttack");
  }

  hitPlayer(player, bullet) {
    console.log(player.pid);
    bullet.destroy();
    console.log("bu mermiyi bu yiğit attı", bullet.ownerPid);
    if (this.player.alpha != 0){
      this.socket.emit("bulletCollide", {
        killer: bullet.ownerPid,
        death: player.pid,
      });
    }
  }

  killThePlayer(pid) {
    if (pid != this.player.pid) {
      Object.keys(this.playerMap).forEach((pID) => {
        if (pID != this.player.pid && pID == pid) {
          this.playerMap[pID].body.enable = false;
          this.playerMap[pID].alpha = 0;
        }
      });
    } else {
      this.player.body.enable = false;
      this.player.alpha = 0;
      this.gameLock = true;
      this.fireChecker = false;
      this.createRespawnButton(pid);
    }
  }

  createRespawnButton(pid) {
    let reSpawnButton = this.add.image(this.scale.width/2, this.scale.height/3*2, "ui",'green-button.png').setInteractive();
    reSpawnButton.setScrollFactor(0);
    this.socket.emit("getKills");
    this.socket.emit("getDeaths");

    let respawnPlayIcon = this.add.image(this.scale.width/2, this.scale.height/3*2,'ui','play-icon.png');
    respawnPlayIcon.setScrollFactor(0);
    reSpawnButton.on("pointerdown", () => {
      this.rankCount = 1;
      this.textController = 1;
      this.socketChecker = 0;
      let spaceRankCount = 1;
      reSpawnButton.visible = false;
      this.events.emit("updateTopRateKeys", this.space);
      while (spaceRankCount <= 5) {
        this.events.emit(
          "updateTopRate",
          spaceRankCount,
          this.space,
          this.space,
          this.space,
          this.space
        );
        spaceRankCount++;
        reSpawnButton.destroy();
        respawnPlayIcon.destroy();
      }
      spaceRankCount = 1;

      this.player.visible = true;
      // this.player.body.enable = true;
      this.bulletCount = 24;
      // this.player.respawn();
      this.gameLock = false;

      this.socket.emit("respawnPlayer", { id: pid});
    });
  }

  // mainMenuButton() {
  //   let mainMenuButton = this.add.image(400, 450, "button2").setInteractive();
  //   mainMenuButton.setScrollFactor(0);
  //   this.socket.emit("getKills");
  //   this.socket.emit("getDeaths");
  //
  //   Object.keys(this.playerMap).forEach((id) => {
  //     this.playerMap[id].body.enable = false;
  //     this.playerMap[id].visible = false;
  //   });
  //   mainMenuButton.on("pointerdown", () => {
  //     this.rankCount = 1;
  //     this.textController = 1;
  //     this.socketChecker = 0;
  //     let spaceRankCount = 1;
  //     mainMenuButton.visible = false;
  //     this.events.emit("updateTopRateKeys", this.space);
  //     while (spaceRankCount <= 5) {
  //       this.events.emit(
  //         "updateTopRate",
  //         spaceRankCount,
  //         this.space,
  //         this.space,
  //         this.space,
  //         this.space
  //       );
  //       spaceRankCount++;
  //     }
  //     spaceRankCount = 1;
  //     //this.scene.start("UI");
  //     //this.shutdown();
  //   });
  // }

  printer(killsVariable, deathVariable) {
    if (this.socketChecker == 0) {
      console.log("kills: ", killsVariable);
      console.log("deaths: ", deathVariable);
      Object.keys(killsVariable).forEach((id) => {
        this.playerMap[id].playerKills = killsVariable[id];
      });
      Object.keys(deathVariable).forEach((id) => {
        this.playerMap[id].playerDeaths = deathVariable[id];
      });
      Object.keys(this.playerMap).forEach((id) => {
        if (this.playerMap[id].playerKills == undefined) {
          this.playerMap[id].playerKills = 0;
        }
        if (this.playerMap[id].playerDeaths == undefined) {
          this.playerMap[id].playerDeaths = 0;
        }
      });

      Object.keys(this.playerMap).forEach((id) => {
        this.playerArrays.push(this.playerMap[id]);
      });
      this.events.emit("updateTopRateKeys", this.tableTitles);

      let sortedArray = this.playerArrays.sort(
        (first, second) => 0 - (first.playerKills > second.playerKills ? 1 : -1)
      );
      console.log(sortedArray);

      for (let i = 0; i < sortedArray.length; i++) {
        this.events.emit(
          "updateTopRate",
          this.textController,
          this.rankArray[i],
          sortedArray[i].nickname,
          sortedArray[i].playerKills,
          sortedArray[i].playerDeaths
        );
        this.textController++;
      }

      this.playerArrays = [];
      console.log(this.playerArrays);
      this.socketChecker++;
    }
  }

  createMagazines() {
    this.magazine = this.physics.add.image(400, 400, "weapons","ammo2.png");
    this.magazine.setActive(true);
    this.magazine.setVisible(true);
    this.magazine.body.checkCollision.none = false;
  }

  spawnMagazine(coordinates) {
    this.magazine.setPosition(coordinates[0], coordinates[1]);
    this.magazine.setActive(true);
    this.magazine.setVisible(true);
    this.magazine.body.checkCollision.none = false;
  }

  collectMagazine(player, magazine) {
    let coordinates = [
      [1007, 3075],
      [2629, 1116],
      [4102, 2865],
      [4281, 1096],
      [775, 661],
      [724, 3040]
    ];
    this.bulletCount += 12;
    this.goldPickupAudio.play();
    this.events.emit("updateScore", this.bulletCount);

    magazine.setActive(false);
    magazine.setVisible(false);
    magazine.body.checkCollision.none = true;

    this.spawnMagazine(coordinates[this.coordinatesCount]);
    this.coordinatesCount++;

    if (this.coordinatesCount > 2) {
      this.coordinatesCount = 0;
    }
  }

  isPlayerExist(id: string): boolean {
    // @ts-ignore
    return Object.keys(this.playerMap).includes(id);
  }
  shutdown(): void {
    this.bulletCount = null;
    this.coordinatesCount = null;
    this.fireRate = null;
    this.nextFire = null;
    this.pid = null;
    this.player = null;
    this.keys = null;
    this.wall = null;
    this.background = null;
    this.bullets = null;
    this.magazine = null;
    this.goldPickupAudio = null;
    this.bulletFireAudio = null;
    this.socket = null;
    this.playerMap = null;
    this.currentPlayers = null;
    this.currentKills = null;
    this.currentDeaths = null;
    this.playerCreated = null;
    this.fireChecker = null;
    this.socketChecker = null;
    this.rankCount = null;
    this.textController = null;
    this.space = null;
    this.tableTitles = null;
  }
}
