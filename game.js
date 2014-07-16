var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update, render: render });

function preload() {

	game.load.tilemap('desert', 'map2.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.spritesheet('ground', 'ground_1x1.png', 32, 48);
    game.load.spritesheet('dude', 'dude.png', 32, 48);
    game.load.image('background', 'background2.png');

}

var player;
var layer, ll;
var facing = 'left';
var jumpTimer = 0;
var cursors;
var jumpButton;
var bg;
var walls;
var flying = false;
var wallsCG, playerCG;
var cb = function(){
	player.body.setZeroVelocity();
	player.body.setZeroForce();
	player.body.setZeroRotation();
	game.physics.p2.gravity.y = 0;
	};

function create() {
    game.physics.startSystem(Phaser.Physics.P2JS);
    // bg = game.add.tileSprite(0, 0, 800, 600, 'background');
	game.physics.p2.setImpactEvents(true);

    map = game.add.tilemap('desert');
    map.addTilesetImage('ground', 'ground');

    game.physics.p2.gravity.y = 600;
    game.physics.p2.restitution = 1;

 	layer = map.createLayer('ebene1');

	wallsCG = game.physics.p2.createCollisionGroup();
	playerCG = game.physics.p2.createCollisionGroup();

	walls = game.physics.p2.convertCollisionObjects(map, "ebene2", true);

	  for(var wall in walls)
	  {
	    walls[wall].setCollisionGroup(wallsCG);
	    walls[wall].collides(playerCG);
	  }



    player = game.add.sprite(32, 32, 'dude');
    game.physics.p2.enable(player);

    player.body.setCircle(28);
    player.body.setCollisionGroup(playerCG);


    player.body.collides(wallsCG, cb);
	player.body.damping = 0.7

    // player.body.setSize(20, 32, 5, 16);
// player.body.fixedRotation = true;
    // player.animations.add('left', [0, 1, 2, 3], 10, true);
    // player.animations.add('turn', [4], 20, true);
    // player.animations.add('right', [5, 6, 7, 8], 10, true);

    game.camera.follow(player);

	game.input.onDown.add(launch, this);
}

function stickToIt(player, wall){
	console.log("crash", player, wall);
}

function launch() {
	game.physics.p2.gravity.y = 600;
	diffX = game.input.x - player.x;
	diffY = game.input.y - player.y;
	veloX = diffX * 1.2;
	veloY = diffY * 4;
	if (diffX>0)
	{
		player.body.velocity.x = veloX;
		player.body.velocity.y = veloY;
	}
	else
	{
		player.body.velocity.x = veloX;
		player.body.velocity.y = veloY;
	}
}

function update() {


}

function render () {

    game.debug.body(player);

}