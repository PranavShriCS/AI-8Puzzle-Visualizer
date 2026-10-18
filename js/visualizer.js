
const Visualizer = (() => {
    let solver = null;
    let history = [];
    let historyIndex = -1;
    let timer = null;
    let startedAt = null;
    let elapsedMs = 0;
    let isPaused = true;
    let runFinished = false;

    const $ = id => document.getElementById(id);

    function formatState(state) {
        if (!state) return "None";
        return state.map(value => value === 0 ? "□" : value).join(" ");
    }

    function renderStateList(elementId, items, emptyMessage) {
        const container = $(elementId);
        if (!container) return;

        container.replaceChildren();

        if (!items || items.length === 0) {
            container.textContent = emptyMessage;
            return;
        }

        items.forEach((item, index) => {
            const entry = document.createElement("div");
            entry.className = "state-entry";

            const label = document.createElement("strong");
            label.textContent = `${index + 1}. `;

            const state = document.createElement("span");
            state.textContent = formatState(item.state);

            const depth = document.createElement("small");
            depth.textContent = `Depth: ${item.depth}`;

            entry.append(label, state, depth);
            container.appendChild(entry);
        });
    }

    function renderSolutionPath(path) {
        const container = $("solution-path");
        if (!container) return;

        container.replaceChildren();

        if (!path || path.length === 0) {
            container.textContent =
                "The solution path will appear here when found.";
            return;
        }

        path.forEach((state, index) => {
            const entry = document.createElement("div");
            entry.className = "solution-entry";

            const heading = document.createElement("strong");
            heading.textContent = index === 0
                ? "Initial State"
                : index === path.length - 1
                    ? "Goal State"
                    : `Move ${index}`;

            const board = document.createElement("div");
            board.className = "mini-board";

            state.forEach(value => {
                const tile = document.createElement("span");
                tile.className = value === 0
                    ? "mini-tile blank"
                    : "mini-tile";
                tile.textContent = value === 0 ? "" : value;
                board.appendChild(tile);
            });

            entry.append(heading, board);
            container.appendChild(entry);
        });
    }

    function updateStatistics(event) {
        $("generated-count").textContent = event.nodesGenerated;
        $("expanded-count").textContent = event.nodesExpanded;
        $("current-depth").textContent = event.depth;
        $("depth-limit").textContent = event.depthLimit;
        $("parent-state").textContent = formatState(event.parentState);
        $("path-cost").textContent = event.pathCost;
    }

    function getElapsedMs() {
        if (startedAt === null) return elapsedMs;
        if (runFinished || isPaused) return elapsedMs;
        return elapsedMs + performance.now() - startedAt;
    }

    function estimateMemoryBytes() {
        return history.reduce((total, event) => {
            const count =
                (event.frontier?.length || 0) +
                (event.explored?.length || 0) +
                (event.generatedSuccessors?.length || 0) +
                (event.solutionPath?.length || 0) + 1;

            return total + 9 * 8 * count;
        }, 0);
    }

    function updateSummary(event) {
        $("summary-generated").textContent = event.nodesGenerated;
        $("summary-expanded").textContent = event.nodesExpanded;
        $("summary-depth").textContent = event.maximumDepth;
        $("summary-iterations").textContent = event.iteration + 1;

        const hasSolution =
            event.solutionPath && event.solutionPath.length > 0;

        $("summary-moves").textContent = hasSolution
            ? event.solutionPath.length - 1
            : "—";

        $("summary-cost").textContent = hasSolution
            ? event.solutionPath.length - 1
            : "—";

        $("summary-time").textContent = `${getElapsedMs().toFixed(2)} ms`;

        const memoryBytes = estimateMemoryBytes();
        $("summary-memory").textContent = memoryBytes < 1024
            ? `${memoryBytes} bytes (estimate)`
            : `${(memoryBytes / 1024).toFixed(2)} KB (estimate)`;

        if (event.type === "solution") {
            $("summary-status").textContent =
                "Solution found! The goal state has been reached.";
        } else if (event.type === "failure") {
            $("summary-status").textContent =
                "Search ended without finding a solution.";
        } else {
            $("summary-status").textContent =
                "Search in progress. Use the controls to explore the steps.";
        }
    }

    function stopTimer() {
        if (timer !== null) {
            clearTimeout(timer);
            timer = null;
        }
    }

    function renderEvent(event) {
        if (!event) return;

        if (event.currentState) {
            Puzzle.setCurrentState(event.currentState);
        }

        updateStatistics(event);

        $("search-status").textContent =
            `Iteration ${event.iteration + 1}: ${event.status}`;

        renderStateList(
            "successors-list",
            (event.generatedSuccessors || []).map(state => ({
                state,
                depth: event.depth + 1
            })),
            "No successors generated in this step."
        );

        renderStateList(
            "frontier-list",
            event.frontier || [],
            "The frontier is empty."
        );

        renderStateList(
            "explored-list",
            event.explored || [],
            "No nodes explored in this iteration yet."
        );

        renderSolutionPath(event.solutionPath);
        updateSummary(event);
    }

    function initializeSolver() {
        const start = Puzzle.getInitialState();
        const goal = Puzzle.getGoalState();

        solver = Search.createSolver(start, goal);
        history = [];
        historyIndex = -1;
        elapsedMs = 0;
        startedAt = null;
        isPaused = true;
        runFinished = false;

        Puzzle.setCurrentState(start);

        $("summary-status").textContent = "Search initialized.";
        $("search-status").textContent =
            "Search initialized. Click Next Step or Run.";
        $("summary-time").textContent = "0.00 ms";
        $("summary-memory").textContent = "0 bytes (estimate)";
        $("summary-moves").textContent = "—";
        $("summary-cost").textContent = "—";

        renderStateList("successors-list", [], "No successors generated yet.");
        renderStateList("frontier-list", [], "The frontier is empty.");
        renderStateList("explored-list", [], "No nodes explored yet.");
        renderSolutionPath([]);

        $("generated-count").textContent = "1";
        $("expanded-count").textContent = "0";
        $("current-depth").textContent = "0";
        $("depth-limit").textContent = "0";
        $("parent-state").textContent = "None";
        $("path-cost").textContent = "0";
    }

    function executeNextStep() {
        if (!solver || runFinished) return;

        const event = solver.step();
        if (!event) return;

        history.push(event);
        historyIndex = history.length - 1;
        renderEvent(event);

        if (solver.isFinished()) {
            runFinished = true;
            isPaused = true;
            stopTimer();

            if (startedAt !== null) {
                elapsedMs += performance.now() - startedAt;
                startedAt = null;
            }

            updateSummary(event);
        }
    }

    function nextStep() {
        stopTimer();

        if (!solver) {
            try {
                initializeSolver();
            } catch (error) {
                $("search-status").textContent = error.message;
                $("summary-status").textContent = "Unable to start the search.";
                return;
            }
        }

        if (runFinished) return;

        if (historyIndex < history.length - 1) {
            historyIndex++;
            renderEvent(history[historyIndex]);
            return;
        }

        isPaused = true;

        if (startedAt !== null) {
            elapsedMs += performance.now() - startedAt;
            startedAt = null;
        }

        executeNextStep();
    }

    function previousStep() {
        if (!solver || historyIndex <= 0) return;

        pauseSearch();
        historyIndex--;
        renderEvent(history[historyIndex]);

        $("search-status").textContent =
            "Previous step displayed. Press Resume or Next Step to continue.";
    }

    function scheduleNextStep() {
        if (isPaused || runFinished || !solver) return;

        const speed = Number($("speed-control").value) || 500;

        timer = setTimeout(() => {
            timer = null;
            if (isPaused || runFinished) return;

            executeNextStep();

            if (!runFinished && !isPaused) {
                scheduleNextStep();
            }
        }, speed);
    }

    function startSearch() {
        stopTimer();

        try {
            initializeSolver();
            isPaused = false;
            startedAt = performance.now();

            executeNextStep();

            if (!runFinished) {
                scheduleNextStep();
            }
        } catch (error) {
            $("search-status").textContent = error.message;
            $("summary-status").textContent = "Unable to start the search.";
        }
    }

    function pauseSearch() {
        stopTimer();

        if (startedAt !== null) {
            elapsedMs += performance.now() - startedAt;
            startedAt = null;
        }

        isPaused = true;

        if (solver && !runFinished) {
            $("search-status").textContent += " Paused.";
            updateSummary(history[historyIndex] || {
                nodesGenerated: 1,
                nodesExpanded: 0,
                maximumDepth: 0,
                iteration: 0,
                solutionPath: []
            });
        }
    }

    function resumeSearch() {
        if (!solver || runFinished || !isPaused) return;

        isPaused = false;
        startedAt = performance.now();
        scheduleNextStep();
    }

    function resetSearch() {
        stopTimer();

        solver = null;
        history = [];
        historyIndex = -1;
        startedAt = null;
        elapsedMs = 0;
        isPaused = true;
        runFinished = false;

        Puzzle.reset();

        $("generated-count").textContent = "0";
        $("expanded-count").textContent = "0";
        $("current-depth").textContent = "0";
        $("depth-limit").textContent = "0";
        $("parent-state").textContent = "None";
        $("path-cost").textContent = "0";

        $("search-status").textContent = "Ready to begin.";
        $("summary-status").textContent = "The search has not started.";
        $("summary-moves").textContent = "—";
        $("summary-iterations").textContent = "0";
        $("summary-depth").textContent = "0";
        $("summary-generated").textContent = "0";
        $("summary-expanded").textContent = "0";
        $("summary-cost").textContent = "—";
        $("summary-time").textContent = "—";
        $("summary-memory").textContent = "—";

        renderStateList("successors-list", [], "No successors generated yet.");
        renderStateList("frontier-list", [], "The frontier is empty.");
        renderStateList("explored-list", [], "No nodes explored yet.");
        renderSolutionPath([]);
    }

    function initialize() {
        $("run-btn")?.addEventListener("click", startSearch);
        $("pause-btn")?.addEventListener("click", pauseSearch);
        $("resume-btn")?.addEventListener("click", resumeSearch);
        $("next-btn")?.addEventListener("click", nextStep);
        $("previous-btn")?.addEventListener("click", previousStep);
        $("reset-search-btn")?.addEventListener("click", resetSearch);

        $("generate-btn")?.addEventListener("click", resetSearch);
        $("reset-btn")?.addEventListener("click", resetSearch);
    }

    document.addEventListener("DOMContentLoaded", initialize);

    return {
        startSearch,
        pauseSearch,
        resumeSearch,
        nextStep,
        previousStep,
        resetSearch
    };
})();

window.Visualizer = Visualizer;
