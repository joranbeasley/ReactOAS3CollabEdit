import React from 'react';
import {action} from "@storybook/addon-actions"
// import { Header } from './Header';
import {LoginPage} from "../pages/LoginPage"
export default {
  title: 'Example/LoginPage',
  component: LoginPage,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'fullscreen',
  },
};

const Template = ({redirect_uri,google_client_id,github_client_id}) => {
  return <LoginPage onSuccess={(v)=>{
    action("Login Success")(v)
  }} {...{redirect_uri,google_client_id,github_client_id}} />;
}

export const LoginForm = Template.bind({});
LoginForm.args = {
    google_client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID ?? '',
    github_client_id: process.env.REACT_APP_GITHUB_CLIENT_ID ?? '',
    redirect_uri: 'http://localhost:3000',
};
//
// export const LoggedOut = Template.bind({});
// LoggedOut.args = {};
