import {mapBounds} from "./mapBounds";

export default class Player extends Phaser.Physics.Arcade.Image {
  speed: number;
  pid: string;
  playerKills: number;
  playerDeaths: number;
  oldPosition: any;
  isAlive: boolean = true;
  nickname: string;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    key: string,
    pid: string,
    nickname: string
    /* 		frame: number */
  ) {
    super(scene, x, y, key);
    this.scene = scene;
    this.pid = pid;
    this.speed = 275;
    this.nickname = nickname;
    this.scene.physics.world.enable(this);

    this.setBodySize(120,110);
    this.setImmovable(true);
    this.setBounce(1,1);
    this.setCollideWorldBounds(true);



    this.scene.add.existing(this);
    // this.scene.add.existing(this.container);
  }
  isWithinMovementBoundaries(
      x: number,
      y: number
  ): any {
      if (!mapBounds[y]) {
        return true;
      } else {
        return !mapBounds[y].includes(x);
      }
  }


  respawn(){
    this.alpha = 0.5;
    this.scene.time.addEvent({
      delay: 3000,                // ms
      callback:  () => {
        this.body.enable = true;
        // this.setBodySize(120,110);
        // this.setImmovable(true);
        // this.setBounce(1,1);
        this.alpha = 1;
        // this.setCollideWorldBounds(true);
      },
      callbackScope: this,
      loop: false
    });


  }

  update(cursors) {
    this.setVelocityX(0);
    this.setVelocityY(0);
    let absPlayerX: number = Math.round(this.x);
    let absPlayerY: number = Math.round(this.y);


    if (cursors.left.isDown && this.isWithinMovementBoundaries(absPlayerX - 80, absPlayerY)) {
      this.setVelocityX(-this.speed);
    } else if (cursors.right.isDown && this.isWithinMovementBoundaries(absPlayerX + 80, absPlayerY)) {
      this.setVelocityX(this.speed);
    } else {
      this.setVelocityX(0);
    }

    if (cursors.up.isDown && this.isWithinMovementBoundaries(absPlayerX, absPlayerY - 80)) {
      this.setVelocityY(-this.speed);
    } else if (cursors.down.isDown && this.isWithinMovementBoundaries(absPlayerX, absPlayerY + 80)) {
      this.setVelocityY(this.speed);
    } else {
      this.setVelocityY(0);
    }
  }
}
