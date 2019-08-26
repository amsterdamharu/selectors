import React from 'react';
import { Link, Route } from 'wouter';
import { useDispatch } from 'react-redux';
import People from '../People';
import Person from '../Person';
import { none } from '../../actions';

export default function App() {
  const dispatch = useDispatch();
  const dispatchUnrelated = React.useCallback(
    (e) => {
      e.preventDefault();
      dispatch(none());
    },
    [dispatch]
  );
  return (
    <div>
      <Link href="/">Home</Link>&nbsp;
      <a href="/" onClick={dispatchUnrelated}>
        dispatch unrelated
      </a>
      <Route path="/" component={People} />
      <Route path="/person/:id" component={Person} />
    </div>
  );
}
