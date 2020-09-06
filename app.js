document.addEventListener("DOMContentLoaded", function() {

    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');

    const entities = [
        {
            name: 'wall',
            code: 'W',
            size: { x: 16, y: 16},
            src: 'img/wall.png'
        },
        {
            name: 'wall_left',
            code: 'L',
            size: { x: 16, y: 16},
            src: 'img/wall-left.png'
        },
        {
            name: 'wall_right',
            code: 'R',
            size: { x: 16, y: 16},
            src: 'img/wall-right.png'
        },
        {
            name: 'wall_both',
            code: 'B',
            size: { x: 16, y: 16},
            src: 'img/wall-both.png'
        },
        {
            name: 'floor',
            code: 'F',
            size: { x: 16, y: 16},
            src: 'img/floor.png'
        },
        {
            name: 'cheese',
            code: 'C',
            size: { x: 16, y: 16},
            src: 'img/cheese_16x16.png'
        },
        {
            name: 'cheese_master',
            code: 'M',
            size: { x: 16, y: 16},
            src: 'img/cheese-master.png'
        }
    ];

    function renderEntity(entities, entityCode, x, y) {
        const entity = entities.find(x => x.code == entityCode);
        if (entity === undefined) {
            console.log('ERROR', `Entity with code '${entityCode}' not found`);
        }
        else
        {
            context.drawImage(entity.img, x, y);
        }
    }

    function redenerScenery(entities, level) {
        const NO_OF_LINES = 32;
        const NO_OF_COLUMNS = 32;
        const COLUMN_WIDTH = 16;
        const LINE_HEIGHT = 16;
        for (let line = 0 ; line < NO_OF_LINES ; line++ ) {
            for (let col = 0 ; col < NO_OF_COLUMNS ; col++) {
                const entityCode = level.data[line].charAt(col);
                const x = col * COLUMN_WIDTH;
                const y = line * LINE_HEIGHT;
                renderEntity(entities, entityCode, x, y);
            }
        }
    }

    const controls = {
        player: {
            upPressed: false,
            downPressed: false,
            leftPressed: false,
            rightPressed: false
        }
    };

    document.addEventListener('keydown', function(event) {
        if (event.key === 'ArrowUp' || event.key === 'w') {
            controls.player.upPressed = true;
        }
        if (event.key === 'ArrowDown' || event.key === 's') {
            controls.player.downPressed = true;
        }
        if (event.key === 'ArrowLeft' || event.key === 'a') {
            controls.player.leftPressed = true;
        }
        if (event.key === 'ArrowRight' || event.key === 'd') {
            controls.player.rightPressed = true;
        }
    });


    function updateWorld(entities, level, time)
    {
        if (controls.player.upPressed) {
            level.player.currentLocation.y--;
            controls.player.upPressed = false;
        }
        if (controls.player.downPressed) {
            level.player.currentLocation.y++;
            controls.player.downPressed = false;
        }
        if (controls.player.leftPressed) {
            level.player.currentLocation.x--;
            controls.player.leftPressed = false;
        }
        if (controls.player.rightPressed) {
            level.player.currentLocation.x++;
            controls.player.rightPressed = false;
        }

        redenerScenery(entities, level);
        renderEntity(entities, 'C', 16, 16);
        renderEntity(entities, 'M', level.player.currentLocation.x, level.player.currentLocation.y);
        window.requestAnimationFrame((t) => updateWorld(entities, level, t));
    }



    let promises = [];
    for(const element of entities) {
        element.img = new Image(element.size.x, element.size.y);
        element.img.src = element.src;
        let promise = new Promise((resolve,reject) => {
            element.img.onload = () => {
                resolve();
            }
        });
        promises.push(promise);
    }

    Promise.all(promises).then(() => {
        fetch('level1.json')
            .then(response => response.json())
            .then(level =>  {
                level.player.currentLocation = level.player.start;
                updateWorld(entities, level, null);
            })
            .catch((error) => console.log('Error:', error));
    });

});