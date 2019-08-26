import { createSelector } from 'reselect';
const selectData = (state) => state.data;
export const selectPeople = createSelector(
  selectData,
  (data) => data.people
);
export const createSelectPerson = (personId) =>
  createSelector(selectPeople, (people) =>
    people.find(({ id }) => id === personId)
  );
export const createSelectPersonWithFriends = (personId) =>
  createSelector(
    selectPeople,
    createSelectPerson(personId),
    (people, person) => ({
      ...person,
      friends: person.friends.map((personId) =>
        people.find(({ id }) => id === personId)
      ),
    })
  );
