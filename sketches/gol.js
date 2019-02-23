/*

Done! The CSS isn't as pretty as I had hoped but it does the job. Any feedback on code readability would be great,
I kind of rushed through the end of it to get it "done" but I definitely want to come back to it and optimize it
a bit more.

*/

var canvas;
var grid;
var sizeInput, sizeInputBtn, newSize;
var speedInput, speedInputBtn;

var speed, step;
var menuOffset = 50, infoOffset = 50;

var play;

function preload() {
	pauseIcon = loadImage("https://image.flaticon.com/icons/svg/94/94891.svg");
	shuffleIcon = loadImage("https://image.flaticon.com/icons/svg/159/159657.svg");
}

function setup () {
	infoOffset = height-50;
	speed = 10;
	step = 0;
	
	numberAlive = 0;
	generations = 0;
	gridColor = color(200, 200, 0, 255);
	infoColor = color(200, 200, 0, 100);

	canvas = createCanvas(400 + menuOffset, 400 + infoOffset);
	gridSize = 20;
	grid = new Grid(gridSize);
	grid.randomize();
	
	sizeInput = createInput(gridSize.toString());
	sizeInputBtn = createButton('size');
	sizeInputBtn.mousePressed(changeGridSize);
	

	speedInput = createInput(speed.toString());
	speedInputBtn = createButton('speed');
	speedInputBtn.mousePressed(changeSpeed);
	
	buttons = [];
	buttons.push(new Button("pause", pauseIcon, width - menuOffset/2, 30));
	buttons.push(new Button("shuffle", shuffleIcon, width - menuOffset/2, 70));
	
	play = true;

	canvas.class('canvas');
	canvas.parent('sketch-holder');
	sizeInput.class('inputs');
	sizeInput.parent('input-holder1');
	sizeInputBtn.class('button');
	sizeInputBtn.parent('input-holder1');
	speedInput.class('inputs');
	speedInput.parent('input-holder2');
	speedInputBtn.class('button');
	speedInputBtn.parent('input-holder2');
	
	print("What was the most challenging part of adding your customizations?: ");
	print("~~ Hands down the CSS. It's such a vast topic that I got overwhelmed at first trying to figure out the most basic way to lay the project out.");
	print("How much did you push yourself outside of your comfort zone?");
	print("~~ In terms of the HTML/CSS, a lot... in terms of the actual logic I could have gone further. I did some " + 
	"research about optimizing the Game of Life because I noticed the really small cell sizes took up a LOT of " + 
	"processing power- if I tried to accomplish something with that, that definitely would have been outside of my comfort zone.");
	print("Would you be happy or embarrassed to add this project to your portfolio? Why?");
	print("~~ Happy: this is my first full project using HTML/CSS/JS that can easily be revisited and iterated on! " +
	"It would be neat to try to put this on a \"for fun\" portfolio website using the things I've been learning with MVC.");
}

function draw () {
	background(250);
	
	if (play) {
		step++;
		if(step % speed === 0){
			grid.updateNeighborCounts();
			grid.updatePopulation();
		}
	}
	grid.draw();
	
	// info rectangle
	push();
	fill(infoColor);
	rectMode(CENTER);
	rect(width/2, height-((height - infoOffset)/2), width, (height - infoOffset), 5);
	pop();
	
	// grid information
	fill(0);
	textAlign(LEFT, CENTER);
	textSize(17);
	textFont('Source Sans Pro');
	infoOffset = grid.numberOfRows*grid.cellSize;
	text("Number of cells alive: " + numberAlive.toString(), 10, infoOffset + 17);
	text("Generations occured: " + generations.toString(), 10, infoOffset + 37);

	// diplaying buttons
	for (var i = 0; i < buttons.length; i++) {
		buttons[i].show();
	}


}

function mousePressed() {
	for (var i = 0; i < buttons.length; i++) {
		if (buttons[i].clicked(mouseX, mouseY) == "shuffle") {
			grid.randomize();
			if (!play) {
				play = true;
			}
		} else if (buttons[i].clicked(mouseX, mouseY) == "pause") {
			play = !play;
		}
	}
}

function changeGridSize() {
	newSize = parseInt(sizeInput.value());
	grid = null;
	grid = new Grid(newSize);
	grid.randomize();
}

function changeSpeed() {
	speed = parseInt(speedInput.value());
}

