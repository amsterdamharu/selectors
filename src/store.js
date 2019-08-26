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
  (state = defaultState) => {
    //reducer always returns a new state object but
    //  never chanes values this means components will
    //  never re render but selectors will be called
    //  every time an action dispatches
    return { ...state };
  },
  defaultState,
  window.__REDUX_DEVTOOLS_EXTENSION__ &&
    window.__REDUX_DEVTOOLS_EXTENSION__()
);

export default store;
