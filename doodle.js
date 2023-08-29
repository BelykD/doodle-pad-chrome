/*
Doodle Pad - Chrome Extension

Author: Dylan Belyk
*/

// Main tile map canvas
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
// Color palette tile map
const colorSelect = document.getElementById('colors');
const contextColors = colorSelect.getContext('2d');
// Tool tile map
const toolSelect = document.getElementById('tools');
const contextTools = toolSelect.getContext('2d');
 
let color = 'black'; // Default pen color
let lastColor = 'white'; // Default last color (previously used color)
const tileSize = 10; // Size of canvas tile
let drawing = false; // Enables tile color changing with pen

// Used to change active and non active states for different tools
let penActive, eraserActive, paintBucketActive, 
    eyeDropperActive, clearActive, undoActive, redoActive = false;
 // Used to only allow redo if undo has been used previously
let undoToggle = false;
// Function to add images of tools
function addImage(imgPath) { 
    const img = document.createElement("img");
    img.src = imgPath;
    return context.createPattern(img, "repeat");
} 
// Adding images of tools
const pen = addImage('Assets/pen.png');
const eraser = addImage('Assets/eraser.png');
const paintBucket = addImage('Assets/paintBucket.png');
const undoRedo = addImage('Assets/undoRedo.png');
const eyeDropper = addImage('Assets/eyeDropper.png');
const clear = addImage('Assets/clear.png');
const save = addImage('Assets/save.png');

