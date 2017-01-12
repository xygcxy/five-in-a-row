/**
* Javascript 版五子棋（无禁手）
*/
 
/**
* i表示行，j表示列
* 优先级说明：
* 优先级 priority：(假设下一子后）
* 4:己方胜
* 3:对方胜
* 2:己方活四
* 1;对方活四
* 0:己方三三、三四
* -1: 对方三三、三四
* -2:己方冲四 
* -3: 己方冲四
* -4: 己方活三
* -5: 对方活三
* -6: 己方活二
* -7：对方活二
* -100: 普通
*/
function Gomoku() {
    this.chessboardSize = 14; // 棋盘大小
 
    this.chessState = []; // 保存落子情况，二维数组，i表示行，j表示列
    this.gameover = false;
    this.round = 0;
    this.chessCount = 0;
    this.gameResult = '';
    this.operationLog = [];
    this.relativeEmptyPositon = [];
    this.chess = ['', 'black', 'white'];
    this.role = {
        human: 1, // 'black'
        AI: 2 //'white'
    };
 
    this.turn = this.role.human;
    this.chessClass = {
        white: 'white-chess',
        black: 'black-chess',
        last: 'last-chess'
    };
    this.locale = {};
}
 
/**************** begin DOM 处理 ******************************/
/**
* 生成背景
* @returns {Gomoku.prototype._DOMCreateChessboardBackground.table}
*/
Gomoku.prototype._DOMCreateChessboardBackground = function () {
    var table = $('<table />'), tbody = $('<tbody/>'), i, j, tr;
    table.attr('id', 'chessboard-background');
    for (i = 0; i < this.chessboardSize - 1; i++) {
        tr = $('<tr/>');
        for (j = 0; j < this.chessboardSize - 1; j++) {
            tr.append($('<td/>'));
        }
        tbody.append(tr);
    }
    table.html(tbody);
    return table;
};
/**
* 生成点击区域
* @returns {Gomoku.prototype._DOMCreateChessboardSpace.table}
*/
Gomoku.prototype._DOMCreateChessboardSpace = function () {
    var table = $('<table />'), tbody = $('<tbody/>'), i, j, tr, td;
    table.attr('id', 'chessboard-space');
    for (i = 0; i < this.chessboardSize; i++) {
        tr = $('<tr/>');
        for (j = 0; j < this.chessboardSize; j++) {
            td = $('<td/>');
            td.attr('id', i + '_' + j);
            tr.append(td);
        }
        tbody.append(tr);
    }
    table.html(tbody);
    return table;
};
Gomoku.prototype._DOMSetLang = function (lang) {
    this.locale = locale[lang];
    this._DOMShowText();
};
Gomoku.prototype._DOMShowText = function () {
    $('#restart').html(this.locale.restart);
    $('#regret').html(this.locale.regret);
    if ($('#gameover-lay-win').length == 0) {
        $('body').append('<div id="gameover-lay-win" class="gameover-lay"  style="display: none"></div>');
    }
    if ($('#gameover-lay-lose').length == 0) {
        $('body').append('<div id="gameover-lay-lose" class="gameover-lay"  style="display: none"></div>');
    }
    if ($('#gameover-overlay').length == 0) {
        $('body').append('<div id="gameover-overlay" class="gameover-overlay" style="display: none"></div>');
    }
 
    $('#gameover-lay-win').html(this.locale.youWin);
    $('#gameover-lay-lose').html(this.locale.youLose);
    $('#error').html(this.locale.staleBrowser);
    document.title = this.locale.gomoku;
}
/**
* 生成棋盘
* @returns {undefined}
*/
Gomoku.prototype._DOMCreateChessboard = function () {
    var chessboard = $('<div/>');
    chessboard.attr('id', 'chessboard');
    if (typeof (document.body.style.maxHeight) == 'undefined') {
        chessboard.html('<div class="error" id="error"></div>');
    }
    else {
        chessboard.append(this._DOMCreateChessboardBackground());
        chessboard.append(this._DOMCreateChessboardSpace());
    }
    $('#main').html(chessboard);
    $('#chessboard-space td').html('<span class="last-chess-point"></span>');
    $('#7_7').append('<span class="chessboard-important-point"></span>');
    $('#3_3').append('<span class="chessboard-important-point"></span>');
    $('#11_11').append('<span class="chessboard-important-point"></span>');
    $('#3_11').append('<span class="chessboard-important-point"></span>');
    $('#11_3').append('<span class="chessboard-important-point"></span>');
    this._DOMInitEvent();
    $('#zh-cn').click();
};
/**
* 初始化点击事件
* @returns {undefined}
*/
Gomoku.prototype._DOMInitEvent = function () {
    var td = $('#chessboard-space td');
    var self = this;
    $('#chessboard-space td').click(function () {
        if (self.turn == self.role.human) {
            self._DOMPutChess($(this), self.role.human);
        }
    });
    $(window).resize(function () {
        self._DOMResetGameoverLayPosition();
    });
    $('#en').click(function () {
        self._DOMSetLang('en');
        $('.switch-lang a').removeClass('current-lang');
        $(this).addClass('current-lang');
    });
    $('#zh-cn').click(function () {
        self._DOMSetLang('zh-cn');
        $('.switch-lang a').removeClass('current-lang');
        $(this).addClass('current-lang');
    });
};
Gomoku.prototype._DOMResetGameoverLayPosition = function () {
    var div = $('#chessboard-space');
    $('#gameover-lay-win').css({
        left: ($(window).width() - $('#gameover-lay-win').width()) / 2,
        top: div.offset().top + div.height() / 4
    });
    $('#gameover-lay-lose').css({
        left: ($(window).width() - $('#gameover-lay-lose').width()) / 2,
        top: div.offset().top + div.height() / 4
    });
    $('#gameover-overlay').css({
        left: div.offset().left,
        top: div.offset().top,
        width: div.width(),
        height: div.height()
    });
}
/**
* 下子产生的DOM变化
* @param {type} node
* @param {type} who
* @returns {unresolved}
*/
Gomoku.prototype._DOMPutChess = function (node, who) {
    if (node.hasClass(this.chessClass.white) || node.hasClass(this.chessClass.black) || this.gameover) {
        return;
    }
    if (who == this.role.human || who == this.role.AI) {
        var index, value, cls, id = node.attr('id');
        value = who;
        cls = eval('this.chessClass.' + this.chess[who]);
        index = id.split('_');
        node.addClass(cls);
        $('.' + this.chessClass.last).removeClass(this.chessClass.last);
        node.addClass(this.chessClass.last);
        this._setChessState(index[0], index[1], value);
        this._setOperationLog(index[0], index[1]);
        if (this.round) {
            $('#round').html(Math.round(this.round));
        }
 
        this._checkGameover();
        if (this.gameover) {
            this._DOMGameover();
            //this.restart();
            return;
        }
        if (this.turn === this.role.human) {
            this.turn = this.role.AI;
            this._DOMAutoPutChess();
        }
        else {
            this.turn = this.role.human;
        }
 
    }
};
/**
* 悔棋产生的DOM变化
* @param {int} i
* @param {int} j
* @returns {undefined}
*/
Gomoku.prototype._DOMRetreatChess = function (i, j) {
    var td = $('#' + i + '_' + j);
    td.removeClass(this.chessClass.white);
    td.removeClass(this.chessClass.black);
    td.removeClass(this.chessClass.last);
    $('#round').html(this.round);
};
/**
* 重新开始产生的DOM变化
* @returns {undefined}
*/
Gomoku.prototype._DOMRestartChess = function () {
    var td = $(' #chessboard-space td');
    td.removeClass(this.chessClass.white);
    td.removeClass(this.chessClass.black);
    td.removeClass(this.chessClass.last);
    $('#round').html(this.round);
    $('.gameover-lay').hide();
    $('#gameover-overlay').hide();
    $('#regret').prop('disabled', false);
};
Gomoku.prototype._DOMAutoPutChess = function () {
    if (this.turn == this.role.AI && !this.gameover) {
        var result = this._findArea();
        this._DOMPutChess($('#' + result.i + '_' + result.j), this.role.AI);
    }
};
Gomoku.prototype._DOMGameover = function () {
    $('#regret').prop('disabled', true);
    $('.gameover-lay').hide();
    if (this.gameResult == this.locale.youWin) {
        $('#gameover-lay-win').show();
    }
    else {
        $('#gameover-lay-lose').show();
    }
    $('#gameover-overlay').show();
    this._DOMResetGameoverLayPosition();
};
/*********** end DOM 处理 ******************/
 
