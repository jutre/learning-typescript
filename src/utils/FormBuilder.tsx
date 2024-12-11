import { useState, useEffect } from 'react';

interface FormFieldDefinition  { 
  label: string,
  name: string,
  type: string,
  rule?: string,
}

type formData = {[index: string]: number | string | boolean};

interface FormBuilderProps {
  formFieldsDefinition: FormFieldDefinition[],
  submitButtonText?: string ,
  initialData?: formData ,
  successfulSubmitCallback: (formData:{[index: string]: number | string | boolean} ) => void
}

interface ErrorMessage {
  [index: string]: string
}


/**
 * 
 * @param {array} formFieldsDefinition - array of objects. Each object in array represents form field's
 * definition, object properties are dedicated for following purpose
 * "label" - label text for input field, 
 * "name" - input element's "name" attribute value,  
 * "type" - input element's "type" attribute value
 * "rule" - validation rule for fields value,
 * for example, three fields are defined as follows - 
 * 
 * [{label: "id", name:"id", type:"hidden"},
 *  {label: "Title", name:"title", type:"text", rule:"required"}, 
 *  {label: "Description", name:"description", type:"textarea", rule:"required"}]
 *
 * @param {string} submitButtonText - text for submit button, can be empty, default value "Submit"
 * @param {object} initialData - object with data that will be filled in form input fields on initial display.
 * Each object propertie's value will be displayed in input field with name same as propertie's name
 * @param {function(submittedData)} successfulSubmitCallback -function what will be invoked after form submit
 * if all fields pass validation
 * @returns 
 */
