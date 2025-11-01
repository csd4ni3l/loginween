const WIDTH = 1280;
const HEIGHT = 720;

function change_setting(category, setting, value) {
    localStorage.setItem(setting, value);
    go("settings", category);
}

function show_settings(category, SETTINGS) {
    const x = 400;
    const label_x = 50;
    const space_between = 100;
    let y;

    if (category == "Graphics") {
        y = 130 + space_between;
        create_label(label_x, y - space_between, "These settings need a page reload to take effect!", 32);
    }
    else {
        y = 130;
    }
    
    for (let key in SETTINGS[category]) {
        const settings_dict = SETTINGS[category][key];
        const currentKey = key;

        create_label(label_x, y + 10, key, 32);
        
        let value = localStorage.getItem(key);

        if (value == undefined) {
            localStorage.setItem(key, settings_dict.default);
            value = settings_dict.default;
        }

        if (settings_dict.type == "bool") {
            horizontal_buttons(x, y, [
                [
                    "ON", 
                    value === "true" ? color(255, 255, 255) : color(127, 127, 127),
                    color(0, 0, 0, 0),  
                    () => { change_setting(category, currentKey, true); }
                ], 
                [
                    "OFF", 
                    value === "false" ? color(255, 255, 255) : color(127, 127, 127),
                    color(0, 0, 0, 0),  
                    () => { change_setting(category, currentKey, false); }
                ]
            ], 100, 50, 20);

        }
        else if (settings_dict.type == "option") {
            create_dropdown(x, y, 300, 75, settings_dict.options, 0, (option) => {
                localStorage.setItem(currentKey, option);
            });
        }
        else if (settings_dict.type == "slider") {
            create_slider(x, y, 400, Number(settings_dict.min), Number(settings_dict.max), Number(value), (new_value) => {
                localStorage.setItem(currentKey, new_value);
            });
        }
        
        y = y + space_between;
    }
}

function start_game() {
    kaplay(
        { 
            width: WIDTH,
            height: HEIGHT,
            canvas: document.getElementById("canvas"),
            root: document.getElementById("game-container"),
            crisp: !localStorage.getItem("Anti-Alasing"),
            texFilter: localStorage.getItem("Texture Filtering").toLowerCase(),
            maxFPS: Number(localStorage.getItem("FPS Limit")),
            font: "New Rocker",
            background: "#e18888",
            buttons: {
                up: {
                    keyboard: "up",
                    gamepad: "south", 
                },
                jump: {
                    keyboard: "space",
                    gamepad: "a"
                }
            }
        }
    );

    const [GAME_TITLE, SETTINGS] = setup_game();

    scene("settings", (setting_category) => {
        let generated_button_lists = Object.entries(SETTINGS).map(([key, value]) => [key, color(127, 127, 127), color(0, 0, 0, 0), scene_lambda("settings", key)]);
        generated_button_lists = [["Back", color(127, 127, 127), color(0, 0, 0, 0), scene_lambda("main_menu")]].concat(generated_button_lists);

        horizontal_buttons(10, 10, generated_button_lists, 200, 75, 10);

        if (setting_category != null) {
            show_settings(setting_category, SETTINGS);
        }
        else {
            show_settings(Object.keys(SETTINGS)[0], SETTINGS);
        }
    })

    scene("main_menu", () => {
        create_label(WIDTH / 2 - 16 * GAME_TITLE.length, HEIGHT / 4, GAME_TITLE, 56);
        vertical_buttons(WIDTH / 4, HEIGHT / 2.25, [["Play", color(127, 127, 127), color(0, 0, 0, 0), scene_lambda("play")], ["Settings", color(127, 127, 127), color(0, 0, 0, 0), scene_lambda("settings")]], WIDTH / 2, HEIGHT / 8, HEIGHT / 50)
    });

    go("main_menu");
}