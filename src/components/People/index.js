import React from 'react';
import { useSelector } from 'react-redux';
import {
  selectPeople,
  createSelectPersonWithTotalFriends,
} from '../../selectors';
import { Link } from 'wouter';
import { useRendered } from '../../hooks';
function Person({ person }) {
  const selectPerson = React.useMemo(
    () => createSelectPersonWithTotalFriends(person.id),
    [person.id]
  );
  const { id, name, totalFriends } = useSelector(
    selectPerson
  );
  const rendered = useRendered();
  return (
    <li>
      <Link href={`/person/${id}`}>
        {name} (friends:{totalFriends}) [rendered:{rendered}{' '}
        times ]
      </Link>
    </li>
  );
}
function PeopleList({ people }) {
  const rendered = useRendered();
  return (
    <div>
      <h1>Rendered:{rendered} times</h1>
      <ul>
        {people.map((person) => (
          <Person key={person.id} person={person} />
        ))}
      </ul>
    </div>
  );
}
export default function People() {
  const people = useSelector(selectPeople);
  return PeopleList({ people });
}
