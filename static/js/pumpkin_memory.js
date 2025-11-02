function setup_game() {
    loadSprite("pumpkin", "/static/graphics/pumpkin.png");
    const SETTINGS = {
        "Graphics": {
            "Anti-Aliasing": {"type": "bool", "default": true},
            "Texture Filtering": {"type": "option", "options": ["Nearest", "Linear"], "default": "Linear"},
            "FPS Limit": {"type": "slider", "min": 0, "max": 480, "default": 60},
        },
        "Sound": {
            "Music": {"type": "bool", "default": true},
            "SFX": {"type": "bool", "default": true},
            "Music Volume": {"type": "slider", "min": 0, "max": 100, "default": 50},
            "SFX Volume": {"type": "slider", "min": 0, "max": 100, "default": 50},
        },
    };

    scene("game", (pumpkin_pairs, pumpkin_array, revealed, found_pairs, start) => {
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

        let arr;
        if (pumpkin_array == null) {
            arr = [...Array(pumpkin_pairs).keys(), ...Array(pumpkin_pairs).keys()];

            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
        }
        else {
            arr = pumpkin_array;
        }

        if (revealed == null) {
            revealed = [];
            found_pairs = [];
            start = performance.now();
        }

        let found_pair = null;
        if (arr[revealed[0]] == arr[revealed[1]] && !found_pairs.includes(arr[revealed[0]])) {
            found_pair = arr[revealed[0]];
            found_pairs.push(arr[revealed[0]]);
            revealed = [];
        }

        if (revealed.length > 2) {
            revealed = [];
        }
        
        let best_time = Number(localStorage.getItem("pumpkin_memory_best_time")) || 99999;
        let first_time = best_time == 99999;

        const best_time_display = (best_time == 99999) ? "None" : `${best_time}s`;
        const elapsed = performance.now() - start;
        const timer_label = create_label(520, 5, `Time spent: ${(elapsed / 1000).toFixed(1)}s Best Time: ${best_time_display}`);

        const timer_interval_id = setInterval(() => {
            const elapsed = performance.now() - start;
            if (first_time) {
                best_time = (elapsed / 1000).toFixed(1);
            }

            timer_label.text = `Time spent: ${(elapsed / 1000).toFixed(1)}s Best Time: ${best_time}s`
        }, 100);

        if (pumpkin_pairs == found_pairs.length - 1) {
            const elapsed = performance.now() - start;
            if ((elapsed / 1000).toFixed(1) < best_time) {
                best_time = (elapsed / 1000).toFixed(1);
            }
            localStorage.setItem(`memory_best_${pumpkin_pairs}`, best_time);
            
            create_label(520, 320, `You win!\nTime took: ${(elapsed / 1000).toFixed(1)} s Best Time: ${best_time_display}`, 48);
            return;
        }

        for (let i = 0; i < arr.length; i++) {
            let row =  Math.floor(i / cols);
            let col = i % cols;
            let index = i;

            if (revealed.includes(i)) {
                const sprite = create_sprite(start_x + col * (pumpkin_size + space_between), start_y + row * (pumpkin_size + space_between), "pumpkin");
                sprite.scale = 1;
                tween(sprite.scale, 0, 0.2, (val) => sprite.scale = val).then(() => {
                    create_label(start_x + col * (pumpkin_size + space_between) + pumpkin_size / 2, start_y + row * (pumpkin_size + space_between) + pumpkin_size / 2, arr[i], 24);
                    tween(sprite.scale, 1, 0.2, (val) => sprite.scale = val).then(() => {
                        wait(0.5, () => {
                            if (found_pair == null) {
                                clearInterval(timer_interval_id);
                                go("game", pumpkin_pairs, arr, [], found_pairs, start);
                            }
                            else {
                                destroy(sprite);
                            }
                        });
                    });
                })
            } else if (found_pairs.includes(arr[i])) {
                const sprite = create_sprite(start_x + col * (pumpkin_size + space_between), start_y + row * (pumpkin_size + space_between), "pumpkin");
                sprite.opacity = 0.5;
                create_label(start_x + col * (pumpkin_size + space_between) + pumpkin_size / 2, start_y + row * (pumpkin_size + space_between) + pumpkin_size / 2, arr[i], 24);
            } else {
                const btn = create_texturebutton(start_x + col * (pumpkin_size + space_between), start_y + row * (pumpkin_size + space_between), "pumpkin", () => {
                    btn.scale = 1.1;
                    tween(btn.scale, 1, 0.2, (val) => btn.scale = val);
                    clearInterval(timer_interval_id);
                    go("game", pumpkin_pairs, arr, revealed.concat([index]), found_pairs, start);
                })
            }
        }

    });

    scene("play", () => {
        create_label(WIDTH / 2 - 16 * "Difficulty Selector".length, HEIGHT / 8, "Difficulty Selector", 56);
        vertical_buttons(WIDTH / 4, HEIGHT / 4, [
            ["Easy", color(127, 127, 127), color(0, 0, 0, 0), scene_lambda("game", 5)], 
            ["Medium", color(127, 127, 127), color(0, 0, 0, 0), scene_lambda("game", 10)],
            ["Hard", color(127, 127, 127), color(0, 0, 0, 0), scene_lambda("game", 15)],
            ["Extra Hard", color(127, 127, 127), color(0, 0, 0, 0), scene_lambda("game", 20)]
        ], WIDTH / 2, HEIGHT / 8, HEIGHT / 50)
    });

    return ["Pumpkin Memory", SETTINGS];
}