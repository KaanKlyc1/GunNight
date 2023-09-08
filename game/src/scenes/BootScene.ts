export default class BootScene extends Phaser.Scene {
  constructor() {
    super("Boot"); // Name of the scene
  }

  preload(): void {
    this.loadImages();
    this.loadSpriteSheets();
    this.loadAudio();
  }

  create(): void {
    this.scene.start("ForwardingScene");
  }

  // Utility functions:
  // Load Images
  loadImages(): void {
    // this.load.image("button1", "assets/images/ui/blue_button01.png");
    // this.load.image("button2", "assets/images/ui/blue_button02.png");
    this.load.image("deneme", "assets/images/deneme.png");
    this.load.image("map", "assets/images/map.png");
    this.load.image("circle", "assets/images/circle.png");
    this.load.image("bullet", "assets/images/bullet.png");
    this.load.image("play-page", "assets/images/play-page.png");
    this.load.image("cone", "assets/images/cone.png");
    this.load.atlas(
      "soldier",
      "assets/atlas/characters-full.png",
      "assets/atlas/characters-full.json"
    );
    this.load.atlas(
        "ui",
        "assets/atlas/ui-assets.png",
        "assets/atlas/ui-assets.json"
    );
    this.load.atlas(
        "weapons",
        "assets/atlas/weapons.png",
        "assets/atlas/weapons.json"
    );
  }

  // Load SpriteSheets
  loadSpriteSheets(): void {
    this.load.spritesheet("items", "assets/images/items.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    /*     this.load.spritesheet("characters", "assets/images/characters.png", {
      frameWidth: 32,
      frameHeight: 32,
    }); */
  }

  // Load Audio
  loadAudio(): void {
    this.load.audio("goldSound", ["assets/audio/Pickup.wav"]);
    this.load.audio("bulletAttack", ["assets/audio/PlayerAttack.wav"]);
  }
}
