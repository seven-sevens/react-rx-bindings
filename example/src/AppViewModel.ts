import {Bindable, ReactRxBindingViewModel} from "./ReactRxBindings" //from "react-rx-bindings";
import {BehaviorSubject, combineLatest, distinctUntilChanged, filter, Subject, Subscription} from "rxjs";
import {Unsubscribe} from "redux";

export class AppViewModel extends ReactRxBindingViewModel<void> {
    initialize(_: void): Subscription[] {
        return [];
    }

    cleanUp(): void {
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
