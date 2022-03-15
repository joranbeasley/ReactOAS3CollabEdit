import {createSlice} from "@reduxjs/toolkit";
import yamljs from "yamljs"

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
    setYaml(state,payload){
      console.log("SET YAML:",payload)
      state.yaml = payload?.payload
      try{
        state.json = yamljs.parse(state.yaml)
      }catch (e){
        state.parseError = e
      }
    }
  }
})

export const {setYaml,joinRoom,setUsername,setUsers} = editorSlice.actions
export default editorSlice.reducer
