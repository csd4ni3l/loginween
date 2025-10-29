scene("game", (pumpkin_pairs) => {
})

scene("play", () => {
    create_label(WIDTH / 2 - 16 * "Difficulty Selector".length, HEIGHT / 8, "Difficulty Selector", 56);
    vertical_buttons(WIDTH / 4, HEIGHT / 4, [
        ["Easy", color(127, 127, 127), color(0, 0, 0, 0), scene_lambda("game", 6)], 
        ["Medium", color(127, 127, 127), color(0, 0, 0, 0), scene_lambda("game", 9)],
        ["Hard", color(127, 127, 127), color(0, 0, 0, 0), scene_lambda("game", 12)],
        ["Extra Hard", color(127, 127, 127), color(0, 0, 0, 0), scene_lambda("game", 15)]
    ], WIDTH / 2, HEIGHT / 8, HEIGHT / 50)
})