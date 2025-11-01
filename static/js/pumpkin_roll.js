function setup_game() {
    loadSprite("pumpkin", "/static/graphics/pumpkin.png");
    loadSprite("gravestone", "/static/gravestone.png")
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
        "Input": {
            "Controller Enabled": {"type": "bool", "default": true}
        }
    };

    scene("play", () => {
        let pumpkin_sprite = add([
            sprite("pumpkin"),
            pos(50, 670),
            anchor("center"),
            rotate(0)
        ])

        setInterval(() => {
            pumpkin_sprite.angle = (pumpkin_sprite.angle + dt() * 720) % 360;
        }, 100)
        
        onKeyPress("jump", () => {

        })
    })

    return ["Pumpkin Roll", SETTINGS];
}