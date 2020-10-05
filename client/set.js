
// 0 not clicked
// 1 clicked
// 2 new player so new card
// 3 need to add three so new card
// 4 move to deleted position?

const loginForm = document.getElementById("login-form");
const loginButton = document.getElementById("login-form-submit");
const loginErrorMsg = document.getElementById("login-error-msg");
const loginErrorMsgLine2 = document.getElementById("error-msg-second-line");
const hostButton = document.getElementById("host-button");
const startButton = document.getElementById("startgame");
const timer = document.getElementById("timer");
var winners = [];
var admin = false;
var socket = io();
var clickable = false;
hostButton.addEventListener("click", (e) => {
    e.preventDefault();
    const username = loginForm.username.value;
    const gameid = "A" + (Math.floor(Math.random() * Math.floor(100000)) + 100000);
    if (username.length < 10 && username.length > 0) {
        socket.emit('login', username, gameid, true);
        admin = true;
    } else if (username.length > 9) {
        loginErrorMsg.innerHTML = "Username is too<span id='error-msg-second-line'>long!</span>"
        loginErrorMsg.style.opacity = 1;
    }
    else {
        loginErrorMsg.innerHTML = "You need a<span id='error-msg-second-line'>username!</span>"
        loginErrorMsg.style.opacity = 1;
    }
})
loginButton.addEventListener("click", (e) => {
    e.preventDefault();
    const username = loginForm.username2.value;
    const gameid = loginForm.gameid.value;
    if (username.length < 10 && username.length > 0) {
        socket.emit('login', username, gameid, false);
        admin = false;
    } else if (username.length > 9) {
        loginErrorMsg.innerHTML = "Username is too<span id='error-msg-second-line'>long!</span>"
        loginErrorMsg.style.opacity = 1;
    }
    else {
        loginErrorMsg.innerHTML = "You need a<span id='error-msg-second-line'>username!</span>"
        loginErrorMsg.style.opacity = 1;
    }
})
socket.on('loginState', function (bool, gameid, errorCode) {
    if (bool) {
        alert("You have successfully logged in.");
        document.getElementById("gamePage").style.display = "flex";
        document.getElementById("main-holder").style.display = "none";
        idview = document.getElementById("gameid");
        idview.innerHTML = "Code: " + gameid;
        if (admin) {
            startButton.style = "";
            timer.style = "display: none";
        }
    }
    else {
        if (errorCode == "a"){
            loginErrorMsg.innerHTML = "That game has<span id='error-msg-second-line'>already started!</span>"
        }
        else if(errorCode =="b"){
            loginErrorMsg.innerHTML = "That room does<span id='error-msg-second-line'>not exist!</span>"
        }
        loginErrorMsg.style.opacity = 1;
    }
});
socket.on('kicked', function () {
    loginErrorMsg.innerHTML = "The host has<span id='error-msg-second-line'>left the game!</span>"
    loginErrorMsg.style.opacity = 1;
    document.getElementById("gamePage").style.display = "none";
    document.getElementById("main-holder").style.display = "";
    for (var i = 1; i < 13; i++) {
        var lastCard = document.querySelector('#container' + (i));
        lastCard.parentElement.removeChild(lastCard);
    }
    timer.innerHTML = "Waiting to Start ..."

});
startButton.addEventListener("click", (e) => {
    if (startButton.innerHTML == "Start New Game!") {
        socket.emit("reset");
    }
    e.preventDefault();
    sec = 64;
    tick();
    function tick() {
        socket.emit("startGame", sec);
        sec--;
        if (sec >= 0) {
            stopTime = setTimeout(tick, 1000);
        }
        else {
            startButton.style = "";
            startButton.innerHTML = "Start New Game!"
        }
    }

});
socket.on('initiateGame', function (timeLeft) {
    timer.style = "";
    startButton.style = "display: none";
    if (timeLeft > 60) {
        timer.innerHTML = timeLeft - 60;
    }
    else if (timeLeft == 60) {
        clickable = true;
        timer.innerHTML = "Go!"
        for (var i = 0; i < 12; i++) {
            
            var flipMe = document.querySelector('#container' + (i + 1) + " .front-back")
            flipMe.classList.remove('front-back-transformer');
        }
    }
    else if (timeLeft > 0) {
        timer.innerHTML = timeLeft;
    }
    else if (timeLeft == 0) {
        clickable = false;
        timer.innerHTML = timeLeft;
        for (var i = 0; i < 12; i++) {
            document.querySelector('#container' + (i + 1) + " .front-back").classList.add('front-back-transformer');
        }
        if (admin) {
            startButton.style = "";
        }
        timer.innerHTML = winners.join(" and ") + " Won!";

    }
})
function returnRGB(color) {
    if (color == "green") {
        return "rgb(0, 178, 89)";
    }
    if (color == "red") {
        return "rgb(239, 62, 66)";
    }
    if (color == "purple") {
        return "rgb(73, 47, 146)";
    }
    if (color == "white") {
        return "white";
    }
}
function getOffset(el) {
    const rect = el.getBoundingClientRect();
    return {
        left: rect.left + window.scrollX,
        top: rect.top + window.scrollY
    };
}
var currentCards = [];
socket.on('currentCards', function (curr, amtCards, clicked) {
    var timeouts = 0;
    document.querySelector("#cleft").innerHTML = "You can do " + amtCards + " more sets!";
    if (JSON.stringify(curr) != JSON.stringify(currentCards)) {
        if (clicked != null) {
            for (var i = 0; i < clicked.length; i++) {
                if (clicked[i] < 2) {
                    timeouts = 1000;
                    var flipMe = document.querySelector('#container' + (i + 1) + " .front-back");
                    flipMe.classList.add('front-back-transformer');
                }
            }
        }

        var heightContainer = 16 / 3 * curr.length + 2;
        document.querySelector(".memory-game").style = "height: " + heightContainer + "vh";
        setTimeout(() => {

            currentCards = curr;
            var original = document.querySelector('#container0');
            var top = 0;
            var left = 0;
            for (var i = 1; i < clicked.length + 1; i++) {
                if (clicked[i - 1] < 4) {
                    var newCardDOM = original.cloneNode(true);
                    newCardDOM.classList.add('pos' + i);
                    newCardDOM.classList.add('opac100');
                    newCardDOM.style = "";
                    newCardDOM.id = "container" + i;
                    newCardDOM.setAttribute("onClick", 'cellClicked(' + i + ')');
                    newCardDOM.querySelector('.front-back .set-cell').id = "c" + i;
                    newCardDOM.querySelector('.front-back').classList.add('front-back-transformer');

                    var element = newCardDOM.querySelector('.front-back .set-cell .vBox .hBox');

                    tempCard = currentCards[i - 1];

                    if (tempCard.fill == "none") {
                        element.setAttribute("fill", "none");
                    }
                    else if (tempCard.fill == "full") {
                        element.setAttribute("fill", returnRGB(tempCard.color));
                    }
                    else {
                        element.setAttribute("fill", "url(#" + tempCard.color + "-stripes)");
                    }

                    //changes stroke of original
                    element.setAttribute("stroke", returnRGB(tempCard.color));
                    //changes shape of original
                    element.setAttribute("href", "#" + tempCard.shape + "-shape");


                    if (clicked[i - 1] != 2) {
                        var lastCard = document.querySelector('#c' + (i));
                        lastCard.after(newCardDOM.querySelector('#c' + i));
                        lastCard.parentElement.removeChild(lastCard);
                    }
                    else {
                        var lastCard = document.querySelector('#container' + (i - 1));
                        lastCard.after(newCardDOM);
                    }
                    if (tempCard.quantity == 0) {
                        var noCard = document.querySelector('#c' + i + ' .vBox');
                        noCard.parentElement.removeChild(noCard);
                    }
                    for (k = 2; k < 1 + tempCard.quantity; k++) {

                        var originalS = document.querySelector('#c' + i + ' .vBox');

                        var clone = originalS.cloneNode(true);
                        originalS.before(clone);

                    }


                }
            }
        }, timeouts);
        setTimeout(() => {
            if (clicked != null) {
                for (var i = 0; i < curr.length; i++) {
                    if (clicked[i] != 2 && clicked[i] != 3) {
                        var flipMe = document.querySelector('#container' + (i + 1) + " .front-back")
                        flipMe.classList.remove('front-back-transformer');
                    }
                }
            }
        }, timeouts + 100);
    }
});
socket.on('users', function (PLAYER_LIST, id) {
    pList = [];
    winners = [];

    for (var i in PLAYER_LIST) {
        if (i == id) {
            PLAYER_LIST[i].blue = true;
        }
        pList.push(PLAYER_LIST[i]);
    }

    pList.sort((a, b) => (a.sets < b.sets) ? 1 : -1);

    var bestScore = 0;
    var rank = 1;
    for (var i = 0; i < pList.length; i++) {
        if (pList[i].sets >= bestScore) {
            bestScore = pList[i].sets;
            pList[i].rank = rank;
        }
        else {
            rank++;
            bestScore = pList[i].sets;
            pList[i].rank = rank;
        }
        if (rank == 1) {
            winners.push(pList[i].username);
        }
    }

    var numP = 1;
    while (document.querySelector('#player' + numP) != null) {
        var element = document.querySelector('#player' + numP);
        element.parentNode.removeChild(element);
        numP++;
    }

    numP = 1;
    var original = document.querySelector('#player0');
    for (var i = pList.length - 1; i >= 0; i--) {
        var clone = original.cloneNode(true);
        clone.id = 'player' + numP;

        clone.style = "";

        original.after(clone);
        var name = document.querySelector('#player' + numP + " .info .name");
        name.innerHTML = pList[i].username;
        if (pList[i].blue == true) {
            name.style = "color: rgb(0, 0, 255);"
        }
        var score = document.querySelector('#player' + numP + " .info .score");
        score.innerHTML = "Sets: " + pList[i].sets;
        var rank = document.querySelector('#player' + numP + " .rank");
        rank.innerHTML = "#" + pList[i].rank;

        numP++;
    }
    if (numP > 1) {
        var fix = numP - 1;
        var element = document.querySelector('#player' + fix);
        element.style = "border-top: 1px solid #000000;";
    }
});