class Grid {
	constructor (cellSize) {
		// update the contructor to take cellSize as a parameter
		this.cellSize = cellSize;
		// use cellSize to calculate and assign values for numberOfColumns and numberOfRows
		this.numberOfColumns = floor((width - 50)/this.cellSize);
		this.numberOfRows = floor((height - 50)/this.cellSize);
		this.cells = new Array(this.numberOfColumns);
		
		for (var i = 0; i < this.cells.length; i++){
			this.cells[i] = new Array(this.numberOfRows);
		}
		
		for (var column = 0; column < this.numberOfColumns; column ++) {
			for (var row = 0; row < this.numberOfRows; row++) {
				this.cells[column][row] = new Cell(column, row, cellSize);
			}
		}
	}

	draw () {
		// numberAlive = 0;
		for (var column = 0; column < this.numberOfColumns; column++) {
			for (var row = 0; row < this.numberOfRows; row++) {
				if(this.cells[column][row].isAlive) {
					fill(gridColor);
				} else {
					fill(230); 
				}
				noStroke();
				rectMode(CORNER);
				rect(column * this.cellSize + 1, row * this.cellSize + 1, this.cellSize - 1, this.cellSize - 1);
			}
		}
	}
  
	randomize(){
		for (var column = 0; column < this.numberOfColumns; column++) {
			for (var row = 0; row < this.numberOfRows; row++) {
				this.cells[column][row].setIsAlive(floor(random(0, 2)));
			}
		}
	}
	
	updatePopulation() {
		numberAlive = 0;
		for (var column = 0; column < this.numberOfColumns; column++) {
			for (var row = 0; row < this.numberOfRows; row++) {
				this.cells[column][row].liveOrDie();
			}
		}
		generations++;
		// print(generations);
		// print(numberAlive);
	}
	
	isValidPosition (column, row) {
		if(column < 0 || column >= this.numberOfColumns || row < 0 || row >= this.numberOfRows) {
			return false;
		} else {
			return true;
		}
	}
	
	getNeighbors(currentCell) {
		var neighbors = [];
		
		for (var xOffset = -1; xOffset <= 1; xOffset++) {
			for (var yOffset = -1; yOffset <= 1; yOffset++) {
				var neighborColumn = currentCell.column + xOffset;
				var neighborRow = currentCell.row + yOffset;
				
				// do something with neighborColumn and neighborRow
				if(xOffset !== 0 || yOffset !== 0) {
					if (this.isValidPosition(neighborColumn, neighborRow)) {
						//if(this.cells[neighborColumn][neighborRow].isAlive){
							neighbors.push(this.cells[neighborColumn][neighborRow]);
						//}
					}
				}
			}
		}
		
		return neighbors;
	}
	
	updateNeighborCounts() {
		for (var column = 0; column < this.numberOfColumns; column ++) {
			for (var row = 0; row < this.numberOfRows; row++) {
				var currentCell = this.cells[column][row];
				var currentCellNeighbors = this.getNeighbors(currentCell);
				currentCell.liveNeighborCount = 0;
				
				for(var i = 0; i < currentCellNeighbors.length; i++) {
					if (currentCellNeighbors[i].isAlive){
						currentCell.liveNeighborCount++;
					}
				}
			}
		}
	}
}

class Cell {
	constructor(column, row, size) {
		this.column = column;
		this.row = row;
		this.size = size;
		this.isAlive = false;
		this.liveNeighborCount = 0;
	}
	
	setIsAlive(value){
		if(value == 1){
			this.isAlive = true;
		} else {
			this.isAlive = false;
		}
	}
	
	liveOrDie() {
		if(this.isAlive && this.liveNeighborCount < 2){
			this.isAlive = false;
		} else if(this.isAlive && this.liveNeighborCount == 2 || this.liveNeighborCount == 3) {
			this.isAlive = true;
			numberAlive++;
		} else if(this.isAlive && this.liveNeighborCount > 3) {
			this.isAlive = false;
		} else if(!this.isAlive && this.liveNeighborCount == 3) {
			this.isAlive = true;
			numberAlive++;
		}
	}
}

class Button {
	constructor(n, image, x, y) {
		this.icon = image;
		this.size = 30;
		this.x = x;
		this.y = y;
		this.name = n;
	}
	
	show(){
		imageMode(CENTER);
		image(this.icon, this.x, this.y, this.size, this.size);
	}
	
	clicked(mX, mY) {
		if (mX < this.x + this.size/2 && 
			mX > this.x - this.size/2 && 
			mY < this.y + this.size/2 && 
			mY > this.y - this.size/2){
			return(this.name);
			}
	}
}
