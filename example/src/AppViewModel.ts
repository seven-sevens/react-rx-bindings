import {Bindable, ReactRxBindingViewModel} from "./ReactRxBindings" //from "react-rx-bindings";
import {BehaviorSubject, combineLatest, distinctUntilChanged, filter, Subject, Subscription} from "rxjs";
import {RootStore, changeColor} from "./App";
import {Unsubscribe} from "redux";

export class AppViewModel extends ReactRxBindingViewModel<RootStore> {
    @Bindable() firstName$ = new BehaviorSubject("");
    @Bindable() lastName$ = new BehaviorSubject("");

    @Bindable() helloMessage$ = new BehaviorSubject("");
    @Bindable() messageColor$ = new BehaviorSubject("");

    // You don't need bindable here, but it's here to document that it's used in the view
    @Bindable() changeToOtherColor$ = new Subject<void>();

    reduxSubscription: Unsubscribe | undefined;
    initialize(store: RootStore): Subscription[] {
        let subscriptions: Subscription[] = []; // first create a variable to store all subscriptions in

        // simple example of updating a bindable from redux, we have to save the subscription so that we can unsubscribe from it later
        // in cleanup
        this.reduxSubscription = store.subscribe(() => {
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
        this.reduxSubscription?.(); // unsubscribe from redux
    }
}

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
