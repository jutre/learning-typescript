import  {Book}  from "../types/Book";
import { AppState } from "../store/store";

function getAllBooks(state: AppState): Book[] {
    return state.booksState;
}

function getBookById (state: AppState, id: number) {
    const selectedBook = state.booksState.find(
      (book) => book.id === id
    );
    return selectedBook;
  };

export { getAllBooks, getBookById }

