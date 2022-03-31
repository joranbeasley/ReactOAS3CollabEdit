import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import {Provider} from "react-redux";
import store from "./store"
import ReduxToastr from "react-redux-toastr";
import * as Sentry from "@sentry/browser";
import { BrowserTracing } from "@sentry/tracing";
const release = process.env.REACT_APP_VERSION
const dsn = process.env.REACT_APP_SENTRY_DSN
console.log("INIT DSN:",dsn)
Sentry.init({
  dsn,

  // Alternatively, use `process.env.npm_package_version` for a dynamic release version
  // if your build tool supports it.
  release,
  integrations: [new BrowserTracing()],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,

});
const ToastrLayer = ()=>(<div style={{position: "absolute", zIndex: 5000}}>
        <ReduxToastr/>
      </div>)
ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App/>
      <ToastrLayer />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
