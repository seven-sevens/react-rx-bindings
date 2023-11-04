import {Bindable, ReactRxBindingViewModel} from "../../ReactRxBindings";
import {BehaviorSubject, Subscription} from "rxjs";
import "../../extensions/Subscription+storeIn";

export class ValidateEmailViewModel extends ReactRxBindingViewModel<void> {
    @Bindable() email$ = new BehaviorSubject("");
    @Bindable() isValid$ = new BehaviorSubject(false);
    initialize(_: void): Subscription[] {
        let subscriptions: Subscription[] = [];

        this.email$
            .subscribe(email => {
                this.isValid$.next(this.validateEmail(email));
            })
            .storeIn(subscriptions); // check out the extension method in extensions/Subscription+storeIn.ts
            // if you don't use storeIn, be sure to keep a running list of subscriptions and return them at the bottom of this function
        return subscriptions;
    }

    validateEmail(email: string): boolean {
        let regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return regex.test(email.toLowerCase());
    }

    cleanUp(): void {
    }
}
