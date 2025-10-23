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

function check_colorable(ctx, CELL_SIZE, gridX, gridY) {
    var cellX = gridX * CELL_SIZE + CELL_SIZE / 3;
    var cellY = gridY * CELL_SIZE + CELL_SIZE / 3;
    var pixel = ctx.getImageData(cellX, cellY, 1, 1).data;
    return (pixel[0] >= 254 && (pixel[1] >= 124 && pixel[1] <= 126));
}

function check_and_color(ctx, CELL_SIZE, currentPattern, gridX, gridY) {
    if (check_colorable(ctx, CELL_SIZE, gridX, gridY)) {
        var key = `${gridX},${gridY}`;
        if (!currentPattern.includes(key)) {
            currentPattern.push(key);
            var cellX = gridX * CELL_SIZE + CELL_SIZE / 3;
            var cellY = gridY * CELL_SIZE + CELL_SIZE / 3;
            ctx.fillStyle = 'transparent';
            ctx.clearRect(cellX - CELL_SIZE / 3, cellY - CELL_SIZE / 3, CELL_SIZE, CELL_SIZE);
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

    for (let y = 0; y < grid_size; y++) {
        for (let x = 0; x < grid_size; x++) {
            if (colored == amount) {
                return currentPattern;
            }
            if (check_and_color(ctx, cell_size, currentPattern, x, y)) {
                colored++;
            }
        }
    }
    
    return currentPattern;
}

function draw_pattern(ctx, canvas, pattern, grid_size) {
    const cell_size = canvas.width / grid_size;
    let currentPattern = [];

    for (let x = 0; x < grid_size; x++) {
        for (let y = 0; y < grid_size; y++) {
            if (includesPoint(pattern, [x, y])) {
                check_and_color(ctx, cell_size, currentPattern, x, y);
            }
        }
    }
    
    return currentPattern;
}

function get_colorable(ctx, canvas, grid_size) {
    let colorable = 0;
    const cell_size = canvas.width / grid_size;

    for (let x = 0; x < grid_size; x++) {
        for (let y = 0; y < grid_size; y++) {
            if (check_colorable(ctx, cell_size, x, y)) {
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