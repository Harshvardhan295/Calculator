let resultEl = document.getElementById("result-el");

function getInputValues() {
    let num1 = parseInt(document.getElementById("num1-el").value);
    let num2 = parseInt(document.getElementById("num2-el").value);
    return { num1, num2 };
}

function add() {
    let { num1, num2 } = getInputValues();
    let result = num1 + num2;
    resultEl.textContent = "Sum: " + result;
}

function subtract() {
    let { num1, num2 } = getInputValues();
    let result = num1 - num2;
    if (num2>num2){
    resultEl.textContent = "Difference: -" + result;}
    resultEl.textContent = "Difference: " + result;
}

function divide() {
    let { num1, num2 } = getInputValues();
    let result = num1 / num2;
    resultEl.textContent = "Division: " + result;
}

function multiply() {
    let { num1, num2 } = getInputValues();
    let result = num1 * num2;
    resultEl.textContent = "Multiplication: " + result;
}