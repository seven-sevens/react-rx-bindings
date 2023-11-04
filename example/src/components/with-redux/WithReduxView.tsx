import React from "react";
import {useReactRxBindings} from "../../ReactRxBindings" //from "react-rx-bindings";
import {configureStore, createSlice, PayloadAction} from '@reduxjs/toolkit'
import {WithReduxViewModel} from "./WithReduxViewModel";

export interface ColorState {
    color: string;
}

const initialState: ColorState = {
    color: "#00FFFF",
}
export const colorSlice = createSlice({
    name: 'colorSlice',
    initialState,
    reducers: {
        changeColor: (state) => {
            let color1 = "#00FFFF";
            let color2 = "#FF0000";
            if(state.color === color1) {
                state.color = color2;
            } else {
                state.color = color1;
            }
        }
    },
})

export const { changeColor } = colorSlice.actions

const store = configureStore({
    reducer: {
        colorSlice: colorSlice.reducer
    },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootStore = typeof store;
export type RootStoreState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch

export default function WithReduxView() {
    let bindings = useReactRxBindings(() => new WithReduxViewModel(), store);

    return (
        <div>
            <button onClick={() => bindings.rx.changeToOtherColor$.next()}>Change Color</button>
            <br />
            <input type="text" value={bindings.rx.firstName$.value} placeholder="First Name" onChange={(e) => bindings.rx.firstName$.next(e.target.value)} />
            <br />
            <input type="text" value={bindings.rx.lastName$.value} placeholder="Last Name" onChange={(e) => bindings.rx.lastName$.next(e.target.value)} />
            <br />
            <p style={{color: bindings.rx.messageColor$.value}}>
                {bindings.rx.helloMessage$.value}
            </p>
        </div>
    );
}
