function spawn_enemy() {
    let enemy_type = "tombstone";
    const enemy_width = 140;
    const enemy_height = 120;
    const enemy_sprite = add([
        sprite(enemy_type),
        pos(1280 - enemy_width, 720 - enemy_height),
        scale(0.05),
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
    const SETTINGS = {
        "Graphics": {
            "Anti-Aliasing": {"type": "bool", "default": "true"},
            "Texture Filtering": {"type": "option", "options": ["Nearest", "Linear"], "default": "Linear"},
            "FPS Limit": {"type": "slider", "min": 0, "max": 480, "default": 60},
        },
        "Sound": {
            "Music": {"type": "bool", "default": "true"},
            "SFX": {"type": "bool", "default": "true"},
            "Music Volume": {"type": "slider", "min": 0, "max": 100, "default": 50},
            "SFX Volume": {"type": "slider", "min": 0, "max": 100, "default": 50},
        },
        "Input": {
            "Controller Enabled": {"type": "bool", "default": "true"}
        }
    };
    const GRAVITY = 2500;
    const JUMP_VELOCITY = -1200;
    const GROUND_Y = 670;

    scene("play", () => {
        let score = 0;
        let high_score = localStorage.getItem("pumpkin_roll_highscore");
        let game_over = false;
        let enemys = [];
        let last_enemy_spawn = performance.now();

        const score_label = create_label(480, 10, `Score: ${score} High Score: ${high_score}`);

        if (high_score == null) {
            high_score = 0;
        }

        let pumpkin_sprite = add([
            sprite("pumpkin"),
            pos(50, 670),
            anchor("center"),
            rotate(0),
            area(),
            "pumpkin"
        ])
        
        pumpkin_sprite.isJumping = false;

        create_button(5, 5, 150, 75, "Back", color(127, 127, 127), color(0, 0, 0, 0), scene_lambda("main_menu"))
        
        onCollide("pumpkin", "enemy", () => {
            if (game_over) return;
            game_over = true;

            for (let enemy of enemys) {
                destroy(enemy);
            }

            create_label(520, 320, `Game Over!\nScore: ${Math.floor(score)}\nHigh Score: ${high_score}`, 48);
        })

        enemy_spawn_with_check = () => {
            if (game_over) {
                return
            }
            enemys.push(spawn_enemy())
        }

        spawn_enemy();

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
                    enemys.push(spawn_enemy());
                    setTimeout(enemy_spawn_with_check, 150);
                    setTimeout(enemy_spawn_with_check, 300);              
                }
                else if (random < 0.5) {
                    enemys.push(spawn_enemy());
                    setTimeout(enemy_spawn_with_check, 150);  
                }
                else {
                    enemys.push(spawn_enemy());
                }
            }

            if (isKeyDown("space") && !pumpkin_sprite.isJumping) {
                pumpkin_sprite.vy = JUMP_VELOCITY;
                pumpkin_sprite.isJumping = true;
            }

            pumpkin_sprite.angle = (pumpkin_sprite.angle + dt() * 270) % 360;

            if (!pumpkin_sprite.isJumping) return;

            pumpkin_sprite.vy += GRAVITY * dt();
            pumpkin_sprite.pos.y += pumpkin_sprite.vy * dt();

            if (pumpkin_sprite.pos.y >= GROUND_Y) {
                pumpkin_sprite.pos.y = GROUND_Y;
                pumpkin_sprite.isJumping = false;
                pumpkin_sprite.vy = 0;
            }
        });
    })

    return ["Pumpkin Roll", SETTINGS];
}