
const Puzzle = (() => {
    const DEFAULT_INITIAL = [2, 8, 3, 1, 6, 4, 7, 0, 5];
    const DEFAULT_GOAL = [1, 2, 3, 8, 0, 4, 7, 6, 5];

    let initialState = [...DEFAULT_INITIAL];
    let goalState = [...DEFAULT_GOAL];
    let currentState = [...DEFAULT_INITIAL];

    function stateKey(state) {
        return state.join(",");
    }

    function isValidState(state) {
        return (
            Array.isArray(state) &&
            state.length === 9 &&
            state.every(value =>
                Number.isInteger(value) &&
                value >= 0 &&
                value <= 8
            ) &&
            new Set(state).size === 9
        );
    }

    function isSolvable(initial, goal) {
        if (!isValidState(initial) || !isValidState(goal)) {
            return false;
        }

        const goalOrder = goal.filter(value => value !== 0);
        const rank = new Map(
            goalOrder.map((value, index) => [value, index])
        );

        const sequence = initial
            .filter(value => value !== 0)
            .map(value => rank.get(value));

        let inversions = 0;

        for (let i = 0; i < sequence.length; i++) {
            for (let j = i + 1; j < sequence.length; j++) {
                if (sequence[i] > sequence[j]) {
                    inversions++;
                }
            }
        }

        return inversions % 2 === 0;
    }

    function renderBoard(elementId, state) {
        const board = document.getElementById(elementId);
        if (!board) return;

        board.replaceChildren();

        state.forEach(value => {
            const tile = document.createElement("div");

            tile.className = value === 0
                ? "puzzle-tile blank"
                : "puzzle-tile";

            tile.textContent = value === 0 ? "" : value;
            tile.setAttribute("role", "img");
            tile.setAttribute(
                "aria-label",
                value === 0 ? "Blank tile" : `Tile ${value}`
            );

            board.appendChild(tile);
        });
    }

    function renderAll() {
        renderBoard("initial-board", initialState);
        renderBoard("goal-board", goalState);
        renderBoard("current-board", currentState);
    }

    function getNeighbors(state) {
        const blankIndex = state.indexOf(0);
        const row = Math.floor(blankIndex / 3);
        const col = blankIndex % 3;

        const directions = [
            { dr: -1, dc: 0 },
            { dr: 1, dc: 0 },
            { dr: 0, dc: -1 },
            { dr: 0, dc: 1 }
        ];

        const neighbors = [];

        for (const { dr, dc } of directions) {
            const newRow = row + dr;
            const newCol = col + dc;

            if (
                newRow < 0 || newRow > 2 ||
                newCol < 0 || newCol > 2
            ) {
                continue;
            }

            const nextIndex = newRow * 3 + newCol;
            const nextState = [...state];

            nextState[blankIndex] = nextState[nextIndex];
            nextState[nextIndex] = 0;

            neighbors.push(nextState);
        }

        return neighbors;
    }

    function generateRandomPuzzle() {
        let state = [...goalState];
        let previousKey = null;

        const scrambleSteps = 14 + Math.floor(Math.random() * 7);

        for (let step = 0; step < scrambleSteps; step++) {
            const candidates = getNeighbors(state).filter(
                next => stateKey(next) !== previousKey
            );

            const next = candidates[
                Math.floor(Math.random() * candidates.length)
            ];

            previousKey = stateKey(state);
            state = next;
        }

        initialState = [...state];
        currentState = [...state];

        renderAll();
        updateStatus(
            `Random solvable puzzle generated using ${scrambleSteps} moves.`
        );
    }

    function reset() {
        currentState = [...initialState];
        renderAll();
        updateStatus("Puzzle reset. Ready to solve.");
    }

    function updateStatus(message) {
        const status = document.getElementById("search-status");

        if (status) {
            status.textContent = message;
        }
    }

    function setCurrentState(state) {
        if (!isValidState(state)) {
            throw new Error("Invalid puzzle state.");
        }

        currentState = [...state];
        renderBoard("current-board", currentState);
    }

    function setStates(initial, goal) {
        if (!isValidState(initial) || !isValidState(goal)) {
            throw new Error(
                "Both states must contain tiles 0–8 exactly once."
            );
        }

        if (!isSolvable(initial, goal)) {
            throw new Error(
                "The initial state cannot reach this goal state."
            );
        }

        initialState = [...initial];
        goalState = [...goal];
        currentState = [...initial];

        renderAll();
        updateStatus("Initial and goal states applied successfully.");
    }

    function setInitialState(state) {
        setStates(state, goalState);
    }

    function setGoalState(state) {
        setStates(initialState, state);
    }

    function isGoal(state) {
        return stateKey(state) === stateKey(goalState);
    }

    function initialize() {
        renderAll();

        document
            .getElementById("generate-btn")
            ?.addEventListener("click", generateRandomPuzzle);

        document
            .getElementById("reset-btn")
            ?.addEventListener("click", reset);
    }

    return {
        initialize,
        stateKey,
        isValidState,
        isSolvable,
        getNeighbors,
        generateRandomPuzzle,
        reset,
        renderAll,
        setCurrentState,
        setInitialState,
        setGoalState,
        setStates,
        getInitialState: () => [...initialState],
        getGoalState: () => [...goalState],
        getCurrentState: () => [...currentState],
        isGoal
    };
})();

document.addEventListener("DOMContentLoaded", Puzzle.initialize);
