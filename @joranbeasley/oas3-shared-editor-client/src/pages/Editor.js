import React from "react";
import {AceEditor} from "../components/Editor";
import "swagger-ui-react/swagger-ui.css"
import {SwaggerUIView} from "../components/SwaggerUIView";
import {useDispatch, useSelector} from "react-redux";
import {doSetYaml} from "../store";
import 'react-redux-toastr/lib/css/react-redux-toastr.min.css'
import {AppBar} from "../components/AppBar";
import {ws} from "../util/ws";

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

const AceEditorSplitPage = ({room, user, value, onChange, onSelectionChange, onEditor}) => {
  const dispatch = useDispatch()
  const [editor, setEditor] = React.useState()
  const [markers, setMarkers] = React.useState({})
  const changeFunc = React.useMemo(() => {
    return (evt, doc) => {

      dispatch(doSetYaml(doc.getValue()))
      if (onChange) {
        evt = {...evt, editor: editor.editor}
        onChange(evt, doc)
      }
    }
  }, [onChange, dispatch, editor])
  const {parseError, json} = useSelector(state => state?.editor ?? {})
  React.useEffect(() => {
    const onRemoteChangeEvent = evt => {
      editor.editor.getSession().getDocument().applyDelta(evt.change)
    }
    const onRemoteSelectionChangeEvent = evt => {
      const hash = evt.user.email + evt.user.color
      if(!markers[hash]){
        editor.curMgr.addCursor(hash, evt.user.given_name, evt.user.color, evt.cursor)
        markers[hash] = evt.user
        setMarkers({...markers})
      }else{
        editor.curMgr.setCursor(hash,evt.cursor)
      }
    }
    const onRemoteUserJoined = evt => {
      console.log("**REMOTE USER JOINED EVENT!!:", evt)
      const hash = evt.user.email + evt.user.color
      if (markers[hash]) {
        console.log("User appears to already have a marker!")
      } else {
        editor.curMgr.addCursor(hash, evt.user.given_name, evt.user.color, {row: 0, column: 0})
        markers[hash] = evt.user
        setMarkers({...markers})
        console.log("ADDED MARKER")
      }
    }
    const onRemoteUserLeft = evt => {
      console.log("**REMOTE USER LEFT EVENT!!:", evt)
      const hash = evt.user.email + evt.user.color
      if (!markers[hash]) {
        console.log("User is missing from markers")
      } else {
        editor.curMgr.removeCursor(hash)
        markers[hash] = undefined
        delete markers[hash]
        setMarkers({...markers})
      }
    }
    const onRemoteWelcome = payload => {
      console.log("GOT REMOTE WELCOME!",payload)
    }
    ws.once("WELCOME", onRemoteWelcome)
    ws.on("USER_JOINED", onRemoteUserJoined)
    ws.on("USER_LEFT", onRemoteUserLeft)
    ws.on("CHANGE_EVENT", onRemoteChangeEvent)
    ws.on("CURSOR_UPDATE", onRemoteSelectionChangeEvent)
    return () => {
      ws.off("CHANGE_EVENT", onRemoteChangeEvent)
      ws.off("WELCOME", onRemoteWelcome)
      ws.off("CURSOR_UPDATE", onRemoteSelectionChangeEvent)
      ws.off("USER_JOINED", onRemoteUserJoined)
      ws.off("USER_LEFT", onRemoteUserLeft)
    }
  }, [editor, markers, setMarkers])
  const _onEditor = (editor) => {
    setEditor(editor)
    if (onEditor) {
      onEditor(editor)
    }
  }
  const selectionChangeFunc = React.useMemo(() => {
    return (evt, doc) => {
      // dispatch(doSetYaml(doc.getValue()))
      if (onSelectionChange) {
        evt = {...evt, editor: editor.editor}
        onSelectionChange(evt, doc)
      }
    }
  }, [editor, onSelectionChange])
  // React.useEffect(() => {
  //   // this ONLY affects the local store ... it does not actually dispatch any kind of message to ws
  //   // dispatch(joinRoom({room,user}))
  //   // dispatch(setUsername(user))
  // }, [room,user, dispatch])
  React.useEffect(() => {
    if (parseError && editor) {
      editor.editor.getSession().setAnnotations([{
        row: parseError.parsedLine,
        column: 0,
        text: parseError.message, // Or the Json reply from the parser
        type: "error" // also "warning" and "information"
      }]);
    }
  }, [parseError, editor])
  return <SplitPanelDiv>
    <AceEditor
      mode={"yaml"}
      theme={"tomorrow_night_eighties"}
      onEditor={_onEditor}
      onChange={changeFunc}
      onSelectionChange={selectionChangeFunc}
      value={value}
    />
    <SwaggerUIView json={json}/>
  </SplitPanelDiv>
}

export function EditorPage({room, user}) {
  const value = useSelector(state => state.editor.yaml)

  const onChange = (evt) => {
    const {editor} = evt
    evt = {...evt}
    delete evt.editor
    if (editor && editor.curOp && editor.curOp.command.name) {
      console.log("user change BROADCAST");
      ws.sendEvent("EDITOR_CHANGE", {evt})
      // setTimeout(()=>{
      //   editor.getSession().getDocument().applyDelta(evt)
      // },5000)
    } else {
      console.log("other change, skip BROADCAST")
    }

  }
  const onSelectionChange = (evt) => {
    console.log("GOT SELECTION CHANGE:", evt)
    const {editor} = evt
    evt = {...evt}
    delete evt.editor
    const {row, column} = editor.selection.cursor
    const cursor = {row, column}
    const {row: arow, column: acolumn} = editor.selection.anchor
    const anchor = {row: arow, column: acolumn}
    ws.sendEvent("UPDATE_CURSOR", {cursor, anchor})
  }
  return (<div>
    <AppBar/>
    <div style={{display: "block", top: '30px', bottom: 0, left: 0, right: 0, position: 'absolute'}}>
      <AceEditorSplitPage {...{room, user, value, onChange, onSelectionChange}}/>
      {/*<AceEditorWS mode={"ace/mode/yaml"} theme={"ace/theme/tomorrow_night_eighties"}/>*/}
    </div>

  </div>)
}
