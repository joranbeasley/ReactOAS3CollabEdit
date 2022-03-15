import React from "react";

export function WebsocketPlayground({style}){
  const OPTIONS = ['CURSOR_UPDATE','CHANGE'                                   ]
  const [evt,setEvt] = React.useState()
  const [payload,setPayload] = React.useState()
  return <div style={{width:'100%',height:'100%',display:'block',...(style||{})}}>
      <select id="fruit" onChange={this.change} value={this.state.value}>
                  <option value="select">Select</option>
                  <option value="Apples">Apples</option>
                  <option value="Mangoes">Mangoes</option>
     </select>
  </div>
}
