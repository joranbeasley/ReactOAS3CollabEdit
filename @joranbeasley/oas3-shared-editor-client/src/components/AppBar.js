import React from "react";
import {useDispatch, useSelector} from "react-redux";
import {StatusLight} from "./Light";
import {FaEdit, FaSave} from "react-icons/fa";
import {setUsername} from "../store";

function useAppBarSelector(){
  return useSelector(state=>({
    user:state.editor.current_user,
    room:state.editor.current_room,
    users:state.editor.current_users,
    connecting:state.ws.CONNECTING,
    connected:state.ws.CONNECTED,
  }))
}
function EditableText({value,onChange,onSave, style}){
  const [editing,setEditing] = React.useState(false)
  let icon = <FaEdit style={{color: '#FFF'}} onClick={()=>setEditing(true)}/>
  let render = <span style={{...(style??{})}}>{value}</span>
  if( editing){
    icon = <FaSave style={{color: '#FFF'}} onClick={()=>setEditing(false)}/>
    render = <input value={value} onChange={onChange} />
  }
  const span1 = <div>{render} {icon}</div>
  return span1
}
export function AppBar(props){
  const {user,room,connecting,connected,users} = useAppBarSelector()
  const dispatch = useDispatch()
  let color = "black"
  let status_color = connected?'green':connecting?'yellow':"red"
  const style = {display:"flex",justifyContent:'space-between',width:'100%',height:'30px',
    backgroundColor: color}
  const style2 = {color:'#fff', padding: '5px'}
  const style_user = {...style2,marginRight:'20px'}
  return <div style={style} >
    <div style={style2}>{room?.payload} [{users?.length ?? '--'} Current Users]</div>
    <div style={{display:'flex',alignItems:'center'}}>
      <EditableText onChange={e=>dispatch(setUsername(e.currentTarget.value))} style={style_user} value={user?.payload} />
      <StatusLight style={{padding:'5px'}} color={status_color}/>
    </div>
  </div>
}
