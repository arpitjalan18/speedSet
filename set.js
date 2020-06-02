
// create card constructors/attributes
function card(color, shape, fill, quantity) {
    this.color = color;
    this.shape = shape;
    this.fill = fill;
    this.quantity = quantity;
}
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
var colors = ["green", "red", "purple"];
var shapes = ["squiggle", "oval", "diamond"];
var fills = ["none", "stripes", "full"];
var quantity = [1, 2, 3];

var cards = [];
var currentCards = [];

start();
function newGame() {
    var modal = document.getElementById("myModal");
    modal.style.display = "none";
    numSets = 0;
    document.querySelector("#sets").innerHTML = "Sets: " + numSets + "	|";
    document.querySelector("#status").innerHTML = 'Board has Sets! |';
    for (i = 1; i < 13; i++) {
        document.querySelector("#c" + i).style.backgroundColor = 'white';
    }
    cards = [];
    currentCards = [];
    start();
}
function start() {
    // create cards
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

    for (i = 1; i < 13; i++) {
        var index = Math.floor(Math.random() * cards.length);
        var tempCard = cards[index];
        cards.splice(index, 1);
        currentCards.push(tempCard);

        var element = document.querySelector('#c' + i + 'b1');

        //changes fill of original 
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

        //delete old clones
        for (j = 2; j < 4; j++) {
            var element2remove = document.querySelector('#c' + i + 'v' + j);
            if (element2remove != null) {
                element2remove.parentNode.removeChild(element2remove);
            }
        }

        //add new clones
        for (k = 2; k < 1 + tempCard.quantity; k++) {
            var original = document.querySelector('#c' + i + 'v1');
            var clone = original.cloneNode(true);
            clone.id = 'c' + i + 'v' + k;
            original.after(clone);
        }
    }
    document.querySelector("#cleft").innerHTML = 'Cards Left: ' + cards.length + '	|';
    checkSequence();
}
var clicked = [false, false, false, false, false, false, false, false, false, false, false, false];
numSets = 0;
function cellClicked(cellIndex) {
    if (clicked[cellIndex - 1]) {
        document.querySelector("#c" + cellIndex).style.backgroundColor = 'white';
        clicked[cellIndex - 1] = false;
    }
    else {
        document.querySelector("#c" + cellIndex).style.backgroundColor = 'lightgrey';
        clicked[cellIndex - 1] = true;
    }
    var howMany = 0;
    var set = [];
    for (i = 0; i < 12; i++) {
        if (clicked[i]) {
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
            numSets++;
            document.querySelector("#sets").innerHTML = "Sets: " + numSets + "	|";
            replaceSet(clicked);
        }
        else {
            document.querySelector("#cardHolder").style.backgroundColor = 'red';
            window.setTimeout(unFlash, 100);
        }
        for (i = 1; i < 13; i++) {
            if (clicked[i - 1]) {
                document.querySelector("#c" + i).style.backgroundColor = 'white';
                clicked[i - 1] = false;
            }
        }
    }
}
function unFlash() {
    document.querySelector("#cardHolder").style.backgroundColor = 'white';
}
function replaceSet(clicked) {
    for (i = 1; i < 13; i++) {
        if (clicked[i - 1]) {
            var tempCard;
            if (cards.length == 0) {
                tempCard = new card("white", "oval", "none", 1)
            }
            else {
                var index = Math.floor(Math.random() * cards.length);
                tempCard = cards[index];
                cards.splice(index, 1);
            }
            currentCards.splice(i - 1, 1, tempCard);

            var element = document.querySelector('#c' + i + 'b1');

            //changes fill of original 
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

            //delete old clones
            for (j = 2; j < 4; j++) {
                var element2remove = document.querySelector('#c' + i + 'v' + j);
                if (element2remove != null) {
                    element2remove.parentNode.removeChild(element2remove);
                }
            }

            //add new clones
            for (k = 2; k < 1 + tempCard.quantity; k++) {
                var original = document.querySelector('#c' + i + 'v1');
                var clone = original.cloneNode(true);
                clone.id = 'c' + i + 'v' + k;
                original.after(clone);
            }
        }
    }
    document.querySelector("#cleft").innerHTML = 'Cards Left: ' + cards.length + '	|';
    checkSequence();

}
function checkSequence() {
    if (!checkSets()) {
        if (cards.length > 0) {
            console.log("shuffling");
            document.querySelector("#cardHolder").style.backgroundColor = 'red';
            document.querySelector('#status').innerHTML = "No Sets! Shuffling Board ... |";
            window.setTimeout(shuffle, 3000);
        }
        else {
            // Get the modal
            var modal = document.getElementById("myModal");
            // Get the <span> element that closes the modal
            var span = document.getElementsByClassName("close")[0];
            modal.style.display = "block";
            // When the user clicks on <span> (x), close the modal
            span.onclick = function () {
                modal.style.display = "none";
            }
            // When the user clicks anywhere outside of the modal, close it
            window.onclick = function (event) {
                if (event.target == modal) {
                    modal.style.display = "none";
                }
            }
            document.querySelector('#status').innerHTML = "No Sets Left! You Won! |";
        }
    }
    else {
        console.log("not shuffling");
    }
}
function checkSets() {
    var set = currentCards;
    for (i = 0; i < 12; i++) {
        for (j = i + 1; j < 12; j++) {
            for (k = j + 1; k < 12; k++) {
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
    unFlash();
    document.querySelector("#status").innerHTML = 'Board has Sets! |';
    for (i = 0; i < 12; i++) {
        cards.push(currentCards[i]);
    }
    currentCards = [];
    for (i = 1; i < 13; i++) {
        var index = Math.floor(Math.random() * cards.length);
        var tempCard = cards[index];
        cards.splice(index, 1);
        currentCards.push(tempCard);

        var element = document.querySelector('#c' + i + 'b1');

        //changes fill of original 
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

        //delete old clones
        for (j = 2; j < 4; j++) {
            var element2remove = document.querySelector('#c' + i + 'v' + j);
            if (element2remove != null) {
                element2remove.parentNode.removeChild(element2remove);
            }
        }

        //add new clones
        for (k = 2; k < 1 + tempCard.quantity; k++) {
            var original = document.querySelector('#c' + i + 'v1');
            var clone = original.cloneNode(true);
            clone.id = 'c' + i + 'v' + k;
            original.after(clone);
        }
    }
    checkSequence();
}