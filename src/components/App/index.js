import React, { useCallback, useState } from 'react';
import { check } from './tokenAction';

export default function App() {
  const [response, setResponse] = useState({});
  const click = useCallback(
    () =>
      check().then(
        (response) => setResponse(response),
        (error) => console.log('some error:', error)
      ),
    []
  );
  return (
    <div>
      <div>
        <button onClick={click}>get token</button>
      </div>
      <div>
        <pre>{JSON.stringify(response, undefined, 2)}</pre>
      </div>
    </div>
  );
}