/**
* 初始化变量
* @returns {undefined}
*/
Gomoku.prototype._initVariables = function () {
    var i, j, row;
    this.operationLog = [];
    this.chessState = [];
    for (i = 0; i < this.chessboardSize; i++) {
        row = [];
        for (j = 0; j < this.chessboardSize; j++) {
            row.push(0); // 0 blank 1 black 2 white
        }
        this.chessState.push(row);
    }
 
    this.gameover = false;
    this.role = {
        human: 1, // 'black'
        AI: 2 //'white'
    };
 
    this.turn = this.role.human;
    this.round = 0;
    this.chessCount = 0;
    this.gameResult = '';
};
 
Gomoku.prototype._setChessState = function (i, j, val) {
    try {
        this.chessState[i][j] = parseInt(val);
    }
    catch (e) {
    }
};
Gomoku.prototype._setOperationLog = function (i, j) {
    this.chessCount++;
    if (this.chessCount % 2 === 0) {
        this.round++;
    }
    this.operationLog.push({
        i: parseInt(i),
        j: parseInt(j)
    });
};
Gomoku.prototype._setBlackChessRole = function (role) {
    if (role === 'AI') {
        this.role = {
            AI: 1, // 'black'
            human: 2 //'white'
        };
        this.turn = this.role.AI;
    }
    else if (role === 'human') {
        this.role = {
            human: 1, // 'black'
            AI: 2 //'white'
        };
        this.turn = this.role.human;
    }
};
/*************** begin 外层调用 **********************/
/**
* 初始化（程序入口）
* @returns {undefined}
*/
Gomoku.prototype.init = function (blackRole) {
    this._DOMCreateChessboard();
    this._initVariables();
    this._setBlackChessRole(blackRole);
    this._DOMAutoPutChess();
};
 
