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
const middleWares = [
  (store) => (next) => (action) =>
    console.log('first', action) ||
    next({ type: 'changed' }),
  (store) => (next) => (action) =>
    console.log('second', action) || next(action),
];
//this is what redux devtools returns, how is it called by redux?
const myCreateStore = (cs) => {
  console.log('ok, was called with:', cs);
  return (reducer, initialState) => {
    console.log('ignore original?', cs);
    let state = initialState;
    const subscriptions = new Map();
    const getState = () => initialState;
    const dispatch = (action) => {
      mw(action);
    };
    const mw = middleWares
      .map((mw) => mw({ getState, dispatch }))
      .reverse()
      .reduce(
        (acc, mw) => mw(acc),
        (action) => {
          console.log('got action:', action);
          state = reducer(state, action);
          subscriptions.forEach((fn) => fn());
        }
      );
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
};
// const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
// const store = createStore(reducer, /* preloadedState, */ composeEnhancers(
//     applyMiddleware(...middleware)
//   ));
const store = createStore(
  (state = defaultState, action) => {
    console.log('in reducer:', state, action);
    //reducer always returns a new state object but
    //  never change values this means components will
    //  never re render but selectors will be called
    //  every time an action dispatches
    return { ...state };
  },
  defaultState,
  myCreateStore
);
window.store = store;
store.dispatch({ type: 'ok' });
export default store;
