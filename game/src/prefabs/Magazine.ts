export default class Magazine extends Phaser.Physics.Arcade.Image {
  public magazines: number;

  constructor(scene, x, y, key) {
    super(scene, x, y, 'weapons','ammo2.png');
    this.scene = scene;

    this.magazines = 12;

    // Physics
    this.scene.physics.world.enable(this);
    this.scene.add.existing(this);
  }

  makeActive() {
    this.setActive(true);
    this.setVisible(true);
    this.body.checkCollision.none = false;
  }

  makeInactive() {
    this.setActive(false);
    this.setVisible(false);
    this.body.checkCollision.none = true;
  }
}
