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
