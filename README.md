# TSP-3020
A Javascript implementation to solve the Traveling Salesman problem in two ways.

(1) A version of the Held-Karp algorithm that utilizes dynamic programming - this version does not return to the starting city, it merely takes a starting city and finds the quickest route through every other city in the graph.

(2) A stochastic search algorithm that finds a route through the graph that is "basically okay." It starts by generating a random route through the entire graph, and at every iteration it reverses part of the route and tries again. Not guaranteed to always give the absolute best-case path, but will always find one that is not terrible.
