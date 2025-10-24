function draw(e, ctx, CELL_SIZE, drawing, canvas, currentPattern, lit) {
    if (!drawing) return;
    var rect = canvas.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;
    var gridX = Math.floor(x / CELL_SIZE);
    var gridY = Math.floor(y / CELL_SIZE);
    check_and_color(ctx, CELL_SIZE, currentPattern, lit, gridX, gridY);
}

function clearCanvas(ctx, canvas, img, GRID_SIZE, currentPattern) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    drawGrid(ctx, canvas, GRID_SIZE);
    currentPattern.length = 0;
}

function drawGrid(ctx, canvas, GRID_SIZE) {
    const cell_size = canvas.width / GRID_SIZE;
    const image_data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.lineWidth = 1;
    
    for (let i = 0; i <= GRID_SIZE; i++) {
        const pos = i * cell_size;
        
        ctx.beginPath();
        for (let j = 0; j < GRID_SIZE; j++) {
            const checkLeft = i > 0 && check_colorable(image_data, canvas.width, cell_size, i - 1, j);
            const checkRight = i < GRID_SIZE && check_colorable(image_data, canvas.width, cell_size, i, j);
            
            if (checkLeft || checkRight) {
                ctx.moveTo(pos, j * cell_size);
                ctx.lineTo(pos, (j + 1) * cell_size);
            }
        }
        ctx.stroke();
        
        ctx.beginPath();
        for (let j = 0; j < GRID_SIZE; j++) {
            const checkAbove = i > 0 && check_colorable(image_data, canvas.width, cell_size, j, i - 1);
            const checkBelow = i < GRID_SIZE && check_colorable(image_data, canvas.width, cell_size, j, i);
            
            if (checkAbove || checkBelow) {
                ctx.moveTo(j * cell_size, pos);
                ctx.lineTo((j + 1) * cell_size, pos);
            }
        }
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

    return is_orange(topLeft.r, topLeft.g) &&
           is_orange(topRight.r, topRight.g) &&
           is_orange(bottomLeft.r, bottomLeft.g) &&
           is_orange(bottomRight.r, bottomRight.g);
}

function check_and_color(ctx, CELL_SIZE, currentPattern, lit, gridX, gridY, image_data = null) {
    if (!image_data) {
        image_data = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height).data;
    }

    if (check_colorable(image_data, ctx.canvas.width, CELL_SIZE, gridX, gridY)) {
        var key = `${gridX},${gridY}`;
        if (!currentPattern.includes(key)) {
            currentPattern.push(key);
            var cellX = gridX * CELL_SIZE;
            var cellY = gridY * CELL_SIZE;
            if (!lit) {
                ctx.clearRect(cellX, cellY, CELL_SIZE, CELL_SIZE);
            }
            else {
                ctx.fillStyle = "yellow"
                ctx.fillRect(cellX, cellY, CELL_SIZE, CELL_SIZE);
            }
            return true;
        } else {
            return false;
        }
    }

    return false;
}

function get_colorable(ctx, canvas, grid_size) {
    let pattern = [];
    const cell_size = canvas.width / grid_size;

    const image_data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    for (let y = 0; y < grid_size; y++) {
        for (let x = 0; x < grid_size; x++) {
            if (check_colorable(image_data, canvas.width, cell_size, x, y)) {
                var key = `${x},${y}`;
                pattern.push(key);
            }
        }
    }

    return pattern;
}

function light_pumpkin(ctx, cell_size, currentPattern) {
    for (const str of currentPattern) {
        const [x, y] = str.split(",").map(s => parseInt(s.trim(), 10));
        
        var cellX = x * cell_size;
        var cellY = y * cell_size;

        ctx.fillStyle = "yellow"
        ctx.fillRect(cellX, cellY, cell_size, cell_size);
    }
}

function unlight_pumpkin(ctx, cell_size, currentPattern) {
    for (const str of currentPattern) {
        const [x, y] = str.split(",").map(s => parseInt(s.trim(), 10));
        
        var cellX = x * cell_size;
        var cellY = y * cell_size;

        ctx.clearRect(cellX, cellY, cell_size, cell_size)
    }
}

function setup_lightbtn(ctx, cell_size, lightbtn_id, pattern) {
    let lit = { value: false };
    
    document.getElementById(lightbtn_id).addEventListener('click', function(event) {
        if (lit.value) {
            lit.value = false;
            unlight_pumpkin(ctx, cell_size, pattern);
        } 
        else {
            lit.value = true;
            light_pumpkin(ctx, cell_size, pattern);
        }
    });

    return lit;
}

function setup_pumpkin(canvas_id, clearbtn_id, lightbtn_id, form_id, pattern_field_id, grid_size, allow_drawing=true) {
    const canvas = document.getElementById(canvas_id);
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = '/static/pumpkin.png';
    const GRID_SIZE = grid_size;
    const CELL_SIZE = canvas.width / GRID_SIZE;
    
    let currentPattern = [];
    let lit = { value: false };
    
    img.onload = () => {
        clearCanvas(ctx, canvas, img, GRID_SIZE, currentPattern);
    };

    if (allow_drawing) {
        lit = setup_lightbtn(ctx, CELL_SIZE, lightbtn_id, currentPattern);

        let drawing = false;
        canvas.addEventListener('mousedown', () => { drawing = true; });
        canvas.addEventListener('mouseup', () => { drawing = false; });
        canvas.addEventListener('mousemove', (e) => draw(e, ctx, CELL_SIZE, drawing, canvas, currentPattern, lit.value));
        canvas.addEventListener('click', (e) => {draw(e, ctx, CELL_SIZE, true, canvas, currentPattern, lit.value)});
        
        document.getElementById(clearbtn_id).addEventListener('click', () => clearCanvas(ctx, canvas, img, GRID_SIZE, currentPattern));
        document.getElementById(form_id).addEventListener('submit', function(event) {
            document.getElementById(pattern_field_id).value = JSON.stringify(currentPattern);
        });
    }

    return [ctx, canvas, img];
}