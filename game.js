var game = new Phaser.Game(1024, 768, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update, render: render });

function preload() {

    game.load.tilemap('thisLevel', '/levels/mountains/level2/level2.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.spritesheet('tiles', '/characters/ground_1x1.png', 32, 32);
    game.load.spritesheet('frog', '/characters/frog100px133px.png', 133, 100);
    game.load.spritesheet('fly', '/characters/fly.png', 133, 56);
    game.load.image('bg', '/levels/mountains/level1/images/background.jpg');
    game.load.image('fg', '/levels/mountains/level1/images/foreground.png');
    game.load.image('arrow', '/levels/mountains/level1/images/foreground.png');

}

var player;
var layer, ll;
var facing = 'left';
var jumpTimer = 0;
var cursors;
var jumpButton;
var fg, bg;
var bgVel=0.1;
var fly;
var walls, enemys, startPoint, goalPoint;
var flying = false;
var wallsCG, playerCG, goalCG, enemyCG;
var jumps = 999;
var level = 0;
var jumpsEl = null;
var levelEl = null;

function stickToIt(pl, wall){
	flying = false;
	player.play("landing");
	player.body.setZeroVelocity();
	player.body.setZeroForce();
	player.body.setZeroRotation();
	game.physics.p2.gravity.y = 0;
};


function die(){
	resetLevel();
	// die
	c.l("dead");
}
var resetLevel = function(){
	player.body.x = startPoint.x;
	player.body.y = startPoint.y;
	player.body.setZeroForce();
	player.body.setZeroRotation();
	player.body.setZeroVelocity();
};

var nextLevel = function(){
	level++;
	setLevel();
	c.l("hurray, you finished the level");
};

function setJumps(){ jumpsEl.innerHTML = jumps; }
function setLevel(){ levelEl.innerHTML = level; }

function startJump(){
	player.play("jump");
	setTimeout(function(){
		launch();
	}, 400);
}

function create() {
	jumpsEl = document.getElementById("jumps");
	levelEl = document.getElementById("level");
	setJumps();
	setLevel();

    game.physics.startSystem(Phaser.Physics.P2JS);
	game.physics.p2.setImpactEvents(true);
    game.physics.p2.gravity.y = 600;
    game.physics.p2.restitution = 1;

    bg = game.add.image(0, 0, "bg");

    //fg = game.add.tileSprite(0, 0, 'fg');


    map = game.add.tilemap('thisLevel');
	map.addTilesetImage('tileset', 'tiles');
 	layer = map.createLayer('tileEbene');
 	layer.resizeWorld();


	wallsCG = game.physics.p2.createCollisionGroup();
	playerCG = game.physics.p2.createCollisionGroup();
	enemyCG = game.physics.p2.createCollisionGroup();
	goalCG = game.physics.p2.createCollisionGroup();
	bounceCG = game.physics.p2.createCollisionGroup();

	walls = game.physics.p2.convertCollisionObjects(map, "collision", true);
	enemys = game.physics.p2.convertCollisionObjects(map, "enemy", true);

 	startPoint = game.physics.p2.convertCollisionObjects(map, 'start')[0];
 	goalPoint = game.physics.p2.convertCollisionObjects(map, 'goal')[0];
	goalPoint.setCollisionGroup(goalCG);
	goalPoint.collides(playerCG);

	for(var wall in walls) {
	    walls[wall].setCollisionGroup(wallsCG);
	    walls[wall].collides(playerCG);
	}

	for(var enemy in enemys) {
	    enemys[enemy].setCollisionGroup(enemyCG);
	    enemys[enemy].collides(playerCG);
	}


	// INIT PLAYER
    player = game.add.sprite(133, 100, 'frog');
    player.inputEnabled = true;
    game.physics.p2.enable(player);
    player.body.setCircle(28);
	player.body.damping = 0.7;
	player.body.x = startPoint.x;
	player.body.y = startPoint.y;
    player.body.setCollisionGroup(playerCG);
    player.body.collides(enemyCG, die, this);
    player.body.collides(wallsCG, stickToIt);
    player.body.collides(goalCG, nextLevel);


    goalFly = game.add.sprite(133, 56, 'fly');
    goalFly.animations.add('flying', [0,1,2,3,4], 18, true);
    goalFly.play("flying");
	goalFly.x = goalPoint.x-80;
	goalFly.y = goalPoint.y-80;

	// ANIMATIONS
    jump = player.animations.add('jump', [9,0,1,2,3], 10, false);
    landing = player.animations.add('landing', [9, 10], 10, false);
    player.animations.add('turn', [10], 2, true);
    fly = player.animations.add('fly', [4], 10, true);

	landing.onComplete.add(function(){ player.play("sit"); }, this);

	jump.onComplete.add(function() { player.play("fly"); }, this);

	game.camera.follow(player);
	player.events.onInputDown.add(startJump, this);
	player.events.onInputUp.add(launch, this);
}



function launch() {
	if (flying === true || jumps === 0) { return false;	}
	flying = true;
	jumps--;
	setJumps();
	game.physics.p2.gravity.y = 600;
	diffX = game.input.worldX - player.x;
	diffY = game.input.worldY - player.y;

	if (diffY > 0){ diffY = 0; }

	veloX = diffX * 1.2;
	veloY = diffY * 3;

	if (diffX > 0) { // jump right
		if (player.scale.x < 0){ player.scale.x *= -1; }
		player.body.velocity.x = veloX;
		player.body.velocity.y = veloY;
	} else { // jump left
		if (player.scale.x > 0){ player.scale.x *= -1; }
		player.body.velocity.x = veloX;
		player.body.velocity.y = veloY;
	}
}

function update() {
    bg.x += player.body.velocity.x/20;
}

function render() {
	//game.debug.body(player);
}
