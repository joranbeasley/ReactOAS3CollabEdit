import React from "react";
import Ace from "ace-builds/src-min-noconflict/ace"
import "brace/mode/python"
import * as AceCollabExt from "@convergencelabs/ace-collab-ext";

// import {edit} from "ace-builds";


export function AceEditor({mode, value, theme, onEditor, style, onChange, onSelectionChange}) {
  const [editor_, setEditor] = React.useState()
  const [editorSet, setEditorSet] = React.useState(false)
  React.useEffect(() => {
    const editor = editor_?.editor
    const curMgr = editor_?.curMgr
    let mmode = mode
    let mtheme = theme
    if (editor) {
      if (mode && mode.indexOf("/mode/") < 1) {
        mmode = `ace/mode/${mode ?? 'python'}`
      }
      if (theme && theme.indexOf("/theme/") < 1) {
        mtheme = `ace/theme/${theme ?? 'dracula'}`
      }
      if (editor.getOption('mode') !== mmode) {
        editor.setOption('mode', mmode)
      }
      if (editor.getOption('theme') !== mtheme) {
        editor.setOption('theme', mtheme)
      }
      if (!editorSet && onEditor) {
        setEditorSet(true)
        onEditor({editor, curMgr})
      }
    }
  }, [editor_, mode, theme, onEditor,editorSet])
  React.useEffect(() => {
    if (value !== editor_?.editor?.getValue()) {
      console.log("Update Value?", value)
      const editor = editor_?.editor
      if (!editor) {
        return
      }
      editor.getSession().getDocument().setValue(value)
    }
  }, [value,editor_])
  React.useEffect(() => {
    console.log("BIND CHANGE")
    if (!editor_) {
      return
    }
    const editor = editor_?.editor
    if (onChange) {
      editor.getSession().on("change", onChange)
    }
    return () => {
      console.log("UNBIND CHANGE")
      if (!editor_) {
        return
      }
      const editor = editor_?.editor
      if (onChange) {
        editor.getSession().off("change", onChange)
      }

    }
  }, [editor_, onChange])
  React.useEffect(() => {
    console.log("BIND CHANGE SEL")
    if (!editor_) {
      return
    }
    const editor = editor_?.editor
    if (onSelectionChange) {
      editor.selection.on("changeCursor", onSelectionChange)
    }
    return () => {
      console.log("UNBIND CHANGE SEL")
      if (!editor_) {
        return
      }
      const editor = editor_?.editor
      if (onSelectionChange) {
        editor.selection.off("changeCursor", onSelectionChange)
      }
    }
  }, [editor_, onSelectionChange])
  const AceEditorMemo = React.useMemo(() => {
      const ele = (<div
        ref={ele => {
          const editor = Ace.edit(ele)
          const curMgr = new AceCollabExt.AceMultiCursorManager(editor.getSession());
          setEditor({editor, curMgr})
        }}
        style={{display: "block", width: '100%', height: '100%', ...(style ?? {})}}
      />)
      return ele
    }, [style]
  )
  return AceEditorMemo
}


export function AceEditorWS({mode, theme}) {
  const [ , setEditor] = React.useState()
  return <AceEditor onEditor={setEditor}/>
}
