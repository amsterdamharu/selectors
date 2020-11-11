import React from 'react';
import ReactDOM from 'react-dom';
import {
  createAsyncThunk,
  unwrapResult,
} from '@reduxjs/toolkit';

import { Provider, useDispatch } from 'react-redux';
import {
  createStore,
  applyMiddleware,
  compose,
} from 'redux';

// toggle reject
const reject = ((shouldReject) => () =>
  (shouldReject = !shouldReject))(true);
// test thunk action creator
const testAsyncThunk = createAsyncThunk(
  'some/test',
  //  arg is the argument passed to the action creator, can be ignored if not used
  async (arg, { rejectWithValue }) => {
    console.log('argument passed to action creator:', arg);
    if (reject()) {
      //return result of rejectWithValue call
      return rejectWithValue('rejected value');
    }
    return Promise.resolve('resolved value');
  }
);

const reducer = (state, { type, payload }) => {
  return state;
};
//creating store with redux dev tools
const composeEnhancers =
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(
  reducer,
  {},
  composeEnhancers(
    applyMiddleware(
      ({ dispatch, getState }) => (next) => (action) =>
        typeof action === 'function'
          ? action(dispatch, getState)
          : next(action)
    )
  )
);
const App = () => {
  const dispatch = useDispatch();
  return (
    <button
      onClick={() =>
        dispatch(testAsyncThunk('argument passed'))
          .then(
            (resolved) => {
              console.log('action resolved with', resolved);
              return resolved;
            },
            (rejected) =>
              // this never executes because promise returned
              //   by dispatch(tunkaction) will not reject
              console.log('action rejected with:', rejected)
          )
          .then(
            //after unwrap result you have a promise that will
            //  reject
            unwrapResult
          )
          .catch((err) =>
            console.log('rejected with...', err)
          )
      }
    >
      dispatch action{' '}
    </button>
  );
};

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
