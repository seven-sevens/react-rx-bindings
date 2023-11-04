import {configureStore, createSlice} from "@reduxjs/toolkit";

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

export const store = configureStore({
    reducer: {
        colorSlice: colorSlice.reducer
    },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootStore = typeof store;
export type RootStoreState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
