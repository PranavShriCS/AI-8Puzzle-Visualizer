
const Search = (() => {
    function stateKey(state) {
        return state.join(",");
    }

    function createSolver(start, goal) {
        if (!Puzzle.isValidState(start) || !Puzzle.isValidState(goal)) {
            throw new Error("Start and goal must be valid puzzle states.");
        }

        if (!Puzzle.isSolvable(start, goal)) {
            throw new Error("The initial state cannot reach the goal.");
        }

        const goalKey = stateKey(goal);

        let depthLimit = 0;
        let iteration = 0;
        let nodesGenerated = 1;
        let nodesExpanded = 0;
        let maximumDepth = 0;
        let finished = false;
        let solutionPath = [];
        let lastEvent = null;
        let stack = [];
        let exploredRecent = [];

        function startIteration() {
            stack = [{
                state: [...start],
                parent: null,
                depth: 0,
                path: [stateKey(start)]
            }];

            exploredRecent = [];
        }

        function snapshot(node, type, successors = []) {
            return {
                type,
                iteration,
                depthLimit,
                currentState: node ? [...node.state] : null,
                parentState: node ? node.parent : null,
                depth: node ? node.depth : 0,
                generatedSuccessors: successors.map(
                    state => [...state]
                ),
                nodesGenerated,
                nodesExpanded,
                maximumDepth,
                frontierSize: stack.length,
                frontier: stack.slice(-12).reverse().map(node => ({
                    state: [...node.state],
                    depth: node.depth
                })),
                explored: exploredRecent.slice(-12).map(node => ({
                    state: [...node.state],
                    depth: node.depth
                })),
                pathCost: node ? node.depth : 0,
                solutionPath: solutionPath.map(state => [...state]),
                finished,
                status: ""
            };
        }

        startIteration();

        function step() {
            if (finished) return lastEvent;

            if (stack.length === 0) {
                if (depthLimit >= 31) {
                    finished = true;
                    lastEvent = snapshot(null, "failure");
                    lastEvent.status = "Search ended without finding a solution.";
                    return lastEvent;
                }

                depthLimit++;
                iteration++;
                startIteration();

                lastEvent = snapshot(null, "iteration");
                lastEvent.status =
                    `Starting iteration ${iteration + 1} with depth limit ${depthLimit}.`;

                return lastEvent;
            }

            const node = stack.pop();
            maximumDepth = Math.max(maximumDepth, node.depth);

            if (stateKey(node.state) === goalKey) {
                finished = true;
                solutionPath = node.path.map(key =>
                    key.split(",").map(Number)
                );

                lastEvent = snapshot(node, "solution");
                lastEvent.solutionPath = solutionPath.map(state => [...state]);
                lastEvent.status = `Solution found in ${node.depth} moves.`;
                return lastEvent;
            }

            if (node.depth >= depthLimit) {
                lastEvent = snapshot(node, "cutoff");
                lastEvent.status = `Depth limit reached at depth ${node.depth}.`;
                return lastEvent;
            }

            nodesExpanded++;

            const successors = [];

            for (const nextState of Puzzle.getNeighbors(node.state)) {
                const key = stateKey(nextState);

                if (node.path.includes(key)) continue;

                successors.push({
                    state: [...nextState],
                    parent: [...node.state],
                    depth: node.depth + 1,
                    path: [...node.path, key]
                });
            }

            for (let i = successors.length - 1; i >= 0; i--) {
                stack.push(successors[i]);
            }

            nodesGenerated += successors.length;

            exploredRecent.push({
                state: [...node.state],
                depth: node.depth
            });

            if (exploredRecent.length > 100) {
                exploredRecent.shift();
            }

            lastEvent = snapshot(
                node,
                "expand",
                successors.map(node => node.state)
            );

            lastEvent.status = `Expanded a node at depth ${node.depth}.`;
            return lastEvent;
        }

        function getStats() {
            return {
                algorithm: "IDDLS",
                solutionFound: solutionPath.length > 0,
                nodesGenerated,
                nodesExpanded,
                maximumDepth,
                depthLimit,
                iterations: iteration + 1,
                moves: solutionPath.length ? solutionPath.length - 1 : null,
                pathCost: solutionPath.length ? solutionPath.length - 1 : null
            };
        }

        return {
            step,
            getStats,
            isFinished: () => finished,
            getSolutionPath: () => solutionPath.map(state => [...state]),
            getDepthLimit: () => depthLimit
        };
    }

    return { createSolver };
})();
