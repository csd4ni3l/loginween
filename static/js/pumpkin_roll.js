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
        "Input": {
            "Controller Enabled": {"type": "bool", "default": "true"}
        },
        "Spooky": {
            "Jumpscares": {"type": "bool", "default": "true"}
        }
    };
    
    return ["Pumpkin Roll", SETTINGS];
}

function spawn_enemy(enemy_type) {
    let enemy_width;
    let enemy_height;
    let start_y;
    if (enemy_type == "tombstone") {
        scale_f = scale(0.05);
        start_y = 720;
        enemy_width = 140;
        enemy_height = 120;
    }
    else {
        scale_f = scale(0.5);
        start_y = 600;
        enemy_width = 148;
        enemy_height = 147;
    }

    const enemy_sprite = add([
        sprite(enemy_type),
        pos(1280 - enemy_width, start_y - enemy_height),
        scale_f,
        area(),
        "enemy"
    ]);

    enemy_sprite.onUpdate(() => {
        enemy_sprite.pos.x -= 1000 * dt();

        if (enemy_sprite.pos.x <= -enemy_width) {
            destroy(enemy_sprite);
        }
    })
    return enemy_sprite;
}

function setup_game() {
    loadSprite("pumpkin", "/static/graphics/pumpkin.png");
    loadSprite("tombstone", "/static/graphics/tombstone.png");
    loadSprite("bird", "/static/graphics/bird.png");

    const GRAVITY = 2500;
    const JUMP_VELOCITY = -1200;
    const GROUND_Y = 670;

    scene("play", () => {
        let score = 0;
        let high_score = Number(localStorage.getItem("pumpkin_roll_highscore"));
        let game_over = false;
        let enemies = [];
        let last_enemy_spawn = performance.now();

        const score_label = create_label(480, 10, `Score: ${score} High Score: ${high_score}`);
        
        let pumpkin_sprite = add([
            sprite("pumpkin"),
            pos(50, 670),
            anchor("center"),
            rotate(0),
            area(),
            "pumpkin"
        ])
        
        pumpkin_sprite.isJumping = false;

        let jumpscare_interval_id;
        if (localStorage.getItem("Pumpkin Roll Jumpscares") == "true") {
            jumpscare_interval_id = setInterval(() => {
                if (Math.random() < 0.035) {
                    jumpscare();
                }
            }, 1000);
        }

        create_button(5, 5, 150, 75, "Back", color(127, 127, 127), color(0, 0, 0, 0), () => {
            if (localStorage.getItem("Pumpkin Roll Jumpscares") == "true") {
                clearInterval(jumpscare_interval_id);
            }
            go("main_menu");
        })
        
        onCollide("pumpkin", "enemy", () => {
            if (game_over) return;
            game_over = true;

            for (let enemy of enemies) {
                destroy(enemy);
            }

            if (localStorage.getItem("Pumpkin Roll Jumpscares") == "true") {
                jumpscare();
            }

            create_label(520, 320, `Game Over!\nScore: ${Math.floor(score)}\nHigh Score: ${high_score}`, 48);

            if (localStorage.getItem("Pumpkin Roll Jumpscares") == "true") {
                setTimeout(jumpscare, 500);
            }
        })

        enemy_spawn_with_check = (count) => {
            const enemy_type = Math.random() < 0.75 ? "tombstone" : "bird";
            for (let i = 0; i < count; i++) {
                if (game_over) {
                    return
                }
                
                setTimeout(() => {
                    enemies.push(spawn_enemy(enemy_type));
                }, i * 150);
            }
        }

        enemy_spawn_with_check(1);

        pumpkin_sprite.onUpdate(() => {
            if (game_over) return;
            score += 60 * dt();

            if (Math.floor(score) > high_score) {
                high_score = Math.floor(score);
                localStorage.setItem("pumpkin_roll_highscore", high_score);
            }

            score_label.text = `Score: ${Math.floor(score)} High Score: ${high_score}`;

            if ((performance.now() - last_enemy_spawn) >= 1000) {
                last_enemy_spawn = performance.now();
                const random = Math.random();
                if (random < 0.2) {
                    enemy_spawn_with_check(3);           
                }
                else if (random < 0.5) {
                    enemy_spawn_with_check(2);
                }
                else {
                    enemy_spawn_with_check(1);
                }
            }

            if ((isKeyDown("space") || (localStorage.getItem("Pumpkin Roll Controller Enabled") === "true" && isGamepadButtonDown("south"))) && !pumpkin_sprite.isJumping) {
                pumpkin_sprite.vy = JUMP_VELOCITY;
                pumpkin_sprite.isJumping = true;
            }

            if (pumpkin_sprite.isJumping) {
                pumpkin_sprite.angle = (pumpkin_sprite.angle + dt() * 360) % 360;
            }
            else {
                pumpkin_sprite.angle = (pumpkin_sprite.angle + dt() * 180) % 360;
                return;
            }
            pumpkin_sprite.vy += GRAVITY * dt();
            pumpkin_sprite.pos.y += pumpkin_sprite.vy * dt();

            if (pumpkin_sprite.pos.y >= GROUND_Y) {
                pumpkin_sprite.pos.y = GROUND_Y;
                pumpkin_sprite.isJumping = false;
                pumpkin_sprite.vy = 0;
            }
        });
    })
}