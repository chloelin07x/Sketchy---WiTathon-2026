import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import Home from "./HomePage";
import Draw from "./DrawingPage";
import Guess from "./Guess";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route exact path = "/" element = {<Home/>}/>
          <Route exact path = "/Draw" element = {<Draw/>}/>
          <Route exact path = "/Guess" element = {<Guess/>}/>
        </Routes>
      </Router>
    </>
  )
}

export default App
