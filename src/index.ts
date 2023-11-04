import {distinctUntilChanged} from "rxjs/operators";
import {Subscription} from "rxjs";
import {useEffect, useState} from "react";

var classesWithReactive: {[key: string]: string []} = {};

type ReactRxBindingViewModelState<P, T extends ReactRxBindingViewModel<P>> = {rx: T} | {[key: string]: any};

// ick - I'm extending the internal subscriber interface to add a storeIn method.  I'm doing this because to prevent
// memory leaks we have to store each subscriber in a list and then unsubscribe from each one when the component is
// unmounted.  I could make the user do this my making a list at the top then typing
//
// subscription.push(this.myRx$.
//  .pipe(...)
//  .subscribe(...));
//
// but that's an extra level of nesting, which makes it harder to find bugs.  So instead I'm adding a storeIn method
// so now you can do
//
// this.myRx$
//  .pipe(...)
//  .subscribe(...)
//  .storeIn(subscriptions);
//
// It may not seem like a big deal, but it cleans up the code quite a bit.
//
// @ts-ignore
declare module "rxjs/internal/Subscription" {
    interface Subscription {
        storeIn(store: Subscription []): void;
    }
}

Subscription.prototype.storeIn = function(store: Subscription []) {
    store.push(this);
}

function createReactState<P, T extends ReactRxBindingViewModel<P>>(inst: T): ReactRxBindingViewModelState<P, T> {
    let firstTimeState = makeFirstTimeState(inst)
    return {...firstTimeState, rx: inst};
}

function makeFirstTimeState<P, T extends  ReactRxBindingViewModel<P>>(inst: T): ReactRxBindingViewModelState<P, T> {
    let initialValues: {[key: string]: any} = {};
    (classesWithReactive[inst.constructor.name] ?? [])
        .forEach((propertyKey: string) => {
            let keyName = reformatPropertyKeyName(propertyKey);

            // @ts-ignore
            initialValues[keyName] = inst[propertyKey].value;
        });
return initialValues;
}

function reformatPropertyKeyName(propertyKey: string): string {
    return propertyKey.endsWith("$") ? propertyKey.substring(0, propertyKey.length - 1) : propertyKey;
}

export function useReactRxBindings<P, T extends ReactRxBindingViewModel<P>>(instClosure: () => T, props: P): ReactRxBindingViewModelState<P, T> {
    let [state, setState] = useState(() => createReactState(instClosure()));
    useEffect(() => {
        // @ts-ignore
        let subscriptions = [...(classesWithReactive[state.rx.constructor.name] ?? [])
            // @ts-ignore
            .map((propertyKey: string) => state.rx[propertyKey].pipe(distinctUntilChanged()).subscribe((value: any) => {
                    let keyName = reformatPropertyKeyName(propertyKey);
                    let newHash: {[key: string]: any} = {};
                    newHash[keyName] = value;
                    setState({...state, newHash});
                })),
            ...state.rx.initialize(props)];

        return () => {
            subscriptions.forEach((subscription: Subscription) => subscription.unsubscribe());
        }
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

export abstract class ReactRxBindingViewModel<T> {
    abstract initialize(props: T): Subscription[];
}
