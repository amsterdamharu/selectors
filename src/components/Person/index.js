import React from 'react';
import { useSelector } from 'react-redux';
import { createSelectPersonWithFriends } from '../../selectors';
import { Link } from 'wouter';
import { useRendered } from '../../hooks';
function PersonComponent({ person }) {
  const rendered = useRendered();
  const { name, totalFriends, friends } = person;
  return (
    <div>
      <h1>Rendered:{rendered} times</h1>
      <h2>Name: {name}</h2>
      <h3>Friends ({totalFriends}):</h3>
      <ul>
        {friends.map(({ id, name }) => (
          <ul key={id}>
            <Link href={`/person/${id}`}>{name}</Link>
          </ul>
        ))}
      </ul>
    </div>
  );
}
export default function Person({ params: { id } }) {
  const selectPerson = React.useMemo(
    () => createSelectPersonWithFriends(Number(id)),
    [id]
  );
  const person = useSelector(selectPerson);
  return <PersonComponent person={person} />;
}
