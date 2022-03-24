import React from "react";
import {AceEditor} from "../components/Editor";
import "swagger-ui-react/swagger-ui.css"
import {SwaggerUIView} from "../components/SwaggerUIView";
import {useDispatch, useSelector} from "react-redux";
import {doSetYaml, joinRoom, setUsername} from "../store";
import 'react-redux-toastr/lib/css/react-redux-toastr.min.css'
import {AppBar} from "../components/AppBar";

export const SplitPanelDiv = ({children}) => {
  const wrapperStyle = {
    top: 0, bottom: 0, left: 0, right: 0, position: "absolute", display: "flex"
  }
  const [child1, child2] = children
  return <div style={wrapperStyle}>
    <div style={{display: "block", width: "50%", height: "100%"}}>
      {child1}
    </div>
    <div style={{display: "block", width: "50%", height: "100%"}}>
      {child2}
    </div>
  </div>
}

const AceEditorSplitPage = ({room, user,value, onChange,onSelectionChange,onEditor}) => {
  const dispatch = useDispatch()
  const [editor, setEditor] = React.useState()
  const changeFunc = React.useMemo(()=>{
    return (evt,doc)=>{
      dispatch(doSetYaml(doc.getValue()))
      if(onChange) {
        onChange(evt, doc)
      }
    }
  },[onChange,dispatch])
  const {parseError,current_user,current_room,json} = useSelector(state => state?.editor ?? {})


  React.useEffect(() => {
    // this ONLY affects the local store ... it does not actually dispatch any kind of message to ws
    dispatch(joinRoom(room))
    dispatch(setUsername(user))
  }, [room,user])
  React.useEffect(() => {
    if (parseError && editor) {
      editor.editor.getSession().setAnnotations([{
        row: parseError.parsedLine,
        column: 0,
        text: parseError.message, // Or the Json reply from the parser
        type: "error" // also "warning" and "information"
      }]);
    }
  }, [parseError])

  // const _onEditor = (editor) => {
  //   if(!editor){
  //     console.log("HMMM NO EDITOR??")
  //     return
  //   }
  //   console.log('EEEEEE:"',editor)
  //   editor.editor.setValue("# ... Loading From Server")
  //   setEditor(editor)
  //   const bridge = wsBridge.initializeEditor(editor, dispatch)
  //   dispatch(beginConnection())
  //   ws.connect_ws(`${WSS}?room=${room}&user=${user}`).then(
  //     () => dispatch(finishConnection())
  //   )
  //   ws.on("close", () => dispatch(connectionClosed()))
  // }
  return <SplitPanelDiv>
    <AceEditor
      mode={"yaml"}
      theme={"tomorrow_night_eighties"}
      {...{value,onEditor,onChange:changeFunc,onSelectionChange}}
    />
    <SwaggerUIView json={json}/>
  </SplitPanelDiv>
}
export function EditorPage({room,user,value,onChange,onSelectionChange}){
  return (<div>
    <AppBar />
    <div style={{display:"block",top:'30px',bottom:0,left:0,right:0,position:'absolute'}}>
      <AceEditorSplitPage {...{room, user,value,onChange,onSelectionChange}}/>
      {/*<AceEditorWS mode={"ace/mode/yaml"} theme={"ace/theme/tomorrow_night_eighties"}/>*/}
    </div>

    </div>)
}
