function draw(e, ctx, CELL_SIZE, drawing, canvas, currentPattern) {
    if (!drawing) return;
    var rect = canvas.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;
    var gridX = Math.floor(x / CELL_SIZE);
    var gridY = Math.floor(y / CELL_SIZE);
    check_and_color(ctx, CELL_SIZE, currentPattern, gridX, gridY);
}

function clearCanvas(ctx, canvas, img, GRID_SIZE, currentPattern) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    drawGrid(ctx, canvas, GRID_SIZE);
    currentPattern.length = 0;
}

function drawGrid(ctx, canvas, GRID_SIZE) {
    const cell_size = canvas.width / GRID_SIZE;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
        const pos = i * cell_size;
        ctx.beginPath();
        ctx.moveTo(pos, 0);
        ctx.lineTo(pos, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, pos);
        ctx.lineTo(canvas.width, pos);
        ctx.stroke();
    }
}

function is_orange(r, g) {
    return (r >= 250 && (g >= 121 && g <= 130));
}

function getPixel(image_data, canvas_width, x, y) {
    const index = (Math.floor(y) * canvas_width + Math.floor(x)) * 4;
    
    return {
        r: image_data[index],
        g: image_data[index + 1],
        b: image_data[index + 2],
        a: image_data[index + 3]
    };
}

function check_colorable(image_data, canvas_width, CELL_SIZE, gridX, gridY) {
    const cellX = gridX * CELL_SIZE;
    const cellY = gridY * CELL_SIZE;

    offset = 5
    
    const topLeft = getPixel(image_data, canvas_width, cellX + offset, cellY + offset);
    const topRight = getPixel(image_data, canvas_width, cellX + CELL_SIZE - offset, cellY + offset);
    const bottomLeft = getPixel(image_data, canvas_width, cellX + offset, cellY + CELL_SIZE - offset);
    const bottomRight = getPixel(image_data, canvas_width, cellX + CELL_SIZE - offset, cellY + CELL_SIZE - offset);

    console.log(topLeft, topRight, bottomLeft, bottomRight)

    return is_orange(topLeft.r, topLeft.g) &&
           is_orange(topRight.r, topRight.g) &&
           is_orange(bottomLeft.r, bottomLeft.g) &&
           is_orange(bottomRight.r, bottomRight.g);
}

function check_and_color(ctx, CELL_SIZE, currentPattern, gridX, gridY, image_data = null) {
    if (!image_data) {
        image_data = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height).data;
    }

    if (check_colorable(image_data, ctx.canvas.width, CELL_SIZE, gridX, gridY)) {
        var key = `${gridX},${gridY}`;
        if (!currentPattern.includes(key)) {
            currentPattern.push(key);
            var cellX = gridX * CELL_SIZE;
            var cellY = gridY * CELL_SIZE;
            ctx.clearRect(cellX, cellY, CELL_SIZE, CELL_SIZE);
            return true;
        } else {
            return false;
        }
    }

    return false;
}

function includesPoint(arr, [x, y]) {
    return arr.some(([a, b]) => a === x && b === y);
}

function color_amount(ctx, canvas, grid_size, amount) {
    let colored = 0;
    const cell_size = canvas.width / grid_size;
    let currentPattern = [];
    
    const image_data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    for (let y = 0; y < grid_size; y++) {
        for (let x = 0; x < grid_size; x++) {
            if (colored == amount) {
                return currentPattern;
            }
            if (check_and_color(ctx, cell_size, currentPattern, x, y, image_data)) {
                colored++;
            }
        }
    }
    
    return currentPattern;
}

function draw_pattern(ctx, canvas, pattern, grid_size) {
    const cell_size = canvas.width / grid_size;
    let currentPattern = [];
    
    const image_data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    for (let x = 0; x < grid_size; x++) {
        for (let y = 0; y < grid_size; y++) {
            if (includesPoint(pattern, [x, y])) {
                check_and_color(ctx, cell_size, currentPattern, x, y, image_data);
            }
        }
    }
    
    return currentPattern;
}

function get_colorable(ctx, canvas, grid_size) {
    let colorable = 0;
    const cell_size = canvas.width / grid_size;

    const image_data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    for (let y = 0; y < grid_size; y++) {
        for (let x = 0; x < grid_size; x++) {
            if (check_colorable(image_data, canvas.width, cell_size, x, y)) {
                colorable++;
            }
        }
    }

    return colorable;
}

function setup_pumpkin(canvas_id, clearbtn_id, form_id, pattern_field_id, grid_size, allow_drawing=true) {
    const canvas = document.getElementById(canvas_id);
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = '/static/pumpkin.png';
    const GRID_SIZE = grid_size;
    const CELL_SIZE = canvas.width / GRID_SIZE;
    let currentPattern = [];
    
    img.onload = () => {
        clearCanvas(ctx, canvas, img, GRID_SIZE, currentPattern);
    };
    
    if (allow_drawing) {
        let drawing = false;
        canvas.addEventListener('mousedown', () => { drawing = true; });
        canvas.addEventListener('mouseup', () => { drawing = false; });
        canvas.addEventListener('mousemove', (e) => draw(e, ctx, CELL_SIZE, drawing, canvas, currentPattern));
        canvas.addEventListener('click', (e) => {draw(e, ctx, CELL_SIZE, true, canvas, currentPattern)});
        document.getElementById(clearbtn_id).addEventListener('click', () => clearCanvas(ctx, canvas, img, GRID_SIZE, currentPattern));
        document.getElementById(form_id).addEventListener('submit', function(event) {
            document.getElementById(pattern_field_id).value = JSON.stringify(currentPattern);
        });
    }

    return [ctx, canvas, img];
}