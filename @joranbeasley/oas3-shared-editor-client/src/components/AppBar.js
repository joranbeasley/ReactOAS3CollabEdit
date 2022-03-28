import React from "react";
import {useSelector} from "react-redux";
import {StatusLight} from "./Light";
import {FaEdit, FaSave} from "react-icons/fa";
// import {setUsername} from "../store";
function Bubble({stroke='#FFF',fill='#F00',fontColor='#FFF',
                  fontFamily='"Open Sans", sans-serif',hoverText='no hover text',children}){
  const style = {stroke,fill,fontSize:'15px',fontFamily,
    color:fontColor,backgroundColor: fill,
    borderRadius:'1rem',border:`2px solid ${stroke}`,display: 'inline-flex',
    width: '18px',height: '18px', justifyContent: 'center', alignContent: 'center',
    padding:'2px'}
  console.log("STYLE:",style)
  return <div title={hoverText} style={style}><div>{children}</div></div>
}
function UserBubble({userInfo}){
  const rngInt = (n)=> Math.round(Math.random()*n).toString()
  const genRngInts = (n,m)=>(new Array(n)).fill(m).map(rngInt).join(",")
  const fill = userInfo?.color
    ?? `rgb(${genRngInts(3,255)})`
  const fname = userInfo?.given_name ?? '?'
  const lname = userInfo?.family_name ?? '?'
  const cc = fname.substr(0,1).toUpperCase() + lname.substr(0,1).toUpperCase()
  return <Bubble hoverText={userInfo.email} fill={fill}>{cc}</Bubble>
}
function useAppBarSelector(){
  return useSelector(state=>({
    user:state.editor.current_user,
    room:state.editor.current_room,
    users:state.editor.current_users,
    connecting:state.ws.readyState === WebSocket.CONNECTING,
    connected:state.ws.readyState === WebSocket.OPEN,
  }))
}
function EditableText({value,onChange,onSave, style, editable=true}){
  const [editing,setEditing] = React.useState(false)
  let icon = <FaEdit style={{color: '#FFF'}} onClick={()=>setEditing(true)}/>
  let render = <span style={{...(style??{})}}>{value}</span>
  if( editing){
    icon = <FaSave style={{color: '#FFF'}} onClick={()=>setEditing(false)}/>
    render = <input value={value} onChange={onChange} />
  }
  const span1 = <div>{render} {editable && icon}</div>
  return span1
}
export function AppBar(props){
  const {user,room,connecting,connected,users} = useAppBarSelector()
  let color = "black"
  let status_color = connected?'green':connecting?'yellow':"red"
  let status_text = connected?'CONNECTED':connecting?'CONNECTING':'DISCONNECTED'
  const style = {display:"flex",justifyContent:'space-between',width:'100%',height:'30px',
    backgroundColor: color}
  console.log("status color?",status_color)
  const usersBubbles = users
    .filter(u=>(u.email !== user.email || u.color !== user.color) )
    .map(u=><UserBubble userInfo={u}></UserBubble>)
  const style2 = {color:'#fff', padding: '5px'}
  const style_user = {...style2,marginRight:'20px'}
  return <div style={style} >
    <div style={style2}>{room?.payload} [{users?.length ?? '--'} Current Users]</div>
    <div>
      {usersBubbles}
    </div>
    <div style={{display:'flex',alignItems:'center'}}>
      <UserBubble userInfo={user}/>
      <EditableText editable={false} style={style_user} value={user?.payload} />
      <StatusLight title={status_text} style={{padding:'5px'}} color={status_color}/>
    </div>
  </div>
}