const colors = [ // Array to store color palette data
    'red', 'orangered', 'coral', 'darkorange', 'orange', 'gold', 'yellow', 'darkgoldenrod', 'goldenrod', 'chocolate', 'saddlebrown', 'darkkhaki', 'khaki', 
    'palegoldenrod', 'moccasin', 'beige', 'greenyellow', 'chartreuse', 'lime', 'limegreen', 'palegreen', 'lightgreen', 'springgreen', 'mediumspringgreen', 
    'lawngreen', 'darkgreen', 'green', 'forestgreen', 'seagreen', 'mediumseagreen', 'darkolivegreen', 'olivedrab', 'darkseagreen', 'darkcyan', 'teal', 
    'lightseagreen', 'aqua', 'aquamarine', 'mediumaquamarine', 'paleturquoise', 'turquoise', 'mediumturquoise', 'darkturquoise', 'cadetblue', 'steelblue', 
    'lightsteelblue', 'powderblue', 'lightblue', 'skyblue', 'lightskyblue', 'deepskyblue', 'dodgerblue', 'cornflowerblue', 'royalblue', 'blue', 'mediumblue', 
    'darkblue', 'navy', 'midnightblue', 'blueviolet', 'indigo', 'darkslateblue', 'slateblue', 'mediumslateblue', 'mediumpurple', 'darkmagenta', 'purple', 
    'darkviolet', 'darkorchid', 'salmon', 'darksalmon', 'lightcoral', 'mediumorchid', 'orchid', 'violet', 'plum', 'thistle', 'mistyrose', 'lightpink', 'pink', 
    'palevioletred', 'hotpink', 'deeppink', 'mediumvioletred', 'brown', 'maroon', 'firebrick', 'crimson', 'indianred', 'rosybrown', 'darkred', 'whitesmoke', 
    'mintcream', 'gainsboro', 'lightgrey', 'silver', 'darkgray', 'gray', 'dimgray', 'black'
];
const tiles = []; // Array to be populated with tile data
const tilesUndo = []; // Used to store previous data for undo feature
const tilesRedo = []; // Used to store current data for undo feauture
const tools = [pen, eraser, paintBucket, eyeDropper, undoRedo, clear, save]; // Array to be populated with tool data
// Drawing function to change colors of tiles when clicked
function changeTileOnClick(event) {
    // Getting current mouse coordinates
    let xLoc = event.clientX - canvas.offsetLeft;
    let yLoc = event.clientY - canvas.offsetTop;
    // Executed only when pen is
    if (penActive || eraserActive) {
        // Checking for what tile the mouse is on when clicked and changing its color
        tiles.forEach(tile => {
            if (xLoc >= tile.x && xLoc <= tile.x + tileSize && yLoc >= tile.y && yLoc <= tile.y + tileSize && drawing) {
                tile.fillStyle = color; // Setting tile fillStyle to the current color being used
                drawMap();  // Re-drawing map to update canvas
            }
        });
    } else {
        drawMap(); // Re-drawing map to update canvas
    }
}
// Color palette, eraser, and save options
function changeColor(event) {
    // Getting current mouse coordinates
    const xLoc = event.clientX - colorSelect.offsetLeft;
    const yLoc = event.clientY - colorSelect.offsetTop;
    // Activate pen when user changes color unless the paint bucket is selected
    if (!paintBucketActive) {
        drawToolPalette(); // Resetting tools
        penLogic(); // Activating pen when color is changed
    }
    // Checks each tile in tools for a match - used for pen, color change, or eraser
    colors.forEach(col => {
        if (xLoc >= col.x && xLoc <= col.x + 20 && yLoc >= col.y && yLoc <= col.y + 20) {
            color = col.fillStyle;
            lastColor = color; // Sets last color used
            updateColorDisplay(color) // Updating current color display in tools
            drawColorPalette(); // Reseting tools
            outlineTile(col); // Adding selection outline to selected color
        }
    });
}
// Updates "current color" display tile in tools
function updateColorDisplay(col) {
    contextTools.fillStyle = col;
    contextTools.fillRect(350, 0, 50, 50);
}
// Changes tool in use
function changeTool(event) {
    // Getting current mouse coordinates
    const xLoc = event.clientX - toolSelect.offsetLeft;
    const yLoc = event.clientY - toolSelect.offsetTop;
    // Checking which tool is clicked and executing related function
    if (xLoc <= 50) {
        penLogic(); // Pen 
    } else if (xLoc <= 100) {
        eraserLogic(); // Eraser
    } else if (xLoc <= 150) {
        paintBucketLogic(); // Paint bucket
    } else if (xLoc <= 200) {
        eyeDropperLogic(); // Eye dropper last
    } else if (xLoc <= 250 && yLoc <= 25) {
        undoLogic(); // Undo last
    } else if (xLoc <= 250 && yLoc >= 25)  {
        redoLogic(); // Redo last
    } else if (xLoc <= 300) {
        clearLogic(); // Clear canvas
    } else if (xLoc <= 350) {
        saveLogic(); // Save canvas
    }
}
// Pen tool logic
function penLogic() {
    if (color == 'white') { // Switch to last color used if the last tool used was the eraser
        color = lastColor;
    }
    colors.forEach(col => { // Handles changing from pen to eraser, eye dropper, or clear and back - outlines last color used
        if(col.fillStyle == lastColor) {
            outlineTile(col); // Adding selection outline to pen
        }
    });
    handleActiveButton(true, false, false, false, false, false, false, false); // Toggling active buttons
    drawToolPalette(); // Resetting tools
    updateColorDisplay(color) // Updating "current color" display in tools
    outlineTool({ x: 0, y: 0, width: 50, height: 50 }); // Adding selection outline to pen
}
// Eraser tool logic
function eraserLogic() {
    if (color != 'white') { // Keeps last used color when switching from clear to eraser
        lastColor = color; // Gets last used color after using eraser
    }
    color = 'white'; // Set color to white for eraser
    handleActiveButton(false, true, false, false, false, false, false, false); // Toggling active buttons
    drawToolPalette(); // Resetting tools
    drawColorPalette(); // Restting color palette
    updateColorDisplay('white') // Updating "current color" display in tools
    outlineTool({ x: 50, y: 0, width: 50, height: 50 }); // Adding selection outline to eraser
}
// Paint bucket tool logic
function paintBucketLogic() {
    if (color == 'white') { // Switch to last color used if the last tool used was the eraser
        color = lastColor;
    } 
    colors.forEach(col => { // Handles changing from paint bucket to eraser, eye dropper, or clear and back - outlines last color used
        if(col.fillStyle == lastColor) {
            outlineTile(col);
        }
    });
    handleActiveButton(false, false, true, false, false, false, false, false); // Toggling active buttons - Enables paint bucket button
    drawToolPalette(); // Resetting tools
    updateColorDisplay(color) // Updating "current color" display in tools
    outlineTool({ x: 100, y: 0, width: 50, height: 50 }); // Adding selection outline to paint bucket
}
// Eye dropper tool logic
function eyeDropperLogic() {
    handleActiveButton(false, false, false, true, false, false, false, false); // Toggling active buttons - Enables paint bucket button
    drawToolPalette(); // Resetting tools
    // If first tool selected when the program is opened is the eye dropper it keeps the color display white 
    if (lastColor != 'white') {
        updateColorDisplay(color) // Updating "current color" display in tools
    }
    outlineTool({ x: 150, y: 0, width: 50, height: 50 }); // Adding selection outline to clear canvas
}
// Undo tool logic
function undoLogic() {
    handleActiveButton(false, false, false, false, false, true, false, true); // Toggling active buttons
    for (let i = 0; i < tiles.length; i++) {
        tilesRedo[i].fillStyle = tiles[i].fillStyle; // Swapping fillStyle from tiles array to tilesRedo for redo feature
        tiles[i].fillStyle = tilesUndo[i].fillStyle // Swapping fillStyle from undoTiles to the canvas tiles array
    }
    drawMap(); // Re-drawing map to update canvas
    drawToolPalette(); // Resetting tools
    updateColorDisplay(color) // Updating "current color" display in tools
    outlineTool({ x: 200, y: 0, width: 50, height: 25 }); // Adding selection outline to clear canvas
    // Timer for 100 milliseconds to remove the border on the button to make a 'clicking' effect
    setTimeout(() => {
        drawToolPalette(); // Resetting tool palette to remove the border
        updateColorDisplay(color) // Updating "current color" display in tools
    }, 100);
} 
// Redo tool logic
function redoLogic() {
    if (undoToggle) { // Only allow redo if undo has been used previously
        handleActiveButton(false, false, false, false, false, false, true, false); // Toggling active buttons
        for (let i = 0; i < tiles.length; i++) {
            tiles[i].fillStyle = tilesRedo[i].fillStyle // Swapping fillStyle from redoTiles to the canvas tiles array
        }
        drawMap(); // Re-drawing map to update canvas
        drawToolPalette(); // Resetting tools
        updateColorDisplay(color) // Updating "current color" display in tools
        outlineTool({ x: 200, y: 25, width: 50, height: 25 }); // Adding selection outline to clear canvas
        // Timer for 100 milliseconds to remove the border on the button to make a 'clicking' effect
        setTimeout(() => {
            drawToolPalette(); // Resetting tool palette to remove the border
            updateColorDisplay(color) // Updating "current color" display in tools
        }, 100);
    }
}
// Clear canvas tool logic
function clearLogic() {
    handleActiveButton(false, false, false, false ,true, false, false, false); // Toggling active buttons - Enables clear button
    if (color != 'white') { // Keeps last used color when switching from eraser to clear
        lastColor = color; // Gets last used color after using clear canvas
    }
    color = 'white';
    drawToolPalette(); // Resetting tools
    drawColorPalette(); // Resetting color palette
    updateColorDisplay('white') // Updating "current color" display in tools to white
    outlineTool({ x: 250, y: 0, width: 50, height: 50 }); // Adding selection outline to clear canvas
}
// Save canvas tool logic
function saveLogic() {
    const savePrompt = prompt("Save as:")
    if (savePrompt != null) {
        const fileName = savePrompt;
        const dataURL = canvas.toDataURL('image/png'); // Save image as a png file type
        const saveDoodle = document.createElement('a'); // Creating a element
        saveDoodle.href = dataURL; // Setting data URL as elements href
        saveDoodle.download = fileName + '.png'; // Filename to be saved as
        saveDoodle.click(); // Initiating save
    }
}
// Handles paint bucket click event
function handlePaintBucket(event) {
    // Getting current mouse coordinates
    const xLoc = event.clientX - canvas.offsetLeft;
    const yLoc = event.clientY - canvas.offsetTop;
    let currentTileColor = null; // Used to get the color that was clicked by the paint bucket
    if (paintBucketActive) {
        tiles.forEach(tile => { // Changing each tile color to current color
            if (xLoc >= tile.x && xLoc <= tile.x + tileSize && yLoc >= tile.y && yLoc <= tile.y + tileSize) {
                // Getting the color of the tile that was clicked
                currentTileColor = tile.fillStyle; 
            }
        });
        tiles.forEach(tile => {
            if (currentTileColor == tile.fillStyle) {
                tile.fillStyle = color;
            }
        });
        drawMap();  // Re-drawing map to update canvas
    }
}