/**
* 重新开始
* @returns {undefined}
*/
Gomoku.prototype.restart = function (blackRole) {
    this._initVariables();
    this._setBlackChessRole(blackRole);
    this._DOMRestartChess();
    this._DOMAutoPutChess();
};
 
/**
* 梅棋
* @returns {undefined}
*/
Gomoku.prototype.regret = function () {
    var id, i, j;
    if (this.operationLog.length > 1) {
        id = this.operationLog.pop();
        i = parseInt(id.i);
        j = parseInt(id.j);
        this._setChessState(i, j, 0);
        this.round--;
        this.chessCount--;
        this._DOMRetreatChess(i, j);
        if (this.operationLog.length % 2 === 1) {
            id = this.operationLog.pop();
            i = parseInt(id.i);
            j = parseInt(id.j);
            this._setChessState(i, j, 0);
            this.chessCount--;
            this._DOMRetreatChess(i, j);
        }
    }
 
};
/************* end 外层调用 *****************/
 
 
/************ begin 算法核心 **************/
 
/**
* 反转棋盘（旋转180度）
* @returns {undefined}
*/
Gomoku.prototype._reverseChessState = function (i, j) {
    var newArr = [], i = 0, j = 0, row = [];
    for (i = this.chessboardSize - 1; i >= 0; i--) {
        row = [];
        for (j = this.chessboardSize - 1; j >= 0; j--) {
            row.push(this.chessState[i][j]);
        }
        newArr.push(row);
    }
    this.chessState = newArr;
    newArr = null;
    if (typeof (i) != 'undefined' && typeof (j) != 'undefined') {
        return {
            i: this.chessboardSize - 1 - i,
            j: this.chessboardSize - 1 - j
        }
    }
    return null;
 
};
/**
* 顺时针旋转90度（i = j, j = this.chessboardSize - 1 - i )
* @returns {object} 旋转后的(i,j)
*/
Gomoku.prototype._rotateChessStateClockwise90 = function (i, j) {
    var newArr = [], row = [], returnObj = null;
    if (typeof (i) != 'undefined' && typeof (j) != 'undefined') {
 
        returnObj = {
            i: j,
            j: this.chessboardSize - 1 - i
        };
    }
    for (i = this.chessboardSize - 1; i >= 0; i--) {
        row = [];
        for (j = this.chessboardSize - 1; j >= 0; j--) {
            row.push(this.chessState[j][this.chessboardSize - 1 - i]);
        }
        newArr.push(row);
    }
    this.chessState = newArr;
    newArr = null;
    return returnObj;
};
/**
* 逆时针旋转90度（i = this.chessboardSize - 1 -j, j = i）
* @returns {undefined}
*/
Gomoku.prototype._rotateChessStateAnticlockwise90 = function (i, j) {
    var newArr = [], i = 0, j = 0, row = [];
    for (i = this.chessboardSize - 1; i >= 0; i--) {
        row = [];
        for (j = this.chessboardSize - 1; j >= 0; j--) {
            row.push(this.chessState[this.chessboardSize - 1 - j][i]);
        }
        newArr.push(row);
    }
    this.chessState = newArr;
    newArr = null;
    if (typeof (i) != 'undefined' && typeof (j) != 'undefined') {
        return {
            i: this.chessboardSize - 1 - j,
            j: i
        }
    }
    return null;
};
 
