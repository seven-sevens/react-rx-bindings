import {Bindable, ReactRxBindingViewModel} from "./ReactRxBindings" //from "react-rx-bindings";
import {BehaviorSubject, combineLatest, distinctUntilChanged, filter, Subject, Subscription} from "rxjs";

type ReactRxBindingViewModelProps = {
    color1: string;
    color2: string;
}
export class AppViewModel extends ReactRxBindingViewModel<ReactRxBindingViewModelProps> {
    @Bindable() firstName$ = new BehaviorSubject("");
    @Bindable() lastName$ = new BehaviorSubject("");

    @Bindable() helloMessage$ = new BehaviorSubject("");
    @Bindable() messageColor$ = new BehaviorSubject("");

    // You don't need bindable here, but it's here to document that it's used in the view
    @Bindable() changeToOtherColor$ = new Subject<void>();

    initialize(props: ReactRxBindingViewModelProps): Subscription[] {
        let subscriptions: Subscription[] = []; // first create a variable to store all subscriptions in
        this.messageColor$.next(props.color1);

        combineLatest([this.firstName$, this.lastName$])
            .pipe(distinctUntilChanged())
            .subscribe(([firstName, lastName]) => {
                this.helloMessage$.next(`Hello ${firstName} ${lastName}!`);
            })
            .storeIn(subscriptions); // remember to add the subscription to the list.  If we don't do this it won't be unsubscribed when the component is unmounted

        this.changeToOtherColor$
            .subscribe(() => {
                this.messageColor$.next(this.messageColor$.value === props.color1 ? props.color2 : props.color1);
            })
            .storeIn(subscriptions); // remember to add the subscription to the list.  If we don't do this it won't be unsubscribed when the component is unmounted

        return subscriptions;
    }
}
