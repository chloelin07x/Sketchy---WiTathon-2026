import React from 'react'
import { useNavigate } from 'react-router-dom';
import './HomePage.css'

function Home() {
    const navigate = useNavigate();
    
    const handleStartGame = () => {
        navigate('/Draw');
    };

    const handleJoinGame = () => {
        alert("This feature will be added in the future.");
    }

    return (
        <div className = "home-page">
            <section className = "title-section">
                <span className = "title"> Sketchy </span>
            </section>
            <section className='logo'> 
                <i className="fa-solid fa-palette"></i>
            </section>
            <section className = "menu-section">
                <button className = "menu-buttons" onClick={handleStartGame}> Start game </button>
                <button className = "menu-buttons" onClick ={handleJoinGame}> Join game </button>
            </section>
        </div>
    )
    
}

export default Home