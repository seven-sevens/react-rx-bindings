import {distinctUntilChanged} from "rxjs/operators";
import {Subscription} from "rxjs";
import {Dispatch, SetStateAction, useEffect, useState} from "react";

var classesWithReactive: {[key: string]: string []} = {};

export type ReactRxBindingViewModelState<T extends ReactRxBindingViewModel> = {rx: T} | {[key: string]: any};
export type ReactRxBindingViewModelSetState<T extends ReactRxBindingViewModel> = Dispatch<SetStateAction<ReactRxBindingViewModelState<T>>>

declare module "rxjs/internal/Subscription" {
    interface Subscription {
        storeIn(store: Subscription []): void;
    }
}

Subscription.prototype.storeIn = function(store: Subscription []) {
    store.push(this);
}

export function useReactRxBindings<T extends ReactRxBindingViewModel, P>(instClosure: () => T, props: P): ReactRxBindingViewModelState<T> {
    let [state, setState] = useState(() => ReactRxBindingViewModel.CreateReactState(instClosure()));
    useEffect(() => {
        const subscriptions = state.rx.initialize(state, setState, props,[]);
        return () => subscriptions.forEach((subscription: Subscription) => subscription.unsubscribe());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return state;
}


export function Bindable(): any {
    return function (target: Object, propertyKey: string) {
        let className = target.constructor.name;
        if(classesWithReactive[className] === undefined) {
            classesWithReactive[target.constructor.name] = [propertyKey];
        } else {
            classesWithReactive[className].push(propertyKey);
        }
    };
}

export class ReactRxBindingViewModel {
    initialize<U extends ReactRxBindingViewModel>(state: ReactRxBindingViewModelState<U>,
                                                  setState: ReactRxBindingViewModelSetState<U>,
                                                  props: any,
                                                  subscriptions: Subscription []): Subscription [] {
        let bindingSubscriptions = (classesWithReactive[this.constructor.name] ?? [])
            .map((propertyKey: string) => {
                // @ts-ignore
                return this[propertyKey].pipe(distinctUntilChanged()).subscribe((value: any) => {
                    let keyName = this.reformatPropertyKeyName(propertyKey);
                    let newHash: {[key: string]: any} = {};
                    newHash[keyName] = value;
                    setState({...state, newHash});
                });
            });

        return [...subscriptions, ...bindingSubscriptions];
    }

    static CreateReactState<T extends ReactRxBindingViewModel>(inst: T): ReactRxBindingViewModelState<T> {
        let firstTimeState = inst.makeFirstTimeState()
        return {...firstTimeState, rx: inst};
    }

    private makeFirstTimeState<T extends  ReactRxBindingViewModel>(): ReactRxBindingViewModelState<T> {
        let initialValues: {[key: string]: any} = {};
        (classesWithReactive[this.constructor.name] ?? [])
            .forEach((propertyKey: string) => {
                let keyName = this.reformatPropertyKeyName(propertyKey);

                // @ts-ignore
                initialValues[keyName] = this[propertyKey].value;
            });
        return initialValues;
    }

    private reformatPropertyKeyName(propertyKey: string): string {
        return propertyKey.endsWith("$") ? propertyKey.substring(0, propertyKey.length - 1) : propertyKey;
    }
}
