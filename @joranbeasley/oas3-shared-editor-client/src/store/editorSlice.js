import {createSlice} from "@reduxjs/toolkit";
import jsyaml from "js-yaml";

const editorSlice = createSlice({
  name:'editorSlice',
  initialState:{
    yaml:'',
    json:{},
    parseError:null,
    current_room: null,
    current_users: [],
    current_user: null
  },
  reducers:{
    setUsername(state,payload){
      state.current_user = payload
    },
    joinRoom(state,payload){
      state.current_room = payload
    },
    setUsers(state,action){
      state.current_users = [...action?.payload]
    },
    setError(state,payload){
      state.parseError = payload
    },
    setYaml(state,payload){
      state.yaml = payload?.payload
    },
    setJSON(state,payload){
      state.json = payload?.payload ?? {}
    },
  }
})
export function doSetYaml(yaml) {
  // fetchTodoByIdThunk is the "thunk function"
  return async function setYamlThunk(dispatch, getState) {
    if(getState().editor.yaml===yaml){return}
    dispatch(setYaml(yaml))
    try{
      const json = jsyaml.load(yaml)
      dispatch(setJSON(json))
    }catch (e){
      const {line:parsedLine, column} = e.mark
      dispatch(setError({parsedLine,column,message:e.message}))
    }
  }
}
export const {setYaml,setJSON,joinRoom,setUsername,setUsers,setError} = editorSlice.actions
export default editorSlice.reducer
