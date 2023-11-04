import {distinctUntilChanged} from "rxjs/operators";
import {Subscription} from "rxjs";
import {useEffect, useState} from "react";

var classesWithReactive: {[key: string]: string []} = {};

type ReactRxBindingViewModelState<T extends ReactRxBindingViewModel> = {rx: T} | {[key: string]: any};
//type ReactRxBindingViewModelSetState<T extends ReactRxBindingViewModel> = Dispatch<SetStateAction<ReactRxBindingViewModelState<T>>>

function createReactState<T extends ReactRxBindingViewModel>(inst: T): ReactRxBindingViewModelState<T> {
    let firstTimeState = makeFirstTimeState(inst)
    return {...firstTimeState, rx: inst};
}

function makeFirstTimeState<T extends  ReactRxBindingViewModel>(inst: T): ReactRxBindingViewModelState<T> {
    let initialValues: {[key: string]: any} = {};
    (classesWithReactive[inst.constructor.name] ?? [])
        .forEach((propertyKey: string) => {
            let keyName = reformatPropertyKeyName(propertyKey);

            // @ts-ignore
            initialValues[keyName] = this[propertyKey].value;
        });
return initialValues;
}

function reformatPropertyKeyName(propertyKey: string): string {
    return propertyKey.endsWith("$") ? propertyKey.substring(0, propertyKey.length - 1) : propertyKey;
}


export function useReactRxBindings<T extends ReactRxBindingViewModel, P>(instClosure: () => T, props: P): ReactRxBindingViewModelState<T> {
    let inst = instClosure();
    let [state, setState] = useState(() => createReactState(inst));
    useEffect(() => {
        let subscriptions = (classesWithReactive[inst.constructor.name] ?? [])
            .map((propertyKey: string) => {
                // @ts-ignore
                return this[propertyKey].pipe(distinctUntilChanged()).subscribe((value: any) => {
                    let keyName = reformatPropertyKeyName(propertyKey);
                    let newHash: {[key: string]: any} = {};
                    newHash[keyName] = value;
                    setState({...state, newHash});
                });
            });
        subscriptions.push(...inst.subscriptions);
        return () => subscriptions.forEach((subscription: Subscription) => subscription.unsubscribe());
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
    subscriptions: Subscription [] = [];
}
