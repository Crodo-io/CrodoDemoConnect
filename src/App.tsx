import React from 'react';
import './assets/css/bootstrap.min.css';
import './App.css';
import './assets/css/index.css';
import {ConnectPanel} from "./components/Connect/ConnectPanel";
import {ConnectWindow} from "./components/Connect/ConnectWindow";

function App() {
    return (
        <div className="App">
            <ConnectPanel/>
            <ConnectWindow/>
        </div>
    );
}

export default App;
