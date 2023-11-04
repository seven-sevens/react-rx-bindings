import {useReactRxBindings} from "../../ReactRxBindings";
import React from "react";
import {SayHelloViewModel} from "./SayHelloViewModel";

export default function SayHelloView() {
    // This is all it takes to tie the view to the view model.
    let bindings = useReactRxBindings(() => new SayHelloViewModel(), // Create the view model
                                                                undefined); // for now, we don't have any init so pass undefined

    return (
        <div>
            <input type="text"
                   placeholder="Name"
                   value={bindings.rx.name$.value /* reference everything from the binding.rx object - get at the current state using .value */}
                   onChange={(e) => bindings.rx.name$.next(e.target.value) /* and update the value by calling .next(new_val) */}
            />
            <br />
            Hello {bindings.rx.name$.value}
        </div>
    );
}
