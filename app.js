document.addEventListener("DOMContentLoaded", function() {
    class Vector2 {
        constructor(x,y) {
            this._x = x;
            this._y = y;
        }
        get 0() {
            return this._x; 
        }
        get 1() {
            return this._y; 
        }
        get x() {
            return this._x; 
        }
        get y() {
            return this._y; 
        }
    }

    class BoundingBox {
        constructor(topLeft, bottomRight) {
            this._topLeft = topLeft;
            this._bottomRight = bottomRight;
        }
        get topLeft() { return this._topLeft; }
        get bottomRight() { return this._bottomRight; }
    }

    function resizeCanvas(canvas) {
        let maxSize = Math.min(window.innerWidth, window.innerHeight) - 5; // 5px margin
        canvas.height = maxSize;
        canvas.width = maxSize;
    }

    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');

    resizeCanvas(canvas);
    window.addEventListener("resize", evt => resizeCanvas(canvas));


    const entityTypes = [
        {
            name: 'wall',
            code: 'W',
            size: { x: 16, y: 16},
            src: 'img/wall.png',
            boundingBox: new BoundingBox(new Vector2(0,0), new Vector2(15,15))
        },
        {
            name: 'wall_left',
            code: 'L',
            size: { x: 16, y: 16},
            src: 'img/wall-left.png',
            boundingBox: new BoundingBox(new Vector2(0,0), new Vector2(15,15))
        },
        {
            name: 'wall_right',
            code: 'R',
            size: { x: 16, y: 16},
            src: 'img/wall-right.png',
            boundingBox: new BoundingBox(new Vector2(0,0), new Vector2(15,15))
        },
        {
            name: 'wall_both',
            code: 'B',
            size: { x: 16, y: 16},
            src: 'img/wall-both.png',
            boundingBox: new BoundingBox(new Vector2(0,0), new Vector2(15,15))
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
            src: 'img/cheese-master.png',
            boundingBox: new BoundingBox(new Vector2(0,28), new Vector2(15,31))
        }
    ];

    function addVector2(a,b) {
        return new Vector2(a.x+b.x, a.y+b.y);
    }

    function areBoundingBoxesColliding(a, b) {
        // from: https://stackoverflow.com/questions/20925818/algorithm-to-check-if-two-boxes-overlap#20925869
        let x1min = a.topLeft.x;
        let x1max = a.bottomRight.x;
        let y1min = a.topLeft.y;
        let y1max = a.bottomRight.y
        let x2min = b.topLeft.x;
        let x2max = b.bottomRight.x;
        let y2min = b.topLeft.y;
        let y2max = b.bottomRight.y

        let isOverlapping = (x1min < x2max && x2min < x1max && y1min < y2max && y2min < y1max);
        return isOverlapping;
    }

    function areEntitiesColliding(a, b) {
        if (a.boundingBox === undefined || b.boundingBox === undefined)
            return false;

        // get actual instead of relative coords for bounding boxes
        let bba = new BoundingBox(
            addVector2(a.boundBox.topLeft, a.location),
            addVector2(a.boundBox.bottomRight, a.location),
        );
        let bbb = new BoundingBox(
            addVector2(b.boundBox.topLeft, b.location),
            addVector2(b.boundBox.bottomRight, b.location),
        );

        return areBoundingBoxesColliding(bba, bbb);
    }

    function renderEntityTypeCode(entityTypes, entityCode, x, y) {
        const entityType = entityTypes.find(x => x.code == entityCode);
        if (entityType === undefined) {
            console.log('ERROR', `EntityType with code '${entityCode}' not found`);
        }
        else
        {
            context.drawImage(entityType.img, x, y);
        }
    }

    function renderEntities(entities) {
        entities
            .forEach(entity => {
                context.drawImage(entity.entityType.img, entity.location.x, entity.location.y);
                // if (entity.entityType.boundingBox !== undefined) {
                //     context.strokeStyle = '#0F0'
                //     context.strokeRect(
                //         entity.location.x + entity.entityType.boundingBox.topLeft.x,
                //         entity.location.y + entity.entityType.boundingBox.topLeft.y,
                //         entity.entityType.boundingBox.bottomRight.x - entity.entityType.boundingBox.topLeft.x,
                //         entity.entityType.boundingBox.bottomRight.y - entity.entityType.boundingBox.topLeft.y
                //         );
                // }
            });
    }

    function parseLevelSceneryCode(entityTypes, entityCode, x, y) {
        const entityType = entityTypes.find(x => x.code == entityCode);
        if (entityType === undefined) {
            console.log('ERROR', `Entity with code '${entityCode}' not found`);
        }
        else
        {
            return {
                entityType: entityType,
                location: new Vector2(x,y)
            };
        }
    }

    function parseLevelScenery(data, entityTypes) {
        const NO_OF_LINES = 32;
        const NO_OF_COLUMNS = 32;
        const COLUMN_WIDTH = 16;
        const LINE_HEIGHT = 16;
        const entities = [];
        for (let line = 0 ; line < NO_OF_LINES ; line++ ) {
            for (let col = 0 ; col < NO_OF_COLUMNS ; col++) {
                const entityCode = data[line].charAt(col);
                const x = col * COLUMN_WIDTH;
                const y = line * LINE_HEIGHT;
                entities.push(parseLevelSceneryCode(entityTypes, entityCode, x, y));
            }
        }
        return entities;
    }

    function renderDebugInfo(world) {
        const locationText = `Player.location: ${Math.round(world.player.location.x*100)/100}, ${Math.round(world.player.location.y*100)/100}`;
        const bbLocation = new BoundingBox(
            addVector2(world.player.entityType.boundingBox.topLeft, world.player.location),
            addVector2(world.player.entityType.boundingBox.bottomRight, world.player.location),
        ); 
        const bbText = `BB: ${bbLocation.topLeft.x}, ${bbLocation.topLeft.y} - ${bbLocation.bottomRight.x}, ${bbLocation.bottomRight.y}`;
        const text = locationText + ' ' + bbText;
        context.fillStyle = '#0000FF';
        context.fillText(text, 2, context.canvas.height - 20);
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

    document.addEventListener('keyup', function(event) {
        if (event.key === 'ArrowUp' || event.key === 'w') {
            controls.player.upPressed = false;
        }
        if (event.key === 'ArrowDown' || event.key === 's') {
            controls.player.downPressed = false;
        }
        if (event.key === 'ArrowLeft' || event.key === 'a') {
            controls.player.leftPressed = false;
        }
        if (event.key === 'ArrowRight' || event.key === 'd') {
            controls.player.rightPressed = false;
        }
    });

    function updateWorld(entityTypes, world, currentTime, previousTime)
    {
        if (currentTime !== null && currentTime !== undefined
            && previousTime !== null && previousTime !== undefined) {
            
            let deltaTime = currentTime - previousTime;
            // distance = speed * time (convert milliseconds to seconds)
            let dx = 128 * (deltaTime/1000);
            let dy = dx;

            let newLocation = {
                x: world.player.location.x,
                y: world.player.location.y
            };

            if (controls.player.upPressed) {
                newLocation.y -= dy;
            }
            if (controls.player.downPressed) {
                newLocation.y += dy;
            }
            if (controls.player.leftPressed) {
                newLocation.x -= dx;
            }
            if (controls.player.rightPressed) {
                newLocation.x += dx;
            }

            newLocation.x = Math.round(newLocation.x);
            newLocation.y = Math.round(newLocation.y);

            // If player has tried to move
            if (world.player.location.x != newLocation.x || world.player.location.y != newLocation.y) {

                const newLocationVect = new Vector2(newLocation.x, newLocation.y);
                // get actual instead of relative coords for bounding boxes
                let bbNewLocation = new BoundingBox(
                    addVector2(world.player.entityType.boundingBox.topLeft, newLocationVect),
                    addVector2(world.player.entityType.boundingBox.bottomRight, newLocationVect),
                );
                
                const isPlayerColliding = !world.player.level.entities.every(entity => {
                    if (entity.entityType.boundingBox === undefined)
                        return true;
                    let bbEntity = new BoundingBox(
                        addVector2(entity.entityType.boundingBox.topLeft, entity.location),
                        addVector2(entity.entityType.boundingBox.bottomRight, entity.location)
                    );
                    const areColliding = areBoundingBoxesColliding(bbEntity, bbNewLocation);
                    // if (bbNewLocation.topLeft.y >= 112 && bbNewLocation.topLeft.y <= 127
                    //     && bbNewLocation.topLeft.x <= 15
                    //     && bbEntity.topLeft.x == 0 && bbEntity.topLeft.y >= 112) {
                    //         console.log({areColliding, bbEntity, bbNewLocation});
                    //     }
                    return !areColliding;
                });
                if (isPlayerColliding) {
                    //console.log("player is colliding when attempting to move", { from: world.player.location, to: newLocationVect });
                } else {
                    //console.log("player is NOT colliding when attempting to move", { from: world.player.location, to: newLocationVect });
                    world.player.location = newLocationVect;
                };
            }
        }
       
        renderEntities(world.player.level.entities);
        renderEntityTypeCode(entityTypes, 'C', 16, 16);
        renderEntityTypeCode(entityTypes, 'M', world.player.location.x, world.player.location.y);
        // context.fillStyle = '#0F0';
        // context.strokeRect(
        //     // new Vector2(0,28), new Vector2(15,31)
        //     world.player.location.x + 0,
        //     world.player.location.y + 28,
        //     15,
        //     31-28
        // );
        //renderDebugInfo(world);
        window.requestAnimationFrame((t) => updateWorld(entityTypes, world, t, currentTime));
    }

    let promises = [];
    for(const element of entityTypes) {
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
        // TODO: support multiple levels
        fetch('level1.json')
            .then(response => response.json())
            .then(levelData =>  {

                const world = {
                    player: {},
                    levels: []
                };

                const level1 = {
                    // Parse background/scenery into entities
                    entities: parseLevelScenery(levelData.data, entityTypes)
                };
                world.levels.push(level1);

                // Player start details
                world.player = parseLevelSceneryCode(entityTypes, 'M', levelData.player.start.x, levelData.player.start.y);
                if (world.levels.length < 1)
                    throw "No levels in world.levels";

                world.player.level = world.levels[0];
                console.log('world', world);
                updateWorld(entityTypes, world, null, null);
            })
            .catch((error) => console.log('Error:', error));
    });
});