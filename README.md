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

# A word about RxJS

If you have not used [RxJS](https://rxjs.dev/) before, it's probably a good idea to take a look at their 
[Getting Started](https://rxjs.dev/guide/overview) guide.

# Usage

Look in the examples folder for a full, running react app.

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
First thing to notice is the `@Bindable()` decorator.  This is used to mark a RxJS Subject as bindable, which means that
if the state of the Subject is updated, it will trigger a UI refresh.  This is the key to simplifying managing
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

## A Second example, with subscriptions

The first example was extremely simple.  Let's look at a more complicated example.
like validating an email

### ValidateEmail ViewModel

[ValidateEmailViewModel.ts](https://github.com/seven-sevens/react-rx-bindings/blob/main/example/src/components/validate-email/ValidateEmailViewModel.ts)
```
import {Bindable, ReactRxBindingViewModel} from "../../ReactRxBindings";
import {BehaviorSubject, Subscription} from "rxjs";
import {validateEmail} from "./ValidateEmailFunction";

export class ValidateEmailViewModel extends ReactRxBindingViewModel<void> {
    @Bindable() email$ = new BehaviorSubject("");
    @Bindable() isValid$ = new BehaviorSubject(false);
    initialize(_: void): Subscription[] {
        let subscriptions: Subscription[] = [];

        this.email$.subscribe(email => {
            this.isValid$.next(validateEmail(email));
        })
        .storeIn(subscriptions);

        return subscriptions;
    }

    cleanUp(): void {
    }
}
```

The big addition here is `.subscribe`.  Importantly, notice that we're returning the subscription, which tells
`ReactRxBindingViewModel` to clean it up when the component unmounts.  This is important to prevent memory leaks.

***Always return subscriptions from `initialize` if you don't do this, it'll cause a memory leak.***

Also notice that we're using `.storeIn(subscriptions)`.  This is a convenience method that will add the subscription
to an array.  It makes it cleaner to return the subscriptions from `initialize`.

`.subscribe` runs every time the value of `email$` changes.  Here it updates `isValid$`, which is a `@Bindable()`
so the UI will update.

### ValidateEmail View

[ValidateEmailView.tsx](https://github.com/seven-sevens/react-rx-bindings/blob/main/example/src/components/validate-email/ValidateEmailView.tsx)

```
import {useReactRxBindings} from "../../ReactRxBindings";
import React from "react";
import {ValidateEmailViewModel} from "./ValidateEmailViewModel";

export default function ValidateEmailView() {
    let bindings = useReactRxBindings(() => new ValidateEmailViewModel(), undefined);

    return (
        <div>
            <input type="text"
                   placeholder="Email"
                   value={bindings.rx.email$.value} 
                   onChange={(e) => bindings.rx.email$.next(e.target.value)} />
            <br />
            <p>Email is {bindings.rx.isValid$.value ? "valid" : "invalid"}</p>
        </div>
    );
}
```

More of the same here.  Notice we're able to update `email$` and `isValid$` and have the view update automatically.

## Side-quest, making it easier to store subscriptions

Before going through the Redux example, let's take a quick detour to look at storeIn.

This adds a function to an internal object, which can change between versions.  VSCode does not seem to like 
auto-complete on this, but it does work.

[Subscription+storeIn.ts](https://github.com/seven-sevens/react-rx-bindings/blob/main/example/src/extensions/Subscription%2BstoreIn.ts)
```
import {Subscription} from "rxjs";

// this adds a convenience method to the subscription class to make it easier to store subscriptions in an array
// @ts-ignore
declare module "rxjs/internal/Subscription" {
    interface Subscription {
        storeIn(store: Subscription []): void;
    }
}

Subscription.prototype.storeIn = function(store: Subscription []) {
    store.push(this);
}
```

What this does is allow you to call `.storeIn` on a subscription, and it will automatically add it to an array.

For example
```
let subscriptions: Subscription[] = []; // make a single array to store subscriptions in

this.email$.subscribe(email => {
    this.isValid$.next(validateEmail(email));
})
.storeIn(subscriptions); // <-- Use this to store the subscription.  This saves nesting and makes the code cleaner.

return subscriptions;
```

It's not very noticeable yet because we only have one subscription, but when you've got several, and some pipelines
going, it makes it much easier to read, and easy to go through and make sure you've saved each subscription.

## Redux Example

It's React, you've probably heard of Redux.  You can use Redux to manage state along with MVVM and `react-rx-bindings`.
My way of doing it is to make a shadow `@Bindable()` variable for each Redux variable.  This way, it's possible
to simulate the Redux state changes in tests.

I've pulled out the Redux code into it's own file [WithReduxStore.ts](https://github.com/seven-sevens/react-rx-bindings/blob/main/example/src/components/with-redux/WithReduxStore.ts)

[WithReduxViewModel.ts](https://github.com/seven-sevens/react-rx-bindings/blob/main/example/src/components/with-redux/WithReduxViewModel.ts)
```
import {Bindable, ReactRxBindingViewModel} from "../../ReactRxBindings";
import {changeColor, RootStore} from "./WithReduxStore";
import {BehaviorSubject, combineLatest, distinctUntilChanged, Subject, Subscription} from "rxjs";
import {Unsubscribe} from "redux";
import "../../extensions/Subscription+storeIn";

export class WithReduxViewModel extends ReactRxBindingViewModel<RootStore> {
    @Bindable() firstName$ = new BehaviorSubject("");
    @Bindable() lastName$ = new BehaviorSubject("");

    @Bindable() helloMessage$ = new BehaviorSubject("");
    @Bindable() messageColor$ = new BehaviorSubject("");

    // You don't need bindable here, but it's here to document that it's used in the view
    @Bindable() changeToOtherColor$ = new Subject<void>();

    reduxUnsubscribe: Unsubscribe | undefined;
    initialize(store: RootStore): Subscription[] {
        let subscriptions: Subscription[] = []; // first create a variable to store all subscriptions in

        // simple example of updating a bindable from redux, we have to save the redux subscription so that we can unsubscribe from it later
        // in cleanup
        this.reduxUnsubscribe = store.subscribe(() => {
            this.messageColor$.next(store.getState().colorSlice.color);
        })

        // here's how to process bindables using rxjs end to end
        combineLatest([this.firstName$, this.lastName$])
            .pipe(distinctUntilChanged())
            .subscribe(([firstName, lastName]) => {
                this.helloMessage$.next(`Hello ${firstName} ${lastName}!`);
            })
            .storeIn(subscriptions); // remember to add the subscription to the list.  If we don't do this it won't be unsubscribed when the component is unmounted
            // You can also store this individually and return it in the list of subscriptions at the bottom of this function (see the bottom of this function)

        // here's an example of calling a redux action from a bindable
        this.changeToOtherColor$
            .subscribe(() => {
                store.dispatch(changeColor());
            })
            .storeIn(subscriptions); // remember to add the subscription to the list.  If we don't do this it won't be unsubscribed when the component is unmounted
            // You can also store this individually and return it in the list of subscriptions at the bottom of this function (see the bottom of this function)

        return subscriptions; // return the list of subscriptions so that they can be unsubscribed when the component is unmounted
    }

    cleanUp(): void {
        this.reduxUnsubscribe?.(); // unsubscribe from redux
    }
}
```

Notice we've passed the store type to `ReactRxBindingViewModel`.  This means that `initialize` will expect to be passed
the store.  We also have to add a variable to store the redux subscription so that we can unsubscribe from it in `cleanUp`.
We have to manage redux manually because it's not part of RxJS.

Once we subscribe, we can use `.next` to update any bindable we want.  From there, it works just like the other examples,
any update causes the view to update.

You can also dispatch actions from inside of an RxJS `.subscribe`.

[WithReduxView.tsx](https://github.com/seven-sevens/react-rx-bindings/blob/main/example/src/components/with-redux/WithReduxView.tsx)
```
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
```

Big change here is we're finally using `useReactRxBindings` init state to pass the store to the bindings.
