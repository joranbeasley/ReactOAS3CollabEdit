import {ws} from "./ws";
import {setUsers, setYaml} from "../store";
import {toastr} from 'react-redux-toastr'
// import * as AceCollabExt from "@convergencelabs/ace-collab-ext";

// toastr.options.closeMethod = 'fadeOut';
// toastr.options.closeDuration = 5000;
// toastr.options.closeEasing = 'swing';
const colors = []
const cursors = {}
class EditorWebsocketBridge{
  constructor(ws) {
    this.ws = ws
    this.editor = null
    this._dispatch = null
    this._bound = false
  }
  onEditorChangeDocumentEvent(evt){
    console.log("Local Change Event",evt, this)
    const value = this.editor.getValue()
    this.ws.sendEvent("EDITOR_CHANGE",{value,evt})
    this._dispatch(setYaml(value))
  }
  onEditorCursorChangedEvent(e){
    console.log("Local Cursor Event",e)
    this.ws.sendEvent("UPDATE_CURSOR",{cursor:this.editor.selection.getCursor()})
  }
  onRemoteCursorChange(e){
    console.log("Remote Cursor Event",e)
  }
  onRemoteDocumentChangeEvent(e){
    console.log("Remote Change Event",e['change'])
    this.unbindEditor()
    this.editor.getSession().getDocument().applyDeltas([e['change']])
    this.bindEditor()
    this._dispatch(setYaml(this.editor.getSession().getValue()))
  }
  unbindEditor(){
    this.editor.getSession().off("change", this.onEditorChangeDocumentEvent)
    this.editor.selection.off("changeCursor", this.onEditorCursorChangedEvent)
  }
  initializeEditor(editor_,dispatch){
    if(this.editor){
      throw Error("ALREADY INITIALIZED!!!")
    }
    this._dispatch = dispatch
    this.editor = editor_?.editor
    this.curMgr = editor_?.curMgr;
    this.onEditorChangeDocumentEvent = this.onEditorChangeDocumentEvent.bind(this)
    this.onEditorCursorChangedEvent = this.onEditorCursorChangedEvent.bind(this)
    this.ws.on("CHANGE_EVENT",e=>this.onRemoteDocumentChangeEvent(e))
    this.ws.once("WELCOME", data => {
      console.log("THIS ED:",this.editor,this)
      this.editor.getSession().getDocument().setValue(data?.room?.content)
      this.editor.selection.clearSelection()

      this.bindEditor()
      const me = data.user
      const users = (data?.room?.users ?? []).map(user=>{
        if(user.email === me.email && user.color === me.color){
          return user;
        }
        this.curMgr.addCursor(user.color,user.email.substr(0,5),user.color,{row:0,column:0})
        return user
      })

      toastr.success("Joined Room",`You have joined '${data?.room?.name}'`)
      this._dispatch(setUsers(users))
      this._dispatch(setYaml(this.editor.getValue()))
    })
    this.ws.on("USER_LEFT",(data)=>{
      toastr.error('User Left',data?.user?.email)
      const color = data?.user?.color
      // this.curMgr.removeCursor(color.substr(1))
      if(data?.room?.users) {
        this._dispatch(setUsers(data.room.users))
      }
    })
    this.ws.on("CURSOR_UPDATE",data=>{
      console.log("REMOTE CURSOR UPDATE!:",data)
      this.curMgr.setCursor(data.user.color,data.cursor)
    })
    this.ws.on("USER_JOINED",(data)=>{
      toastr.info('User Joined',data?.user?.email)

      const color = data?.user?.color
      const uname = data?.user?.email
      this.curMgr.addCursor(color,uname,color,0)
      console.log("ADDED CURSOR:")
      if(data?.room?.users) {
        this._dispatch(setUsers(data.room.users))
      }
    })
  }
  bindEditor(){
    this.editor.getSession().on("change", this.onEditorChangeDocumentEvent)
    this.editor.selection.on("changeCursor", this.onEditorCursorChangedEvent)
  }
}
export const wsBridge = new EditorWebsocketBridge(ws)
