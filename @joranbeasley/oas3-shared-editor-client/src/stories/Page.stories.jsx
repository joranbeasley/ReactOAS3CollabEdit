import React from 'react';
import { within, userEvent } from '@storybook/testing-library';

import { Page } from './Page';
import {EditorPage} from "../pages/Editor";
import "brace/mode/yaml"
import "brace/theme/tomorrow_night_eighties"
import {Provider, useSelector} from "react-redux";
import store, {setYaml} from "../store"
export default {
  title: 'Example/EditorPage',
  component: EditorPage,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'fullscreen',
  },
};

const Template = (args) => {
  // const {yaml,json} = useSelector(state=>())
  const callbacks = {onChange:null,onSelectionChange:null}
  if (args.logChangeEvents){
    callbacks.onChange = (evt,documentSession)=>{
      console.log("ChangeEvt:",evt)
    }
    delete args.logChangeEvents
  }
  if(args.logChangeSelectionEvents){
    callbacks.onSelectionChange = (...args)=>{
      console.log("ON SELECTION CHANGE:",args,this)
    }
    delete args.logChangeSelectionEvents
  }
  return <Provider store={store}><EditorPage {...callbacks} {...args} /></Provider>;
}

// More on interaction testing: https://storybook.js.org/docs/react/writing-tests/interaction-testing
// export const LoggedOut = Template.bind({});

export const YamlEditorPage = Template.bind({});
YamlEditorPage.args = {
  logChangeEvents:true,
  logChangeSelectionEvents:true,
}
// LoggedIn.play = async ({ canvasElement }) => {
//   const canvas = within(canvasElement);
//   const loginButton = await canvas.getByRole('button', { name: /Log in/i });
//   await userEvent.click(loginButton);
// };
