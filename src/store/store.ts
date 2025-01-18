import { configureStore } from '@reduxjs/toolkit'
import booksReducer from '../features/booksSlice';


const store = configureStore({
    reducer: {booksState: booksReducer}
});

// Infer the type of `store`
export type AppStore = typeof store
// Infer the `AppDispatch` type from the store itself
export type AppDispatch = typeof store.dispatch
// Infer the `AppState` type
export type RootState = ReturnType<typeof store.getState>;

export default store;