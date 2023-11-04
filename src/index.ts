import {distinctUntilChanged} from "rxjs/operators";
import {Subscription} from "rxjs";
import {useEffect, useState} from "react";

var classesWithReactive: {[key: string]: string []} = {};

type ReactRxBindingViewModelState<T> = {rx: T} | {[key: string]: any};

function createReactState<P, T extends ReactRxBindingViewModel<P>>(inst: T): ReactRxBindingViewModelState<T> {
    let initialValues: {[key: string]: any} = {};
    (classesWithReactive[inst.constructor.name] ?? [])
        .forEach((propertyKey: string) => {
            let keyName = reformatPropertyKeyName(propertyKey);

            // @ts-ignore
            initialValues[keyName] = inst[propertyKey].value;
        });

    return {...initialValues, rx: inst};
}

function reformatPropertyKeyName(propertyKey: string): string {
    return propertyKey.endsWith("$") ? propertyKey.substring(0, propertyKey.length - 1) : propertyKey;
}

export function useReactRxBindings<P, T extends ReactRxBindingViewModel<P>>(instClosure: () => T, props: P): ReactRxBindingViewModelState<T> {
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
            ...state.rx.initialize(props)
        ];

        return () => {
            subscriptions.forEach((subscription: Subscription) => subscription.unsubscribe());
            state.rx.cleanUp();
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

export abstract class ReactRxBindingViewModel<P> {
    abstract initialize(props: P): Subscription[];
    abstract cleanUp(): void;
}
