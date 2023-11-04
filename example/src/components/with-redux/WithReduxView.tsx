import React from "react";
import {useReactRxBindings} from "../../ReactRxBindings" //from "react-rx-bindings";
import {WithReduxViewModel} from "./WithReduxViewModel";
import {store} from "./WithReduxStore";

export default function WithReduxView() {
    // we're passing the redux store to the bindings
    let bindings = useReactRxBindings(() => new WithReduxViewModel(), store);

    return (
        <div>
            <button onClick={() => bindings.rx.changeToOtherColor$.next()}>Change Color</button>
            <br />
            <input type="text" value={bindings.rx.firstName$.value} placeholder="First Name" onChange={(e) => bindings.rx.firstName$.next(e.target.value)} />
            <br />
            <input type="text" value={bindings.rx.lastName$.value} placeholder="Last Name" onChange={(e) => bindings.rx.lastName$.next(e.target.value)} />
            <br />
            <p style={{color: bindings.rx.messageColor$.value}}>
                {bindings.rx.helloMessage$.value}
            </p>
        </div>
    );
}
