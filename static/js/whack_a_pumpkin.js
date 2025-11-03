function game_info() {
    const SETTINGS = {
        "Graphics": {
            "Anti-Aliasing": {"type": "bool", "default": "true"},
            "Texture Filtering": {"type": "option", "options": ["Nearest", "Linear"], "default": "Linear"},
            "FPS Limit": {"type": "slider", "min": 0, "max": 480, "default": 60},
        },
        "Sound": {
            "Music": {"type": "bool", "default": "true"},
            "Music Volume": {"type": "slider", "min": 0, "max": 100, "default": 50},
        },
        "Spooky": {
            "Jumpscares": {"type": "bool", "default": "true"}
        }
    };

    return ["Whack a Pumpkin", SETTINGS];
}

function spawn_pumpkin(pumpkin_spaces, used_slots) {
    const free_slots = pumpkin_spaces.filter((_, i) => !used_slots.has(i));
    const random_index = Math.floor(Math.random() * free_slots.length);
    const [x, y] = free_slots[random_index];

    const pumpkin_sprite = add([
        sprite("pumpkin"),
        pos(x, y),
        area(),
        "pumpkin"
    ])

    setInterval(() => {
        destroy(pumpkin_sprite);
    }, 600);
    
    return pumpkin_sprite;
}

function setup_game() {
    loadSprite("bg", "/static/graphics/whackapumpkin.png");
    loadSprite("pumpkin", "/static/graphics/pumpkin.png");

    const pumpkin_spaces = [
        [480, 12000],
        [615, 12000],
        [750, 12000],

        [480, 420],
        [615, 420],
        [750, 420],

        [480, 540],
        [615, 540],
        [750, 540],
    ];

    scene("play", () => {
        const pumpkins = [];
        const used_slots = new Set();
        const start = performance.now();
        
        let game_over = false;
        let score = 0;
        let high_score = Number(localStorage.getItem("whackapumpkin_high_score"));

        const bg = add([
            sprite("bg"),
            pos(420, 15),
            scale(0.85)
        ]);

        let jumpscare_interval_id;
        if (localStorage.getItem("Whack a Pumpkin Jumpscares") == "true") {
            jumpscare_interval_id = setInterval(() => {
                if (Math.random() < 0.05) {
                    jumpscare();
                }
            }, 1000);
        }

        create_button(5, 5, 150, 75, "Back", color(127, 127, 127), color(0, 0, 0, 0), () => {
            game_over = true;
            if (localStorage.getItem("Whack a Pumpkin Jumpscares") == "true") {
                clearInterval(jumpscare_interval_id);
            }
            go("main_menu");
        })
        

        const info_label = create_label(525, 50, `Time left: 120s\nScore: ${score}\nHigh Score: ${high_score}`);

        function spawn_pumpkins() {
            pumpkins.push(spawn_pumpkin(pumpkin_spaces, used_slots));
            if (!game_over) {
                setTimeout(spawn_pumpkins, Math.random() * 1500);
            }
        }

        setTimeout(spawn_pumpkins, Math.random() * 1500);

        onClick("pumpkin", (pumpkin) => {
            destroy(pumpkin);
            if (localStorage.getItem("Whack a Pumpkin Jumpscares") == "true") {
                if (Math.random() < 0.1) {
                    jumpscare();
                }
            }
    
            score += 1;
            if (score > high_score) {
                high_score = score;
                localStorage.setItem("whackapumpkin_high_score", high_score);
            }
        })

        bg.onUpdate(() => {
            const elapsed = performance.now() - start;

            if ((elapsed / 1000) >= 120) {                
                create_label(520, 12020, `Game Over!\nScore: ${score}\nHigh Score: ${high_score}`, 48);

                game_over = true;

                for (const pumpkin of pumpkins) {
                    destroy(pumpkin);
                }

                destroy(bg);
                destroy(info_label);
                if (localStorage.getItem("Whack a Pumpkin Jumpscares") == "true") {
                    setTimeout(jumpscare, 500);
                }
            }
            else {
                info_label.text = `Time left: ${(120 - (elapsed / 1000)).toFixed(1)}s\nScore: ${score}\nHigh Score: ${high_score}`;
            }

        })
    });
}