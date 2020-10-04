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
var ROOM_LIST = {}

var Player = function (id, username, admin, gameid) {
    var self = {
        id: id,
        username: username,
        sets: 0,
        rank: 1,
        admin: admin,
        gameid: gameid,
        blue: false,
        timer: 64
    }
    return self;
}
var io = require('socket.io')(serv, {});
io.sockets.on('connection', function (socket) {
    socket.id = Math.random();
    SOCKET_LIST[socket.id] = socket;

    socket.on('disconnect', function () {
        if (socket.admin) {
            clearRoom()
        }
        delete SOCKET_LIST[socket.id];
        delete PLAYER_LIST[socket.id];
        console.log("socket dc");

    });

    socket.on('login', function (username, gameid, admin) {
        roomExists = false;
        if (admin) {
            roomExists = true;
            ROOM_LIST[socket.id] = gameid;
            socket.join(gameid);
        }
        else {
            for (var i in ROOM_LIST) {
                if (gameid == ROOM_LIST[i]) {
                    roomExists = true;
                    socket.join(gameid)
                }
            }
        }
        if (!roomExists) {
            console.log("socket could not find room. emit that please. login failed")
            socket.emit('loginState', false)
        }
        else {
            socket.emit('loginState', true, gameid)
            var player = Player(socket.id, username, admin, gameid);
            PLAYER_LIST[socket.id] = player;
            var clicked = [];
            for (var i = 0; i < currentCards.length; i++) {
                clicked[i] = 2;
            }
            emitCurrentCards(clicked, gameid);
        }
    });

    socket.on('replaceSet', function (clicked, currentClientCards) {

        if (JSON.stringify(currentClientCards) == JSON.stringify(currentCards)) {
            PLAYER_LIST[socket.id].sets++;
            replaceSet(clicked, PLAYER_LIST[socket.id].gameid);
        }
        else {
            console.log("Just missed it!");
        }
    });

    socket.on('startGame', function (timeLeft) {
        startGame(socket.id, timeLeft);
    });
    console.log('socket connection');

});

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
    shuffle([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
}
function startGame(socketid, timeLeft) {
    gameid = PLAYER_LIST[socketid].gameid;

    for (var i in PLAYER_LIST) {
        var socket = SOCKET_LIST[i];
        if (PLAYER_LIST[i].gameid == gameid) {
            socket.emit('initiateGame', timeLeft);
        }
    }
}
function emitCurrentCards(clicked, gameid) {
    emitUsers(gameid);
    console.log(gameid)
    for (var i in PLAYER_LIST) {
        var socket = SOCKET_LIST[i];
        if (PLAYER_LIST[i].gameid == gameid) {
            socket.emit('currentCards', currentCards, cards.length, clicked);
        }
    }
}

function emitUsers(gameid) {
    for (var i in PLAYER_LIST) {
        var socket = SOCKET_LIST[i];
        if (PLAYER_LIST[i].gameid == gameid) {
            socket.emit('users', filterObject(PLAYER_LIST, "gameid", gameid), i);
        }
    }
}
function replaceSet(clicked, gameid) {
    shuffle(clicked, gameid);
    emitCurrentCards(clicked, gameid);
}
function clearRoom(room, namespace = '/') {
    let roomObj = io.nsps[namespace].adapter.rooms[room];
    if (roomObj) {
        // now kick everyone out of this room
        Object.keys(roomObj.sockets).forEach(function (id) {
            io.sockets.connected[id].leave(room);
        })
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
function shuffle(clicked, gameid) {
    tempCardDeck = cards;
    console.log("im shuffling bitch");
    currentCards = [];
    for (i = 1; i < 13; i++) {
        var index = Math.floor(Math.random() * tempCardDeck.length);
        var tempCard = tempCardDeck[index];
        tempCardDeck.splice(index, 1);
        currentCards.push(tempCard);
    }
    if (!checkSets()) {
        shuffle(clicked, gameid);
    }
}
const filterObject = (obj, filter, filterValue) =>
    Object.keys(obj).reduce((acc, val) =>
        (obj[val][filter] === filterValue ? {
            ...acc,
            [val]: obj[val]
        } : acc
        ), {});