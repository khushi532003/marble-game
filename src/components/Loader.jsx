import { useEffect } from 'react'
import { Html, useProgress } from '@react-three/drei'

const Loader = ({ onLoaded }) => {

    const { loaded, total } = useProgress()

    useEffect(() => {
        if (loaded === total && total > 0) {
            onLoaded()
        }
    }, [loaded, total, onLoaded])

    return (
        <>
            <Html fullScreen>
                <div className="loader fixed top-0 left-0">
                    <img src="/loaderball.gif" alt="Loader Ball" />
                </div>
            </Html>
        </> 
    )
}

export default Loader;