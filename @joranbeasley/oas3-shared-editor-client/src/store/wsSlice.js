import {createSlice} from "@reduxjs/toolkit";
import yamljs from "yamljs"

const editorSlice = createSlice({
  name:'wsSlice',
  initialState:{
    CONNECTED:false,
    CONNECTING:false
  },
  reducers:{
    beginConnection(state){
      state.CONNECTING = true
    },
    finishConnection(state){
      state.CONNECTED = true
      state.CONNECTING = false
    },
    connectionClosed(state){
      state.CONNECTED = false
      state.CONNECTING = false
    }
  }
})

export const {beginConnection,finishConnection,connectionClosed} = editorSlice.actions
export default editorSlice.reducer
