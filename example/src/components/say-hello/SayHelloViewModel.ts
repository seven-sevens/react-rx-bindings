import {Bindable, ReactRxBindingViewModel} from "../../ReactRxBindings";
import {BehaviorSubject, Subscription} from "rxjs";

export class SayHelloViewModel extends ReactRxBindingViewModel<void> {

    // adding @Bindable() will make the view redraw everytime the value changes
    @Bindable() name$ = new BehaviorSubject("");
    initialize(_: void): Subscription[] {
        return []; // no need for complicated subscriptions yet
    }

    cleanUp(): void {
    }
}
