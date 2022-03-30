import {createSlice} from "@reduxjs/toolkit";
import jsyaml from "js-yaml";
import {reactLocation} from "../App";

const editorSlice = createSlice({
  name: 'editorSlice',
  initialState: {
    yaml: '',
    json: {},
    parseError: null,
    current_room: null,
    current_users: [],
    current_user: null
  },
  reducers: {
    joinRoom(state, action) {
      const {payload} = action
      state.current_room = payload.room
      state.current_user = payload.user
      state.current_users = [...payload.room.users]
    },
    updateRoom(state, action) {
      const {payload} = action
      state.current_room = payload.room
      state.current_users = [...payload.room.users]
    },
    setUsers(state, action) {
      state.current_users = [...action?.payload]
    },
    setError(state, payload) {
      state.parseError = payload
    },
    setYaml(state, payload) {
      state.yaml = payload?.payload
    },
    setJSON(state, payload) {
      state.json = payload?.payload ?? {}
    },
  }
})

export function doJoinRoomAndRedirect({room, user}) {
  return async function setRoomThunk(dispatch, getState) {
    dispatch(editorSlice.actions.joinRoom({room, user}))
    const uri = `/room/${room.name}/${user.email}`
    // document.location.href=uri
    // document.location.history.push(uri)
    await reactLocation.navigate({pathname: uri})
  }
}

export function doSetYaml(yaml) {
  // fetchTodoByIdThunk is the "thunk function"
  return async function setYamlThunk(dispatch, getState) {
    if (getState().editor.yaml === yaml) {
      return
    }
    dispatch(setYaml(yaml))
    try {
      const json = jsyaml.load(yaml)
      dispatch(setJSON(json))
    } catch (e) {
      const {line: parsedLine, column} = e.mark
      dispatch(setError({parsedLine, column, message: e.message}))
    }
  }
}

export const {setYaml, setJSON, joinRoom, updateRoom, setUsers, setError} = editorSlice.actions
export default editorSlice.reducer
