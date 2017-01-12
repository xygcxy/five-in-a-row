/*xuyungeng
* 
*/
var canvas = document.getElementById('canvas');
var ctn = canvas.getContext('2d');

var isWhite = true;   // 是否轮到白棋走
var isWell = false;  // 是否赢了

var imgBlack = new Image();
imgBlack.src = 'keleyib.png';
var imgWhite = new Image();
imgWhite.src = 'keleyiw.png';

var chessData = []; //var chessData = new Array(15)

init();
//初始化棋盘

function init() {
    for (var i = 0; i <= 640; i += 40) {
        //绘制横线
        ctn.beginPath();
        ctn.moveTo(0, i);
        ctn.lineTo(640, i);
        ctn.closePath();
        ctn.stroke();
        //绘制竖线
        ctn.beginPath();
        ctn.moveTo(i, 0);
        ctn.lineTo(i, 640);
        ctn.closePath();
        ctn.stroke();
    }
    //初始化棋盘数组
    for (var x = 0; x < 15; x++) {
        chessData[x] = [];
        for (var y = 0; y < 15; y++) {
            chessData[x][y] = 0;
        }
    }
}
//有些控制

function play(e) {
    var x = parseInt((e.clientX - 20) / 40);
    var y = parseInt((e.clientY - 20) / 40);

    if (chessData[x][y] != 0) {
        alert('你不能在这个位置下棋');
        return;
    }

    if (isWell) {
        alert('游戏已经结束，请刷新重玩！');
        return;
    }

    if (isWhite) {
        drawChess(1, x, y);
        judge(1, x, y);
        isWhite = false;
    } else {
        drawChess(2, x, y);
        judge(2, x, y);
        isWhite = true;
    }

}
//绘制单个棋子

function drawChess(chess, x, y) {

    if (x >= 0 && x < 15 && y >= 0 && y < 15) {
        if (chess == 1) {
            ctn.drawImage(imgWhite, x * 40 + 20, y * 40 + 20);
            chessData[x][y] = 1;
        } else {
            ctn.drawImage(imgBlack, x * 40 + 20, y * 40 + 20);
            chessData[x][y] = 2;
        }
    }
}
//输的算法

function judge(chess, x, y) {
    var hz = 0;
    var ve = 0;
    var nw = 0;
    var ne = 0;
    //判断左右
    for (var i = x; i > 0; i--) {
        if (chessData[i][y] != chess) {
            break;
        }
        hz++;
    }
    for (var i = x + 1; i < 15; i++) {
        if (chessData[i][y] != chess) {
            break;
        }
        hz++;
    }
    //判断上下
    for (var i = y; i > 0; i--) {
        if (chessData[x][i] != chess) {
            break;
        }
        ve++;
    }
    for (var i = y + 1; i < 15; i++) {
        if (chessData[x][i] != chess) {
            break;
        }
        ve++
    }
    //判断左上右下
    for (var i = x, j = y; i > 0, j > 0; i--, j--) {
        if (chessData[i][j] != chess) {
            break;
        }
        nw++;
    }
    for (var i = x + 1, j = y + 1; i < 15, j < 15; i++, j++) {
        if (chessData[i][j] != chess) {
            break;
        }
        nw++;
    }
    //判断右上左下
    for (var i = x, j = y; i >= 0, j < 15; i--, j++) {
        if (chessData[i][j] != chess) {
            break;
        }
        ne++;
    }
    for (var i = x + 1, j = y - 1; i < 15, j >= 0; i++, j--) {
        if (chessData[i][j] != chess) {
            break;
        }
        ne++;
    }

    if (hz >= 5 || ve >= 5 || nw >= 5 || ne >= 5) {
        if (chess == 1) {
            isWell = true;
            alert('白棋赢了');
        } else {
            isWell = true;
            alert('黑棋赢了');
        }
    }
}
/*
* keleyi.com
* 柯 乐 义 
* 代码实现了游戏的功能 但待续改进 比如悔棋等。
*/