function create_button(x, y, w, h, label_text, bg, text_color, on_click) {
    let button = add([
        rect(w, h), 
        pos(x, y),
        bg,
        area(),
    ]);

    button.add([
        text(label_text, {
            width: w / 1.5,
            size: 28,
        }),
        text_color,
        pos(w / 2 - (label_text.length * 8), h / 2 - 18)
    ]);

    button.onClick(on_click);
    button.onHover(() => {
        button.scale = vec2(1.025, 1.025);
        setCursor("pointer");
    });
    
    button.onHoverEnd(() => {
        button.scale = vec2(1, 1);
        setCursor("default");
    });
    

    return button;
}

function create_slider(x, y, w, min_val, max_val, initial_val, on_change) {
    const slider_height = 15;
    const handle_size = 30;
    
    let slider_container = add([
        pos(x, y),
    ]);
    
    let track = slider_container.add([
        rect(w, slider_height),
        pos(0, handle_size / 2 - slider_height / 2),
        color(100, 100, 100),
        area()
    ]);
    
    let value = initial_val;
    let handle_x = ((value - min_val) / (max_val - min_val)) * w;
    
    let handle = slider_container.add([
        rect(handle_size, handle_size),
        pos(handle_x - handle_size / 2, 0),
        color(255, 255, 255),
        area(),
        "slider_handle"
    ]);
    
    let value_label = slider_container.add([
        text(value.toFixed(0), { size: 16 }),
        pos(w + 10, handle_size / 2 - 8),
        color(255, 255, 255),
    ]);
    
    let is_dragging = false;
    
    handle.onHover(() => {
        setCursor("pointer");
    });
    
    handle.onHoverEnd(() => {
        if (!is_dragging) {
            setCursor("default");
        }
    });
    
    handle.onMousePress(() => {
        is_dragging = true;
        setCursor("grabbing");
    });
    
    onMouseRelease(() => {
        if (is_dragging) {
            is_dragging = false;
            setCursor("default");
        }
    });
    
    onMouseMove(() => {
        if (is_dragging) {
            let mouse_x = mousePos().x - slider_container.pos.x;
            mouse_x = Math.max(0, Math.min(w, mouse_x));
            
            handle.pos.x = mouse_x - handle_size / 2;
            
            value = min_val + (mouse_x / w) * (max_val - min_val);
            value_label.text = value.toFixed(0);
            
            if (on_change) {
                on_change(value);
            }
        }
    });
    
    track.onHover(() => {
        setCursor("pointer");
    });
    
    track.onHoverEnd(() => {
        setCursor("default");
    });
    
    track.onClick(() => {
        if (!is_dragging) {
            let mouse_x = mousePos().x - slider_container.pos.x;
            mouse_x = Math.max(0, Math.min(w, mouse_x));
            
            handle.pos.x = mouse_x - handle_size / 2;
            value = min_val + (mouse_x / w) * (max_val - min_val);
            value_label.text = value.toFixed(0);
            
            if (on_change) {
                on_change(value);
            }
        }
    });
    
    track.use(area());
    
    return {
        obj: slider_container,
        getValue: () => value,
        setValue: (new_val) => {
            value = Math.max(min_val, Math.min(max_val, new_val));
            handle_x = ((value - min_val) / (max_val - min_val)) * w;
            handle.pos.x = handle_x - handle_size / 2;
            value_label.text = value.toFixed(0);
        }
    };
}

function create_dropdown(x, y, w, h, options, initial_index, on_select) {
    let selected_index = initial_index || 0;
    let is_open = false;
    
    let dropdown = add([
        pos(x, y),
        z(10),
    ]);
    
    let selected_box = dropdown.add([
        rect(w, h),
        pos(0, 0),
        color(60, 60, 60),
        area(),
        outline(2, rgb(100, 100, 100)),
    ]);
    
    let selected_text = dropdown.add([
        text(options[selected_index], { size: 20 }),
        pos(10, h / 2 - 10),
        color(255, 255, 255),
    ]);
    
    let arrow = dropdown.add([
        text("▼", { size: 16 }),
        pos(w - 25, h / 2 - 8),
        color(200, 200, 200),
    ]);
    
    let options_container = null;
    let option_items = [];
    
    function create_options_menu() {
        if (options_container) {
            destroy(options_container);
        }
        
        options_container = dropdown.add([
            pos(0, h + 2),
            z(20),
        ]);
        
        option_items = [];
        
        options.forEach((option, index) => {
            let option_box = options_container.add([
                rect(w, h),
                pos(0, index * h),
                color(50, 50, 50),
                area(),
                outline(1, rgb(80, 80, 80)),
            ]);
            
            let option_text = options_container.add([
                text(option, { size: 20 }),
                pos(10, index * h + h / 2 - 10),
                color(255, 255, 255),
            ]);
            
            option_box.onHover(() => {
                option_box.color = rgb(80, 80, 80);
                setCursor("pointer");
            });
            
            option_box.onHoverEnd(() => {
                option_box.color = rgb(50, 50, 50);
                setCursor("default");
            });
            
            option_box.onClick(() => {
                selected_index = index;
                selected_text.text = options[index];
                close_dropdown();
                if (on_select) {
                    on_select(options[index], index);
                }
            });
            
            option_items.push({ box: option_box, text: option_text });
        });
    }
    
    function open_dropdown() {
        is_open = true;
        arrow.text = "▲";
        create_options_menu();
    }
    
    function close_dropdown() {
        is_open = false;
        arrow.text = "▼";
        if (options_container) {
            destroy(options_container);
            options_container = null;
        }
    }
    
    selected_box.onHover(() => {
        selected_box.color = rgb(70, 70, 70);
        setCursor("pointer");
    });
    
    selected_box.onHoverEnd(() => {
        selected_box.color = rgb(60, 60, 60);
        setCursor("default");
    });
    
    selected_box.onClick(() => {
        if (is_open) {
            close_dropdown();
        } else {
            open_dropdown();
        }
    });
    
    onClick(() => {
        if (is_open) {
            let mouse = mousePos();
            let in_bounds = mouse.x >= x && mouse.x <= x + w && 
                           mouse.y >= y && mouse.y <= y + h + (options.length * h);
            if (!in_bounds) {
                close_dropdown();
            }
        }
    });
    
    return {
        obj: dropdown,
        getValue: () => options[selected_index],
        getIndex: () => selected_index,
        setIndex: (index) => {
            if (index >= 0 && index < options.length) {
                selected_index = index;
                selected_text.text = options[index];
            }
        },
        close: close_dropdown
    };
}

function create_label(x, y, label_text, font_size) {
    return add([
        text(label_text, {
            size: font_size,
        }),
        color(0, 0, 0),
        pos(x, y)
    ])
}

function horizontal_buttons(start_x, start_y, buttons, width, height, space_between) {
    for (let i = 0; i < buttons.length; i++) {
        create_button(start_x + i * (width + space_between), start_y, width, height, buttons[i][0], buttons[i][1], buttons[i][2], buttons[i][3])
    }
}

function vertical_buttons(start_x, start_y, buttons, width, height, space_between) {
    for (let i = 0; i < buttons.length; i++) {
        create_button(start_x, start_y + i * (height + space_between), width, height, buttons[i][0], buttons[i][1], buttons[i][2], buttons[i][3])
    }
}

function scene_lambda(scene, args) {
    return () => {
        go(scene, args);
    }
}