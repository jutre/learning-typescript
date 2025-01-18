import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { bookUpdated, getBookById } from "../features/booksSlice";
import { routes } from "../config";
import { FormBuilder } from '../utils/FormBuilder';
import { Book } from "../types/Book";
import { useAppSelector, useAppDispatch } from '../store/reduxHooks';
import { setPageTitleTagValue } from "../utils/setPageTitleTagValue";


/**
 * This component gets initial data from Redux store but does not use react-redux connect() because we don't need 
 * re-render component after store's state is updated because the new state corresponds to values is that is 
 * currently in input fields.
 */
function BookEditing() {
  const [submitingIndicator, setSubmitingIndicator] = useState(false);

  
  let formInitialData;

  //will contain possible errors
  const [errorMsg, setErrorMsg] = useState("");

  const dispatch = useAppDispatch();

  let { bookId } = useParams();

  //useAppDispatch is React hook, it must be called inside function body, possibly with selector parameter int value NaN if
  //param value can not be casted to reasonable int, in that case returning no book because book with id=0 does not exist; error message
  //for incorrectly formated param will be generated in useEffect hook

  //fix possible undefined value for passing it to parseInt
  if(bookId === undefined){
    bookId = '';
  }
  let bookIdIntVal = parseInt(bookId);
  const initialData = useAppSelector(state => getBookById(state, bookIdIntVal));

  //exclude non integer and values less than one.
  if (! /^[1-9][0-9]*$/.test(bookId)) {
    setErrorMsg(bookId + " - invalid parameter value! Value must be integer greater than zero.");

  } else {
    if (initialData === undefined) {
      setErrorMsg(`A book with id="${bookId}" was not found!`);
    } else {
      formInitialData = initialData;
    }
  }

  useEffect(() => {
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
    dispatch(bookUpdated(bookData as Book))
    
    //simulation of end of fetching, not using real submiting data to server
    setTimeout( () => {setSubmitingIndicator(false)}, 500); 
  }


  return  (
    <div>
      <div className="navigation">
        <Link to={routes.bookListPath}>Back</Link>
      </div>
      
      <h2>Edit book</h2>
      
      {errorMsg &&
        <div className='error'>{errorMsg}</div> }
      {formInitialData &&
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