// calculator_logic.js
const display = document.getElementById('display');
let displayValue = '0';
let firstOperand = null;
let operator = null;
let waitingForSecondOperand = false;

function updateDisplay() {
    display.value = displayValue;
}

updateDisplay(); // Initial display update

function handleNumber(number) {
    if (displayValue === 'Error' || displayValue === 'Infinity' || displayValue === '-Infinity') displayValue = '0'; // Clear error/Inf on new input
    if (waitingForSecondOperand) {
        displayValue = number;
        waitingForSecondOperand = false;
    } else {
        displayValue = displayValue === '0' ? number : displayValue + number;
    }
}

function handleDecimal() {
    if (displayValue === 'Error' || displayValue === 'Infinity' || displayValue === '-Infinity') displayValue = '0'; // Clear error/Inf
    if (waitingForSecondOperand) {
        displayValue = '0.';
        waitingForSecondOperand = false;
        return;
    }
    if (!displayValue.includes('.')) {
        displayValue += '.';
    }
}

function performCalculation(currentOperator = operator, op2 = parseFloat(displayValue)) {
    // Use currentOperator and op2 passed in, default to global state if not.
    // This allows % to use this function with a calculated second operand.
    const secondOperand = op2;

    if (currentOperator === '/' && secondOperand === 0) {
        displayValue = 'Error'; 
        firstOperand = null;
        operator = null; // Reset global operator
        waitingForSecondOperand = false;
        return null; 
    }

    let result = 0;
    switch (currentOperator) {
        case '+':
            result = firstOperand + secondOperand;
            break;
        case '-':
            result = firstOperand - secondOperand;
            break;
        case '*':
            result = firstOperand * secondOperand;
            break;
        case '/':
            result = firstOperand / secondOperand;
            break;
        default:
            return null; 
    }
    displayValue = String(parseFloat(result.toFixed(10)));
    // Update global firstOperand only if we are using the global operator
    if (currentOperator === operator) {
        firstOperand = parseFloat(displayValue);
    }
    return result;
}

function handleOperator(nextOperatorValue) {
    if (displayValue === 'Error' && nextOperatorValue !== 'clear' && nextOperatorValue !== 'clear-entry') return;

    const inputValue = parseFloat(displayValue);

    if (operator && waitingForSecondOperand) { // User is changing operator
        operator = nextOperatorValue;
        return;
    }

    if (firstOperand === null) {
        firstOperand = inputValue;
    } else if (operator) { 
        const result = performCalculation();
        if (result === null && displayValue === 'Error') {
             // Error already set by performCalculation, updateDisplay will be called by caller
             return; 
        }
    }

    waitingForSecondOperand = true;
    operator = nextOperatorValue;
}

function handleEquals() {
    if (displayValue === 'Error') return; 
    if (operator && firstOperand !== null && !waitingForSecondOperand) {
        performCalculation();
        operator = null; 
        waitingForSecondOperand = false; 
    }
}

function handleSqrt() {
    if (displayValue === 'Error') return;
    const currentValue = parseFloat(displayValue);

    if (currentValue < 0) {
        displayValue = 'Error';
        firstOperand = null; // Reset state on error
        operator = null;
        waitingForSecondOperand = false;
        // updateDisplay() will be called by the event handler
        return;
    }

    const sqrtResult = Math.sqrt(currentValue);
    displayValue = String(parseFloat(sqrtResult.toFixed(10))); // Update display with sqrt result

    // Check if sqrt is part of a chained operation (e.g., 5 + √9)
    // At this point, displayValue is the result of √9 (i.e., 3)
    // firstOperand would be 5, operator would be '+'
    // waitingForSecondOperand would be FALSE because '9' was fully entered.
    if (operator && firstOperand !== null && !waitingForSecondOperand) {
        // The result of sqrt (now in displayValue) becomes the second operand.
        performCalculation(); // This uses firstOperand, operator, and current displayValue (which is sqrtResult)
        // performCalculation updates firstOperand to the result of the full expression (e.g., 8)
        // and displayValue to this result.
        operator = null; // The calculation is complete.
        waitingForSecondOperand = false;
    } else {
        // If it's a standalone sqrt (e.g. just √9) or sqrt on a result (e.g. 5+3=8, then √)
        // The result of sqrt becomes the new firstOperand for any future operations.
        firstOperand = parseFloat(displayValue); // This is now the result of sqrt.
        operator = null;
        waitingForSecondOperand = false;
    }
    // updateDisplay() will be called by the event handler
}

function handlePercent() {
    if (displayValue === 'Error') return;
    const currentNum = parseFloat(displayValue);

    if (firstOperand !== null && operator !== null && !waitingForSecondOperand) {
        // Case: 100 + 10%  (currentNum is 10, firstOperand is 100, operator is +)
        const percentageValue = firstOperand * (currentNum / 100);
        // Temporarily set displayValue to percentageValue to use it as second operand
        // displayValue = String(percentageValue); // Don't update display yet
        performCalculation(operator, percentageValue); // Pass original operator and calculated percentage as op2
        // performCalculation updates displayValue with the final result (e.g., 110)
        // and updates global firstOperand with this result.
    } else {
        // Case: just 10% (firstOperand is null or no operator for it)
        displayValue = String(parseFloat((currentNum / 100).toFixed(10)));
        firstOperand = parseFloat(displayValue); // Update firstOperand with this new value
    }
    // After percent, it usually finalizes the segment or prepares for a new one
    operator = null;
    waitingForSecondOperand = false;
}


function clearAll() {
    displayValue = '0';
    firstOperand = null;
    operator = null;
    waitingForSecondOperand = false;
}

function clearEntry() {
    displayValue = '0';
    // If waitingForSecondOperand is true, it means an operator was just pressed.
    // User wants to clear the '0' and type a new second operand.
    // So, waitingForSecondOperand should remain true.
    // If it was false, user was typing first number or a number after equals.
    // This simple CE is fine.
}

const buttonsGrid = document.querySelector('.buttons-grid');
if (buttonsGrid) {
    buttonsGrid.addEventListener('click', (event) => {
        const { target } = event;
        if (!target.matches('button.calc-button')) {
            return;
        }

        const buttonId = target.id;
        const buttonValue = target.value; // Using .value as set in HTML

        if (target.classList.contains('number')) {
            handleNumber(buttonValue); // Numbers use their value (which is their text)
        } else if (buttonId === 'decimal') { // or buttonValue === '.'
            handleDecimal();
        } else if (buttonId === 'sqrt') { // or buttonValue === 'sqrt'
            handleSqrt();
        } else if (buttonId === 'percent') { // or buttonValue === '%'
            handlePercent();
        } else if (target.classList.contains('operator') && buttonId !== 'equals') {
            // All other operators (+, -, *, /)
            handleOperator(buttonValue);
        } else if (buttonId === 'equals') { // or buttonValue === '='
            handleEquals();
        } else if (buttonId === 'clear') { // or buttonValue === 'clear'
            clearAll();
        } else if (buttonId === 'clear-entry') { // or buttonValue === 'clear-entry'
            clearEntry();
        }
        
        updateDisplay();
    });
} else {
    console.error("Calculator buttons grid not found. Event listeners not attached.");
}
