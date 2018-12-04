// Chris Schultz
// Kelby Funk
// COSC 3020
// Assignment 03 - Traveling Salesman
// 30 Nov 2018

/* REFERENCES AND CITATIONS
 *   Discussion in the engineering lab with other students concerning high-level
 *     implementations
 *   Online references to Held-Karp and articles
 *     https://people.eecs.berkeley.edu/~vazirani/algorithms/chap6.pdf
 *     https://medium.com/basecs/speeding-up-the-traveling-salesman-using-dynamic-programming-b76d7552e8dd
 *   In-class lecture notes on dynamic programming
 */

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

function heldKarpAlt(cities, start){
    if (cities.length < 2){
        return 0;
    }
    // memoTable will be the way we hold distances that have already
    // been computed. For every index, there are three elements: in order,
    // the subset of cities already visited, the city we are going through
    // to reach that subset, and the minimum distance produced from that

    // this is some initial setup
    var memoTable = [];
    var validCities = [];
    for (var i = 0; i < cities.length; i++){
        if (start == i){
            continue;
        }
        validCities.push(i);
    }
    var subsets = generateSubsets(validCities);
    for (var i = 0; i < validCities.length; i++){
        memoTable.push([[], validCities[i], 0]);
    }

    // this constructs the memo table with possible sets and cities
    for (var i = 1; i < validCities.length; i++){
        var temp = [];
        var subsetsCopy = subsets.filter(set => set.length == i);
        for (var j = 0; j < subsetsCopy.length; j++){
            for (var k = 0; k < validCities.length; k++){
                if (subsetsCopy[j].includes(validCities[k])){
                    continue;
                }
                temp.push([subsetsCopy[j], validCities[k], -1]);
            }
        }
        for (var x = 0; x < temp.length; x++){
            memoTable.push(temp[x]);
        }
    }
    memoTable.push([validCities, start, -1]);

    var minDist = [];
    var tempStuff = [];
    var accumulator = 0;

    // this section calculates all the minimum distances
    // in the memo table
    for (var i = 0; i < memoTable.length; i++){
        var currentLength = memoTable[i][0].length;
        if (memoTable[i][0] == 0){
            continue;
        }
        var tempStuff = memoTable.filter(set => set[0].length == currentLength - 1);
        for (var k = 0; k < memoTable[i][0].length; k++){
            var copyMemoLocation = [];
            copyMemoLocation.push(memoTable[i][0].slice());
            var oldCity = memoTable[i][0][k];
            var currentCity = memoTable[i][1];
            var lookupSet = copyMemoLocation.slice();
            lookupSet[0].splice(k, 1);
            for (var m = 0; m < tempStuff.length; m++){
                var comparisonSet = tempStuff[m][0].slice();
                if (testEqualArrays(comparisonSet, lookupSet[0]) &&
                    (tempStuff[m][1] == oldCity)){
                        accumulator = accumulator + tempStuff[m][2];
                    }
            }
            minDist.push(accumulator + findRouteDist(cities, [currentCity, oldCity]));
            accumulator = 0;
        }
        memoTable[i][2] = Math.min(...minDist);
        minDist = [];
    }
    var x = memoTable.pop();
    var trueMin = x[2];
    return trueMin;
}

// generates an undirected graph - an adjacency matrix
function generateGraph(n){
    var mySize = n;
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
// thanks for nothing, stack overflow
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

// a function that generates all possible subsets of an array
// and then sorts them in order of the length of the set
function generateSubsets(array){
    var collect = [];
    for (var i = 0; i < (Math.pow(2, array.length)); i++){
        var temp = [];
        for (var j = 0; j < array.length; j++){
            if ((i & (1 << j))) temp.push(array[j]);
        }
        collect.push(temp);
    }
    collect.sort(function(a, b){return a.length - b.length});
    return collect;
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
    // the cutoff will be either a route that is 1/3 of the original distance
    //   or a route that is the length of the graph * 3
    var cutoff1 = 0.33 * originalDist;
    var cutoff2 = myRoute.length * 3;
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
   
    return dist;
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

// we removed the original test cases to save space, but we tested all the algorithms on
// these four graphs. the first three had defined cases, and returned as the minimum tour
// 6, 9, and 6 respectively. the fourth one is to facilitate easy testing at high inputs

console.log("-----------------------Testing Held-Karp!--------------------------");
for (var i = 3; i <= 50; i++){
    var myMatrix = generateGraph(i);
    console.time('Time to execute Held Karp')
    console.log("On a graph of size", i, "the shortest path I could find is of length",
                heldKarpAlt(myMatrix, 0));
    console.timeEnd('Time to execute Held Karp');
    console.log();
}

console.log("-------------------Testing Stochastic Search!----------------------");
for (var i = 3; i <= 50; i++){
    myMatrix = generateGraph(i);
    myRoute = generateRoute(myMatrix);
    console.time('Time to execute stochastic search');
    console.log("On a graph of size", i, "starting from", myRoute[0], "the shortest",
                 "path I could find is of length", stocSearch(myMatrix, myRoute));
    console.timeEnd('Time to execute stochastic search');
    console.log();
}

console.log("-----------------Comparing Min Distances Found!--------------------");
for (var i = 0; i <= 11; i++){
    myMatrix = generateGraph(i);
    myRoute = generateRoute(myMatrix);
    var start = myRoute[0];
    console.log("For a graph of size", i, "the Held-Karp algorithm returned the optimal",
                "tour with a distance of", heldKarpAlt(myMatrix, start));
    console.log("For the same graph, the stochastic search algorithm found a tour",
                "with a distance of", stocSearch(myMatrix, myRoute));
    console.log();
}