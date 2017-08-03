var Tetris = function () {
    var ctx;
    var canvas;
    var arena;
    var player;
    var dropCounter;
    var dropInterval;
    var lastTime;
    var doc;
};

Tetris.prototype.init = function (ctx, canvas) {
    this.doc = document;
    this.canvas = canvas;
    this.ctx = ctx;
    this.dropCounter = 0;
    this.dropInterval = 1000;
    this.lastTime = 0;
    this.arena = this.createMatrix(12, 20);

    this.player = {
        pos: {x: 0, y: 0},
        matrix: null,
        score: 0
    };

    this.playerReset();
    this.updateScore();
    this.update();
};

Tetris.prototype.checkFullRow = function () {
    var rowCount = 1;
    outer: for (var y = this.arena.length - 1; y > 0; y--) {
        for (var x = 0; x < this.arena[y].length; x++) {
            if (this.arena[y][x] === 0) {
                continue outer;
            }
        }
        var row = this.arena.splice(y, 1)[0].fill(0);
        this.arena.unshift(row);
        y++;
        this.player.score += rowCount * 10;
        rowCount *= 2;
    }
};

Tetris.prototype.collide = function (arena, player) {
    var [m, o] = [player.matrix, player.pos];
    for (var y = 0; y < m.length; ++y) {
        for (var x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
                    (arena[y + o.y] &&
                            arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
};

Tetris.prototype.createMatrix = function (w, h) {
    var matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
};

Tetris.prototype.createPiece = function (type) {
    var t;
    switch (type) {
        case "T":
            t = [
                [0, 0, 0],
                [1, 1, 1],
                [0, 1, 0]
            ];
            break;
        case "O":
            t = [
                [2, 2],
                [2, 2]
            ];
            break;
        case "L":
            t = [
                [0, 3, 0],
                [0, 3, 0],
                [0, 3, 3]
            ];
            break;
        case "J":
            t = [
                [0, 4, 0],
                [0, 4, 0],
                [4, 4, 0]
            ];
            break;
        case "I":
            t = [
                [0, 5, 0, 0],
                [0, 5, 0, 0],
                [0, 5, 0, 0],
                [0, 5, 0, 0]
            ];
            break;
        case "S":
            t = [
                [0, 6, 6],
                [6, 6, 0],
                [0, 0, 0]
            ];
            break;
        case "Z":
            t = [
                [7, 7, 0],
                [0, 7, 7],
                [0, 0, 0]
            ];
            break;
    }
    return t;
};

Tetris.prototype.colors = [
    null,
    '#800080',
    '#FFFF00',
    '#FFA500',
    '#0000FF',
    '#00FFFF',
    '#00FF00',
    '#FF0000'
];

Tetris.prototype.draw = function () {
    this.ctx.fillStyle = "#000";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawMatrix(this.arena, {x: 0, y: 0});
    this.drawMatrix(this.player.matrix, this.player.pos);
};

Tetris.prototype.drawMatrix = function (matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                this.ctx.fillStyle = this.colors[value];
                this.ctx.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
};

Tetris.prototype.merge = function (arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                this.arena[y + this.player.pos.y][x + this.player.pos.x] = value;
            }
        });
    });
};

Tetris.prototype.playerDrop = function () {
    this.player.pos.y++;
    if (this.collide(this.arena, this.player)) {
        this.player.pos.y--;
        this.merge(this.arena, this.player);
        this.playerReset();
        this.checkFullRow();
        this.updateScore();
    }
    this.dropCounter = 0;
};

Tetris.prototype.playerMove = function (dir) {
    this.player.pos.x += dir;
    if (this.collide(this.arena, this.player)) {
        this.player.pos.x -= dir;
    }
};

Tetris.prototype.playerReset = function () {
    var pieces = 'ILJOTSZ';
    this.player.matrix = this.createPiece(pieces[pieces.length * Math.random() | 0]);
    //this.player.matrix = new Piece(pieces[pieces.length * Math.random() | 0]);
    this.player.pos.y = 0;
    this.player.pos.x = (this.arena[0].length / 2 | 0) - (this.player.matrix[0].length / 2 | 0);
    if (this.collide(this.arena, this.player)) {
        this.arena.forEach(row => row.fill(0));
        this.player.score = 0;
        this.updateScore();
    }
};

Tetris.prototype.playerRotate = function (dir) {
    var pos = this.player.pos.x;
    var offset = 1;
    this.rotate(this.player.matrix, dir);
    while (this.collide(this.arena, this.player)) {
        this.player.pos.x += offset;
        offset = -(offset + (offset > 0) ? 1 : -1);
        if (offset > this.player.matrix[0].length) {
            this.rotate(this.player.matrix, -dir);
            this.player.pos.x = pos;
            return;
        }
    }
};

Tetris.prototype.rotate = function (matrix, dir) {
    for (var y = 0; y < matrix.length; y++) {
        for (var x = 0; x < y; x++) {
            [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        }
    }

    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
};

Tetris.prototype.update = function (time = 0) {
    var deltaTime = time - this.lastTime;
    this.lastTime = time;

    this.dropCounter += deltaTime;
    if (this.dropCounter > this.dropInterval) {
        this.playerDrop();
    }
    this.draw();
    requestAnimationFrame(this.update.bind(this));
};

Tetris.prototype.updateScore = function () {
    this.doc.getElementById('score').innerText = this.player.score;
};

Tetris.prototype.getArena = function () {
    return this.arena;
};