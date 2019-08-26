import { createStore } from 'redux';
const createId = (c => () => ++c)(0);
const defaultState = {
  counters: [
    { id: createId(), a: 1 },
    { id: createId(), a: 1 },
  ],
};

const store = createStore(
  (state = defaultState, action) => {
    console.log('in the reducer', state, action);
    if (action.type === 'UP' || action.type === 'DOWN') {
      const direction = action.type === 'UP' ? 1 : -1;
      return {
        ...state,
        counters: state.counters.map(item =>
          item.id === action.id
            ? { ...item, a: item.a + direction }
            : item
        ),
      };
    }
    if (action.type === 'REMOVE') {
      return {
        ...state,
        counters: state.counters.filter(
          item => item.id !== action.id
        ),
      };
    }
    if (action.type === 'SOME') {
      return { ...state, counters: [...state.counters] };
    }
    if (action.type === 'ADD') {
      return {
        ...state,
        counters: state.counters.concat({
          id: createId(),
          a: 0,
        }),
      };
    }
    return state;
  },
  defaultState,
  window.__REDUX_DEVTOOLS_EXTENSION__ &&
    window.__REDUX_DEVTOOLS_EXTENSION__()
);

export default store;