export function FormBuilder({ formFieldsDefinition, submitButtonText = "Submit", initialData, successfulSubmitCallback }:
                FormBuilderProps) {
  /*
  TODO finish code for creating radio input, select
  TODO - currently in case if initial data object contains properties that are not present as form fields they are also
  submitted (unmodified). Decide is it is needed to eliminate them and submit only object with fields that are 
  present in form as input fields */

  //will track all input fields values, initially set to component property value
  const [inputFieldValues, setInputFieldValues] = useState<formData>({});
  const [inputErrors, setInputErrors] = useState<ErrorMessage>({});


  useEffect(() => {
    /*Setting initial form data to component's state in useEffect hook which depends on @param initialData value. 
    We can't do just  useState(initialData) as doing such way in case parent component re-renders with other @param initialData value,
    new value won't be set to component's state as useState runs once. This is done for case a design pattern is used when parent component 
    renders for the first time with empty data (then form as it's child is rendered with empty fields) and then parent component loads data 
    from somehow in useEffect hook and re-renders with loaded data that must be initially sed in form fields*/


    /*Code to reach consistency. Initial data for form is plain object with key/value pairs, where value suplies initial
    value for all kind of input elements, for checkbox that value is used for "checked" attribute. Any type of data can be suplied
    for ths attribute in this object, React would convert it to Truthy/Falsey value when setting it for input element. If user changes
    in form checkbox to opposite value and then sets back like removing initial check mark and then puting it back 
    and then submits it, the value passed to successfulSubmitCallback will be 'true' withboolean type. But in case user does not 
    change the checkbox state and submits the form, the data passed to successfulSubmitCallback for the ckeckbox field will be same
    value that was passed in initial data object having expactly same type, for example a string value "on". 
    The following code converts all initial values for checkboxes to boolean type to correct than inconsitency. The outcome is 
    always passing boolean type value to successfulSubmitCallback for checbox fields*/

    //Create a copy of @param initialData object as it might be modified. In some cases passed value might be read only as with
    //objects coming from Redux, but we need an object that can be modified for checkbox fields values correction
    if(! initialData){
      initialData = {};
    }
    let initialDataCopy = {...initialData};
    let correctedCheckboxValues: formData = {};
    formFieldsDefinition.forEach(formElementDef => {
      let fieldName = formElementDef.name;
      if(formElementDef.type === "checkbox"){
        if( typeof (initialDataCopy[fieldName]) !== "boolean"){
          correctedCheckboxValues[fieldName] = Boolean(initialDataCopy[fieldName]);
        }
      }
    })

    if(Object.keys(correctedCheckboxValues).length !== 0){
      initialDataCopy = { ...initialDataCopy, ...correctedCheckboxValues };
    }

    //finally set corrected data to state
    setInputFieldValues(initialDataCopy);

  }, [initialData]);

  const onInputFieldsChange = (event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
    //sets changed input's value in state variable
    let name = event.target.name;
    let value: string | boolean = event.target.value;

    //value for checkbox comes from checked state of checkbox input element
    if (event.target.type === "checkbox") {
      //additional check for type narrowing for Typescript 
      //which is redudant in pure JS as as condition (event.target.type === "checkbox") takes only checkboxes
      if("checked" in event.target){
        value = event.target.checked;
      }
    }
    setInputFieldValues(values => ({ ...values, [name]: value }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    let errors = {}; //actually clear previous errors, as this will be filled with errors from current validation

    for (const formElementDef of formFieldsDefinition) {
      let fieldName = formElementDef.name;
      if (formElementDef.rule === "required" && !inputFieldValues[fieldName]) {
        errors = { ...errors, [fieldName]: "this field must not be empty" };
      }
    }
  

    //if there are no input errors, call sucessfull submit callback
    if (Object.keys(errors).length === 0) {
      successfulSubmitCallback(inputFieldValues);
    }

    //set actual errors to state for displaying
    setInputErrors(errors);
  }

 
  return (
    <form onSubmit={handleSubmit}>
      {(formFieldsDefinition).map((formElementDef) => {
        let fieldName = formElementDef.name;

        //TODO: possibly grab type from react element types or if using those
        //check it there is possibility in TS to specify that either "checked" or "value" must be present
        type InputElementAttributes = { name: string, 
          id: string; 
          onChange: (event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => void,
          checked?:  boolean,
          value?: number | string,
          type?: string
        }
        //Adding attributes present in all input elements.
        //All input elements also have change handler as they are controlled input fields
        let inputElemAttributes: InputElementAttributes = {
          name: fieldName,
          id: fieldName,
          onChange: onInputFieldsChange
        };

        //in "checkbox" input element assign current field's value to "checked" attribute,
        //for all other input types value goes to "value" attribute.
        //Do not allow 'undefined' value for "checked" or "value" attributes to have controlled input element -
        //field's value's initial data might be 'undefined' usually for forms without initial data
        if (formElementDef.type === "checkbox") {
          //casting to boolean is to convince Typescript that this is realy boolean. I have to to it due to 
          //general type of form initial data besides that everywhere the value for checkbox is maintained
          // as boolean
          inputElemAttributes.checked = Boolean(inputFieldValues[fieldName]); 
          if(inputElemAttributes.checked === undefined){
            inputElemAttributes.checked = false;
          }
        }else{
          let valueAttributeVal = "";
          if(inputFieldValues[fieldName] !== undefined){
            valueAttributeVal = inputFieldValues[fieldName] + ""
          }
          inputElemAttributes.value =  valueAttributeVal;
        }

        //create "input", "textarea", etc. html tag corresponding to type of input in form definition object
        //TODO - add code for "select" tag creation, "<input type='radio' />
        let inputTag;
        if (formElementDef.type === "text" || formElementDef.type === "checkbox" || formElementDef.type === "hidden") {
          inputElemAttributes.type = formElementDef.type;
          inputTag = <input {...inputElemAttributes} />;

        } else if (formElementDef.type === "textarea") {
          inputTag = <textarea {...inputElemAttributes} />;
        }

        /**
         * input tag is created, we must wrap it in div and place label as needed according 
         * to type of input element
         */

        //for "hidden" type input return just <input> tag here, no additional wrapping or label
        if(formElementDef.type === "hidden"){
          //recteate tag by adding "key" attribute which is needed for React in list rendering
          return <input {...inputElemAttributes}  key={fieldName}/>;
        }

        /*for all input tags except checkbox, label comes before input field, checkbox also have
        additional markup to have ability to style it as needed*/
        let inputTagWithLabel;
        let fieldWrapperCssClass = "field " + formElementDef.type;
        if(formElementDef.type === "checkbox"){
          inputTagWithLabel = (
            <>
              <div>{inputTag}</div> 
              <label htmlFor={fieldName}>{formElementDef.label}</label>
            </>) ;
        }else{
          inputTagWithLabel = <> <label htmlFor={fieldName}>{formElementDef.label}</label> {inputTag} </>;
        }
        return (
          <div className={fieldWrapperCssClass} key={fieldName}>
            {inputTagWithLabel}

            {inputErrors[fieldName] &&
              <div className='input_error'>{inputErrors[fieldName]}</div>}
          </div>);
      })}

      <input type="submit" value={submitButtonText}/>

    </form>
  );
}
