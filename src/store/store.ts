import { configureStore } from '@reduxjs/toolkit'
import booksReducer from '../features/booksSlice';


const store = configureStore({
    reducer: {booksState: booksReducer}
});

export type AppState = ReturnType<typeof store.getState>;

export default store;