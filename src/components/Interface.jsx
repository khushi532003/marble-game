import { useKeyboardControls } from '@react-three/drei';
import React, { useEffect, useRef } from 'react';
import useGame from '../stores/useGame';
import { addEffect } from '@react-three/fiber';

function Interface() {
    const forward = useKeyboardControls((state) => state.forward);
    const backward = useKeyboardControls((state) => state.backward);
    const leftward = useKeyboardControls((state) => state.leftward);
    const rightward = useKeyboardControls((state) => state.rightward);
    const jump = useKeyboardControls((state) => state.jump);

    const restart = useGame((state) => state.restart);
    const start = useGame((state) => state.start);
    const phase = useGame((state) => state.phase);
    const highscore = useGame((state) => state.highScore);
    const points = useGame((state) => state.points);

    console.log(phase);

    // const tforward = window.addEventListener('touchstart', {})


    const time = useRef();

    useEffect(() => {
        const unsubscribeEffect = addEffect(() => {
            const state = useGame.getState();

            let elapsedTime = 0;
            if (state.phase === 'playing') {
                elapsedTime = Date.now() - state.startTime;
            } else if (state.phase === 'ended' || state.phase === 'gameover') {
                elapsedTime = state.endTime - state.startTime;
            }

            elapsedTime /= 1000;
            elapsedTime = elapsedTime.toFixed(2);

            if (time.current) {
                time.current.textContent = elapsedTime;
            }
        });

        return () => {
            unsubscribeEffect();
        };
    }, []);

    return (
        <>
            <div className="interface">
                <div className="scoreboard flex items-center absolute top-0 left-0 w-full p-8 bg-blue-600">
                    {/* Score display */}
                    <div className="absolute left-[20px] text-yellow-400 text-2xl font-bold">
                        Score: {points}
                    </div>
                    {/* High Score display */}
                    <div className="absolute right-[20px] text-yellow-400 text-2xl font-bold">
                        High Score: {highscore}
                    </div>
                </div>
                {/* Timer */}
                <div ref={time} className="time w-[20%] sm:w-[10%]">0.00</div>

                {/* Start/Restart/Game Over Buttons */}
                {phase === 'ready' && (
                    <div className="restart" onClick={start}>
                        Start
                    </div>
                )}
                {phase === 'ended'  && (
                    <div className="restart" onClick={restart}>
                        Restart
                    </div>
                )}
                {phase === 'gameover' && (
                    <div
                        className="absolute game-over h-screen w-full flex justify-center items-center text-6xl text-red-800 text-center z-50 bg-black bg-opacity-50 cursor-pointer"
                        style={{ pointerEvents: 'auto' }}
                        onClick={() => {
                            restart();
                        }}
                    >
                        Game Over <br /> Play Again?
                    </div>
                )}

                {/* Controls (only show when playing) */}
                {phase === 'playing' && (
                    <div className="controls">
                        <div className="raw">
                            <div className={`key ${forward ? 'active' : ''} flex justify-center items-center text-white text-2xl`}>
                                <i className="ri-arrow-up-line"></i>
                            </div>
                        </div>
                        <div className="raw">
                            <div className={`key ${leftward ? 'active' : ''} flex justify-center items-center text-white text-2xl`}>
                                <i className="ri-arrow-left-line"></i>
                            </div>
                            <div className={`key ${backward ? 'active' : ''} flex justify-center items-center text-white text-2xl`}>
                                <i className="ri-arrow-down-line"></i>
                            </div>
                            <div className={`key ${rightward ? 'active' : ''} flex justify-center items-center text-white text-2xl`}>
                                <i className="ri-arrow-right-line"></i>
                            </div>
                        </div>
                        <div className="raw">
                            <div className={`key ${jump ? 'active' : ''} large flex justify-center items-center text-white text-2xl`}>
                                Space
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default Interface;