// Chris Schultz W05977190
// Kelby Funk W04679495
// COSC 3020
// Assignment 03
// 30 Nov 2018

//
//// HELD-KARP ALGORITHMS, BOTH NORMAL AND DYNAMIC, AND RELATED FUNCTIONS
//

// finds the shortest/optimal tour, starting at one
// city and going to every other city one-way
function heldKarp(cities, start){
    var toHold = [];
    if (cities.length == 2){
        return Math.max(...cities[0]);
    }
    else{
        for (var i = 0; i < cities.length; i++){
            if (cities[start][i] == 0){
                continue;
            }
            else{
                var tempMatrix = copyGraph(cities);
                reduceGraph(tempMatrix, start);
                toHold.push(cities[start][i] + heldKarp (tempMatrix, (i < 1 ? 0 : i - 1)));
            }
        }
        return Math.min(...toHold);
    }
}

function heldKarpAlt(graph, start){
    // algorithm goes here
}

// generates an undirected graph - an adjacency matrix
function generateGraph(){
    var mySize = 6;
    var myMatrix = [];

    for (var i = 0; i < mySize; i++){
        myMatrix[i] = [mySize];
        for (var j = 0; j < mySize; j++){
            if (j == i){
                myMatrix[i][j] = 0;
            }
            else if (j < i){
                myMatrix[i][j] = myMatrix[j][i];
            }
            else{
                myMatrix[i][j] = Math.floor(Math.random() * 10) + 1;
            }
        }
    }
    return myMatrix;
}

// removes a city from a graph, so an nxn graph becomes n-1 x n-1
function reduceGraph(matrix, start){
    if (start < 0){
        return matrix;
    }
    else{
        for (var i = 0; i < matrix.length; i++){
            if (i == start){
                continue;
            }
            else{
                matrix[i].splice((start), 1);
            }
        }

        matrix.splice((start), 1);
        return matrix;
    }
}

// prints an adjacency matrix for ease of display, borrowed from labs
function printMatrix(matrix){
    for (var i = 0; i < matrix.length; i++){
        console.log(matrix[i]);
    }
    return;
}

// function to make a "deep copy" of a graph
// this is here because both slice() and concat()
// both did not play nice with the algorithm
// thanks for nothings stack overflow
function copyGraph(matrix){
    var why = [];
    for (var i = 0; i < matrix.length; i++){
        why[i] = [matrix.length]
        for (var j = 0; j < matrix.length; j++){
            why[i][j] = matrix[i][j];
        }
    }
    return why;
}

//
//// STOCHASTIC LOCAL SEARCH ALGORITHM AND RELATED FUNCTIONS
//

// reverses part of the route at every iteration
function stocSearch(cities, myRoute){
    var original = myRoute.slice();
    var dist = findRouteDist(cities, myRoute);
    var originalDist = dist;
    var x = -1;
    var cutoff1 = 0.33 * originalDist;
    var cutoff2 = myRoute.length * 1.5;
    do{
        for (var i = 1; i < cities.length; i++){
            var k = Math.floor(Math.random() * (cities.length - i)) + i;
            if (k == x){
                continue;
            }
            twoOptSwap(myRoute, i, k);
            var temp = findRouteDist(cities, myRoute);
            if (temp < dist){
                dist = temp;
                var fastest = myRoute.slice();
            }
            x = k;
        }
        x = -1;
        if ((dist <= cutoff1) || (dist <= cutoff2)){break;}
    }while(((testEqualArrays(myRoute, original) == false)));
   
    console.log("Starting from city", myRoute[0], ", the shortest path I could find is of length", dist);
    if (fastest.length == 0){
        console.log("Route is", myRoute);
    }
    else{
        console.log("Route is", fastest);
    }
}

// a function that takes a graph and returns a random route
function generateRoute(cities){
    var temp = [];
    while(temp.length < cities.length){
        var rando = Math.floor(Math.random() * cities.length);
        if (temp.includes(rando)){
            continue;
        }
        else{
            temp.push(rando);
        }
    }
    return temp;
}