/**
* 检查是否结束
* @returns {undefined}
*/
Gomoku.prototype._checkGameover = function () {
    var last = this.operationLog[this.operationLog.length - 1];
    var i = parseInt(last.i), j = parseInt(last.j);
 
    var res = this._getState(i, j, this.turn);
    var gameover = false;
 
    $.each(res, function (k, v) {
        if (v.connetedChessCount >= 5) {
            gameover = true;
            return false;
        }
    });
    this.gameover = gameover;
    if (this.gameover) {
        this.gameResult = this.turn == this.role.human ? this.locale.youWin : this.locale.youLose;
    }
};
 
Gomoku.prototype._getState = function (i, j, role) {
    var chessboardSize = this.chessboardSize,
            horizontalState1 = this._getHorizontalState(i, j, role),
            diagonalState1 = this._getDiagonalState(i, j, role),
            res = this._rotateChessStateClockwise90(i, j),
            horizontalState2 = this._getHorizontalState(res.i, res.j, role),
            diagonalState2 = this._getDiagonalState(res.i, res.j, role);
    try {
        $.each(horizontalState2.available, function (k, v) {
            var _i = v.i;
            var _j = v.j;
            v.i = chessboardSize - 1 - _j;
            v.j = _i;
        });
    }
    catch (e) {
    }
    try {
        $.each(diagonalState2.available, function (k, v) {
            var _i = v.i;
            var _j = v.j;
            v.i = chessboardSize - 1 - _j;
            v.j = _i;
        });
    }
    catch (e) {
    }
    this._rotateChessStateAnticlockwise90();
 
    return [horizontalState1, horizontalState2, diagonalState1, diagonalState2];
};
 
Gomoku.prototype._valid = function (i) {
    return i >= 0 && i < this.chessboardSize && typeof (i) === 'number' && !isNaN(i);
 
};
 
/**
* 水平线
* @param {type} i
* @param {type} j
* @param {type} role
* @returns {object}
*/
Gomoku.prototype._getHorizontalState = function (i, j, role) {
 
    var chessboardSize = this.chessboardSize, chessState = this.chessState;
 
    if (!this._valid(i) || !this._valid(j)) {
        return {};
    }
    var m = 1, chessCount = 1, end = false, skip = 0,
    // 最左边的棋子
            firstChess = { i: i, j: j },
    // 最右边的棋子
    lastChess = { i: i, j: j },
    chessSpan = 0, aliveCount = 0, alive = true, aliveSidesCount = 0,
            available = [], chess = [];
    // 往右找
    while (this._valid(j + m)) {
        if (end) {
            break;
        }
        if (skip > 1) {
            break;
        }
        switch (chessState[i][j + m]) {
            case 0:
                if (skip === 0 || chessState[i][j + m - 1] !== 0) {
                    available.push({
                        i: i,
                        j: j + m
                    });
                }
                skip++;
                break;
            case role:
                chessCount++;
                chess.push({
                    i: i,
                    j: j + m
                });
                lastChess = {
                    i: i,
                    j: j + m
                };
                break;
            default:
                end = true;
        }
        m++;
    }
    end = false;
    skip = 0;
    m = 1;
    // 往左找
    while (this._valid(j - m)) {
        if (end) {
            break;
        }
        if (skip > 1) {
            break;
        }
 
        switch (chessState[i][j - m]) {
            case 0:
                if (skip === 0 || chessState[i][j - m + 1] !== 0) {
                    available.push({
                        i: i,
                        j: j - m
                    });
                }
                skip++;
                break;
            case role:
                firstChess = {
                    i: i,
                    j: j - m
                };
                chessCount++;
                chess.push({
                    i: i,
                    j: j - m
                });
                break;
            default:
                end = true;
        }
        m++;
    }
    chessSpan = lastChess.j - firstChess.j + 1;
 
    var connetedChessCount = [1], tmpCount = 1, invalidCount = 0;
    m = 1;
    while (this._valid(firstChess.j + m)) {
        if (chessState[firstChess.i][firstChess.j + m] !== role) {
            invalidCount++;
            if (invalidCount > 1) {//不连续的占超过1个
                break;
            }
            if (tmpCount < 10) {
                tmpCount = 0;
            }
            else {
                break;
            }
        }
        else {
            tmpCount++;
            connetedChessCount.push(tmpCount);
        }
        m++;
    }
 
    for (m = 0; m < chessSpan; m++) {
        if ($.inArray(chessState[firstChess.i][firstChess.j + m], [0, role]) >= 0) {
            aliveCount++;
        }
    }
    try {
        if ($.inArray(chessState[firstChess.i][firstChess.j - 1], [0, role]) >= 0) {
            aliveSidesCount++;
        }
    }
    catch (e) {
    }
    try {
        if ($.inArray(chessState[firstChess.i][firstChess.j + 1], [0, role]) >= 0) {
            aliveSidesCount++;
        }
    }
    catch (e) {
    }
    if (aliveCount < 4) {
        alive = aliveSidesCount > 0;
    }
    return {
        alive: alive,
        aliveSidesCount: aliveSidesCount,
        available: available,
        chess: chess,
        chessCount: chessCount,
        connetedChessCount: Math.min(Math.max.apply(null, connetedChessCount), chessCount)
    };
 
};
 
