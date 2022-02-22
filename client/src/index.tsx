import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
  split
} from '@apollo/client';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';

import { BrowserRouter } from 'react-router-dom';

import { DEV_SERVER_URI, DEV_WS_SERVER_URI } from './constants';

const wsLink = new WebSocketLink({
  uri: process.env.NODE_ENV === 'production'
    ? window.location.origin.replace(/^http/, 'ws') + '/graphql'
    : `${DEV_WS_SERVER_URI}/graphql`,
  options: {
    reconnect: true
  }
});

const httpLink = createHttpLink({
  uri: process.env.NODE_ENV === 'production'
    ? '/graphql'
    : `${DEV_SERVER_URI}/graphql`,
  credentials: process.env.NODE_ENV === 'production'
    ? 'same-origin'
    : 'include'
});

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink,
);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
})

ReactDOM.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <BrowserRouter>
          <App />
      </BrowserRouter>
    </ApolloProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
