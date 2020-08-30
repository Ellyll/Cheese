document.addEventListener("DOMContentLoaded", function() {

    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');

    // context.fillStyle = '#FF0000';
    // context.fillRect(0, 0, 250, 250);
    // context.fill();


    const wallImg = new Image(16,16);
    wallImg.src = 'img/wall.png';
    wallImg.onload = () => {
        context.drawImage(wallImg, 0, 0);
        context.drawImage(wallImg, 16, 0);
        context.drawImage(wallImg, 32, 0);
    };

    const floorImg = new Image(16,16);
    floorImg.src = 'img/floor.png';
    floorImg.onload = () => {
        context.drawImage(floorImg, 0, 16);
        context.drawImage(floorImg, 16, 16);
        context.drawImage(floorImg, 32, 16);
    };

    const cheeseImg = new Image(16,16);
    cheeseImg.src = 'img/cheese_16x16.png';
    cheeseImg.onload = () => context.drawImage(cheeseImg, 0, 16);

});