import React, {useState, useEffect} from 'react';
import {useLocation} from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import './Guess.css'; // Make sure to import your CSS
import Popup from './Popup.jsx'

const Guess = () => {
    const [time, setTime] = useState(60);
    const [guess, setGuess] = useState('');
    const [image, setImage] = useState(0);
    const [response, setResponse] = useState('');
    const [score, setScore] = useState(null);
    const navigate = useNavigate();
    const [buttonPopup, setButtonPopup] = useState(false);

    // for the image 
    const location = useLocation();
    const {url} = location.state || {}; // This will now be the dataURL with white background 
    const {word} = location.state || {}; 

    useEffect(() => {
        if (time > 0) {
            const timer = setTimeout(() => setTime(time - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            // Handle time running out ==> prompt a message with the score and redirect in the start panel
            navigate('/');
        }
    }, [time]);

    const enterGuess = (e) => {
        e.preventDefault();
        if(guess.toLowerCase() == word.toLowerCase()){
            setScore(time);
        } else {
            setScore(0);
        }
        setButtonPopup(true);
    }

    return (
        <div className="guess-container">
            {/* Header with title and timer */}
            <div className="header">
                    <span className="title">Guess The Drawing! </span>

                <section className="timer">
                    <p className={time < 10 ? 'low-time' : ''}>Timer: {time}s</p>
                </section>
            </div>
        
            {/* Image Display */}
            <div className="image-section">
              <img src={url} alt="Canvas Output" className="display-image" />
            </div>

            {/* Guess Input */}
            <div className="input-section">
                <form onSubmit={enterGuess} className="guess-form">
                    <input 
                        type="text" 
                        value={guess}
                        onChange={(e) => setGuess(e.target.value)}
                        placeholder="Enter your guess" 
                        className="guess-input"
                        autoFocus
                    />
                    <button type="submit" className="submit-button">Guess</button>
                    <Popup trigger = {buttonPopup}>
                        <h5> Score : {score} / 60 </h5>
                        <h5> Your guess : {guess} </h5>
                        <h5> Correct answer : {word} </h5>
                    </Popup>
                </form>
                {response && <p className="response-message">{response}</p>}
            </div>
        </div>
    );
};

export default Guess;