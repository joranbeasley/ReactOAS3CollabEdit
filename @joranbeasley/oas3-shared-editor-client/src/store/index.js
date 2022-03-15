import {combineReducers, createStore} from "@reduxjs/toolkit";
import editorSliceReducer from "./editorSlice"
import wsSliceReducer from "./wsSlice"
import {reducer as toastrReducer} from 'react-redux-toastr'
export {joinRoom,setYaml,setUsers,setUsername} from './editorSlice'
export {beginConnection,finishConnection} from './wsSlice'
// import
const reducer = combineReducers({
  editor: editorSliceReducer,
  ws:wsSliceReducer,
  toastr:toastrReducer
})
const store = createStore(reducer)
export default store