/**
* 对角线（左上->右下）
* @param {type} i
* @param {type} j
* @param {type} role
* @returns {object}
*/
Gomoku.prototype._getDiagonalState = function (i, j, role) {
    var chessboardSize = this.chessboardSize, chessState = this.chessState;
 
    if (i >= chessboardSize || j >= chessboardSize) {
        return {};
    }
 
    var chessCount = 1, end = false, skip = 0,
            alive = true, aliveCount = 0, aliveSidesCount = 0;
    // 最左上角的棋子
    firstChess = { i: i, j: j },
    // 最右下角的棋子
    lastChess = { i: i, j: j },
    // role棋子在此行有效的跨度
    chessSpan = 0,
            m = 1, available = [], chess = [];
 
    // 往右找
    while (this._valid(i + m) && this._valid(j + m)) {
        if (end) {
            break;
        }
        if (skip > 1) {
            break;
        }
        switch (chessState[i + m][j + m]) {
            case 0:
                if (skip === 0 || chessState[i + m - 1][j + m - 1] !== 0) {
                    available.push({
                        i: i + m,
                        j: j + m
                    });
                }
                skip++;
                break;
            case role:
                chessCount++;
                chess.push({
                    i: i + m,
                    j: j + m
                });
                lastChess = {
                    i: i + m,
                    j: j + m
                };
                break;
            default:
                end = true;
        }
        m++;
    }
    end = false;
    skip = 0;
    m = 1;
    // 往左找
    while (this._valid(i - m) && this._valid(j - m)) {
        if (end) {
            break;
        }
        if (skip > 1) {
            break;
        }
        switch (chessState[i - m][j - m]) {
            case 0:
                if (skip === 0 || chessState[i - m + 1][j - m + 1] !== 0) {
                    available.push({
                        i: i - m,
                        j: j - m
                    });
                }
                skip++;
                break;
            case role:
                firstChess = {
                    i: i - m,
                    j: j - m
                };
                chessCount++;
                chess.push({
                    i: i - m,
                    j: j - m
                });
                break;
            default:
                end = true;
        }
        m++;
    }
 
    chessSpan = lastChess.i - firstChess.i + 1;
 
    var connetedChessCount = [1], tmpCount = 1, invalidCount = 0;
    m = 1;
    while (this._valid(firstChess.i + m) && this._valid(firstChess.j + m)) {
        if (chessState[firstChess.i + m][firstChess.j + m] !== role) {
            invalidCount++;
            if (invalidCount > 1) {//不连续的占超过1个
                break;
            }
 
            if (tmpCount < 10) {
                tmpCount = 0;
            }
            else {
                break;
            }
        }
        else {
            tmpCount++;
            connetedChessCount.push(tmpCount);
        }
        m++;
    }
 
    for (m = 0; m < chessSpan; m++) {
        if ($.inArray(chessState[firstChess.i + m][firstChess.j + m], [0, role]) >= 0) {
            aliveCount++;
        }
    }
    try {
        if ($.inArray(chessState[firstChess.i - 1][firstChess.j - 1], [0, role]) >= 0) {
            aliveSidesCount++;
        }
    }
    catch (e) {
    }
    try {
        if ($.inArray(chessState[firstChess.i + 1][firstChess.j + 1], [0, role]) >= 0) {
            aliveSidesCount++;
        }
    }
    catch (e) {
    }
 
    if (aliveCount < 4) {
        alive = aliveSidesCount > 0;
    }
    return {
        alive: alive,
        aliveSidesCount: aliveSidesCount,
        available: available,
        chess: chess,
        chessCount: chessCount,
        connetedChessCount: Math.min(Math.max.apply(null, connetedChessCount), chessCount)
    };
};
/**
* 寻找落子点
* @returns {object} {i:i, j:j}
*/
Gomoku.prototype._findArea = function () {
 
    var returnObj = null;
    returnObj = this._findPotentialDominantPosition();
    return returnObj;
};
Gomoku.prototype._getCenterPosition = function () {
    var center = Math.floor(this.chessboardSize / 2);
    return {
        i: center,
        j: center
    };
};
/**
* 寻找潜在的落字点
* @param {int} role
* @returns {object}
*/
Gomoku.prototype._findPotentialDominantPosition = function () {
    var returnObjArray = [],
            returnObj = null,
            i = 0, j = 0,
            chessState = this.chessState,
            res = null,
            priority = 0, maxPriority = 0;
 
    for (i = 0; this._valid(i); i++) {
        for (j = 0; this._valid(j); j++) {
            if (chessState[i][j] === 0) {
                this._setChessState(i, j, this.role.AI);
                res = this._getState(i, j, this.role.AI);
                this._setChessState(i, j, 0);
 
                priority = this._getPriority(res, this.role.AI);
                returnObjArray.push({
                    i: i,
                    j: j,
                    priority: priority
                });
 
                this._setChessState(i, j, this.role.human);
                res = this._getState(i, j, this.role.human);
                this._setChessState(i, j, 0);
                priority = this._getPriority(res, this.role.human);
 
                returnObjArray.push({
                    i: i,
                    j: j,
                    priority: priority
                });
            }
        }
    }
    maxPriority = Math.max.apply(null, $.map(returnObjArray, function (item) {
        return item.priority;
    }));
 
    if (maxPriority === -100 && chessState[7][7] === 0) {
        returnObj = this._getCenterPosition();
    }
    else {
        $.each(returnObjArray, function (k, v) {
            if (v.priority === maxPriority) {
                returnObj = {
                    i: v.i,
                    j: v.j
                };
                return false;
            }
        });
    }
    return returnObj;
};
 
