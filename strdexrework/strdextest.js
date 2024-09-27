const outputdiv = document.getElementById("output");

function a(x) {
    return((-0.0000000166*x**(4)+0.0000122614*x**(3)-0.0044972984*x**(2)+0.9931907398*x+0.0093811967)/100);
}

function b(p,q) {
    return(
        a(p)*2+(1-a(p))*(1+a(q))
    );
}

function aaa(x,y) {
    y = b(x,y);
    outputdiv.innerHTML = y.toFixed(3);
}

aaa(0,0);
//a(x)=-0.0000000166 x^(4)+0.0000122614 x^(3)-0.0044972984 x^(2)+0.9931907398 x+0.0093811967


const maxspinput = document.getElementById("maxsp");
const strinput = document.getElementById("str");
const dexinput = document.getElementById("dex");


/*
// Get all the input fields
const inputFields = document.querySelectorAll('input[type="number"], input[type="text"], input[type="checkbox"]');
// Add event listeners to all input fields
inputFields.forEach(inputField => {
    inputField.addEventListener('input', inputChanged);
    //inputField.setAttribute('autocomplete', 'new-password');
});
*/


function inputChanged() {
    let maxsp = parseFloat(maxspinput.value);
    let str = parseFloat(strinput.value);
    let dex = parseFloat(dexinput.value);
    aaa(str,dex);
}


strinput.addEventListener('input', strChanged);
dexinput.addEventListener('input', dexChanged);

function strChanged() {
    dexinput.value = parseFloat(maxspinput.value) - parseFloat(strinput.value);
    inputChanged();
}

function dexChanged() {
    strinput.value = parseFloat(maxspinput.value) - parseFloat(dexinput.value);
    inputChanged();
}


maxspinput.addEventListener('input', maxspChanged);

function maxspChanged() {
    strinput.value = parseFloat(maxspinput.value);
    dexinput.value = 0;
    inputChanged();
}