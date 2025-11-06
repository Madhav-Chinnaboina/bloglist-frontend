import { useState,forwardRef,useImperativeHandle } from 'react'
const Toggable = forwardRef((props,ref) => {
  const [ visible,setVisible ] = useState(false)
  const hideWhenVisible = { display : visible? 'none' : '' }
  const showWhenVisible ={ display : visible? '' : 'none' }
  const toggleFunction = () => {
    setVisible(!visible)
  }
  useImperativeHandle(ref,() => ({
    toggleFunction
  }))
  return (
    <>
      <div style={hideWhenVisible}>
        <button onClick={toggleFunction}>
          {props.buttonLabel}
        </button>
      </div>
      <div style={showWhenVisible}>
        {props.children}
        <button onClick={toggleFunction}>cancel</button>
      </div>
    </>
  )
})
export default Toggable