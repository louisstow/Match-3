var TILE = 64;
var BOARD_WIDTH = 6;
var BOARD_HEIGHT = 6;
var REAL_WIDTH = TILE * BOARD_WIDTH;
var REAL_HEIGHT = TILE * BOARD_HEIGHT;
var UI_HEIGHT = 50;

var matchPatterns = [
	
	[ [-1, 0], [-1, -1] ], //1. left up
	[ [0, -1], [-1, -1] ], //2. up left
	[ [0, -1], [ 0, -2] ], //3. up up
	[ [0, -1], [ 1, -1] ], //4. up right
	[ [1,  0], [ 1, -1] ], //5. right up
	[ [1,  0], [ 2,  0] ], //6. right right
	[ [1,  0], [ 1,  1] ], //7. right down
	[ [0,  1], [ 1,  1] ], //8. down right
	[ [0,  1], [ 0,  2] ], //9. down down
	[ [0,  1], [-1,  1] ], //10. down left
	[ [-1, 0], [-1,  1] ], //11. left down
	[ [-1, 0], [-2,  0] ], //12. left left

	[ [-1, 0], [ 0, -1] ], //13. left & up
	[ [0, -1], [ 1,  0] ], //14. up & right
	[ [1,  0], [ 0,  1] ], //14. right & down
	[ [0,  1], [-1,  0] ], //15. down & left

	[ [0, -1], [ 0,  1] ], //16. up & down
	[ [-1, 0], [ 1,  0] ]  //17. left & right
];

Match3 = {
	board: [],

	current: "nightly",

	startTile: [
		"nightly",
		"aurora",
		"firefox"
	],

	nextTile: {
		"nightly": "aurora",
		"aurora": "firefox",
		"firefox": "fxos"
	},

	generateBoard: function (onItem) {

		for (var x = 0; x < BOARD_WIDTH; ++x) {
			//populate the board array
			if (!this.board[x]) { this.board[x] = []; }

			for (var y = 0; y < BOARD_HEIGHT; ++y) {
				var randomValue = Math.random();
				var type = "empty";

				if (randomValue < 0.05) {
					type = this.startTile[2];
				} else if (randomValue < 0.1) {
					type = this.startTile[1];
				} else if (randomValue < 0.2) {
					type = this.startTile[0];
				}

				//only check for matches if not empty
				if (type !== "empty" && Match3.checkThree(x, y, type).length) {
					type = "empty";
				}
				
				this.board[x][y] = onItem.call(this, x, y, type);
			}
		}
	},

	getRelative: function (x, y, pos) {
		var newx = x + pos[0];
		var newy = y + pos[1];

		if (!this.board[newx] || !this.board[newx][newy]) {
			return undefined;
		}

		return this.board[newx][newy];
	},

	checkThree: function (x, y, tile) {
		var result = [];

		matchPatterns.forEach(function (direction) {
			
			var one = Match3.getRelative(x, y, direction[0]);
			var two = Match3.getRelative(x, y, direction[1]);

			if (one && two && one.type === tile && two.type === tile) {
				result.push({
					direction: direction,
					one: one,
					two: two
				});
			}
		});

		return result;
	},

	place: function (x, y) {
		var ent = Match3.board[x][y];

		//can only replace empty tiles
		if (ent.type !== "empty") { 
			console.log(ent, ent.type)
			return;
		}

		replaceTile(x, y, Match3.current);

		Match3.current = "nightly";
	},

	TILE: TILE,
	BOARD_WIDTH: BOARD_WIDTH,
	BOARD_HEIGHT: BOARD_HEIGHT,
	REAL_WIDTH: REAL_WIDTH,
	REAL_HEIGHT: REAL_HEIGHT,
	UI_HEIGHT: UI_HEIGHT
}



