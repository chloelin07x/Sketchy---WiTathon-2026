import React from 'react'
import { useNavigate } from 'react-router-dom';
import './Popup.css'

function Popup(props) {

    const navigate = useNavigate();
    const handleClose = (() => {
    navigate('/');
    }); 
    return(props.trigger) ? (
        <div className = "popup">
        <div className = "popup-inner">
            {props.children}
            <button className = "close-bnt" onClick = {handleClose}> Close </button>
        </div>
        </div>
    ) : "";
}

export default Popup