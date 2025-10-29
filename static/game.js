const WIDTH = 1280;
const HEIGHT = 720;

const SETTINGS = {
    "Graphics": {
        "Anti-Aliasing": {"type": "bool", "default": true},
        "Texture Filtering": {"type": "option", "options": ["Nearest", "Linear"], "default": "Linear"},
        "VSync": {"type": "bool", "default": true},
        "FPS Limit": {"type": "slider", "min": 0, "max": 480, "default": 60},
    },
    "Sound": {
        "Music": {"type": "bool", "default": true},
        "SFX": {"type": "bool", "default": true},
        "Music Volume": {"type": "slider", "min": 0, "max": 100, "default": 50},
        "SFX Volume": {"type": "slider", "min": 0, "max": 100, "default": 50},
    }
}

kaplay(
    { 
        width: WIDTH,
        height: HEIGHT,
        canvas: document.getElementById("canvas"),
        root: document.getElementById("game-container"),
        font: "New Rocker",
        background: "#e18888",
        buttons: {
            up_: {
                keyboard: "up",
                gamepad: "south", 
            },
        }
    }
);

function change_setting(category, setting, value) {
    localStorage.setItem(setting, value);
    go("settings", category);
}

function show_settings(category) {
    const x = 400;
    const label_x = 50;
    const space_between = 100;
    let y = 130;
    
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
            create_slider(x, y, 400, Number(settings_dict.min), Number(settings_dict.max), Number(value), () => {
                localStorage.setItem(currentKey, value);
            });
        }
        
        y = y + space_between;
    }
}

function start_game(title) {
    scene("settings", (setting_category) => {
        let generated_button_lists = Object.entries(SETTINGS).map(([key, value]) => [key, color(127, 127, 127), color(0, 0, 0, 0), scene_lambda("settings", key)]);
        generated_button_lists = [["Back", color(127, 127, 127), color(0, 0, 0, 0), scene_lambda("main_menu")]].concat(generated_button_lists);

        horizontal_buttons(10, 10, generated_button_lists, 200, 75, 10);

        if (setting_category != null) {
            show_settings(setting_category);
        }
        else {
            show_settings(Object.keys(SETTINGS)[0]);
        }
    })

    scene("main_menu", () => {
        create_label(WIDTH / 2 - 16 * title.length, HEIGHT / 4, title, 56);
        vertical_buttons(WIDTH / 4, HEIGHT / 2.25, [["Play", color(127, 127, 127), color(0, 0, 0, 0), scene_lambda("play")], ["Settings", color(127, 127, 127), color(0, 0, 0, 0), scene_lambda("settings")]], WIDTH / 2, HEIGHT / 8, HEIGHT / 50)
    });

    go("main_menu");
}