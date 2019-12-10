import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { ButtonToolbar, Dropdown, DropdownButton } from 'react-bootstrap';

// box class
class Box extends React.Component {
	// select function to determine if box will be on or off
	selectBox = () => {
		this.props.selectBox(this.props.row, this.props.col);
	}

	render() {
		return (
			<div className={this.props.boxClass} id={this.props.boxId} row={this.props.row} col={this.props.col} onClick={this.selectBox} />
		);
	}

}

class Grid extends React.Component {
	render() {
		// set the width of the wrapper
		const width = (this.props.cols * 14);
		// empty arr for box data
		var rowsArr = [];

		// empty box
		var boxClass = " ";

		for (var i = 0; i < this.props.rows; i++) {
			for (var j = 0; j < this.props.cols; j++) {
				// set boxId
				let boxId = i + "_" + j;
				// set boxClass
				boxClass = this.props.gridFull[i][j] ? "box on" : "box off";
				// push item to rowsArr
				rowsArr.push(
					<Box boxClass={boxClass} key={boxId} boxId={boxId} row={i} col={j} selectBox={this.props.selectBox} />
				);
			}
		}

		return (
			// display the grid
			<div className="grid" style={{width: width}}> {rowsArr} </div>
		);
	}
}

class Buttons extends React.Component {
	// update grid size based on user
	handleSelect = (evt) => {
		this.props.gridSize(evt);
	}

	// display buttons and dropdown using react-bootstrap
	render() {
		return(
			<div className="center">
				<ButtonToolbar>
					<button className="btn btn-default" onClick={this.props.playButton}>
						Play
					</button>
					<button className="btn btn-default" onClick={this.props.pauseButton}>
					  Pause
					</button>
					<button className="btn btn-default" onClick={this.props.clear}>
					  Clear
					</button>
					<button className="btn btn-default" onClick={this.props.slow}>
					  Slow
					</button>
					<button className="btn btn-default" onClick={this.props.fast}>
					  Fast
					</button>
					<button className="btn btn-default" onClick={this.props.seed}>
					  Seed
					</button>
						<DropdownButton
							title="Grid Size"
							id="size-menu"
							onSelect={this.handleSelect}
							variant="default"
						>
							<Dropdown.Item eventKey="1">20x10</Dropdown.Item>
							<Dropdown.Item eventKey="2">50x30</Dropdown.Item>
							<Dropdown.Item eventKey="3">70x50</Dropdown.Item>
						</DropdownButton>
				</ButtonToolbar>
			</div>
		);
	}
}

class Main extends React.Component {
	// 1: CONSTRUCTOR
	// 2: SELECT BOX
	// 3: SEED
	// 4: PLAY BUTTON
	// 5: PAUSE BUTTON
	// 6: SLOW DOWN THE GAME
	// 7: SPEED UP THE GAME
	// 8: CLEAR THE BOARD
	// 9: ADJUST THE GRID SIZE
	// 10:PLAY THE GAME
	// 11: COMPONENT MOUNTED
	// 12: RENDER

	// 1: CONSTRUCTOR
	constructor() {
		super();
		// game speed
		this.speed = 100;
		// game rows
		this.rows = 30;
		// colums
		this.cols = 50;

		// set the state of Main Component
		this.state = {
			generation: 0,
			gridFull: Array(this.rows).fill().map(() => Array(this.cols).fill(false))
		}
	}
	// 2: SELECT BOX
	selectBox = (row, col) => {
		// make a copy of the grid
		let gridCopy = arrayClone(this.state.gridFull);
		// set gridCopy[row][col] to value of !gridCopy[row][col];
		gridCopy[row][col] = !gridCopy[row][col];
		// update the state of gridFull
		this.setState({
			gridFull: gridCopy
		});
	}

