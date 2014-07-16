var game = new Phaser.Game(1024, 768, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update, render: render });

function preload() {

    game.load.tilemap('desert', './levels/mountains/level1.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.spritesheet('ground', './characters/ground_1x1.png', 32, 48);
    game.load.spritesheet('frog', './characters/gfrog-small.png', 197, 165);
    game.load.image('bg', './levels/mountains/level1.jpg');
}

var player;
var layer, ll;
var facing = 'left';
var jumpTimer = 0;
var cursors;
var jumpButton;
var bg;
var fly;
var walls;
var flying = false;
var wallsCG, playerCG;
var jumps = 5;
var jumpsEl = null;

var cb = function(){
};

function stickToIt(pl, wall){
	flying = false;
	player.body.setZeroVelocity();
	player.body.setZeroForce();
	player.body.setZeroRotation();
	game.physics.p2.gravity.y = 0;
	player.play("turn");
}

function die(){
	// die
	c.l("dead");
}

function setJumps(){ jumpsEl.innerHTML = jumps; };

function create() {
	// INIT AND SET STATS
	jumpsEl = document.getElementById("jumps");
	setJumps();

    game.physics.startSystem(Phaser.Physics.P2JS);
    bg = game.add.tileSprite(0, 0, 2000, 800, 'bg');
	game.physics.p2.setImpactEvents(true);


    map = game.add.tilemap('desert');
    map.addTilesetImage('background', 'bg');

    game.physics.p2.gravity.y = 600;
    game.physics.p2.restitution = 1;

 	layer = map.createLayer('ebene2');
 	layer.resizeWorld();

 	startLayer = map.createLayer('ebene2');
 	goalLayer = map.createLayer('ebene2');

	wallsCG = game.physics.p2.createCollisionGroup();
	playerCG = game.physics.p2.createCollisionGroup();
	enemyCG = game.physics.p2.createCollisionGroup();

	walls = game.physics.p2.convertCollisionObjects(map, "ebene1", true);
	enemys = game.physics.p2.convertCollisionObjects(map, "enemy", true);

	for(var wall in walls) {
	    walls[wall].setCollisionGroup(wallsCG);
	    walls[wall].collides(playerCG);
	}

	for(var enemy in enemys) {
	    enemys[enemy].setCollisionGroup(enemyCG);
	    enemys[enemy].collides(playerCG);
	}

	// INIT PLAYER
    player = game.add.sprite(197, 165, 'frog');
    game.physics.p2.enable(player);
    player.body.setCircle(28);
	player.body.damping = 0.7

    player.body.setCollisionGroup(playerCG);

    player.body.collides(enemyCG, die, this);

    player.body.collides(wallsCG, stickToIt);

    // player.body.setSize(20, 32, 5, 16);
// player.body.fixedRotation = true;

    jump = player.animations.add('jump', [0,1,2,3,4,5,6,7], 10, false);
    player.animations.add('turn', [8], 2, true);
    fly = player.animations.add('fly', [6], 10, true);

	jump.onComplete.add(function(){ player.play("fly"); }, this);



    game.camera.follow(player);

	game.input.onDown.add(launch, this);
}

function launch() {
	if(flying===true||jumps===0){return false;}
	flying = true;
	jumps--;
	setJumps();
	game.physics.p2.gravity.y = 600;
	diffX = game.input.worldX - player.x;
	diffY = game.input.worldY - player.y;
	veloX = diffX * 1.2;
	veloY = diffY * 4;
	player.play("jump");
	if (diffX>0) {
		// jump right clicked
		if (player.scale.x < 0) player.scale.x *= -1
		player.body.velocity.x = veloX;
		player.body.velocity.y = veloY;
	}
	else {
		if (player.scale.x > 0) player.scale.x *= -1;
		player.body.velocity.x = veloX;
		player.body.velocity.y = veloY;
	}
}

function update() {

}

function render () {
    game.debug.body(player);
}