function handleEyeDropper(event) {
    // Getting current mouse coordinates
    const xLoc = event.clientX - canvas.offsetLeft;
    const yLoc = event.clientY - canvas.offsetTop;
    // When eye dropper tool is selected check for the color of the tile that is clicked
    if (eyeDropperActive) {
        tiles.forEach(tile => {
            if (xLoc >= tile.x && xLoc <= tile.x + tileSize && yLoc >= tile.y && yLoc <= tile.y + tileSize) {
                // Getting the color of the tile that was clicked
                if (tile.fillStyle != 'white') { // No change if it is blank/eraser
                    color = tile.fillStyle; // Setting new color from eye dropper
                }
            }
        });
        if (color != 'white') { // No change if it is blank/eraser
            drawColorPalette(); // Resetting color palette
            // Finding matching color from color palette and outlining it
            colors.forEach(col => {
                if(col.fillStyle == color) {
                    outlineTile(col);
                }
            });
            lastColor = color; // Sets last color to eye dropper selection to prevent outlining two colors at once
            updateColorDisplay(color) // Updating "current color" display in tools
        }
    }
}
// Handles undo click event
function handleUndo() {
    if (!redoActive && !eyeDropperActive) { // Prevents overwriting undo-redo if a mousedown event is detected while redo or eye dropper is active
        // Takes from tiles array and stores in tilesUndo
        for (let i = 0; i < tiles.length; i++) {
            tilesUndo[i].fillStyle = tiles[i].fillStyle;
        }
    }
}
// Handles clear canvas click event
function handleClear() {
    if (clearActive) {
        tiles.forEach(tile => { // Changing each tile color to current color
            tile.fillStyle = 'white';
        });
    }
}
 // Used to toggle active buttons for every logic function - true or false inputs