// quick function to find the distance of a route
function findRouteDist(cities, route){
    var distance = 0;
    for (var i = 0; i < route.length - 1; i++){
        distance = distance + cities[route[i]][route[i + 1]];
    }
    return distance;
}

// function to reverse a chunk of a given route
function twoOptSwap(route, i, k){
    if (i == k) {return route;}
    var temp = route.slice(i, k + 1);
    route.splice(i, (k + 1 - i));
    for (var j = 0; j < temp.length; j++){
        route.splice(i, 0, temp[j]);
    }
}

// function to test if two arrays are equivalent, borrowed from labs
function testEqualArrays(route1, route2){
    var bool = true;
    for (var i = 0; i < route1.length; i++){
        if (route1[i] != route2[i]){
            bool = false;
        }
    }
    return bool;
}



//
//// TEST MATRICES - DEFINED CASES TO SHOW ALGORITHM IS CORRECT
//

var testArrayOne = [[0, 2, 5,],
                    [2, 0, 4,],
                    [5, 4, 0,]];
                    
var testArrayTwo = [[0, 5, 6, 4],
                    [5, 0, 3, 2],
                    [6, 3, 0, 6],
                    [4, 2, 6, 0]];

var testArrayThree = [[0, 5, 4, 1, 5],
                      [5, 0, 7, 7, 2],
                      [4, 7, 0, 1, 2],
                      [1, 7, 1, 0, 9],
                      [5, 2, 2, 9, 0]];

var testArrayFour = generateGraph();

//
//// ALL OF THE TEST CASES FOR HELD-KARP ALGORITHM
//

/*
console.log("------------------------Testing Held-Karp!-------------------------");
// best tour on this should return 6
console.log("The graph is represented as...");
printMatrix(testArrayOne);
console.time('Time to execute heldKarp');
console.log("Best tour from beginning (City A/City 1) is", heldKarp(testArrayOne, 0));
console.timeEnd('Time to execute heldKarp');
console.log("-------------------------------------------------------------------");

// best tour on this should return 9 and 12 respectively
console.log("The graph is represented as...");
printMatrix(testArrayTwo);
console.time('Time to execute heldKarp');
console.log("Best tour from beginning (City A/City 1) is", heldKarp(testArrayTwo, 0));
console.timeEnd('Time to execute heldKarp');
console.time('Time to execute heldKarp');
console.log("Best tour from second city (City B/City 2) is", heldKarp(testArrayTwo, 1));
console.timeEnd('Time to execute heldKarp');
console.log("-------------------------------------------------------------------");

// best tour on this should return 6
console.log("The graph is represented as...");
printMatrix(testArrayThree);
console.time('Time to execute heldKarp');
console.log("Best tour from beginning (City A/City 1) is", heldKarp(testArrayThree, 0));
console.timeEnd('Time to execute heldKarp');
console.log("-------------------------------------------------------------------");

// testing a random big graph
console.log("The graph is represented as...");
printMatrix(testArrayFour);
console.time('Time to execute heldKarp');
console.log("Best tour from beginning (City A/City 1) is", heldKarp(testArrayFour, 0));
console.timeEnd('Time to execute heldKarp');

console.log();

// testing the stochastic search algorithm
console.log("--------------------Testing Stochastic Search!---------------------")
printMatrix(testArrayThree);
console.time('Time to execute stochastic search');
stocSearch(testArrayThree, generateRoute(testArrayThree));
console.timeEnd('Time to execute stochastic search');
console.log("-------------------------------------------------------------------")
*/

// testing the stochastic search algorithm on something big
printMatrix(testArrayFour);
console.time('Time to execute stochastic search');
stocSearch(testArrayFour, generateRoute(testArrayFour));
console.timeEnd('Time to execute stochastic search');
console.log("-------------------------------------------------------------------");
console.log();
console.log("-----------------------Testing Held-Karp!--------------------------");
printMatrix(testArrayThree);
console.log(heldKarpAlt(testArrayThree, 0));
console.log();
console.log("--------------------------Other Tests!-----------------------------");
printMatrix(testArrayTwo);
heldKarpAlt(testArrayTwo, 0);