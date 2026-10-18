
document.addEventListener("DOMContentLoaded", () => {
    const initialInput = document.getElementById("initial-input");
    const goalInput = document.getElementById("goal-input");
    const applyButton = document.getElementById("apply-states-btn");
    const generateButton = document.getElementById("generate-btn");
    const resetButton = document.getElementById("reset-btn");
    const message = document.getElementById("custom-state-message");

    const DEFAULT_INITIAL = [2, 8, 3, 1, 6, 4, 7, 0, 5];
    const DEFAULT_GOAL = [1, 2, 3, 8, 0, 4, 7, 6, 5];

    function parseState(value) {
        const parts = value.trim().split(/[\s,]+/);

        if (
            parts.length !== 9 ||
            parts.some(part => !/^[0-8]$/.test(part))
        ) {
            throw new Error(
                "Enter exactly nine numbers from 0 to 8, separated by commas or spaces."
            );
        }

        const state = parts.map(Number);

        if (!Puzzle.isValidState(state)) {
            throw new Error("Use each number from 0 to 8 exactly once.");
        }

        return state;
    }

    function showMessage(text, isError = false) {
        message.textContent = text;
        message.className = isError
            ? "mt-3 mb-0 text-danger"
            : "mt-3 mb-0 text-success";
    }

    function syncInputsWithPuzzle() {
        initialInput.value = Puzzle.getInitialState().join(",");
        goalInput.value = Puzzle.getGoalState().join(",");
    }

    function resetToDefaults() {
        Puzzle.setStates([...DEFAULT_INITIAL], [...DEFAULT_GOAL]);

        if (window.Visualizer) {
            window.Visualizer.resetSearch();
        }

        syncInputsWithPuzzle();
        showMessage("Default initial and goal states restored.");
    }

    applyButton.addEventListener("click", () => {
        try {
            const initial = parseState(initialInput.value);
            const goal = parseState(goalInput.value);

            Puzzle.setStates(initial, goal);

            if (window.Visualizer) {
                window.Visualizer.resetSearch();
            }

            syncInputsWithPuzzle();
            showMessage("Custom initial and goal states applied successfully.");
        } catch (error) {
            showMessage(error.message, true);
        }
    });

    generateButton.addEventListener("click", () => {
        syncInputsWithPuzzle();
        showMessage("Random puzzle generated. The initial-state input is updated.");
    });

    resetButton.addEventListener("click", resetToDefaults);

    syncInputsWithPuzzle();
});
