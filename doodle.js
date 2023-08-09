/*
Doodle Pad - Chrome Extension

Author: Dylan Beylk
*/

// Main tile map canvas
const canvas = document.getElementById('tileMap');
const context = canvas.getContext('2d');
// Color palette, eraser, and save tile map
const toolSelect = document.getElementById('tools');
const contextTools = toolSelect.getContext('2d');
 
let color = 'black'; // Default pen color
let drawing = false; // Enables tile color changing with pen

// Adding eraser button png
const eraserImg = document.getElementById("eraser");
eraserImg.src = 'Assets/eraser.png'
const eraser = context.createPattern(eraserImg, "repeat");
// Adding save button png
const saveImg = document.getElementById("save");
saveImg.src = 'Assets/save.png'
const save = context.createPattern(saveImg, "repeat");

const tiles = []; // Array to be populated with tile data
const tools = [ // Array to store color palette data
    'red', 'orangered', 'darkorange', 'orange', 'gold', 'darkgoldenrod', 'goldenrod', 'saddlebrown', 'darkkhaki', 'palegoldenrod', 
    'khaki', 'yellow', 'greenyellow', 'chartreuse', 'lime', 'limegreen', 'palegreen', 'springgreen', 'mediumspringgreen', 'lawngreen', 
    'green', 'seagreen', 'mediumseagreen', 'darkseagreen', 'lightseagreen', 'aquamarine', 'mediumaquamarine', 'paleturquoise', 
    'turquoise', 'mediumturquoise', 'darkturquoise', 'cadetblue', 'steelblue', 'lightsteelblue', 'powderblue', 'lightblue', 'skyblue', 
    'lightskyblue', 'deepskyblue', 'dodgerblue', 'cornflowerblue', 'royalblue', 'blue', 'mediumblue', 'darkblue', 'navy', 'midnightblue', 
    'blueviolet', 'indigo', 'darkslateblue', 'slateblue', 'mediumslateblue', 'mediumpurple', 'darkmagenta', 'purple', 'darkviolet', 
    'darkorchid', 'salmon', 'darksalmon', 'lightcoral', 'mediumorchid', 'orchid', 'violet', 'plum', 'thistle', 'pink', 'lightpink', 
    'hotpink', 'palevioletred', 'deeppink', 'mediumvioletred', 'brown', 'maroon', 'firebrick', 'indianred', 'rosybrown', 'darkred', 
    'whitesmoke', 'gainsboro', 'lightgrey', 'silver', 'darkgray', 'gray', 'dimgray', 'black',
];
// Drawing function to change colors of tiles when clicked
function changeTileOnClick(event) {
    const xLoc = event.clientX - canvas.offsetLeft;
    const yLoc = event.clientY - canvas.offsetTop;
    // Checking for what tile the mouse is on when clicked and changing its color
    tiles.forEach(tiles => {
        if (xLoc >= tiles.x && xLoc <= tiles.x + 20 && yLoc >= tiles.y && yLoc <= tiles.y + 20 && drawing == true) {
            // Stop drawing when mouse goes outside of canvas to prevent getting stuck drawing
            if (xLoc <= 1 || xLoc >= 399 || yLoc >= 399 || yLoc <= 1) {
                stopDrawing();
            } else {
                tiles.fillStyle =  color;
                drawMap();
            }
        }
    });
}
// Color palette, eraser, and save options
function changeTool(event) {
    const xLoc = event.clientX - toolSelect.offsetLeft;
    const yLoc = event.clientY - toolSelect.offsetTop;
    // Checks for save button
    if (xLoc >= 0 && xLoc <= 60 && yLoc >= 50 && yLoc <= 100) {
        const dataURL = canvas.toDataURL('image/png'); // Save image as a png file type
        const saveDoodle = document.createElement('a'); // Creating a element
        saveDoodle.href = dataURL; // Setting data URL as elements href
        saveDoodle.download = 'mydoodle.png'; // Filename to be saved as
        saveDoodle.click(); // Initiating save
    }
    // Checks each tile in tools for a match - color change or eraser
    tools.forEach(tools => {
        // Checking for eraser or save button first
        if (xLoc >= 0 && xLoc <= 60 && yLoc >= 0 && yLoc <= 50) {
            color = 'white';
            drawTools(); // Reseting tools
            outlineTile({ x: 0, y: 0, width: 60, height: 50 }); // Adding selection outline to eraser
        } else if (xLoc >= tools.x && xLoc <= tools.x + 20 && yLoc >= tools.y && yLoc <= tools.y + 20) {
            color = tools.fillStyle;
            drawTools(); // Reseting tools
            outlineTile(tools); // Adding selection outline to selected color
        }
    });
}
// Adding selection outline to tile
function outlineTile(tile) {
    let borderWidth = 2; // 2px border width
    contextTools.strokeStyle = 'black'; // Change border color as needed
    contextTools.lineWidth = borderWidth; // Change border width as needed
    contextTools.strokeRect(
        tile.x + borderWidth / 2, // Adjust for border offsets
        tile.y + borderWidth / 2, 
        tile.width - 2, // Making border 2px smaller than tile to fit inside tile
        tile.height - 2);
}
// Mouse down event listener to start drawing
function startDrawing() {
    drawing = true;
}
// Mouse up event listener to stop drawing
function stopDrawing() {
    drawing = false;
}
// Adds each object details to the tool array
function fillToolArray(){
    let colorCount = 0;
    for(let i = 0; i < 5; i++) {
        for(let x = 0; x < 17; x++) {
            tools.push({
                x: (x * 20) + 60, // X-coordinate
                y: i * 20, // Y-coordinate
                width: 20, // Tile width
                height: 20, // Tile height
                fillStyle: tools[colorCount] // Tile color
            })
            colorCount++; // Used to move through array of colors
        }
    }
    // Adding eraser button tiles
    tools.push({
        x: 0,
        y: 0,
        width: 60,
        height: 50,
        fillStyle: eraser
    })
    // Adding save button tiles
    tools.push({
        x: 0,
        y: 50,
        width: 60,
        height: 50,
        fillStyle: save
    })
}
// Adds each object details to the initial tile array
function fillTileArray(){
    for(let i = 0; i < 20; i++) {
        for(let x = 0; x < 20; x++) {
            tiles.push({
                x: x * 20, // X-coordinate
                y: i * 20, // Y-coordinate
                width: 20, // Tile width
                height: 20, // Tile height
                fillStyle: 'white' // Tile background color
            })
        }
    }
}
// Draws the color palette and the eraser and save buttons
function drawTools() {
    tools.forEach(tools => {
        contextTools.fillStyle = tools.fillStyle;
        contextTools.fillRect(tools.x, tools.y, tools.width, tools.height);
    })
}
// Draws the initial 400x400px canvas of 20x20px tiles
function drawMap() {
    tiles.forEach(tiles => {
        context.fillStyle = tiles.fillStyle;
        context.fillRect(tiles.x, tiles.y, tiles.width, tiles.height);
    })
}
// Drawing event listeners
canvas.addEventListener('click', changeTileOnClick); // Handles single clicks for single tiles
canvas.addEventListener('mousemove', changeTileOnClick); // Handles dragging to draw
canvas.addEventListener('mousedown', startDrawing); // Checks when mouse is down to enable drawing
canvas.addEventListener('mouseup', stopDrawing); // Checks when mouse is up to disable drawing
// Tool selection event listener
toolSelect.addEventListener('click', changeTool);
// Populating both tile and tool arrays
fillTileArray();
fillToolArray();
// Drawing canvas and tool tiles
drawMap();
drawTools();
