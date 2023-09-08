export default class Bullet extends Phaser.Physics.Arcade.Sprite {
    ownerPid: string
    constructor (scene, x, y,pid)
    {
        super(scene, x, y, 'bullet');
        this.ownerPid = pid;

        //  You can either do this:
        scene.add.existing(this);
        scene.physics.add.existing(this);

        //  Or this, the end result is the same
        // scene.sys.displayList.add(this);
        // scene.sys.updateList.add(this);
        // scene.sys.arcadePhysics.world.enableBody(this, 0);

        //  Set some default physics properties
        this.setScale(2);
        this.setBounce(1, 1);
        this.setCollideWorldBounds(true);

        // this.setVelocity(0, -200);
    }

}
