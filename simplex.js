// Function to initialize the input fields for objective function coefficients
function setupVariables() {
    // Retrieve the number of variables from the user input
    const numVariables = parseInt(document.getElementById('numVariables').value);
    // Identify the division in the HTML to place the input fields for the objective function
    const objFuncDiv = document.getElementById('objectiveFunction');
    // Clear any existing content in the division
    objFuncDiv.innerHTML = '<h2>Objective Function Z = </h2>';

    // Create and append input fields for each variable coefficient
    for (let i = 0; i < numVariables; i++) {
        const input = document.createElement('input');
        input.type = 'number';
        input.id = 'z' + i;
        input.placeholder = 'Coefficient ' + (i + 1);
        objFuncDiv.appendChild(input);
    }

    // Create a hidden input field for the constant term of the objective function
    const constant = document.createElement('input');
    constant.type = 'number';
    constant.id = 'zConstant';
    constant.style.display = 'none'; // This field is hidden as it's typically not needed for the objective function
    objFuncDiv.appendChild(constant);
}

// Function to initialize the input fields for constraints
function setupConstraints() {
    // Retrieve the number of constraints and variables from the user inputs
    const numConstraints = parseInt(document.getElementById('numConstraints').value);
    const numVariables = parseInt(document.getElementById('numVariables').value);
    // Identify the division in the HTML to place the constraint inputs
    const constraintsDiv = document.getElementById('constraints');
    // Clear any existing content in this division
    constraintsDiv.innerHTML = '<h2>Constraints</h2>';

    // Loop to create input fields for each constraint
    for (let i = 0; i < numConstraints; i++) {
        const constraintDiv = document.createElement('div');
        // Nested loop to create input fields for each variable coefficient in the constraint
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
    // Retrieve the number of variables and constraints from the user input
    const numVariables = parseInt(document.getElementById('numVariables').value);
    const numConstraints = parseInt(document.getElementById('numConstraints').value);
    // Access the constraints division and extract all input fields within each div
    const constraints = document.getElementById('constraints').getElementsByTagName('div');
    let tableau = [];

    // Populate the tableau with constraint coefficients from the input fields
    for (let i = 0; i < numConstraints; i++) {
        const row = Array.from(constraints[i].getElementsByTagName('input'), input => parseFloat(input.value) || 0);
        tableau.push(row);
    }

    // Prepare the objective function row and add to the tableau
    let zRow = [];
    for (let i = 0; i < numVariables; i++) {
        zRow.push(-parseFloat(document.getElementById('z' + i).value) || 0); // Negate coefficients for maximization
    }
    zRow.push(parseFloat(document.getElementById('zConstant').value) || 0); // Include constant term of Z
    tableau.push(zRow);

    displayTableau(tableau, 0, "Initial Tableau"); // Display the initial tableau

    let iterations = 0;
    // Execute the Simplex algorithm iteratively to optimize the solution
    while (true) {
        // Get the last row of the tableau (objective function row)
        const lastRow = tableau[tableau.length - 1];
        // Find the pivot column (column with the most negative coefficient in the objective function row)
        let pivotCol = lastRow.indexOf(Math.min(...lastRow.slice(0, -1)));

        // If there's no negative coefficient in the objective function row, the solution is optimal
        if (pivotCol === -1 || lastRow[pivotCol] >= 0) {
            break; // Stop if the optimal solution is found or no negative coefficients
        }

        // Find the pivot row using the minimum ratio test
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

        // If no valid pivot row is found, the solution is unbounded
        if (pivotRow === -1) {
            console.error("Solution is unbounded."); // Handle unbounded solution case
            break;
        }

        // Get the pivot element
        const pivotElement = tableau[pivotRow][pivotCol];
        // Perform row operations to form the next tableau
        for (let i = 0; i < tableau.length; i++) {
            if (i != pivotRow) {
                const factor = tableau[i][pivotCol] / pivotElement;
                for (let j = 0; j < tableau[i].length; j++) {
                    tableau[i][j] -= factor * tableau[pivotRow][j];
                }
            }
        }

        // Normalize the pivot row
        for (let j = 0; j < tableau[pivotRow].length; j++) {
            tableau[pivotRow][j] /= pivotElement;
        }

        // Increment the iteration counter and display the current tableau
        iterations++;
        displayTableau(tableau, iterations, `Tableau after iteration ${iterations}`);

        // Prevent infinite loops by limiting the number of iterations
        if (iterations > 100) {
            console.error("Max iterations reached."); // Prevent infinite loops
            break;
        }
    }

    displayResults(tableau); // Display the final results
}

// Function to display each tableau
function displayTableau(tableau, iteration, title) {
    // Access the results division to append the tableau
    const resultsDiv = document.getElementById('results');
    const iterationDiv = document.createElement("div");
    iterationDiv.innerHTML = `<h3>${title}</h3>`;
    const table = document.createElement('table');

    // Populate the table with the current tableau values
    tableau.forEach((row) => {
        const tr = document.createElement('tr');
        row.forEach((cell) => {
            const td = document.createElement('td');
            td.textContent = parseFloat(cell).toFixed(2);
            tr.appendChild(td);
        });
        table.appendChild(tr);
    });

    iterationDiv.appendChild(table);
    resultsDiv.appendChild(iterationDiv);
}

// Function to display the final results after completing the Simplex algorithm
function displayResults(tableau) {
    // Access the results division to display the final results
    const resultsDiv = document.getElementById('results');
    const finalResults = document.createElement("div");
    finalResults.innerHTML = "<h3>Final Results</h3>";

    // Extract the optimal value of the objective function
    const z = tableau[tableau.length - 1][tableau[0].length - 1]; // Last element in the last row
    let resultString = `Max Z = ${z.toFixed(2)}`;

    const numVariables = tableau[0].length - 1; // Number of variables
    const variableValues = new Array(numVariables).fill(0);

    // Determine the values of the variables from the final tableau
    for (let j = 0; j < numVariables; j++) {
        const column = tableau.map(row => row[j]);
        const nonZeroIndices = column.slice(0, -1).map((val, index) => val !== 0 ? index : -1).filter(val => val !== -1);
        if (nonZeroIndices.length === 1) { // Basic variable found
            const rowIndex = nonZeroIndices[0];
            variableValues[j] = tableau[rowIndex][tableau[rowIndex].length - 1]; // Value in the last column
        }
    }

    // Append the variable values to the result string
    for (let i = 0; i < variableValues.length; i++) {
        resultString += `, X${i + 1} = ${variableValues[i].toFixed(2)}`;
    }

    finalResults.innerHTML += `<p>${resultString}</p>`;
    resultsDiv.appendChild(finalResults);
}

// Execute the setup functions when the window is loaded
window.onload = function() {
    setupVariables();
    setupConstraints();
}
