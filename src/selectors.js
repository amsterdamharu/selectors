import { createSelector } from 'reselect';
const selectData = (state) => state.data;
export const selectPeople = createSelector(
  selectData,
  (data) => data.people
);
const createSelectPerson = (personId) =>
  createSelector(selectPeople, (people) =>
    people.find(({ id }) => id === personId)
  );
export const createSelectPersonWithTotalFriends = (
  personId
) =>
  createSelector(
    createSelectPerson(personId),
    (person) => ({
      ...person,
      totalFriends: person.friends.length,
    })
  );
export const createSelectPersonWithFriends = (personId) =>
  createSelector(
    selectPeople,
    createSelectPersonWithTotalFriends(personId),
    (people, person) => ({
      ...person,
      friends: person.friends.map((personId) =>
        people.find(({ id }) => id === personId)
      ),
    })
  );
