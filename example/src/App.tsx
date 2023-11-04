import React from 'react';
import './App.css';
import {useReactRxBindings} from "./ReactRxBindings" //from "react-rx-bindings";
import {AppViewModel} from "./AppViewModel";
import {configureStore, createSlice, PayloadAction} from '@reduxjs/toolkit'
import { Provider } from 'react-redux'

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

function App() {
    let bindings = useReactRxBindings(() => new AppViewModel(), store);

    return (
        <div className="App">
            <Provider store={store}>
                <header className="App-header">
                    <button onClick={() => bindings.rx.changeToOtherColor$.next()}>Change Color</button>
                    <br />
                    <textarea value={bindings.rx.firstName$.value} placeholder="First Name" onChange={(e) => bindings.rx.firstName$.next(e.target.value)} />
                    <br />
                    <textarea value={bindings.rx.lastName$.value} placeholder="Last Name" onChange={(e) => bindings.rx.lastName$.next(e.target.value)} />
                    <br />
                    <p style={{color: bindings.rx.messageColor$.value}}>
                        {bindings.rx.helloMessage$.value}
                    </p>
                </header>
            </Provider>
        </div>
    );
}

export default App;

/*
                <textarea value={bindings.rx.message$.value} onChange={(e) => bindings.rx.message$.next(e.target.value)} />
               <p color={bindings.rx.messageColor$.value}>
                    {bindings.rx.helloMessage$.value}
                </p>
 */
