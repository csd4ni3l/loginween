function setup_pumpkin(canvas_id, clearbtn_id, form_id, pattern_field_id, grid_size) {
    const canvas = document.getElementById(canvas_id);
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = '/static/pumpkin.png';

    const GRID_SIZE = grid_size;
    const CELL_SIZE = canvas.width / GRID_SIZE;

    img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        drawGrid();
    };

    let drawing = false;
    let currentPattern = [];

    canvas.addEventListener('mousedown', () => { drawing = true; });
    canvas.addEventListener('mouseup', () => { drawing = false; });
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('click', (e) => {draw(e, true)});

    function draw(e, force=false) {
        if (!drawing && !force) return;
        var rect = canvas.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;

        var gridX = Math.floor(x / CELL_SIZE);
        var gridY = Math.floor(y / CELL_SIZE);

        var cellX = gridX * CELL_SIZE + CELL_SIZE / 3;
        var cellY = gridY * CELL_SIZE + CELL_SIZE / 3;

        var pixel = ctx.getImageData(cellX, cellY, 1, 1).data;

        if (pixel[0] >= 254 && (pixel[1] >= 124 && pixel[1] <= 126)) {
            var key = `${gridX},${gridY}`;

            if (!currentPattern.includes(key)) {
                currentPattern.push(key);
                ctx.fillStyle = 'black'; 
                ctx.fillRect(cellX - CELL_SIZE / 3, cellY - CELL_SIZE / 3, CELL_SIZE, CELL_SIZE);
            }
        }
    }

    function drawGrid() {
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.lineWidth = 1;

        for (let i = 0; i <= GRID_SIZE; i++) {
            const pos = i * CELL_SIZE;

            ctx.beginPath();
            ctx.moveTo(pos, 0);
            ctx.lineTo(pos, canvas.height);
            ctx.stroke();

            ctx.beginPath()
            ctx.moveTo(0, pos);
            ctx.lineTo(canvas.width, pos);
            ctx.stroke()
        }
    }

    document.getElementById(clearbtn_id).addEventListener('click', clearCanvas);

    function clearCanvas() {
        drawing = false; // Fix hold staying after clear
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        drawGrid()
        currentPattern = [];
    }

    document.getElementById(form_id).addEventListener('submit', function(event) {
        document.getElementById(pattern_field_id).value = JSON.stringify(currentPattern);
    });
}