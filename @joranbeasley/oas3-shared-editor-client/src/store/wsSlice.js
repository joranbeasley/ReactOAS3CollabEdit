import {createSlice} from "@reduxjs/toolkit";
// import yamljs from "yamljs"
import {ws} from "../util/ws";

const editorSlice = createSlice({
  name:'wsSlice',
  initialState:{
    readyState:0,
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
export function wsLogin(url) {
  // fetchTodoByIdThunk is the "thunk function"
  return async function wsLoginThunk(dispatch, getState) {
    dispatch(beginConnection())
    ws.connect_ws(getState).then(()=>{
      dispatch(finishConnection())
      ws.once("close",reason=>{
        dispatch(connectionClosed(reason))
      })
    })
  }
}
export const {beginConnection,finishConnection,connectionClosed} = editorSlice.actions
export default editorSlice.reducer