function handleActiveButton(penA, eraserA, paintBucketA, eyeDropperA, clearA, undoA, redoA, toggleU) {
    penActive = penA;
    eraserActive = eraserA;
    paintBucketActive = paintBucketA;
    eyeDropperActive = eyeDropperA;
    clearActive = clearA;
    undoActive = undoA;
    redoActive = redoA;
    undoToggle = toggleU; // Toggles undo button - can only use it after undo has previously been used
}
// Adding selection outline to tile
function outlineTile(tile) {
    let borderWidth = 2; // 2px border width
    contextColors.strokeStyle = 'black'; // Change border color as needed
    contextColors.lineWidth = borderWidth; // Change border width as needed
    contextColors.strokeRect(
        tile.x + borderWidth / 2, // Adjust for border offsets
        tile.y + borderWidth / 2, 
        tile.width - 2, // Making border 2px smaller than tile to fit inside tile
        tile.height - 2);
}
// Adding selection outline to tile
function outlineTool(tool) {
    let borderWidth = 2; // 2px border width
    contextTools.strokeStyle = 'black'; // Change border color as needed
    contextTools.lineWidth = borderWidth; // Change border width as needed
    contextTools.strokeRect(
        tool.x + borderWidth / 2, // Adjust for border offsets
        tool.y + borderWidth / 2, 
        tool.width - 2, // Making border 2px smaller than tile to fit inside tile
        tool.height - 2);
}
// Adds each object details to the tool array
function fillColorArray(){
    let colorCount = 0;
    for (let i = 0; i < 5; i++) {
        for (let x = 0; x < 20; x++) {
            colors.push({
                x: (x * 20), // X-coordinate
                y: i * 20, // Y-coordinate
                width: 20, // Tile width
                height: 20, // Tile height
                fillStyle: colors[colorCount] // Tile color
            });
            colorCount++; // Used to move through array of colors
        }
    }
}

