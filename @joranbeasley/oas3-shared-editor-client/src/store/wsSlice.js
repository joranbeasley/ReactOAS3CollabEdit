import {createSlice} from "@reduxjs/toolkit";
// import yamljs from "yamljs"
import {ws} from "../util/ws";
import {doJoinRoomAndRedirect, doSetYaml, joinRoom, updateRoom} from "./editorSlice";
import {reactLocation} from "../App";

const wsSlice = createSlice({
  name:'wsSlice',
  initialState:{
    readyState:-1,
    connectionError:null,
    url:null,
  },
  reducers:{
    beginConnection(state,payload){
      state.url = payload
      state.readyState =  WebSocket.CONNECTING
    },
    finishConnection(state){
      state.readyState = WebSocket.OPEN
      console.log("READY STATE UPDATED:",state.readyState)
    },
    connectionClosed(state,reason=null){
      state.readyState = WebSocket.CLOSED
      state.connectionError = reason
    },
    connectionFail(state){
      state.readyState = WebSocket.CLOSED
      state.connectionError = "Connection.FAIL"
    }
  }
})

export function wsLogin(url,ws_inst,onLoginSuccess=({user,room})=>1) {
  // fetchTodoByIdThunk is the "thunk function"
  ws_inst = ws_inst ?? ws
  return async function wsLoginThunk(dispatch, getState) {
    dispatch(beginConnection())
    ws_inst.once("WELCOME",async payload=>{
      console.log("GOT WELCOME:",payload)
      dispatch(joinRoom(payload))
      dispatch(doSetYaml(payload.room.content))
      onLoginSuccess({user:payload.user,room:payload.room})
      // dispatch()
    })
    ws_inst.on("USER_JOINED",payload=>{
      dispatch(updateRoom({room:payload.room}))
    })
    ws_inst.on("USER_LEFT",payload=>{
      dispatch(updateRoom({room:payload.room}))
    })
    ws_inst.connect_ws(url).then(()=>{
      console.log("Update Connection OPEN!")
      dispatch(finishConnection())
      ws_inst.once("close",reason=>{
        console.log("CLOSE??",reason)
        dispatch(connectionClosed(reason))
      })
    }).catch((ws_inst2,reason)=>{
      console.log("CONNECTION ERROR!",ws_inst2)
      dispatch(wsSlice.actions.connectionFail())
    })
  }
}
export const {beginConnection,finishConnection,connectionClosed} = wsSlice.actions
export default wsSlice.reducer
