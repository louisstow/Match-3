//entry point to the game
window.onload = start;

var stage; //ref to the main stage
var UI; //ref to the UI box
var scale = 1; //scale of the game
var score = 0; //score counter
var spritesheet; //ref to our spritesheet

//method to scale the main stage to fit window
function setScale () {
	scale = window.innerWidth / Match3.REAL_WIDTH;

	//make sure it's not bigger than the height
	if (scale * Match3.REAL_HEIGHT > window.innerHeight) {
		scale = window.innerHeight / Match3.REAL_HEIGHT;
	}

	var stageStyle = stage.canvas.style;
	stageStyle.transformOrigin = stageStyle.webkitTransformOrigin = stageStyle.mozTransformOrigin = "0 0";
	stageStyle.transform = stageStyle.webkitTransform = stageStyle.mozTransform = "scale("+scale+")";
}

//main method of game
function start () {
	//create the stage using the canvas tag with id `stage`
	stage = new createjs.Stage("stage");

	//add a listener for the mouse event on stage
	stage.addEventListener("stagemousedown", onInputSelect);

	//add a listener to the resize event for scaling
	window.addEventListener("resize", setScale, false);

	//create a spritesheet
	spritesheet =  new createjs.SpriteSheet({
		images: [ "../../assets/city.png" ],
		
		//frame size of 64x64 pixels
		frames: { width: 64, height: 64 },

		//index sprites by order going from
		//left to right, top to bottom
		animations: {
			slum: 0,
			house: 1,
			apartment: 2,
			skyscraper: 3,
			mansion: 4,
			//5
			//6
			pond: 7,
			car: 8,
			crystal: 9,
			//10
			//11
			road_s: 12,
			road_h: 13,
			road_v: 14,
			road_x: 15,
			//16
			//17
			road_e: 18,
			//19
			road_l: 20,
			road_t: 21
		}
	});

	//generate the board and create a bitmap for each
	//tile.
	Match3.generateBoard(function (x, y, type) {
		var tile = new createjs.BitmapAnimation(spritesheet);
		tile.gotoAndStop(type); //go to the frame in our spritesheet

		//set the position on the stage
		tile.x = x * Match3.TILE + 32;
		tile.y = y * Match3.TILE + 32;

		//save the board coords
		tile.col = x;
		tile.row = y;

		tile.type = type;

		//registration points offset the position
		//so we must add 32 to the position of the sprite.
		tile.regX = 32;
		tile.regY = 32;

		tile.rotation = 0;

		//add to main stage
		stage.addChild(tile);

		//save in the board structure
		return tile;
	});

	//generate roads
	Match3.generateRoads(function (tile, type, rotation) {
		//simply change the animation frame to
		//the road type.
		tile.gotoAndStop("road_" + type);
		
		//then set the rotation
		tile.rotation = rotation;
	});

	//draw the UI bar at the bottom of the screen
	UI = new createjs.Shape();
	UI.graphics.beginFill("#177407").drawRect(
		0, 
		Match3.REAL_HEIGHT - Match3.UI_HEIGHT, 
		Match3.REAL_WIDTH, 
		Match3.UI_HEIGHT
	);

	//create some UI widgets and position 
	//them absolutely
	var labelNext = new createjs.Text("Next item", "18px Arial", "#fff")
	labelNext.x = 10;
	labelNext.y = Match3.REAL_HEIGHT - 35;

	var labelScore = new createjs.Text("Score", "18px Arial", "#fff");
	labelScore.x = 220;
	labelScore.y = Match3.REAL_HEIGHT - 35;

	UI.scoreText = new createjs.Text("0", "18px Georgia", "#fff");
	UI.scoreText.x = 280;
	UI.scoreText.y = Match3.REAL_HEIGHT - 37;

	UI.iconNext = new createjs.BitmapAnimation(spritesheet);
	UI.iconNext.x = 90;
	UI.iconNext.y = Match3.REAL_HEIGHT - 48
	UI.iconNext.scaleX = 0.7; //make the icon slightly smaller
	UI.iconNext.scaleY = 0.7; //than 64x64

	//default to the first tile
	UI.iconNext.gotoAndStop("slum");

	//add all the widgets to the main stage
	stage.addChild(UI);
	stage.addChild(labelNext);
	stage.addChild(labelScore);
	stage.addChild(UI.scoreText);
	stage.addChild(UI.iconNext);

	setScale();
}

