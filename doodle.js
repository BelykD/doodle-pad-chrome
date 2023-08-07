const canvas = document.getElementById('tileMap');
const context = canvas.getContext('2d');

const toolSelect = document.getElementById('tools');
const contextTools = toolSelect.getContext('2d');
 
let color = 'black'; // Default pen color
let drawing = false;

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
    'red', 'orangered', 'darkorange', 'orange', 'gold', 'yellow', 'greenyellow', 'chartreuse', 'lime',
    'limegreen', 'springgreen', 'cyan', 'darkturquoise', 'dodgerblue', 'blue', 'blueviolet', 'darkviolet',
    'darkorchid', 'darkmagenta', 'deeppink', 'hotpink', 'pink', 'crimson', 'brown', 'indianred', 'firebrick', 
    'darkred', 'peachpuff', 'moccasin', 'papayawhip', 'lemonchiffon', 'mistyrose', 'lavender', 'khaki', 'gold', 
    'lightsalmon', 'coral', 'orangered', 'darkorange', 'tomato', 'red', 'maroon', 'darkkhaki', 'darkolivegreen', 
    'darkgreen', 'seagreen', 'teal', 'midnightblue', 'darkslateblue', 'mediumblue', 'royalblue', 'mediumslateblue', 
    'slateblue', 'purple', 'darkmagenta', 'mediumorchid', 'darkorchid', 'darkviolet', 'blueviolet', 'indigo',
    'darkslategray', 'cadetblue', 'deepskyblue', 'steelblue', 'cornflowerblue', 'mediumaquamarine', 'turquoise', 
    'darkturquoise', 'lightseagreen', 'mediumspringgreen', 'mediumseagreen', 'seagreen', 'forestgreen', 'darkgreen', 
    'yellowgreen', 'olivedrab', 'olive', 'darkolivegreen', 'mediumseagreen', 'darkseagreen', 'mediumslateblue', 
    'slategray', 'lightslategray', 'darkslategray', 'black'
];

// Drawing function to change colors of tiles when clicked
function changeTileOnClick(event) {
    const xLoc = event.clientX - canvas.offsetLeft;
    const yLoc = event.clientY - canvas.offsetTop;

    tiles.forEach(tiles => {
        if (xLoc >= tiles.x && xLoc <= tiles.x + 20 && yLoc >= tiles.y && yLoc <= tiles.y + 20 && drawing == true) {
            tiles.fillStyle =  color;
            drawMap();
        }
    });
}
// Color palette, eraser, and save options
function changeTool(event) {
    const xLoc = event.clientX - toolSelect.offsetLeft;
    const yLoc = event.clientY - toolSelect.offsetTop;
    // Checks each tile in tools for a match - color change, eraser, or save
    tools.forEach(tools => {
        // Checking for eraser or save button first
        if (xLoc >= 0 && xLoc <= 60 && yLoc >= 0 && yLoc <= 50) {
            color = 'white';
        } else if (xLoc >= 0 && xLoc <= 60 && yLoc >= 50 && yLoc <= 100) {
            const dataURL = canvas.toDataURL('image/png'); // Save image as a png file type
            const saveDoodle = document.createElement('a'); // Creating a element
            saveDoodle.href = dataURL; // Setting data URL as elements href
            saveDoodle.download = 'mydoodle.png'; // Filename to be saved as
            saveDoodle.click(); // Initiating save
        } else if (xLoc >= tools.x && xLoc <= tools.x + 20 && yLoc >= tools.y && yLoc <= tools.y + 20) {
            color = tools.fillStyle;
        }
    });
}
// Mouse down event listener to start drawing
function startDrawing() {
    drawing = true;
}
// Mouse up event listener to stop drawing
function stopDrawing() {
    drawing = false;
}
// Drawing event listeners
canvas.addEventListener('click', changeTileOnClick); // Handles single clicks for single tiles
canvas.addEventListener('mousemove', changeTileOnClick); // Handles dragging to draw
canvas.addEventListener('mousedown', startDrawing); // Checks when mouse is down to enable drawing
canvas.addEventListener('mouseup', stopDrawing); // Checks when mouse is up to disable drawing
// Tool selection event listener
toolSelect.addEventListener('click', changeTool);

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
// Populating both tile and tool arrays
fillTileArray();
fillToolArray();
// Drawing canvas and tool tiles
drawMap();
drawTools();