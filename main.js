onload = function () {
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');
    ctx.scale(20, 20);

    var tetris = new Tetris();
    tetris.init(ctx, canvas);


    document.addEventListener("keydown", event => {
        if (event.keyCode === 37) {
            tetris.playerMove(-1);
        }
        if (event.keyCode == 39) {
            tetris.playerMove(1);
        }
        if (event.keyCode == 40) {
            tetris.playerDrop();
        }
        if (event.keyCode == 38) {
            tetris.playerRotate(1);
        }
    });
    
    tetris.update();
};