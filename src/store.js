import { createStore } from 'redux';
const defaultState = {
  data: {
    people: [
      { id: 1, name: 'one', friends: [2, 3] },
      { id: 2, name: 'two', friends: [1, 3] },
      { id: 3, name: 'three', friends: [1, 2, 3] },
    ],
  },
};
const store = createStore(
  (state = defaultState, action) => {
    console.log('in reducer:', state, action);
    //reducer always returns a new state object but
    //  never change values this means components will
    //  never re render but selectors will be called
    //  every time an action dispatches
    return { ...state };
  },
  defaultState
);
const middleWares = [
  (store) => (next) => (action) =>
    console.log('first', action) || next(action),
  (store) => (next) => (action) =>
    console.log('second', action) || next(action),
];
const reducer = (state = defaultState, action) => {
  console.log('in reducer:', state, action);
  return state;
};
const myCreateStore = (reducer, initialState, next) => {
  if (typeof next === 'function') {
    return next(myCreateStore)(reducer, initialState);
  }
  let state = initialState;
  const subscriptions = new Map();
  const getState = () => state;
  const dispatch = (action) => {
    state = reducer(state, action);
    subscriptions.forEach((fn) => fn());
  };
  const subscribe = (fn) => {
    subscriptions.set(fn, fn);
    return () => {
      console.log('unsubbed');
      subscriptions.delete(fn);
    };
  };
  return {
    getState,
    dispatch,
    subscribe,
  };
};
function applyMiddleware(...wares) {
  return function (createStore) {
    return function () {
      const store = createStore.apply(void 0, arguments);

      const middlewareAPI = {
        getState: store.getState,
        dispatch: store.dispatch,
      };
      const _dispatch = wares
        .map((mw) => mw(middlewareAPI))
        .reverse()
        .reduce((acc, mw) => mw(acc), store.dispatch);

      return { ...store, dispatch: _dispatch };
    };
  };
}
// const wut = applyMiddleware(...middleWares)(myCreateStore)(
//   reducer
// );
// const wut = myCreateStore(
//   reducer,
//   defaultState,
//   applyMiddleware(...middleWares)
// );
const composeEnhancers =
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
const wut = myCreateStore(
  reducer,
  defaultState,
  composeEnhancers(applyMiddleware(...middleWares))
);

window.wut = wut;
wut.dispatch({ type: 'ok' });
export default store;
