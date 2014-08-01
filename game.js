var player;
var game;
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
var level = "cave/level1";
var levelData = "";
var jumpsEl = null;
var levelEl = null;
var statsEl = null;
var startTime = 0;
var levelMap = [];
var levelMapState = 0;

var DEBUG = false;

function preload(world, levelNr) {
	for(world in levelData){
		if (levelData.hasOwnProperty(world)) {
			for(lvl in levelData[world]){
    	        if (levelData[world].hasOwnProperty(lvl)) {
		    		lvl = world+"/"+lvl;
		    		levelMap.push(lvl);
				    game.load.tilemap('tilemap'+lvl, '/levels/'+lvl+'/level.json', null, Phaser.Tilemap.TILED_JSON);
				    game.load.image('bg'+lvl, '/levels/'+lvl+'/images/background.jpg');
		        }
			}
		}
	}
    game.load.spritesheet('tileset', '/characters/ground_1x1.png', 32, 32);
    game.load.spritesheet('frog', '/characters/frog100px133px.png', 133, 100);
    game.load.spritesheet('fly', '/characters/fly.png', 133, 56);
    game.load.image('arrow', '/characters/arrow.png');
    game.stage.disableVisibilityChange = true;
    game.canvas.tabIndex = 1;
}


function stickToIt(pl, wall){
	flying = false;
	player.play("landing");
	player.body.setZeroVelocity();
	player.body.setZeroForce();
	player.body.setZeroRotation();
	player.body.rotation = 0
	game.physics.p2.gravity.y = 0;
}

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
}

function setJumps(){ jumpsEl.innerHTML = jumps; }
function setLevel(){ levelEl.innerHTML = level; }
function setStats(timeNeeded, timeNeededOld){
	statsEl.children[1].innerHTML = timeNeeded;
	statsEl.children[4].innerHTML = timeNeededOld;
	statsEl.style.display = "block";
}
function hideStats(){
	statsEl.style.display = "none";
}

function setStartTime(){ startTime = Date.now(); }

function setLevelValues(){
	lvlData = level.split("/");
	world = lvlData[0];
	lvlNr = lvlData[1];
	timeNeeded = ((Date.now() - startTime))>>0;
	timeNeededOld = levelData[world][lvlNr].time || null;
	if (timeNeeded<timeNeededOld || !timeNeededOld){
		levelData[world][lvlNr].time = timeNeededOld = timeNeeded;
	}
	setStats(timeNeeded, timeNeededOld);
	levelData[world][lvlNr].finished = true;
}

function startJump(){
	if (flying || jumps === 0) { return false;	}
	player.play("jump");
	setTimeout(function(){ launch(); }, 400);
}

function create() {
	jumpsEl = document.getElementById("jumps");
	levelEl = document.getElementById("level");
	statsEl = document.getElementById("betweenLvlStats");
	setJumps();
	setLevel();
	setStartTime();
	if (DEBUG===false) {level = levelMap[levelMapState];}
    bg = game.add.image(0, 0, "bg"+level);

    game.physics.startSystem(Phaser.Physics.P2JS);
	game.physics.p2.setImpactEvents(true);
    game.physics.p2.gravity.y = 600;
    game.physics.p2.restitution = 1;

    map = game.add.tilemap('tilemap'+level);
	map.addTilesetImage('tileset', 'tileset');
 	layer = map.createLayer('tileEbene');
 	layer.resizeWorld();

	// collision layers
	wallsCG = game.physics.p2.createCollisionGroup();
	playerCG = game.physics.p2.createCollisionGroup();
	enemyCG = game.physics.p2.createCollisionGroup();
	goalCG = game.physics.p2.createCollisionGroup();
	bounceCG = game.physics.p2.createCollisionGroup();

	walls = game.physics.p2.convertCollisionObjects(map, "collision", true);
	enemys = game.physics.p2.convertCollisionObjects(map, "enemy", true);
	bounces = game.physics.p2.convertCollisionObjects(map, "bounce", false) || null;

 	startPoint = game.physics.p2.convertCollisionObjects(map, 'start')[0];
 	goalPoint = game.physics.p2.convertCollisionObjects(map, 'goal')[0];

	for(var wall in walls) {
	    walls[wall].setCollisionGroup(wallsCG);
	    walls[wall].collides(playerCG);
	}
	for(var enemy in enemys) {
	    enemys[enemy].setCollisionGroup(enemyCG);
	    enemys[enemy].collides(playerCG);
	}
	for(var bounce in bounces) {
	    bounces[bounce].setCollisionGroup(bounceCG);
	    bounces[bounce].collides(playerCG);
	}

	// INIT PLAYER And Fly
	createPlayerAndFly()
}

