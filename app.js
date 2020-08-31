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

    let promises = [];
    for(const element of entities) {
        element.img = new Image(element.size.x, element.size.y);
        element.img.src = element.src;
        let promise = new Promise((resolve,reject) => {
            element.img.onload = () => {
                console.log('Loaded', element);
                resolve();
            }
        });
        promises.push(promise);
    }

    Promise.all(promises).then(() => {
        console.log("Loaded all");
        fetch('level1.json')
            .then(response => response.json())
            .then(data => {
                console.log(data);
                const NO_OF_LINES = 32;
                const NO_OF_COLUMNS = 32;
                const COLUMN_WIDTH = 16;
                const LINE_HEIGHT = 16;
                for (let line = 0 ; line < NO_OF_LINES ; line++ ) {
                    for (let col = 0 ; col < NO_OF_COLUMNS ; col++) {
                        const entityCode = data.data[line].charAt(col);
                        const x = col * COLUMN_WIDTH;
                        const y = line * LINE_HEIGHT;
                        renderEntity(entities, entityCode, x, y);
                    }
                }
            })
            .catch((error) => console.log('Error:', error));
    });

});