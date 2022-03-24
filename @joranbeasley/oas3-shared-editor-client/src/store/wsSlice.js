import {createSlice} from "@reduxjs/toolkit";
// import yamljs from "yamljs"
import {ws} from "../util/ws";

const editorSlice = createSlice({
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
    },
    connectionClosed(state,reason=null){
      state.readyState = WebSocket.CLOSED
      state.connectionError = reason
    }
  }
})
export function wsLogin(url,ws_inst) {
  // fetchTodoByIdThunk is the "thunk function"
  ws_inst = ws_inst ?? ws
  return async function wsLoginThunk(dispatch, getState) {

    dispatch(beginConnection())
    ws_inst.connect_ws(url).then(()=>{
      dispatch(finishConnection())
      ws_inst.once("close",reason=>{
        console.log("CLOSE??",reason)
        dispatch(connectionClosed(reason))
      })
    }).catch((ws_inst2,reason)=>{
      console.log("CONNECTION ERROR!",ws_inst2)
      dispatch(connectionClosed(reason))
    })
  }
}
export const {beginConnection,finishConnection,connectionClosed} = editorSlice.actions
export default editorSlice.reducer