Gomoku.prototype._getPriority = function (stateObject, role) {
    var priority,
            chess = [null,
                { count: 0, aliveSidesCount: 0 },
                { count: 0, aliveSidesCount: 0 },
                { count: 0, aliveSidesCount: 0 },
                { count: 0, aliveSidesCount: 0 },
                { count: 0, aliveSidesCount: 0}];
    $.each(stateObject, function (k, v) {
        //五子连珠，不必再判断两旁是否有空位
        if (v.connetedChessCount >= 5) {
            chess[5].count++;
        }
        //冲四，不必再判断两旁是否有空位
        else if (v.connetedChessCount === 4 && v.alive) {
            chess[4].count++;
            chess[4].aliveSidesCount = v.aliveSidesCount;
        }
        else if (v.available.length > 1 && v.alive) {
            chess[v.connetedChessCount].count++;
            chess[v.connetedChessCount].aliveSidesCount = v.aliveSidesCount;
        }
    });
 
    if (chess[5].count > 0) {
        priority = role === this.role.AI ? 4 : 3;
    }
    else if (chess[4].count > 0 && chess[4].aliveSidesCount > 1) {
        priority = role === this.role.AI ? 2 : 1;
    }
    else if (chess[3].count >= 2) {
        priority = role === this.role.AI ? 0 : -1;
    }
    else if (chess[4].count > 0 && chess[4].aliveSidesCount === 1) {
        priority = role === this.role.AI ? -2 : -3;
    }
    else if (chess[3].count === 1) {
        priority = role === this.role.AI ? -4 : -5;
    }
    else if (chess[2].count > 0) {
        priority = role === this.role.AI ? -6 : -7;
    }
    else {
        priority = -100;
    }
    return priority;
};
 
/************ end 算法核心 ***************/