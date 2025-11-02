const WIDTH = 1280;
const HEIGHT = 720;
let music_played = false;

function jumpscare() {
    play("jumpscare", {
        volume: 1.5
    })
    const jumpscare_sprite = create_sprite(0, 0, "jumpscare");
    setTimeout(() => {
        destroy(jumpscare_sprite);
    }, 1500);
}

function change_setting(category, setting, value, GAME_TITLE) {
    localStorage.setItem(`${GAME_TITLE} ${setting}`, value);
    go("settings", category);
}

function show_settings(category, GAME_TITLE, SETTINGS) {
    const x = 400;
    const label_x = 50;
    const space_between = 100;
    let y = 130 + space_between;

    create_label(label_x, y - space_between, "All settings require a page reload to take effect!", 32);
    
    for (let key in SETTINGS[category]) {
        const settings_dict = SETTINGS[category][key];
        const currentKey = key;

        create_label(label_x, y + 10, key, 32);
        
        let value = localStorage.getItem(`${GAME_TITLE} ${key}`);

        if (value == null) {
            localStorage.setItem(`${GAME_TITLE} ${key}`, settings_dict.default);
            value = settings_dict.default;
        }

        if (settings_dict.type == "bool") {
            horizontal_buttons(x, y, [
                [
                    "ON", 
                    value === "true" ? color(255, 255, 255) : color(127, 127, 127),
                    color(0, 0, 0, 0),  
                    () => { change_setting(category, currentKey, true, GAME_TITLE); }
                ], 
                [
                    "OFF", 
                    value === "false" ? color(255, 255, 255) : color(127, 127, 127),
                    color(0, 0, 0, 0),  
                    () => { change_setting(category, currentKey, false, GAME_TITLE); }
                ]
            ], 100, 50, 20);

        }
        else if (settings_dict.type == "option") {
            create_dropdown(x, y, 300, 75, settings_dict.options, settings_dict.options.indexOf(value), (option) => {
                localStorage.setItem(`${GAME_TITLE} ${currentKey}`, option);
            });
        }
        else if (settings_dict.type == "slider") {
            create_slider(x, y, 400, Number(settings_dict.min), Number(settings_dict.max), Number(value), (new_value) => {
                localStorage.setItem(`${GAME_TITLE} ${currentKey}`, new_value);
            });
        }
        
        y = y + space_between;
    }
}

function create_start_overlay(GAME_TITLE) {
    const overlay = add([
        rect(WIDTH, HEIGHT),
        color(0, 0, 0),
        opacity(0.6),
        pos(0, 0),
        area(),
        z(1000),
        "overlay"
    ])

    const text_label = add([
        text("Click to Start", { size: 48 }),
        pos(WIDTH / 2, HEIGHT / 2),
        anchor("center"),
        color(255, 255, 255),
        z(1001)
    ])

    onClick("overlay", () => {
        const bgm = play("music", {
            volume: Number(localStorage.getItem(`${GAME_TITLE} Music Volume`) || 50) / 100,
            loop: true
        });

        destroy(overlay);
        destroy(text_label);
    })
}


function start_game() {
    const [GAME_TITLE, SETTINGS] = game_info();

    kaplay(
        { 
            width: WIDTH,
            height: HEIGHT,
            canvas: document.getElementById("canvas"),
            root: document.getElementById("game-container"),
            crisp: !localStorage.getItem(`${GAME_TITLE} Anti-Aliasing`),
            texFilter: (localStorage.getItem(`${GAME_TITLE} Texture Filtering`) || "nearest").toLowerCase(),
            maxFPS: Number(localStorage.getItem(`${GAME_TITLE} FPS Limit`)),
            font: "New Rocker",
            background: "#e18888",
        }
    );

    setup_game();
    
    loadSprite("jumpscare", "/static/graphics/jumpscare.jpg");
    loadSound("jumpscare", "/static/sound/jumpscare.mp3");
    loadSound("music", "/static/sound/music.mp3");

    scene("settings", (setting_category) => {
        let generated_button_lists = Object.entries(SETTINGS).map(([key, value]) => [key, color(127, 127, 127), color(0, 0, 0, 0), scene_lambda("settings", key)]);
        generated_button_lists = [["Back", color(127, 127, 127), color(0, 0, 0, 0), scene_lambda("main_menu")]].concat(generated_button_lists);

        horizontal_buttons(10, 10, generated_button_lists, 200, 75, 10);

        if (setting_category != null) {
            show_settings(setting_category, GAME_TITLE, SETTINGS);
        }
        else {
            show_settings(Object.keys(SETTINGS)[0], GAME_TITLE, SETTINGS);
        }
    })

    scene("main_menu", () => {
        create_label(WIDTH / 2 - 16 * GAME_TITLE.length, HEIGHT / 4, GAME_TITLE, 56);
        vertical_buttons(WIDTH / 4, HEIGHT / 2.25, [["Play", color(127, 127, 127), color(0, 0, 0, 0), scene_lambda("play")], ["Settings", color(127, 127, 127), color(0, 0, 0, 0), scene_lambda("settings")]], WIDTH / 2, HEIGHT / 8, HEIGHT / 50)
        if (!music_played) {
            create_start_overlay(GAME_TITLE);
            music_played = true;
        }
    });

    go("main_menu");
}