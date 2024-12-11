import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getBookById } from "../selectors/books";
import { bookUpdated } from "../features/booksSlice";
import { routes } from "../config";
import { FormBuilder } from '../utils/FormBuilder';
import { Book } from "../types/Book";
//neede for selectors and action distching
import store from "../store/store";
import { setPageTitleTagValue } from "../utils/setPageTitleTagValue";


/**
 * This component gets initial data from Redux store but does not use react-redux connect() because we don't need 
 * re-render component after store's state is updated because the new state corresponds to values is that is 
 * currently in input fields.
 */
function BookEditing() {
  const [submitingIndicator, setSubmitingIndicator] = useState(false);

  
  //load book data from store and keep in compnent's state. Components state is needed as component
  //will be re-rendered when submitting indicator will appear and we need a way to perform data loading only once
  const [formInitialData, setFormInitialData] = useState({});

  //will contain possible errors
  const [errorMsg, setErrorMsg] = useState("");

  let { bookId } = useParams();
  
  useEffect(() => {
    
    //load initial book data for editing
    //(runs after first render, but on first render form was displayed with empty, but user did not see that)

    //exclude non integer and values less than one.
    //bookId might possibly be undefined because of useParams() api, convert to empty string for usage in regexp (needed because of TS)
    if(bookId === undefined){
      bookId = '';
    }
    if (! /^[1-9][0-9]*$/.test(bookId)) {
      setErrorMsg(bookId + " - invalid parameter value! Value must be integer greater than zero.");

    } else {
      let bookIdIntVal = parseInt(bookId);
      const initialData = getBookById(store.getState(), bookIdIntVal);

      if (initialData === undefined) {
        setErrorMsg(`A book with id="${bookId}" was not found!`);
      } else {
        setFormInitialData(initialData);
      }
    }

    //setting page title from here
    setPageTitleTagValue("Edit book");
  }, []);
  
  let  formFieldsDefinition = [
    {label: "id", name:"id", type:"hidden"},
    {label: "Title", name:"title", type:"text", rule:"required"}, 
    {label: "Description", name:"description", type:"textarea", rule:"required"}];
    
  function saveSubmittedData(bookData:{[index: string]: number | string | boolean}){
    //part of loading indicator
    setSubmitingIndicator(true);

    //TODO - maybe convert one by one field from submittedData by converting each field like   {id: parseInt(String(submittedData['id'])), ...}
    //instead of casting
    store.dispatch(bookUpdated(bookData as Book))
    
    //simulation of end of fetching, not using real submiting data to server
    setTimeout( () => {setSubmitingIndicator(false)}, 500); 
  }


  return  (
    <div>
      <div className="navigation">
        <Link to={routes.bookListPath}>Back</Link>
      </div>
      
      <h2>Edit book</h2>
      
      {errorMsg 
        ?
        <div className='error'>{errorMsg}</div>
        :
        <FormBuilder formFieldsDefinition={formFieldsDefinition} 
                    submitButtonText="Update"
                    initialData={formInitialData} 
                    successfulSubmitCallback={saveSubmittedData}/>
      }

      {submitingIndicator&&
        <div className="load_indicator">saving...</div>}
    </div>
  )
}




export default BookEditing;