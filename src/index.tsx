import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import {Auth0Provider} from "@auth0/auth0-react";
import reportWebVitals from './reportWebVitals';
import config from "./auth_config.json";
import history from "./utils/history";
import {AppState} from "@auth0/auth0-react/src/auth0-provider";

const onRedirectCallback = (appState : AppState) => {
    history.push(
        appState && appState.returnTo
            ? appState.returnTo
            : window.location.pathname
    );
};

ReactDOM.render(
    <Auth0Provider
        domain={config.domain}
        clientId={config.clientId}
        audience={config.audience}
        scope="account:admin"
        redirectUri={window.location.origin}
        onRedirectCallback={onRedirectCallback}>
        <React.StrictMode>
            <App/>
        </React.StrictMode>
    </Auth0Provider>,
    document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
