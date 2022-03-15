import React from "react";
import Ace from "ace-builds/src-min-noconflict/ace"
import "brace/mode/python"
import * as AceCollabExt from "@convergencelabs/ace-collab-ext";

// import {edit} from "ace-builds";


export function AceEditor({mode, theme, onEditor,style}) {
  const [editor_, setEditor] = React.useState()
  const [editorSet, setEditorSet] = React.useState(false)
  React.useEffect(() => {
    const editor = editor_?.editor
    const curMgr = editor_?.curMgr
    if (editor) {
      if (mode && mode.indexOf("/mode/") < 1) {
        mode = `ace/mode/${mode ?? 'python'}`
      }
      if (theme && theme.indexOf("/theme/") < 1) {
        theme = `ace/theme/${theme ?? 'dracula'}`
      }
      if (editor.getOption('mode') !== mode) {
        editor.setOption('mode', mode)
      }
      if (editor.getOption('theme') !== theme) {
        editor.setOption('theme', theme)
      }
      if(!editorSet && onEditor){
        setEditorSet(true)
        onEditor({editor,curMgr})
      }
    }
  }, [editor_, mode, theme,onEditor])
  const AceEditorMemo = React.useMemo(() => {
      const ele = (<div
        ref={ele => {
          const editor = Ace.edit(ele)
          const curMgr = new AceCollabExt.AceMultiCursorManager(editor.getSession());
          setEditor({editor,curMgr})
        }}
        style={{display: "block", width: '100%', height: '100%',...(style??{})}}
      />)
      return ele
    }, []
  )
  return AceEditorMemo
}


export function AceEditorWS({mode, theme}) {
  const [editor, setEditor] = React.useState()


  return <AceEditor onEditor={setEditor}/>
}
