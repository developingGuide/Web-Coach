import './CloudLayer.css'


const CloudLayer = () => {
    
    return(
        <div className="cloud-layer">
        <img src="/cloud1.png" className="cloud cloud1" />
        <img src="/cloud2.png" className="cloud cloud2" />
        <img src="/cloud1.png" className="cloud cloud3" />
        <img src="/cloud1.png" className="cloud cloud4" />
        <img src="/cloud2.png" className="cloud cloud5" />
        {/* Add more clouds if needed */}
        </div>
    )
}

export default CloudLayer