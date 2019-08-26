import React from 'react';
import { useSelector } from 'react-redux';
import { createSelectPersonWithFriends } from '../../selectors';
import { Link } from 'wouter';
import { useRendered } from '../../hooks';
function PersonComponent(person) {
  const rendered = useRendered();
  return (
    <div>
      <h1>Rendered:{rendered} times</h1>
      <h2>Name: {person.name}</h2>
      <h3>Friends:</h3>
      <ul>
        {person.friends.map((person) => (
          <ul key={person.id}>
            <Link href={`/person/${person.id}`}>
              {person.name}
            </Link>
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
  return PersonComponent(person);
}
