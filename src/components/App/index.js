import React, { useMemo } from 'react';
import { defaultMemoize as memoize } from 'reselect';
import { useSelector, useDispatch } from 'react-redux';

const CounterComp = props => {
  console.log('component render', props);
  return (
    <div>
      <div>{props.b}</div>
      <div>
        <button onClick={props.up}>UP</button>
        <button onClick={props.down}>DOWN</button>
        <button onClick={props.remove}>REMOVE</button>
      </div>
    </div>
  );
};
const mapStateToProps = () => {
  console.log('creating memoize function');
  const createState = memoize(item => {
    console.log('calling create state with:', item);
    return { ...item, b: item.a };
  });
  return (state, { id }) => {
    const item = state.counters.find(
      item => item.id === id
    );
    return createState(item);
  };
};
const Counter = props => {
  const createState = useMemo(mapStateToProps, []);
  const dispatch = useDispatch();
  const { ID: id } = props;
  const state = useSelector(state => {
    console.log('State changed for:', id);
    return createState(state, { id });
  });
  const mergedState = useMemo(
    () => ({
      ...state,
      up: () => dispatch({ type: 'UP', id }),
      down: () => dispatch({ type: 'DOWN', id }),
      remove: () => dispatch({ type: 'REMOVE', id }),
    }),
    [state, id, dispatch]
  );
  return useMemo(() => CounterComp(mergedState), [
    mergedState,
  ]);
};

const List = props => {
  const { counters, none, add } = props;
  console.log('parent render', counters);
  return (
    <div>
      <button onClick={add}>Add</button>
      <button onClick={none}>No Change</button>
      {counters.map(({ id }) => (
        <Counter key={id} ID={id} />
      ))}
    </div>
  );
};

export default () => {
  const state = useSelector(state => state);
  const dispatch = useDispatch();
  const mergedState = useMemo(
    () => ({
      ...state,
      add: () => dispatch({ type: 'ADD' }),
      none: () => dispatch({ type: 'NONE' }),
    }),
    [state, dispatch]
  );
  return useMemo(() => List(mergedState), [mergedState]);
};
