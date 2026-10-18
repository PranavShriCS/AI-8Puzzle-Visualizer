
# Interactive 8-Puzzle Problem Solver Using IDDLS

## Student Details

- **Name:** Pranav Shri GS
- **Registration Number:** 24BCE2615
- **Course:** Artificial Intelligence
- **Assigned Algorithm:** Iterative Deepening Depth-Limited Search (IDDLS)

## Project Overview

This project is an interactive, browser-based visualization of the 8-Puzzle problem solved using Iterative Deepening Depth-Limited Search (IDDLS).

The 8-Puzzle consists of eight numbered tiles and one blank space arranged in a 3 × 3 grid. The objective is to transform an initial configuration into a specified goal configuration by moving a neighboring tile into the blank space.

The application visualizes the search process and presents the resulting solution path and search statistics.

## Features

- Displays the initial, goal, and current puzzle states.
- Accepts custom initial and goal configurations.
- Validates puzzle configurations and checks reachability.
- Generates random solvable puzzle configurations.
- Implements Iterative Deepening Depth-Limited Search (IDDLS).
- Displays generated successor states, the frontier, and explored states.
- Provides Run, Pause, Resume, Previous Step, Next Step, and Reset Search controls.
- Supports adjustable visualization speed.
- Displays generated and expanded node counts, current depth, depth limit, and path cost.
- Presents the solution path and summary statistics.
- Includes an explanation of the assigned algorithm, its properties, complexity, advantages, and limitations.

## Algorithm: IDDLS

Iterative Deepening Depth-Limited Search repeatedly performs depth-limited depth-first search, increasing the depth limit whenever the goal is not found.

### Algorithm Steps

1. Initialize the depth limit to zero.
2. Perform depth-first search without expanding beyond the current limit.
3. Avoid revisiting states on the current search path.
4. If the goal is not found, increase the depth limit.
5. Repeat until a solution is found or the implementation reaches its stopping limit.

### Completeness and Optimality

For a finite branching factor, IDDLS is complete when a solution exists and the search continues far enough. When all moves have equal cost, it finds a shallowest solution.

### Complexity

Let `b` be the branching factor and `d` be the depth of the shallowest solution.

- **Time complexity:** O(b^d)
- **Space complexity:** O(bd) for the standard search algorithm, excluding visualization history and implementation overhead.

### Advantages

- Uses less search memory than storing a broad search tree.
- Finds a shallowest solution when each move has equal cost.
- Explores progressively deeper solutions.

### Limitations

- Repeats work across depth-limit iterations.
- Search time can grow significantly for difficult configurations.

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6)
- Bootstrap 5

## Project Structure

```text
AI-8Puzzle-Visualizer/
├── index.html
├── README.md
├── css/
│   └── style.css
└── js/
    ├── puzzle.js
    ├── search.js
    ├── visualizer.js
    └── custom.js
```

## Running Locally

1. Download or clone the repository.
2. Open the project folder in Visual Studio Code.
3. Open `index.html` in a modern web browser, or use the VS Code Live Server extension.
4. Configure the initial and goal states or generate a random solvable puzzle.
5. Use the search controls to visualize IDDLS.

An internet connection is needed to load Bootstrap from its CDN.

## Evaluation Metrics

The application displays search progress and statistics, including generated and expanded nodes, depth, depth limit, solution moves, path cost, execution time, and an approximate memory-use estimate.

The memory value is an estimate based on retained visualization states, not a direct measurement of total browser memory.

## References

1. Russell, S. J., and Norvig, P. *Artificial Intelligence: A Modern Approach*. Pearson.
2. Bootstrap documentation: https://getbootstrap.com/docs/5.3/
3. MDN Web Docs: https://developer.mozilla.org/


