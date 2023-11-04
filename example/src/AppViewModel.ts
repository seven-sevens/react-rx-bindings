import {Bindable, ReactRxBindingViewModel} from "./ReactRxBindings" //from "react-rx-bindings";
import {BehaviorSubject, combineLatest, distinctUntilChanged, filter, Subject, Subscription} from "rxjs";

export class AppViewModel extends ReactRxBindingViewModel {
    @Bindable() firstName$ = new BehaviorSubject("");
    @Bindable() lastName$ = new BehaviorSubject("");

    @Bindable() helloMessage$ = new BehaviorSubject("");
    @Bindable() messageColor$ = new BehaviorSubject("");

    // You don't need bindable here, but it's here to document that it's used in the view
    @Bindable() changeToOtherColor$ = new Subject<void>();

    constructor(props: { color1: string, color2: string }) {
        super();
        this.messageColor$.next(props.color1);

        combineLatest([this.firstName$, this.lastName$])
            .pipe(distinctUntilChanged())
            .subscribe(([firstName, lastName]) => {
                this.helloMessage$.next(`Hello ${firstName} ${lastName}!`);
            })

        this.changeToOtherColor$
            .subscribe(() => {
                this.messageColor$.next(this.messageColor$.value === props.color1 ? props.color2 : props.color1);
            })
    }
}
