import React from 'react';

import {GitHubLogin} from "../components/login_buttons/GithubLogin"
import {GoogleLoginButton} from "../components/login_buttons/GoogleLogin"
import GoogleLogin from "react-google-login";
import {action} from "@storybook/addon-actions";
// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/LoginButton',
  component: GitHubLogin,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    backgroundColor: { control: 'color' },
  },
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <GitHubLogin onSuccess={p => action("LOGIN SUCCESS")(p)} {...args} />;
const Template2 = (args) => <GoogleLogin onSuccess={p => action("LOGIN SUCCESS")(p.profileObj)} disabled={false} {...args} />;


export const GITHUB = Template.bind({});
GITHUB.args = {
  clientId: process.env.REACT_APP_GITHUB_CLIENT_ID ?? '<NONE>',
  redirect_uri: 'http://localhost:3000/',
}
export const GOOGLE = Template2.bind({});
GOOGLE.args = {
  clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID ?? '<NONE>',
  redirect_uri: 'http://localhost:3000/',
}