var clicked = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
function cellClicked(cellIndex) {

    if (clicked[cellIndex - 1] == 1) {
        document.querySelector("#c" + cellIndex).style.backgroundColor = 'white';
        clicked[cellIndex - 1] = 0;
    }
    else if (clickable){
        document.querySelector("#c" + cellIndex).style.backgroundColor = 'lightgrey';
        clicked[cellIndex - 1] = 1;
    }
    var howMany = 0;
    var set = [];
    for (i = 0; i < clicked.length; i++) {
        if (clicked[i] == 1) {
            howMany++;
            set.push(currentCards[i]);
        }
    }
    if (howMany == 3) {

        var validSet = true;
        if (!((set[0].color == set[1].color && set[1].color == set[2].color) || (set[0].color != set[2].color && set[0].color != set[1].color && set[1].color != set[2].color))) {
            validSet = false;
        }
        if (!((set[0].fill == set[1].fill && set[1].fill == set[2].fill) || (set[0].fill != set[2].fill && set[0].fill != set[1].fill && set[1].fill != set[2].fill))) {
            validSet = false;
        }
        if (!((set[0].shape == set[1].shape && set[1].shape == set[2].shape) || (set[0].shape != set[2].shape && set[0].shape != set[1].shape && set[1].shape != set[2].shape))) {
            validSet = false;
        }
        if (!((set[0].quantity == set[1].quantity && set[1].quantity == set[2].quantity) || (set[0].quantity != set[2].quantity && set[0].quantity != set[1].quantity && set[1].quantity != set[2].quantity))) {
            validSet = false;
        }
        if (set[0].color == "white" || set[1].color == "white" || set[2].color == "white") {
            validSet = false;
        }
        if (validSet) {
            socket.emit('replaceSet', clicked, currentCards);

        }
        else {
            document.querySelector("#cardHolder").style.backgroundColor = 'red';
            window.setTimeout(unFlash, 100);
        }
        for (i = 1; i < clicked.length + 1; i++) {
            if (clicked[i - 1] == 1) {
                document.querySelector("#c" + i).style.backgroundColor = 'white';
                clicked[i - 1] = 0;
            }
        }
        function unFlash() {
            document.querySelector("#cardHolder").style.backgroundColor = 'white';
        }
    }
}