function createPlayerAndFly(){
    player = game.add.sprite(133, 100, 'frog');
    player.inputEnabled = true;
    game.physics.p2.enable(player, true);
    player.body.setCircle(28);
	player.body.damping = 0.7;
	player.body.x = startPoint.x;
	player.body.y = startPoint.y;
	player.body.collideWorldBounds = false;
    player.body.setCollisionGroup(playerCG);
    player.body.collides(enemyCG, die, this);
    player.body.collides(wallsCG, stickToIt);
    player.body.collides(goalCG, nextLevel);
    player.body.collides(bounceCG, function(){c.l("bounce");});

    // INIT GOALFLY
    goalFly = game.add.sprite(133, 56, 'fly');
    game.physics.p2.enable(goalFly);
	goalFly.body.setCollisionGroup(goalCG);
	goalFly.body.collides(playerCG);
	goalFly.body.setZeroVelocity();
	goalFly.body.static = true;

	goalFly.body.x = goalPoint.x;
	goalFly.body.y = goalPoint.y;

    goalFly.animations.add('flying', [0,1,2,3,4], 30, true);
    goalFly.play("flying");

	// PLAYER ANIMATIONS
    jump = player.animations.add('jump', [9,0,1,2,3], 10, false);
    landing = player.animations.add('landing', [9, 10], 10, false);
    player.animations.add('turn', [10], 2, true);
    fly = player.animations.add('fly', [4], 10, true);

	landing.onComplete.add(function(){ player.play("sit"); }, this);
	jump.onComplete.add(function() { player.play("fly"); }, this);

	game.camera.follow(player);
	player.events.onInputDown.add(startJump, this);
	window.addEventListener('mouseup', function(e){
		game.focusGain(e);
	});

}


function launch() {
	flying = true;
	jumps--;
	setJumps();
	game.physics.p2.gravity.y = 600;
	diffX = game.input.worldX - player.x;
	diffY = game.input.worldY - player.y;

	if (diffY > 0){ diffY = 0; }

	veloX = diffX * 1.2;
	veloY = diffY * 3;

	if (diffX > 0) {	// jump right
		if (player.scale.x < 0){ player.scale.x *= -1; }
		player.body.velocity.x = veloX;
		player.body.velocity.y = veloY;
	} else if (diffX < 0){			// jump left
		if (player.scale.x > 0){ player.scale.x *= -1; }
		player.body.velocity.x = veloX;
		player.body.velocity.y = veloY;
	}
}


flyAniCntX= 0;
flyAniCntY= 0;
function update() {
	// no gravity hack ....
	flyAniCntX += 0.075;
	flyAniCntY += 0.125;
    goalFly.body.x += Math.sin(flyAniCntX)*7;
    goalFly.body.y += Math.sin(flyAniCntY)*10;
}


var bgLoader,nextLevelLoader;


var nextLevel = function () {
	levelMapState++;
	setLevelValues();
	saveLevelData();
	level = levelMap[levelMapState];
	function showEndStats(){
		setTimeout(function(){
			setNewLevelObjects();
			hideStats();
		}, 2000);
	}
	showEndStats()

	function setNewLevelObjects(){
		setLevel(level);
		map.destroy();
		bg.destroy();
		player.destroy();
		goalFly.destroy();

		setStartTime();

		bg = game.add.image(0, 0, "bg"+level);

		map = game.add.tilemap('tilemap'+level);

		for(var wall in walls) { walls[wall].removeFromWorld() }
		for(var enemy in enemys) { enemys[enemy].removeFromWorld() }
		for(var bounce in bounces) { bounces[bounce].removeFromWorld() }

		createPlayerAndFly();

		walls = game.physics.p2.convertCollisionObjects(map, "collision", true);
		enemys = game.physics.p2.convertCollisionObjects(map, "enemy", true);
		bounces = game.physics.p2.convertCollisionObjects(map, "bounce", false) || null;

		startPoint = game.physics.p2.convertCollisionObjects(map, 'start')[0];
		goalPoint = game.physics.p2.convertCollisionObjects(map, 'goal')[0];

		for(var wall in walls) {
		    walls[wall].setCollisionGroup(wallsCG);
		    walls[wall].collides(playerCG);
		}
		for(var enemy in enemys) {
		    enemys[enemy].setCollisionGroup(enemyCG);
		    enemys[enemy].collides(playerCG);
		}
		for(var bounce in bounces) {
		    bounces[bounce].setCollisionGroup(bounceCG);
		    bounces[bounce].collides(playerCG);
		}

		player.body.x = startPoint.x;
		player.body.y = startPoint.y;

		goalFly.body.x = goalPoint.x;
		goalFly.body.y = goalPoint.y;

		game.physics.p2.gravity.y = 600;

	}
}

// get levelData+user highscore+playedlevels+timeneeded

storrageId = "froggystyleHighscore"

levelData = JSON.parse(localStorage.getItem(storrageId)) || null
if (!levelData){ loadXMLDoc("levelData.json"); } else { gameStart();}

function loadXMLDoc(file){
	if (window.XMLHttpRequest){ xmlhttp=new XMLHttpRequest(); } else { xmlhttp=new ActiveXObject("Microsoft.XMLHTTP"); }
	xmlhttp.onreadystatechange=function(){
	  if (xmlhttp.readyState==4 && xmlhttp.status==200) {
	    	levelData = xmlhttp.responseText;
	    	levelData = JSON.parse(levelData);
	    	gameStart();
	  }
	}
	xmlhttp.open("GET", file, true);
	xmlhttp.send();
}

// start game

function gameStart(){
	game = new Phaser.Game(1024, 768, Phaser.CANVAS, 'froggystyle', { preload: preload, create: create, update: update });

}

// save user data
function saveLevelData() { c.l("saveIt");localStorage.setItem(storrageId, JSON.stringify(levelData)); }
