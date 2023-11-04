# react-rx-bindings

A small, reactive, MVVM library with no dependencies. Only peer dependencies are 

`react` +16.8.0 and 

`rxjs` +5.0.0

# Features

* Small and lightweight.
* Separates business logic from UI code using MVVM.
* Focus on managing individual components, not the entire application.
* UI can be derived from local state.
* Plays nice with `Redux` and other state management libraries.

# Installation

The easiest way to install is with npm.

`npm i react-rx-bindings`

The entire implementation is in `index.ts` so you can also just copy and paste the code into your project if you do not want
to use npm.

# Usage

If you have not used [RxJS](https://rxjs.dev/) before, it's probably a good idea to take a look at their 
[Getting Started](https://rxjs.dev/guide/overview) guide.

## First Example
### SayHello ViewModel

[SayHelloViewModel.ts](https://github.com/seven-sevens/react-rx-bindings/blob/main/example/src/components/say-hello/SayHelloViewModel.ts)
```
import {Bindable, ReactRxBindingViewModel} from "../../ReactRxBindings";
import {BehaviorSubject, Subscription} from "rxjs";

export class SayHelloViewModel extends ReactRxBindingViewModel<void> {
    @Bindable() name$ = new BehaviorSubject("");
    initialize(_: void): Subscription[] {
        return []; // no need for complicated subscriptions yet
    }

    cleanUp(): void {
    }
}
```
First thing to notice is the `@Bindable()` decorator.  This is used to mark a property as bindable, which means that
if the state of the variable is updated, it will trigger a UI refresh.  This is the key to simplifying managing
the UI via RxJS.

For now, we're just displaying the value, so we don't need to worry about subscriptions.  We'll get to that later.

All view models have to extend `ReactRxBindingViewModel` and implement the `initialize` and `cleanUp` methods.  If you
want to pass an initial state, you can use the generic `ReactRxBindingViewModel<YourInitTypeHere>`.  This will be passed
to `initialize`.

### SayHello View

[SayHelloView.tsx](https://github.com/seven-sevens/react-rx-bindings/blob/main/example/src/components/say-hello/SayHelloView.tsx)
```
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
```

The `useReactRxBindings` hook is the key to tying the view to the view model.  It takes two parameters, the first is
a function that returns a new instance of the view model, and the second is the initial state.  For now, we don't have
any initial state, so we pass `undefined`.

The `bindings` object returned from `useReactRxBindings` has a object `rx`.  All the bindings are stored in this object.
This is to make it easier to reference the bindings in the view.  You can reference the value by `{bindings.rx.name$.value}`.
You can update the value by calling `bindings.rx.name$.next(new_val)`.  Because `bindings.rx.name$` is a `@Bindable()`
variable, simply updating the value will cause the UI to refresh.

