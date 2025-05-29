import { useState, useEffect } from "react";
import './crow.css'

const Crow = () => {
    const [flapState, setFlapState] = useState('up');

    useEffect(() => {
      const interval = setInterval(() => {
        setFlapState((prev) => (prev === 'up' ? 'down' : 'up'));
      }, 300); // Adjust speed here
    
      return () => clearInterval(interval);
    }, []);

    return(
        <img
        src={flapState === 'up' ? '/crow-up.png' : '/crow-down.png'}
        className="flapping-crow"
        alt="Crow"
        />
    )
}

export default Crow