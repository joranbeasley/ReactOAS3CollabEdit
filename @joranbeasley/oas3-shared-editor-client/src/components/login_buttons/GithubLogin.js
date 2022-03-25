import React from 'react';
// import PropTypes from 'prop-types';

import PopupWindow from '../PopupWindow';
import { toQuery } from '../../util/utils';
import {FaGithub} from "react-icons/fa";


export function GitHubLogin({ clientId, scope, redirectUri,...props }){
  const onClick = ()=> {
    const search = toQuery({
      client_id: clientId,
      scope,
      redirect_uri: redirectUri,
    });
    const popup = PopupWindow.open(
      'github-oauth-authorize',
      `https://github.com/login/oauth/authorize?${search}`,
      {height: 1000, width: 600}
    );
    popup.then(result=>{
      (props.onSuccess??(r=>1))(result)
      console.log("GOT RESULT?:",result.code)
    })
  }
  return <button onClick={onClick}><FaGithub /> Login With Github</button>
}


export default GitHubLogin;
