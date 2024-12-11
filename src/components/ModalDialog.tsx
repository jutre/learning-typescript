export function ModalDialog({ content, confirmFunction, cancelFunction }) {


  /**
   * removes "overflow:hidden" style from body tag. Used in every action on dialog to remove
   * previously added style to restore scrollbar showing abiblity on body
   */
  function removeOverflowStylingFromBodyTag() {
    document.body.style.overflow = 'auto';
  }

  const _confirm = () => {
    removeOverflowStylingFromBodyTag();
    confirmFunction();
  };

  const _cancel = () => {
    removeOverflowStylingFromBodyTag();
    cancelFunction();
  };

  //set style to body tag to hide scrollbar on modal view
  document.body.style.overflow = 'hidden';

  return (
    <>
      <div className='overlay_for_modal_dialog' onClick={() => { _cancel(); }}></div>
      <div className='modal_dialog'>
        <div className='container'>
          <div className='body'>
            <div className='content'>{content}</div>
            <div className='controls'>
              <button className='button_confirm' onClick={() => { _confirm(); }}>Yes</button>
              <span className='button_cancel' onClick={() => { _cancel(); }}>No</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
