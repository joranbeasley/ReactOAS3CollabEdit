import React from "react";
import {SimpleWebsocketTerminal} from "../components/SimpleWebsocketTerminal";
import {Provider} from "react-redux";
import store from "../store"
export default {
  title: 'Example/WebsocketTerminal',
  component: SimpleWebsocketTerminal,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'fullscreen',
  },
};
const Template = (args)=>{
  const url = `ws://localhost:9000/?user=${args.user}&room=${args.room}`
  return <Provider store={store}><SimpleWebsocketTerminal ws_url={url}/></Provider>
}
export const Terminal = Template.bind({})
Terminal.args = {
  user:'bob',
  room:'a room'
}
