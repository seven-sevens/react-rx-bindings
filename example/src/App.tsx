import React from 'react';
import './App.css';
import {useReactRxBindings} from "react-rx-bindings";
import {AppViewModel} from "./AppViewModel";

function App() {
    let bindings = useReactRxBindings(() => new AppViewModel(), {
        color1: "#00FFFF",
        color2: "#FF0000"
    });

    return (
        <div className="App">
            <header className="App-header">
                <button onClick={() => bindings.rx.changeToOtherColor$.next()}>Change Color</button>
                <br />
                <textarea value={bindings.rx.firstName$.value} placeholder="First Name" onChange={(e) => bindings.rx.firstName$.next(e.target.value)} />
                <br />
                <textarea value={bindings.rx.lastName$.value} placeholder="Last Name" onChange={(e) => bindings.rx.lastName$.next(e.target.value)} />
                <br />
                <p style={{color: bindings.rx.messageColor$.value}}>
                    {bindings.rx.helloMessage$.value}
                </p>
            </header>
        </div>
    );
}

export default App;

/*
                <textarea value={bindings.rx.message$.value} onChange={(e) => bindings.rx.message$.next(e.target.value)} />
               <p color={bindings.rx.messageColor$.value}>
                    {bindings.rx.helloMessage$.value}
                </p>
 */
