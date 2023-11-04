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