	// 3: SEED
	seed = () => {
		// store the cloned copy
		let gridCopy = arrayClone(this.state.gridFull);
		for (var i = 0; i < this.rows; i++) {
			for (var j = 0; j < this.cols; j++) {
				// each box has a 1/4 chance of being seeding
				if(Math.floor(Math.random() * 4) === 1) {
					// if true updatde box value to true
					gridCopy[i][j] = true;
				}
			}
		}
		// update the state of the grid
		this.setState({
			gridFull: gridCopy
		});
	}

	// 4: PLAY BUTTON
	playButton = () => {
		clearInterval(this.intervalId);
		this.intervalId = setInterval(this.play, this.speed);
	}

	// 5: PAUSE BUTTON
	pauseButton = () => {
		clearInterval(this.intervalId);
	}

	// 6: SLOW DOWN THE GAME
	slow = () => {
		this.speed = 1000;
		this.playButton();
	}

	
	fast = () => {
		this.speed = 100;
		this.playButton();
	}

	// 8: CLEAR THE BOARD
	clear = () => {
		// update each box to be "box off"
		var grid = Array(this.rows).fill().map(() => Array(this.cols).fill(false));
		// update the state
		this.setState({
			gridFull: grid,
			generation: 0
		});
	}
	
	// 9: ADJUST THE GRID SIZE
	gridSize = (size) => {
		// modifiy grid size based on what the user selects 
		switch (size) {
			case "1": 
				this.cols = 20;
				this.rows = 10;
			break;
			case "2": 
				this.cols = 50;
				this.rows = 30;
			break;
			default: 
				this.cols = 70;
				this.rows = 50;
		}
		this.clear();
	}
	
	// 10:PLAY THE GAME
	play = () => {
		// create 2 copies of the grid so the 2nd can be modified based on the first
		let g = this.state.gridFull;
		let g2 = arrayClone(this.state.gridFull);

		// logic for game rules:
		// 1. Any live cell with fewer than two live neighbours dies, as if by underpopulation.
		// 2. Any live cell with two or three live neighbours lives on to the next generation.
		// 3. Any live cell with more than three live neighbours dies, as if by overpopulation.
		// 4. Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
		for (let i = 0; i < this.rows; i++) {
		  for (let j = 0; j < this.cols; j++) {
		    let count = 0;
		    if (i > 0) if (g[i - 1][j]) count++;
		    if (i > 0 && j > 0) if (g[i - 1][j - 1]) count++;
		    if (i > 0 && j < this.cols - 1) if (g[i - 1][j + 1]) count++;
		    if (j < this.cols - 1) if (g[i][j + 1]) count++;
		    if (j > 0) if (g[i][j - 1]) count++;
		    if (i < this.rows - 1) if (g[i + 1][j]) count++;
		    if (i < this.rows - 1 && j > 0) if (g[i + 1][j - 1]) count++;
		    if (i < this.rows - 1 && j < this.cols - 1) if (g[i + 1][j + 1]) count++;
		    if (g[i][j] && (count < 2 || count > 3)) g2[i][j] = false;
		    if (!g[i][j] && count === 3) g2[i][j] = true;
		  }
		}
		// update state data
		this.setState({
		  gridFull: g2,
		  generation: this.state.generation + 1
		});

	}

	// 11: COMPONENT MOUNTED
	componentDidMount() {
		// seed the board on start
		this.seed();
	}

	// 12: RENDER
	render() {
		return (
			<div>
				<h1>The Game of Life</h1>
				<Buttons playButton={this.playButton} pauseButton={this.pauseButton} slow={this.slow} fast={this.fast} clear={this.clear} seed={this.seed} gridSize={this.gridSize} />
				<Grid gridFull={this.state.gridFull} rows={this.rows} cols={this.cols} selectBox={this.selectBox} />
				<h2>Generations: {this.state.generation}</h2>
			</div>
		);
	}
}

// clone an array
function arrayClone(arr) {
	return JSON.parse(JSON.stringify(arr));
}

ReactDOM.render(<Main />, document.getElementById('root'));
