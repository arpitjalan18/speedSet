
// 0 not clicked
// 1 clicked
// 2 new player so new card
// 3 need to add three so new card
// 4 move to deleted position?

const loginForm = document.getElementById("login-form");
const loginButton = document.getElementById("login-form-submit");
const loginErrorMsg = document.getElementById("login-error-msg");

loginButton.addEventListener("click", (e) => {
    e.preventDefault();
    const username = loginForm.username.value;

    if (username.length < 10 && username.length > 0) {
        alert("You have successfully logged in.");
        document.getElementById("gamePage").style.display = "flex";
        document.getElementById("main-holder").style.display = "none";
        socket.emit('username', username);
    } else {
        loginErrorMsg.style.opacity = 1;
    }
})

var socket = io();
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
socket.on('currentCards', function (curr, amtCards, clicked, newp) {
    document.querySelector("#cleft").innerHTML = amtCards + " Cards Left in Deck";
    console.log(clicked);
    if (JSON.stringify(curr) != JSON.stringify(currentCards)) {
        if (newp) {
            var timeouts = 0;
        }
        else {
            var timeouts = 0;
        }

        if (clicked != null) {
            for (var i = 0; i < clicked.length; i++) {
                if (clicked[i] == 1 || clicked[i] == 5) {
                    var flipMe = document.querySelector('#container' + (i + 1) + " .front-back");
                    flipMe.classList.add('front-back-transformer');
                }
                if (clicked[i] == 3) {
                    var newBack = document.querySelector('#container' + (i - 2)).cloneNode(true);
                    // newBack.classList.add('opac0');
                    newBack.classList.remove('opac100');
                    newBack.id = "container" + (i + 1);
                    newBack.style.zIndex = "1";
                    newBack.querySelector(".front-back").classList.add('front-back-transformer');
                    var lastCard = document.querySelector('#container' + (i));
                    lastCard.after(newBack);

                    setTimeout(function (index) {
                        document.querySelector('#container' + (index + 1)).classList.add('pos' + (index + 1));
                        document.querySelector('#container' + (index + 1)).classList.add('opac100');

                    }, 10, i);
                }
                if (clicked[i] == 4) {
                    document.querySelector('#container' + (i + 1)).classList.remove('opac100');
                    var flipMe = document.querySelector('#container' + (i + 1) + " .front-back");
                    flipMe.classList.add('front-back-transformer');
                }
            }
        }

        var heightContainer = 16 / 3 * curr.length + 2;
        document.querySelector(".memory-game").style = "height: " + heightContainer + "vh";
        setTimeout(() => {

            currentCards = curr;

            for (var i = 0; i < clicked.length; i++) {
                if (clicked[i] == 1 || clicked[i] == 3 || clicked[i] == 4) {
                    //  var element = document.querySelector('#container' + (i + 1));
                    //  element.parentElement.removeChild(element);
                }
            }

            var original = document.querySelector('#container0');
            var top = 0;
            var left = 0;
            for (var i = 1; i < clicked.length + 1; i++) {
                if (clicked[i - 1] > 0 && clicked[i - 1] < 4) {
                    var newCardDOM = original.cloneNode(true);
                    newCardDOM.classList.add('pos' + i);
                    newCardDOM.classList.add('opac100');
                    newCardDOM.style = "";
                    newCardDOM.id = "container" + i;
                    newCardDOM.setAttribute("onClick", 'cellClicked(' + i + ')');
                    if (clicked[i - 1] != 2) {
                        newCardDOM.querySelector('.front-back .set-cell').id = "c" + i + "back";
                    }
                    else {
                        newCardDOM.querySelector('.front-back .set-cell').id = "c" + i;
                    }
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
                        lastCard.after(newCardDOM.querySelector('#c' + i + 'back'));
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
                        if (clicked[i - 1] != 2) {
                            var originalS = document.querySelector('#c' + i + 'back .vBox');
                        }
                        else {
                            var originalS = document.querySelector('#c' + i + ' .vBox');
                        }
                        var clone = originalS.cloneNode(true);
                        originalS.before(clone);

                    }
                    if (clicked[i - 1] != 2) {
                        setTimeout(function (i) {
                            var flipMe = document.querySelector('#container' + (i) + " .front-back");
                            flipMe.classList.add('front-back-transformer');
                        }, 100, i);
                    }
                    //  document.querySelector('#c' + i).classList.add('transition-cell');

                }
            }
        }, timeouts);

        setTimeout(() => {
            if (clicked != null) {
                for (var i = 0; i < curr.length; i++) {
                    if (clicked[i] > 0 && clicked[i] < 4) {
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

var clicked = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
function cellClicked(cellIndex) {

    if (clicked[cellIndex - 1] == 1) {
        document.querySelector("#c" + cellIndex).style.backgroundColor = 'white';
        clicked[cellIndex - 1] = 0;
    }
    else {
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