function fillToolArray() {
    for (let i = 0; i < 7; i++) {
        tools.push({
            x: i * 50, // X-coordinate
            y: 0, // Y-coordinate
            width: 50, // Tile width
            height: 50, // Tile height
            fillStyle: tools[i] // Tile background color
        });
    }
    tools.push({ // Current color tool to show current color
        x: 350,
        y: 0,
        width: 50,
        height: 50,
        fillStyle: lastColor 
    });
}
// Adds each object details to the initial tile array
function fillTileArray(arr){
    for (let i = 0; i < 40; i++) {
        for (let x = 0; x < 40; x++) {
            arr.push({
                x: x * 10, // X-coordinate
                y: i * 10, // Y-coordinate
                width: 10, // Tile width
                height: 10, // Tile height
                fillStyle: 'white' // Tile background color
            });
        }
    }
}
// Draws the color palette
function drawColorPalette() {
    colors.forEach(col => {
        contextColors.fillStyle = col.fillStyle;
        contextColors.fillRect(col.x, col.y, col.width, col.height);
    });
}
// Draws the tool buttons
function drawToolPalette() {
    tools.forEach(tool => {
        contextTools.fillStyle = tool.fillStyle;
        contextTools.fillRect(tool.x, tool.y, tool.width, tool.height);
    });
}
// Draws the initial 400x400px canvas of tiles
function drawMap() {
    tiles.forEach(tile => {
        context.fillStyle = tile.fillStyle;
        context.fillRect(tile.x, tile.y, tile.width, tile.height);
    });
}
// Mouse down event listener to start drawing
function startDrawing() {
    drawing = true;
    changeTileOnClick(event); // Handles single click error not changing tile
}
// Mouse up event listener to stop drawing
function stopDrawing() {
    drawing = false;
}
// Fills new array after mouse is pressed for undo feature
canvas.addEventListener('mousedown', handleUndo); // Needs to be before the mousedown drawing listener or one tile will be colored before recording undo data
// Drawing event listeners
canvas.addEventListener('mousemove', changeTileOnClick); // Handles dragging to draw
canvas.addEventListener('mousedown', startDrawing); // Checks when mouse is down to enable drawing
canvas.addEventListener('mouseup', stopDrawing); // Checks when mouse is up to disable drawing
// Color selection event listener to change colors
colorSelect.addEventListener('click', changeColor);
// Tool selection event listener to change tools
toolSelect.addEventListener('click', changeTool);
// Paint bucket and clear canvas event listeners to handle related functions
canvas.addEventListener('click', handlePaintBucket); // Paint bucket button click
canvas.addEventListener('click', handleClear); // Clear canvas button click
canvas.addEventListener('click', handleEyeDropper); // Eye Dropper event listener
// Check if mouse leaves the canvas and stop drawing
canvas.addEventListener("mouseout", stopDrawing);

// Populating tile, color, and tool arrays
fillColorArray(); // Filling array for color palette data
fillToolArray(); // Filling array for tool data
fillTileArray(tiles); // Filling array for main canvas
fillTileArray(tilesUndo); // Filling additional array for undo feature
fillTileArray(tilesRedo); // Filling additional array for redo feature
// Drawing canvas and tool tiles
drawColorPalette(); // Displaying color palette
drawToolPalette(); // Displaying tools
drawMap(); // Displaying initial empty canvas
