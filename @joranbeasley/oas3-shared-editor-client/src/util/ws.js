import EventEmitter from 'events'
export const WSS = process.env.REACT_APP_WSS;
export class JSocket{
  constructor(url=null,callbacks=null) {
    this.emitter = new EventEmitter()
    this.on = (e,cb)=>this.emitter.on(e,cb)
    this.once = (e,c)=>this.emitter.once(e,c)
    this.off = (e,cb)=>this.emitter.off(e,cb)
    this.emit = (e,pa)=>this.emitter.emit(e,pa)
    this.ws = null
    this._pending = []
    Object.keys(callbacks??{}).map(k=>this.emitter.on(k,callbacks[k]))
    if(url){
      this.connect_ws(url)
    }
  }

  connect_ws(url,callbacks){
    Object.keys(callbacks??{}).map(k=>this.emitter.on(k,callbacks[k]))

    this.ws = new WebSocket(url)
    this.ws.onmessage = m=>{
      try{
        this.emitter.emit("messageJSON",JSON.parse(m.data))
      }catch (e) {
        console.log(e)
        this.emitter.emit("messageUTF8", m.data)
      }
    }
    this._pending = []
    this.ws.onopen = ()=>{
      this._pending.map(this.ws.send)
      this.emitter.emit("open",this)
    }
    const p = new Promise(resolve=>{
      this.once("open",resolve)
    })
    this.emitter.on("messageJSON",data=>{
      if(data.event ?? data.type){
        this.emitter.emit(data.event??data.type,data.payload??data.data)
      }
    })

    this.ws.onclose = ()=>this.emitter.emit("close",this)
    return p
  }
  sendUTF8(messageUTF8){
    if(this.ws === null || this.ws.readyState !== WebSocket.OPEN){
      this._pending.push(messageUTF8)
    }else {
      return this.ws.send(messageUTF8)
    }
  }
  sendJSON(payload){
    return this.sendUTF8(JSON.stringify(payload))
  }
  sendEvent(event,payload){
    return this.sendJSON({event,payload})
  }
  static connect(url){
    return new Promise((resolve,reject) => {
      try {
        new JSocket(url, {open: resolve, close:(e)=>{
          console.log("SOCKET CLOSE:",e)
          reject(e)
          }})
      }catch (e){
        console.log('fail constructor???',e)
        reject(e)
      }
    })
  }
}
export const ws = new JSocket()
