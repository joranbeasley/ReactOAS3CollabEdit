import thunk from "redux-thunk"
import {applyMiddleware, combineReducers, createStore} from "@reduxjs/toolkit";
import editorSliceReducer from "./editorSlice"
import wsSliceReducer from "./wsSlice"
import {reducer as toastrReducer} from 'react-redux-toastr'
export {joinRoom,setYaml,setUsers,updateRoom,doSetYaml} from './editorSlice'
export {beginConnection,finishConnection, wsLogin} from './wsSlice'
// import
const reducer = combineReducers({
  editor: editorSliceReducer,
  ws:wsSliceReducer,
  toastr:toastrReducer
})
const store = createStore(reducer,applyMiddleware(thunk))
export default store
