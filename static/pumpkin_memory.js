loadSprite("pumpkin", "/static/pumpkin.png")

scene("game", (pumpkin_pairs) => {
    create_button(5, 5, 150, 75, "Back", color(127, 127, 127), color(0, 0, 0, 0), scene_lambda("main_menu"))

    const total = pumpkin_pairs * 2;
    const pumpkin_size = 100;
    const space_between = 10;
    
    let cols;
    switch (pumpkin_pairs) {
        case 5: cols = 5; break; 
        case 10: cols = 4; break;
        case 15: cols = 5; break;
        case 20: cols = 10; break;
        default: cols = Math.ceil(Math.sqrt(pumpkin_pairs * 2));
    }

    const rows = Math.ceil(total / cols);
    const grid_width = cols * (pumpkin_size + space_between) - space_between;
    const grid_height = rows * (pumpkin_size + space_between) - space_between;

    const start_x = (WIDTH - grid_width) / 2;
    const start_y = (HEIGHT - grid_height) / 2;

    let arr = [...Array(pumpkin_pairs).keys(), ...Array(pumpkin_pairs).keys()];

    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    for (let i = 0; i < arr.length; i++) {
        let row =  Math.floor(i / cols);
        let col = i % cols;

        create_texturebutton(start_x + (col * (pumpkin_size + space_between)), start_y + (row * (pumpkin_size + space_between)), "pumpkin", () => {
            
        });
    }

})

scene("play", () => {
    create_label(WIDTH / 2 - 16 * "Difficulty Selector".length, HEIGHT / 8, "Difficulty Selector", 56);
    vertical_buttons(WIDTH / 4, HEIGHT / 4, [
        ["Easy", color(127, 127, 127), color(0, 0, 0, 0), scene_lambda("game", 5)], 
        ["Medium", color(127, 127, 127), color(0, 0, 0, 0), scene_lambda("game", 10)],
        ["Hard", color(127, 127, 127), color(0, 0, 0, 0), scene_lambda("game", 15)],
        ["Extra Hard", color(127, 127, 127), color(0, 0, 0, 0), scene_lambda("game", 20)]
    ], WIDTH / 2, HEIGHT / 8, HEIGHT / 50)
})