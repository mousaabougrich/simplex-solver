# Simplex Linear Programming Solver

This is a JavaScript implementation of the Simplex algorithm to solve linear programming problems.

## Features

- Set up input fields for objective function coefficients and constraint coefficients dynamically.
- Solve linear programming problems with the Simplex method.
- Display the results including the maximum value of the objective function and the values of decision variables.
- Prevent infinite loops by limiting the number of iterations.

## Usage

1. Include the `simplex.js` file in your HTML file.
2. Define the number of variables and constraints in your linear programming problem using HTML input fields with IDs `numVariables` and `numConstraints`.
3. Use the `setupVariables()` and `setupConstraints()` functions to set up input fields for objective function coefficients and constraint coefficients respectively.
4. Implement a button or trigger to execute the `solveSimplex()` function to solve the linear programming problem.
5. 
