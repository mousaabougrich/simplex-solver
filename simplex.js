// Function to set up input fields for objective function coefficients
function setupVariables() {
    // Get the number of variables from the input field
    const numVariables = parseInt(document.getElementById('numVariables').value);
    // Get the div where objective function inputs will be placed
    const objFuncDiv = document.getElementById('objectiveFunction');
    // Reset the div content
    objFuncDiv.innerHTML = '<h2>Objective Function Z = </h2>'; // Reset

    // Loop to create input fields for each variable coefficient
    for (let i = 0; i < numVariables; i++) {
        const input = document.createElement('input');
        input.type = 'number';
        input.id = 'z' + i;
        input.placeholder = 'Coefficient ' + (i + 1);
        objFuncDiv.appendChild(input);
    }

    // Create an input field for the constant term (hidden as it's not needed)
    const constant = document.createElement('input');
    constant.type = 'number';
    constant.id = 'zConstant';
    constant.style.display = 'none'; // Hide constant input as it's not needed
    objFuncDiv.appendChild(constant);
}

// Function to set up input fields for constraint coefficients
function setupConstraints() {
    // Get the number of constraints and variables from input fields
    const numConstraints = parseInt(document.getElementById('numConstraints').value);
    const numVariables = parseInt(document.getElementById('numVariables').value);
    // Get the div where constraint inputs will be placed
    const constraintsDiv = document.getElementById('constraints');
    // Reset the div content
    constraintsDiv.innerHTML = '<h2>Constraints</h2>'; // Reset

    // Loop to create input fields for each constraint
    for (let i = 0; i < numConstraints; i++) {
        const constraintDiv = document.createElement('div');
        // Loop to create input fields for each variable coefficient in the constraint
        for (let j = 0; j < numVariables; j++) {
            const input = document.createElement('input');
            input.type = 'number';
            input.placeholder = 'X' + (j + 1);
            constraintDiv.appendChild(input);
        }
        // Create an input field for the right-hand side value of the constraint
        const equals = document.createElement('input');
        equals.type = 'number';
        equals.placeholder = '= Value';
        constraintDiv.appendChild(equals);
        constraintsDiv.appendChild(constraintDiv);
    }
}

// Function to solve the linear programming problem using the Simplex method
function solveSimplex() {
    // Get the number of variables and constraints
    const numVariables = parseInt(document.getElementById('numVariables').value);
    const numConstraints = parseInt(document.getElementById('numConstraints').value);
    // Get the div containing constraint inputs
    const constraints = document.getElementById('constraints').getElementsByTagName('div');
    let tableau = [];

    // Populate the tableau with constraint coefficients
    for (let i = 0; i < numConstraints; i++) {
        const row = Array.from(constraints[i].getElementsByTagName('input'), input => parseFloat(input.value) || 0);
        tableau.push(row);
    }

    // Add the objective function row (Z row) to the tableau
    let zRow = [];
    for (let i = 0; i < numVariables; i++) {
        zRow.push(-parseFloat(document.getElementById('z' + i).value) || 0);  // Negate Z coefficients for maximization
    }
    zRow.push(parseFloat(document.getElementById('zConstant').value) || 0); // Z constant term
    tableau.push(zRow);

    // Implement Simplex algorithm
    let iterations = 0;
    while (true) {
        const lastRow = tableau[tableau.length - 1];
        let pivotCol = lastRow.indexOf(Math.min(...lastRow.slice(0, -1)));

        if (pivotCol === -1 || lastRow[pivotCol] >= 0) {
            break; // Optimal solution found or no negative coefficients
        }

        let pivotRow = -1;
        let minRatio = Infinity;
        for (let i = 0; i < tableau.length - 1; i++) {
            if (tableau[i][pivotCol] > 0) {
                const ratio = tableau[i][tableau[i].length - 1] / tableau[i][pivotCol];
                if (ratio < minRatio) {
                    minRatio = ratio;
                    pivotRow = i;
                }
            }
        }

        if (pivotRow === -1) {
            console.error("Solution is unbounded.");
            break;
        }

        const pivotElement = tableau[pivotRow][pivotCol];
        for (let i = 0; i < tableau.length; i++) {
            if (i != pivotRow) {
                const factor = tableau[i][pivotCol] / pivotElement;
                for (let j = 0; j < tableau[i].length; j++) {
                    tableau[i][j] -= factor * tableau[pivotRow][j];
                }
            }
        }

        for (let j = 0; j < tableau[pivotRow].length; j++) { // Normalize the pivot row
            tableau[pivotRow][j] /= pivotElement;
        }

        iterations++;
        if (iterations > 100) { // Prevent infinite loops
            console.error("Max iterations reached.");
            break;
        }
    }

    displayResults(tableau);
}

// Function to display the results of the Simplex method
function displayResults(tableau) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = "<h3>Results</h3>";

    // Extract the solution from the final tableau
    const z = tableau[tableau.length - 1][tableau[0].length - 1]; // Last element in the last row
    const numVariables = tableau[0].length - 1; // Number of variables
    const variableValues = new Array(numVariables).fill(0);

    // Iterate through tableau to find variable values
    for (let j = 0; j < numVariables; j++) {
        const column = tableau.map(row => row[j]);
        const nonZeroIndices = column.slice(0, -1).map((val, index) => val !== 0 ? index : -1).filter(val => val !== -1);
        if (nonZeroIndices.length === 1) { // Basic variable found
            const rowIndex = nonZeroIndices[0];
            variableValues[j] = tableau[rowIndex][tableau[rowIndex].length - 1]; // Value in the last column
        }
    }

    // Display Z (objective function) and variable values
    let resultString = `Max Z = ${z.toFixed(2)}, `;
    for (let i = 0; i < numVariables; i++) {
        resultString += `X${i + 1} = ${variableValues[i].toFixed(2)}, `;
    }
    resultsDiv.innerHTML += `<p>${resultString}</p>`;

    // Display the original tableau
    resultsDiv.innerHTML += "<h3>Original Tableau</h3>";
    tableau.forEach(row => {
        const rowDiv = document.createElement("div");
        row.forEach(cell => {
            const cellSpan = document.createElement("span");
            cellSpan.textContent = `${cell.toFixed(2)}\t`;
            cellSpan.style.marginRight = "10px";
            rowDiv.appendChild(cellSpan);
        });
        resultsDiv.appendChild(rowDiv);
    });
}

// Execute setup functions when the window is loaded
window.onload = function() {
    setupVariables();
    setupConstraints();
}
