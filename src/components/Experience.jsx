import Lights from './Lights';
import { Level } from './Level';
import { Physics } from '@react-three/rapier';
import Player from './Player';
import { Sky } from '@react-three/drei';
import useGame from '../stores/useGame';

function Experience() {
    const blocksCount = useGame((state) => state.blocksCount)
    const blocksSeed = useGame((state) => state.blocksSeed)

    return (
        <>
            {/* <color args={['#bdedfc']} attach='background' /> */}
            <Physics debug={false} >
                <Sky sunPosition={[-100, 70, 100]} />
                <Lights />
                <Level count={blocksCount} seed={blocksSeed} />
                <Player />
                {/* <Player3/> */}
            </Physics>
        </>
    )
}

export default Experience;