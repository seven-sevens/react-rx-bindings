import {useReactRxBindings} from "../../ReactRxBindings";
import {AppViewModel} from "../../AppViewModel";
import {Provider} from "react-redux";
import React from "react";
import {SayHelloViewModel} from "./SayHelloViewModel";

export default function SayHelloView() {
    let bindings = useReactRxBindings(() => new SayHelloViewModel(), undefined);

    return (
        <div>
            <input type="text" value={bindings.rx.name$.value} placeholder="Name" onChange={(e) => bindings.rx.name$.next(e.target.value)} />
            <br />
            Hello {bindings.rx.name$.value}
        </div>
    );
}