//handler for input events
function onInputSelect (e) {
	//need to use e.nativeEvent to get
	//position of input. convert input 
	//to board position.
	var x = Math.floor((e.nativeEvent.clientX / scale) / Match3.TILE);
	var y = Math.floor((e.nativeEvent.clientY / scale) / Match3.TILE);
	
	//place a tile.
	Match3.place(x, y);
}

//listen to tick events and call our tick() method
createjs.Ticker.addEventListener("tick", tick);
//flag to use requestAnimationFrame for smoother animations
createjs.Ticker.useRAF = true;
//set our FPS to something standard like 60fps
createjs.Ticker.setFPS(60);

//handler to the tick event
function tick () {
	//redraw the stage
	stage.update();
}

//helper method to shake a DisplayObject
function startShake (entity) {
	//store the current position
	var oldX = entity.x;
	var oldY = entity.y;

	//on tick handler
	var onTick = function () {
		entity.x = oldX + Math.round(Math.random() * 10 - 5);
		entity.y = oldY + Math.round(Math.random() * 10 - 5)
	}

	//listen to tick and randomize the position
	createjs.Ticker.addEventListener("tick", onTick);

	//when the shaking animation is over
	setTimeout(function () {
		//remove the listener to tick
		createjs.Ticker.removeEventListener("tick", onTick);

		//reset position back to original
		entity.x = oldX;
		entity.y = oldY;
	}, 800);
}

//Handler for game over state
Match3.onGameOver = function () {
	//create the white overlay rectangle
	var shape = new createjs.Shape();
	shape.graphics.beginFill("#fff").drawRect(
		50, 
		50, 
		Match3.REAL_WIDTH - 100, 
		Match3.REAL_HEIGHT - 150
	);

	shape.alpha = 0.9;
	stage.addChild(shape);

	//GAME OVER heading
	var text = new createjs.Text("GAME OVER", "30px Arial", "#000");
	text.x = 100;
	text.y = 90;
	stage.addChild(text);

	//Score: x
	var scoreText = new createjs.Text("Score: " + score, "20px Georgia", "#666");
	scoreText.x = 100;
	scoreText.y = 150;
	stage.addChild(scoreText);

	//Tap to play again 
	var helpText = new createjs.Text("Tap to play again", "18px Arial", "#aaa");
	helpText.x = 120;
	helpText.y = 240;
	stage.addChild(helpText);

	//reload the page for replaying the game
	stage.addEventListener("stagemousedown", function () {
		window.location.reload();
	});
}

//handler for updating the icon
Match3.onNextItem = function (item) {
	//simply change the animation frame
	UI.iconNext.gotoAndStop(item);
};

//handler for when the blocker is placed
Match3.onBlocker = function (x, y) {
	//similar to creating a tile
	var tile = new createjs.BitmapAnimation(spritesheet);
	tile.gotoAndStop("car");
	tile.x = x * Match3.TILE;
	tile.y = y * Match3.TILE;
	tile.col = x;
	tile.row = y;
	tile.type = "car";

	stage.addChild(tile);

	return tile;
}

//animate the blocker (car) using the TweenJS library.
Match3.onMoveBlocker = function (car, x, y) {
	createjs.Tween.get(car).to({
		x: x * Match3.TILE,
		y: y * Match3.TILE
	}, 800);

	car.row = y;
	car.col = x;
}

//Handler for replacing a tile
Match3.onReplaceTile = function (x, y, tile) {
	//get reference to the current tile and
	//replace it.
	var ent = Match3.board[x][y];
	ent.type = tile;
	ent.gotoAndStop(tile);
	ent.rotation = 0;

	//check for any matches after placement
	var matches = Match3.checkThree(x, y, tile);

	//update score
	score += Match3.scores[tile];
	UI.scoreText.text = score;

	if (matches.length) {
		//remove each tile
		matches.forEach(function (match) {
			//decrease the score
			var decreaseScore = Match3.scores[match.one.type] + Match3.scores[match.two.type];
			score -= decreaseScore;
			UI.scoreText.text = score;

			//if placing crystal, replace with match
			if (tile === "crystal")
				tile = match.one.type;

			match.one.type = match.two.type = "empty";
		});
		
		//start the shake effect
		startShake(ent);

		setTimeout(function () {
			//replace with the next tile
			ent.type = Match3.nextTile[tile];
			ent.gotoAndStop(ent.type);

			Match3.onReplaceTile(x, y, ent.type);
		}, 800);
	}

	//regenerate the roads
	Match3.generateRoads(function (tile, type, rotation) {
		tile.gotoAndStop("road_" + type);
		tile.rotation = rotation;
	});
}