		var OptionPanel = function(){
            //Declaring variables----------------------------------------------------------
            "use strict";
            this.difficultyInfo = document.getElementById("difficultyInfo");
            this.difficulty = document.getElementById("difficulty");
            this.numberOfFood = document.getElementById("numberOfFood");
            this.quantity = document.getElementById("quantity");
            this.modeInfo = document.getElementById("modeInfo");
            this.mode = document.getElementById("mode");
            this.confirmButton = document.getElementById("confirm");
            this.startButton = document.getElementById("start");
            this.stopButton = document.getElementById("stop");
            this.resetButton = document.getElementById("reset");
            this.error = document.getElementById("error");
            var self = this;
            //Declaring methods-------------------------------------------------------------
            this.hideOptions = function(){
            	this.difficultyInfo.style.visibility = "hidden";
            	this.difficulty.style.visibility = "hidden";
            	this.numberOfFood.style.visibility = "hidden";
            	this.quantity.style.visibility = "hidden";
                this.modeInfo.style.visibility = "hidden";
                this.mode.style.visibility = "hidden";
                this.confirmButton.style.visibility = "hidden";
            };
            this.hideControls = function(){
                this.startButton.style.visibility = "hidden";
                this.stopButton.style.visibility = "hidden";
                this.resetButton.style.visibility = "hidden";
            };
            this.displayOptions = function(){
            	this.difficultyInfo.style.visibility = "visible";
            	this.difficulty.style.visibility = "visible";
            	this.numberOfFood.style.visibility = "visible";
            	this.quantity.style.visibility = "visible";
                this.modeInfo.style.visibility = "visible";
                this.mode.style.visibility = "visible";
                this.confirmButton.style.visibility = "visible";
            };
            this.displayControls = function(){
                this.startButton.style.visibility = "visible";
                this.stopButton.style.visibility = "visible";
                this.resetButton.style.visibility = "visible";
            };
            this.optionsToControls = function(){
                self.hideOptions();
                self.displayControls();
            };
            this.controlsToOptions = function(){
                self.hideControls();
                self.displayOptions();
            };
            this.checkData = function(){
            	return (this.difficulty.selectedIndex !== -1 &&
            			this.quantity.selectedIndex !==-1 && 
            			this.mode.selectedIndex !==-1);
            }
            //Adding eventListeners to buttons------------------------------------------------
            this.confirmButton.onclick = function(){
            	if(self.checkData()){
            		gameState.setDifficulty(parseInt(self.difficulty.value));
            		gameState.setMode(parseInt(self.mode.value));
            		gameState.setNumberOfFood(parseInt(self.quantity.value));
            		self.optionsToControls();
            		self.error.style.visibility = "hidden";
            	}
            	else{
            		this.error.style.visibility = "visible";
            	}
            };
            this.startButton.onclick = function(){
                gameEngine.startGame(gameState,gameBoard);
                console.log("Start");
            };
            this.stopButton.onclick = function(){
				gameEngine.stopGame(gameState);
                console.log("Stop");
            };
            this.resetButton.onclick = function(){
				gameEngine.resetGame();
                console.log("Restart");
                self.controlsToOptions();
            };
            //Initializing first state------------------------------------------------------------
            this.error.style.visibility = "hidden";
            this.hideControls();
            this.displayOptions();
        };
        var GameBoard = function(){
            //Declaring variables and objects-------------------------------------------------------
            "use strict";
            this.scorePanel = {
                x:0,
                y:600,
                width:600,
                height:40,
                sentence:"Score:"
            };
            this.context = document.getElementById('myCanvas').getContext("2d");
            //Declaring methods---------------------------------------------------------------------
            this.fillField = function(i,j,color){
                this.context.fillStyle = color;
                this.context.fillRect(j*15,i*15,15,15);
            };
            this.clearField = function(i,j){
                this.context.clearRect(j*15,i*15,15,15);
            };
            this.updateBoard = function(clear,fill){
                for(var i=0;i<clear.length;i++){
                    this.clearField(clear[i].row,clear[i].col);
                }
                for(var i=0;i<fill.length;i++){
                    this.fillField(fill[i].row,fill[i].col,fill[i].color);
                }
            };
            this.clearBoard = function(){
                this.context.clearRect(0,0,600,600);
            };
            this.youLooseMessege = function(){
                this.context.fillStyle = "red";
                this.context.font="50px Times New Roman";
                this.context.fillText("You lost.",200,200);
            };
            this.displayScorePanel = function(){
                this.context.fillStyle="rgb(0,0,0)";
                this.context.font = "30px Times New Roman";
                this.context.strokeRect(this.scorePanel.x,
                                        this.scorePanel.y,
                                        this.scorePanel.width,
                                        this.scorePanel.height);
                this.context.fillText(this.scorePanel.sentence, this.scorePanel.x+200, this.scorePanel.y+30);
            };
            this.clearScorePanel = function(){
                this.context.clearRect(this.scorePanel.x,
                                        this.scorePanel.y,
                                        this.scorePanel.width,
                                        this.scorePanel.height);
            };
            this.updateScore = function(score){
                this.scorePanel.sentence = "Score:"+String(score);
                this.clearScorePanel();
                this.displayScorePanel();
            };
            this.resetScore = function(){
                this.scorePanel.sentence = "Score:0";
                this.clearScorePanel();
                this.displayScorePanel();
            }
        };
        var GameState = function(){
            //Declaring variables and objects--------------------------------------------------
            "use strict";
            this.difficulty;//0-easy, 1-medium, 2-hard
            this.mode = 0;//0-moveless, 1-moving
            this.quantityOfFood = 0;
            this.board = new Array(40);
            this.score = 0;
            this.gameStarted = false;
			this.timer;
            this.snake = {
                //0-left,1-up,2-right,3-down
                direction:0,
                nextDirection:0,
                body:[{col:15,row:15},{col:14,row:15}],
                first:{col:14,row:15},
                last:{col:15,row:15},
                speed:0, //number of fields for 50ms
                progressInMove:0,
                growLeft:0,
                color:"green"
            };
            this.foods=[];
            //Declaring methods---------------------------------------------------------------
            this.setDifficulty = function(difficulty){
                this.difficulty = difficulty;
                if(this.difficulty===0){//setting snake speed depending on mode
                    this.snake.speed = 0.25;
                }
                else if(this.difficulty===1){
                    this.snake.speed = 0.5;
                }
                else{
                    this.snake.speed = 1;
                }
            };
            this.setMode = function(mode){
            	console.log(this.mode);
            	this.mode = mode;
            	if(this.mode===1){
	            	for(var i=0;i<this.foods;i++){
	            		this.foods[i].speed = this.snake.speed/2;
	            	}
            	}
            };
            this.setNumberOfFood = function(quantity){
            	this.quantityOfFood = quantity;
            	for(var i=0;i<quantity;i++){
            		this.foods.push({
                        			col:0,
                        			row:0,
                        			color:"red",
                        			progressInMove:0,
                        			speed:0,
                        			direction:0
                        			});
            	}
            };
            this.cleanBoard = function(){
                for(var i=0;i<this.board.length;i++){
                    for(var j=0;j<this.board.length;j++){
                        this.board[i][j]=0;
                    }
                }
            }
            //Initializing first state-------------------------------------------------------
            for(var i=0;i<this.board.length;i++){
                this.board[i]=new Array(this.board.length);
            }
            this.cleanBoard(); //setting all board fields to 0
        };
        var GameEngine = function(){
			//Set of methods responsible for games logic
            "use strict";
            this.checkCollisions = function(position,gameState){
                if((position.col < 0)|| //collisions with walls
               (position.row < 0)||
               (position.col > 39)||
               (position.row > 39)){
                    return true;
                }
                if(gameState.board[position.row][position.col] === 1){
                    return true;
                }
                return false;
            };
            this.getNextPosition = function(direction, object){
                switch(direction){
                    case 0:
                        return {col:object.col-1,row:object.row};
                    case 1:
                        return {col:object.col,row:object.row-1};
                    case 2:
                        return {col:object.col+1,row:object.row};
                    case 3:
                        return {col:object.col,row:object.row+1};
                }
            };
            this.startGame = function(gameState,timer){
            	if(gameState.gameStarted===false){
	            	for(var i=0;i<gameState.foods.length;i++){
		            	this.drawFoodPosition(gameState.board,gameState.foods[i],gameBoard);
		            	gameState.board[gameState.foods[i].row][gameState.foods[i].col]=2
		            }
	            	gameState.gameStarted=true;
					gameBoard.updateBoard([],[{col:gameState.snake.col,
												row:gameState.snake.row,
												color:gameState.snake.color}]
												.concat(gameState.foods
												.map(function(x){return {
													col:x.col,
													row:x.row,
													color:x.color
												}})));
					gameState.board[gameState.snake.first.row][gameState.snake.first.col]=1;
		            gameState.board[gameState.snake.last.row][gameState.snake.last.row]=1;
	            }
            	gameState.gameStarted=true;
				gameState.timer = setInterval(game,50);
			};
			this.gameFailed = function(gameState,gameBoard){
                clearInterval(gameState.timer);
                gameState.gameStarted = false;
                gameBoard.youLooseMessege();
            };
            this.resetGame = function(){ //This is bad but it operates on global variables
				clearInterval(gameState.timer);
                gameState.gameStarted = false;
                gameState = new GameState();
                gameBoard.clearBoard();
                gameBoard.resetScore();
                gameState.score = 0;
			};
			this.stopGame = function(gameState){
                clearInterval(gameState.timer);
			};
			this.drawFoodPosition = function(board,food){
	            var position = {col:Math.floor(Math.random()*40),row:Math.floor(Math.random()*40)},
	            empty = true;
	            while(true){
	            	empty = true;
	                if(gameState.board[position.row][position.col]!=0){
	                    empty = false;
	                    position = {col:Math.floor(Math.random()*40),row:Math.floor(Math.random()*40)};
	                }
					console.log(gameState.board[position.row][position.col]);
	                if(empty){break;}
	            }
	            gameState.board[position.row][position.col]=2;
	            food.col = position.col;
	            food.row = position.row;
            }
            this.updateSnakeDirection = function(snake){
                if(Math.abs(snake.nextDirection-snake.direction)!==2){
                    snake.direction = snake.nextDirection;
                }
            };
            this.moveForward = function(objects){
            	for(var i=0;i<objects.length;i++){
            		objects[i].progressInMove += objects[i].speed;
            	}
            };
            this.getProperBugMoves = function(bug,gameState){
            	return [(bug.col-1>=0 && gameState.board[bug.row][bug.col-1]===0), //left,up,right,down
            		(bug.row-1>=0 && gameState.board[bug.row-1][bug.col]===0),
            		(bug.col+1<40 && gameState.board[bug.row][bug.col+1]===0),
            		(bug.row+1<40 && gameState.board[bug.row+1][bug.col]===0)];
            	
            };
            this.chooseBugsDirection = function(gameState){
            	var moves;
            	for(var i=0;i<gameState.foods.length;i++){
            		if(gameState.mode===1){
            			gameState.foods[i].speed = gameState.snake.speed/2;
            		}
            		moves = this.getProperBugMoves(gameState.foods[i],gameState);
            		if(gameState.snake.first.col <= gameState.foods[i].col && moves[2]===true){
            			gameState.foods[i].direction = 2;
            		}
            		else if(gameState.snake.first.col >= gameState.foods[i].col && moves[0]===true){
            			gameState.foods[i].direction = 0;
            		}
            		else if(gameState.snake.first.row >= gameState.foods[i].row && moves[1]===true){
            			gameState.foods[i].direction = 1;
            		}
            		else if(gameState.snake.first.row <= gameState.foods[i].row && moves[3]===true){
            			gameState.foods[i].direction = 3;
            		}
            		else{
            			gameState.foods[i].speed = 0;
            		}
            	}
            };
        };
        //global function executed by game timer
		function game(){
			var fieldsToClear=[],
				fieldsToFill=[];
			gameEngine.chooseBugsDirection(gameState);
            gameEngine.moveForward(gameState.foods.concat([gameState.snake]));//moving forward food and snake
            if(Math.floor(gameState.snake.progressInMove)===1){ //Snake moved whole field
            	gameEngine.updateSnakeDirection(gameState.snake);
            	var nextSnakePos = gameEngine.getNextPosition(gameState.snake.direction,gameState.snake.first);
            	//Collisions
    			if(gameEngine.checkCollisions(nextSnakePos,gameState)){
                    gameEngine.gameFailed(gameState,gameBoard);
                    return false;
                }
            	if(gameState.board[nextSnakePos.row][nextSnakePos.col]===2){ //Snake ate food
            		for(var i=0;i<gameState.foods.length;i++){ //Draws new position for eaten food
            			if(gameState.foods[i].col===nextSnakePos.col && gameState.foods[i].row===nextSnakePos.row){
            				gameEngine.drawFoodPosition(gameState.board,gameState.foods[i]);
            				gameState.foods[i].progressInMove=0;
            				fieldsToFill.push({col:gameState.foods[i].col,
            								row:gameState.foods[i].row,
            								color:gameState.foods[i].color});
            			}
            		}
            		gameState.score += 10;
                    gameBoard.updateScore(gameState.score);
            		gameState.snake.growLeft++;
            	}
            	if(gameState.snake.growLeft===0){
            		fieldsToClear.push({col:gameState.snake.last.col,
            							row:gameState.snake.last.row});
            		gameState.board[gameState.snake.last.row][gameState.snake.last.col]=0;
            		gameState.snake.body.shift();
            		gameState.snake.last = gameState.snake.body[0];
            	}
            	else{
            		gameState.snake.growLeft--;
            	}
            	gameState.snake.first = nextSnakePos;
            	gameState.snake.body.push(nextSnakePos);
            	gameState.snake.progressInMove=0;
            	gameState.board[nextSnakePos.row][nextSnakePos.col]=1;
            	fieldsToFill.push({col:nextSnakePos.col,row:nextSnakePos.row,color:gameState.snake.color});
            }
            
            for(var i=0;i<gameState.foods.length;i++){
            	if(Math.floor(gameState.foods[i].progressInMove)===1){
            		var nextFoodPos = gameEngine.getNextPosition(gameState.foods[i].direction,gameState.foods[i]);
            		gameState.foods[i].progressInMove=0;
            		gameState.board[gameState.foods[i].row][gameState.foods[i].col]=0;
            		fieldsToClear.push({col:gameState.foods[i].col,
            							row:gameState.foods[i].row});
            		gameState.foods[i].row = nextFoodPos.row;
            		gameState.foods[i].col = nextFoodPos.col;
            		fieldsToFill.push({col:gameState.foods[i].col,
										row:gameState.foods[i].row,
										color:gameState.foods[i].color});
            		gameState.board[gameState.foods[i].row][gameState.foods[i].col]=2;
            	}
            }
            gameBoard.updateBoard(fieldsToClear,fieldsToFill);
        };
        //necessary global objects
		var gameBoard = new GameBoard(),
            optionPanel = new OptionPanel(),
            gameEngine = new GameEngine(),
            gameState = new GameState();
        gameBoard.displayScorePanel();
        document.addEventListener('keydown',function(evt){
            gameState.snake.nextDirection = evt.keyCode - 37;
        },false);