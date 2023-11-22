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
