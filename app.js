var express = require('express');
var app = express();
var serv = require('http').Server(app);

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/client/index.html');
});
app.use('/client', express.static(__dirname + '/client'));
serv.listen(2000);
console.log("Server started.");

var SOCKET_LIST = {};
var PLAYER_LIST = {};


var Player = function (id, username) {
    var self = {
        id: id,
        username: username,
        sets: 0,
        rank: 1,
        blue: false,
        newp: false,
    }
    return self;
}
var io = require('socket.io')(serv, {});
io.sockets.on('connection', function (socket) {
    socket.id = Math.random();
    SOCKET_LIST[socket.id] = socket;

    socket.on('disconnect', function () {
        delete SOCKET_LIST[socket.id];
        delete PLAYER_LIST[socket.id];
        emitUsers();
        console.log("socket dc");

    });

    socket.on('username', function (data) {
        var player = Player(socket.id, data);
        player.newp = true;
        PLAYER_LIST[socket.id] = player;
        var clicked = [];
        for (var i = 0; i < currentCards.length; i++) {
            clicked[i] = 2;
        }
        emitCurrentCards(clicked);

    });

    socket.on('replaceSet', function (clicked, currentClientCards) {

        if (JSON.stringify(currentClientCards) == JSON.stringify(currentCards)) {
            PLAYER_LIST[socket.id].sets++;
            replaceSet(clicked);
        }
        else {
            console.log("fuck you arpit");
        }
    });

    console.log('socket connection');

});

function emitUsers() {
    for (var i in SOCKET_LIST) {
        var socket = SOCKET_LIST[i];
        socket.emit('users', PLAYER_LIST, i);
    }
}
// create card constructors/attributes
function card(color, shape, fill, quantity) {
    this.color = color;
    this.shape = shape;
    this.fill = fill;
    this.quantity = quantity;
}

var colors = ["green", "red", "purple"];
var shapes = ["squiggle", "oval", "diamond"];
var fills = ["none", "stripes", "full"];
var quantity = [1, 2, 3];

var cards = [];
var currentCards = [];
startProg();
function startProg() {

    for (i = 0; i < 3; i++) {
        for (j = 0; j < 3; j++) {
            for (k = 0; k < 3; k++) {
                for (l = 1; l < 4; l++) {
                    var temp = new card(colors[i], shapes[j], fills[k], l);
                    cards.push(temp);
                }
            }
        }
    }
    //cards.splice(13, 66);
    for (i = 1; i < 13; i++) {
        var index = Math.floor(Math.random() * cards.length);
        var tempCard = cards[index];
        cards.splice(index, 1);
        currentCards.push(tempCard);
    }
    if (!checkSets()) {
        shuffle();
    }
}
function emitCurrentCards(clicked) {
    emitUsers();
    for (var i in SOCKET_LIST) {
        var socket = SOCKET_LIST[i];
        socket.emit('currentCards', currentCards, cards.length, clicked, PLAYER_LIST[i].newp);
        PLAYER_LIST[i].newp = false;
    }
}
var runagain = 0;
function replaceSet(clicked) {
    var remove15 = false;
    for (i = 1; i < clicked.length + 1; i++) {
        if (clicked[i - 1] == 1 && i > 12) {
            remove15 = true;
        }
    }

    var replacer = 12;
    var keepsTrackWithIofReplacer = 12;
    var countBackwards = currentCards.length - 1;
    var length = currentCards.length;
    var remove3 = false;
    for (i = 1; i < clicked.length + 1; i++) {
        if (clicked[i - 1] == 1) {
            var tempCard = new card("white", "oval", "none", 0);
            if (cards.length == 0) {
                remove3 = true;
                if (i < length-2) {
                    while (clicked[countBackwards] == 1) {
                        countBackwards--;
                    }
                    currentCards.splice(i - 1, 1, currentCards[countBackwards]);
                    countBackwards--;
                }
            }
            else if (remove15) {
                if (i < 13) {
                    while (clicked[replacer] == 1) {
                        replacer++;
                        keepsTrackWithIofReplacer++;
                    }

                    currentCards.splice(i - 1, 1, currentCards[replacer]);
                    currentCards.splice(replacer, 1);
                    clicked[keepsTrackWithIofReplacer] = 4;
                    keepsTrackWithIofReplacer++;
                }
                else {
                    clicked[i - 1] = 4;
                    currentCards.splice(currentCards.length - 2, 1);
                }
            }
            else {
                var index = Math.floor(Math.random() * cards.length);
                tempCard = cards[index];
                cards.splice(index, 1);
                currentCards.splice(i - 1, 1, tempCard);
            }

        }
    }
    if (remove3){
        clicked[currentCards.length-1]=4;
        clicked[currentCards.length-2]=4;
        clicked[currentCards.length-3]=4;
        currentCards.splice(currentCards.length-4, 3);
    }
    var bool = checkSets();
    if (bool) {
        emitCurrentCards(clicked);
    }
    else {
        if (cards.length == 0) {

        }
        else if (runagain == 0) {
            addThree(clicked);
        }
        else {
            emitCurrentCards(clicked);
        }
    }
}
function addThree(clicked) {
    console.log('addnig bc failed fifd' + cards.length);
    for (i = 1; i < 4; i++) {
        var tempCard;
        if (cards.length == 0) {
            // 'ends the fucking game'
        }
        else {
            var index = Math.floor(Math.random() * cards.length);
            tempCard = cards[index];
            cards.splice(index, 1);
        }
        currentCards.push(tempCard);
        clicked[currentCards.length - 1] = 3;
    }

    var bool = checkSets();
    if (bool) {
        emitCurrentCards(clicked);
    }
    else {
        // addThree(clicked);
        console.log('wtf');
    }

}
function checkSets() {
    var set = currentCards;
    for (i = 0; i < currentCards.length; i++) {
        for (j = i + 1; j < currentCards.length; j++) {
            for (k = j + 1; k < currentCards.length; k++) {
                var validSet = true;
                if (!((set[i].color == set[j].color && set[j].color == set[k].color) || (set[i].color != set[k].color && set[i].color != set[j].color && set[j].color != set[k].color))) {
                    validSet = false;
                }
                if (!((set[i].fill == set[j].fill && set[j].fill == set[k].fill) || (set[i].fill != set[k].fill && set[i].fill != set[j].fill && set[j].fill != set[k].fill))) {
                    validSet = false;
                }
                if (!((set[i].shape == set[j].shape && set[j].shape == set[k].shape) || (set[i].shape != set[k].shape && set[i].shape != set[j].shape && set[j].shape != set[k].shape))) {
                    validSet = false;
                }
                if (!((set[i].quantity == set[j].quantity && set[j].quantity == set[k].quantity) || (set[i].quantity != set[k].quantity && set[i].quantity != set[j].quantity && set[j].quantity != set[k].quantity))) {
                    validSet = false;
                }
                if (set[i].color == "white" || set[j].color == "white" || set[k].color == "white") {
                    validSet = false;
                }
                if (validSet == true) {
                    console.log(i + " " + j + " " + k)
                    return true;
                }
            }
        }
    }
    return false;
}
function shuffle(clicked) {
    console.log("im shuffling bitch");
    for (i = 0; i < 12; i++) {
        cards.push(currentCards[i]);
    }
    currentCards = [];
    for (i = 1; i < 13; i++) {
        var index = Math.floor(Math.random() * cards.length);
        var tempCard = cards[index];
        cards.splice(index, 1);
        currentCards.push(tempCard);
    }
    if (!checkSets()) {
        shuffle(clicked);
    }
}
