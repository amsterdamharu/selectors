import React from 'react';
import { useSelector } from 'react-redux';
import { selectPeople } from '../../selectors';
import { Link } from 'wouter';
import { useRendered } from '../../hooks';

function PeopleList({ people }) {
  const rendered = useRendered();
  return (
    <div>
      <h1>Rendered:{rendered} times</h1>
      <ul>
        {people.map((person) => (
          <li key={person.id}>
            <Link href={`/person/${person.id}`}>
              {person.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
export default function People() {
  const people = useSelector(selectPeople);
  return PeopleList({ people });
}
