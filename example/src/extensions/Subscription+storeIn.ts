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
