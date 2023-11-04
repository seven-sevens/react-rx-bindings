import React from 'react';
import './App.css';
import {useReactRxBindings} from "./ReactRxBindings" //from "react-rx-bindings";
import {AppViewModel} from "./AppViewModel";
import SayHelloView from "./components/say-hello/SayHelloView";
import WithReduxView from "./components/with-redux/WithReduxView";
import ValidateEmailView from "./components/validate-email/ValidateEmailView";

export default function App() {
    let bindings = useReactRxBindings(() => new AppViewModel(), undefined);

    return (
        <div className="App">
            <header className="App-header">
                <h1>Say Hello</h1>
                <SayHelloView />

                <h1>Validate Email</h1>
                <ValidateEmailView />

                <h1>With Redux</h1>
                <WithReduxView />
            </header>
        </div>
    );
}

