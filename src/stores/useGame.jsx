import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export default create(subscribeWithSelector((set) => {
    const savedHighScore = parseInt(localStorage.getItem("highScore") || "0", 10);

    return {
        blocksCount: 100,
        blocksSeed: 0,
        startTime: 0,
        endTime: 0,
        phase: "ready",
        points: 0,
        highScore: savedHighScore,
        resetTrigger: 0, // Add a trigger for resetting the player

        addPoint: () => set((state) => ({ points: state.points + 1 })),

        resetPoints: () => set(() => ({ points: 0 })),

        updateHighScore: () => {
            set((state) => {
                if (state.points > state.highScore) {
                    localStorage.setItem("highScore", state.points.toString());
                    return { highScore: state.points };
                }
                return {};
            });
        },

        start: () => {
            set((state) => {
                if (state.phase === "ready")
                    return {
                        phase: "playing",
                        startTime: Date.now(),
                        points: 0,
                    };
                return {};
            });
        },

        restart: () => {
            set((state) => {
                if (state.phase === "playing" || state.phase === "ended" || state.phase === "gameover")
                    return {
                        phase: "ready",
                        blocksSeed: Math.random(),
                        points: 0,
                        // resetTrigger: state.resetTrigger + 1, // Increment to trigger reset
                    };
                return {};
            });
        },

        end: () => {
            set((state) => {
                if (state.phase === "playing") {
                    if (state.points > state.highScore) {
                        localStorage.setItem("highScore", state.points.toString());
                        return {
                            phase: "ended",
                            endTime: Date.now(),
                            highScore: state.points,
                        };
                    }
                    return {
                        phase: "ended",
                        endTime: Date.now(),
                    };
                }
                return {};
            });
        },

        gameover: () => {
            set((state) => {
                if (state.phase === "playing") {
                    if (state.points > state.highScore) {
                        localStorage.setItem("highScore", state.points.toString());
                        return {
                            phase: "gameover",
                            endTime: Date.now(),
                            highScore: state.points,
                        };
                    }
                    return {
                        phase: "gameover",
                        endTime: Date.now(),
                    };
                }
                return {};
            });
        },
    };
}));