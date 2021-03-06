import React from 'react';
import ReactDOM from 'react-dom';
import './styles.css';
import {Provider} from 'react-redux';
import * as serviceWorker from './serviceWorker';
import CssBaseline from "@material-ui/core/CssBaseline";
import axios from 'axios';
import App from './app/app';
import { store } from './app/store/store';

axios.interceptors.response.use(
  response => {
    return response;
  },
  function(error) {
    if (error.response.status === 400) {
      alert(error.response.data?.data);
    }
    return Promise.reject(error.response);
  }
);

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <CssBaseline/>
      <App/>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
