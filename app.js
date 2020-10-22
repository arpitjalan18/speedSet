var express = require('express');
var app = express();
var serv = require('http').Server(app);

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/client/index.html');
});
app.use('/client', express.static(__dirname + '/client'));
serv.listen(process.env.PORT || 5000);
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
        timer: 64,
        cardArrIndex: 0
    }
    return self;
}
var Room = function(id){
    var self = {
        id: id,
        curr: [],
        started: false
    }
    return self;
}
var io = require('socket.io')(serv, {});
io.sockets.on('connection', function (socket) {
    socket.id = Math.random();
    SOCKET_LIST[socket.id] = socket;

    socket.on('disconnect', function () {
        if (PLAYER_LIST[socket.id]!= null && PLAYER_LIST[socket.id].admin) {
            delete ROOM_LIST[PLAYER_LIST[socket.id].gameid];
            clearRoom(PLAYER_LIST[socket.id].gameid)
        }
        var id = PLAYER_LIST[socket.id].gameid;
        delete SOCKET_LIST[socket.id];
        delete PLAYER_LIST[socket.id];
        emitUsers(id);
        console.log("socket dc");

    });

    socket.on('login', function (username, gameid, admin) {
        roomExists = false;
        gameStarted = false;
        if (admin) {
            roomExists = true;
            socket.join(gameid);
            var room = Room(gameid);
            ROOM_LIST[gameid] = room;
        }
        else {
            for (var i in ROOM_LIST) {
                if (gameid == ROOM_LIST[i].id && !ROOM_LIST[gameid].started) {
                    roomExists = true;
                    socket.join(gameid)
                }
            }
        }
        if (!roomExists) {
            if (ROOM_LIST[gameid]!=null && ROOM_LIST[gameid].started){
                socket.emit('loginState', false, "none", "a")
            }
            else{
                socket.emit('loginState', false, "none", "b")
            }
        }
        else {
            socket.emit('loginState', true, gameid, "none")
            var player = Player(socket.id, username, admin, gameid);

            PLAYER_LIST[socket.id] = player;
            if(admin){
                var temp = 60;
                while(temp > 0){
                    ROOM_LIST[gameid].curr.push(shuffle());
                    temp--;
                }
            }
            var clicked = [];
            for (var i = 0; i < 12; i++) {
                clicked[i] = 2;
            }
            emitCurrentCards(clicked, gameid, socket.id);
        }
    });

    socket.on('replaceSet', function (clicked, currentClientCards) {
        PLAYER_LIST[socket.id].sets++;
        emitCurrentCards(clicked, PLAYER_LIST[socket.id].gameid, socket.id);
       
    });

    socket.on('startGame', function (timeLeft) {
        startGame(socket.id, timeLeft);
    });
    socket.on('reset', function(){
        gameid = PLAYER_LIST[socket.id].gameid;
        resetGame(gameid)
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
}
function startGame(socketid, timeLeft) {
    gameid = PLAYER_LIST[socketid].gameid;
    ROOM_LIST[gameid].started = true;
    for (var i in PLAYER_LIST) {
        var socket = SOCKET_LIST[i];
        if (PLAYER_LIST[i].gameid == gameid) {
            socket.emit('initiateGame', timeLeft);
            if (timeLeft < 1){
                ROOM_LIST[gameid].started = false;
            }
        }
    }
}
function resetGame(gameid){
    var temp = 60;
    ROOM_LIST[gameid].curr = [];
    while(temp > 0){
        ROOM_LIST[gameid].curr.push(shuffle());
        temp--;
    }
    for (var i in PLAYER_LIST) {
        var socket = SOCKET_LIST[i];
        if (PLAYER_LIST[i].gameid == gameid) {
            PLAYER_LIST[i].sets = 0;
            var clicked = [];
            for (var i = 0; i < 12; i++) {
                clicked[i] = 3;
            }
            emitCurrentCards(clicked, gameid, socket.id)
        }
    }
}
function emitCurrentCards(clicked, gameid, socketid) {
    emitUsers(gameid);
    var socket = SOCKET_LIST[socketid]; 
    socket.emit('currentCards', ROOM_LIST[gameid].curr[PLAYER_LIST[socketid].sets], 60-PLAYER_LIST[socketid].sets, clicked)
}

function emitUsers(gameid) {
    for (var i in PLAYER_LIST) {
        var socket = SOCKET_LIST[i];
        if (PLAYER_LIST[i].gameid == gameid) {
            socket.emit('users', filterObject(PLAYER_LIST, "gameid", gameid), i);
        }
    }
}
function clearRoom(room) {
    for(var i in PLAYER_LIST){
        var socket = SOCKET_LIST[i];
        if (PLAYER_LIST[i].gameid == room) {
            socket.emit('kicked');
            socket.leave(room);
        }
    }
}
function checkSets(currentCards) {
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
function shuffle() { 
    tempCardDeck = JSON.parse(JSON.stringify(cards));
    var currentCards = [];
    for (i = 1; i < 13; i++) {
        var index = Math.floor(Math.random() * tempCardDeck.length);
        var tempCard = tempCardDeck[index];
        tempCardDeck.splice(index, 1);
        currentCards.push(tempCard);
    }
    if (!checkSets(currentCards)) {
        return shuffle();
    }
    else{
        return currentCards;
    }
}
const filterObject = (obj, filter, filterValue) =>
    Object.keys(obj).reduce((acc, val) =>
        (obj[val][filter] === filterValue ? {
            ...acc,
            [val]: obj[val]
        } : acc
        ), {});