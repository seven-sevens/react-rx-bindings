import {Bindable, ReactRxBindingViewModel} from "../../ReactRxBindings";
import {BehaviorSubject, Subscription} from "rxjs";
import "../../extensions/Subscription+storeIn";
import {validateEmail} from "./ValidateEmailFunction";

export class ValidateEmailViewModel extends ReactRxBindingViewModel<void> {
    @Bindable() email$ = new BehaviorSubject("");
    @Bindable() isValid$ = new BehaviorSubject(false);
    initialize(_: void): Subscription[] {
        // return the one subscription we made so we'll clean it up at unmount
        return [
            this.email$.subscribe(email => {
                this.isValid$.next(validateEmail(email));
            })
        ]
    }

    cleanUp(): void {
    }
}
