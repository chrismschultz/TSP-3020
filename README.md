# TSP-3020
A Javascript implementation to solve the Traveling Salesman problem in two ways

## What is the goal of the program?

The goal was to solve a variation of the Traveling Salesman problem. The program takes a list of cities as a graph (represented as an adjacency matrix) and a starting city, and returns the length of the shortest tour that visits every city exactly once, but does not return to the starting city. Three different algorithms are included to solve the problem, detailed below.
  
- heldKarp(), a top-down, recursive variation of the Held-Karp algorithm
- heldKarpAlt(), a bottom-up, iterative version of the above
- stocSearch(), which generates a random route through the graph and swaps parts of it at every iteration

## How is the performance of the algorithms?

The algorithms all function as intended. On computers that were tested locally, the Held-Karp algorithms managed to find minimum distances for graphs of around size 20 before being unable to continue. The stochastic search managed to find minimum routes for graphs of up to 48 cities before it really started screaming.

## What improvements could be made in future?

Although the code certainly works, it is by no means a perfect or truly efficient implementation. These are things that I/we would like to improve further:

- Improve the memory efficiency, as the implementation here uses many temporary arrays which could waste memory space
- Improve code readability and find solutions that do not require as many temporary variables and separate functions

## Thanks To:

Kelby Funk, my classmate and partner on this project, as well as other references in the comments.
