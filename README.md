# reselect selectors example

Example app that uses [reselect](https://github.com/reduxjs/reselect) to select data from store.

Created with create-react-app so `yarn install` and `yarn start` (or npm).

Selectors can be found in [selectors.js](https://github.com/amsterdamharu/selectors/blob/master/src/selectors.js)

# What is a selector

A selector is a function that gets data from state and maybe calculate new values from that value. It can be used in react-redux connect or react-redux useSelector.

For example; if you want to get people from state and it is in state.data.people you can write a function like so: `state => state.data.people`. The problem with this is that you may at some point need to change the location of people or change the shape that people is stored in the state.

You can change the location when you descide that people should be in `state.data.apiResult.data` so you have to change all the functions. If you used reselect you only change one function: `const selectPeople = state => state.data.apiResult.data`. Or you can do even better and compose selectors.

## Composing selectors

To solve this you can use reselect that allows you to compose selectors. Composing selectors is using a previous selector to create a new one.

Reselect has a function called `createSelector` that takes 2 arguments. The first is an array of functions and the second is a single function. It will return a function. Here is an example of a composed selector to get people:

```js
const selectData = (state) => state.data;
const selectPeople = createSelector(
  [selectData],
  (data) => data.people
);
```

The first argument is an array of one of more functions, in the selectPeople example it is one function that selects data. The second argument is a function that gets the returned values of the array of functions from the first argument so in this case it gets `state.data`. The last function then selects people from data and returns that.

The implementation of where `state.data` is located is only defined once, if you change it later to `state.data.apiResult` you only need to modify one function.

Here is another example with multiple selectors where it gets the firstName and lastName of the first person in people:

```js
const selectData = (state) => state.data;
const selectPeople = createSelector(
  [selectData],
  (data) => data.people
);
const selectFirstPerson = createSelector(
  [selectPeople],
  (people) => people[0]
);
const selectFirstName = createSelector(
  [selectFirstPerson],
  (person) => person.firstName
);
const selectLastName = createSelector(
  [selectFirstPerson],
  (person) => person.lastName
);
const selectFirstlastName = createSelector(
  [selectFirstName, selectLastName],
  (firstName, lastName) => ({ firstName, lastName })
);
const name = selectFirstlastName({
  data: {
    //selectData will get state.data
    people: [
      //selectPeople will get state.data.people
      {
        //selectFirstPerson will get state.data.people[0]
        //selectFirstName uses selectFirstPerson and gets firstName from that person
        firstName: 'Ruby',
        //selectLastName uses selectFirstPerson and gets lastName from that person
        lastName: 'Rose',
      },
    ],
  },
}); //name is {firstName:"Ruby",lastName:"Rose"}
```

The first argument to createSelector creating `selectFirstlastName` is an array with `selectFirstName` and `selectLastName`. The second argument to createSelector is a function that takes 2 arguments the first is `firstName` that came from `selectFirstName` and the second argument is `lastName` that comes from `selectLastName`.

The problem with the code is that it only gets first person from the array, what if I want to get a person who's first name is Ben?

## Curry

In order to make a selector that finds people whose first name is "Ben" or another name I need a selectPeopleByName that takes the state and a name as an argument. You can pass multiple arguments to a selector but I will use a curried function instead.

A curried function is a function that takes one or more arguments and returns a new function. Here is an example of a curried function named `createMultiplier` that takes multiplier and returns a function that takes a number and when you call that function with a number it will multiply that number with multiplier.

```js
const createMultiplier = (multiplier) => (number) =>
  number * multiplier;
const timesTen = createMultiplier(10);
const timesThree = createMultiplier(3);

timesTen(3); //30
timesThree(3); //9
timesTen(timesThree(2) /** 2*3=6 */); //60
```

The multiplier argument is available in closure scope. You can say that the function returned (timesTen and timesThree) closes over the multiplier argument.

## Parameterized selector

Lets create a curried selector named `createSelectPeopleByFirstName` that will get a first name and return a selector function that receives the state and returns an array of people where the first name is what you passed to `createSelectPeopleByFirstName` (a curried function that closes over firstName)

```js
const selectPeople = (state) => state.people;
const createSelectPeopleByFirstName = (firstName) =>
  createSelector([selectPeople], (people) =>
    people.filter(
      (person) => person.firstName === firstName
    )
  );

const state = {
  people: [{ firstName: 'Ben' }, { firstName: 'Jerry' }],
};
const peopleNamedBen =
  createSelectPeopleByFirstName('Ben')(state);
const peopleNamedJerry =
  createSelectPeopleByFirstName('Jerry')(state);
```

## Memoization

Functions created with `createSelector` are memoized, this means that when the functions in the array passed as the first argument return the same value as when you called it last time the function as the second argument is not called and the value that was returned last time is returned instead.

Here is an example that is not memoized:

```js
const state = { firstName: 'Ben', lastName: 'Stiller' };
const selectPersonFormatted = (state) => ({
  fullName: `${state.firstName} ${state.lastName}`, //returns new object every time
});
const one = selectPersonFormatted(state);
const two = selectPersonFormatted(state);
//this is false because selectPersonFormatted creates a new object every
//  time it's called
console.log(one === two);
```

When we use createSelector then not only do we split up how to get fist and last name but we also get memoized result:

```js
const state = { firstName: 'Ben', lastName: 'Stiller' };
const selectFirstName = (state) => state.firstName;
const selectLastName = (state) => state.lastName;
const selectPersonFormatted = createSelector(
  [selectFirstName, selectLastName],
  //if firstName and lastName didn't change from what
  //  it was in the last call then the next function isn't
  //  called and previous value is returned instead
  (firstName, lastName) => ({
    fullName: `${firstName} ${lastName}`,
  })
);
const one = selectPersonFormatted(state);
const two = selectPersonFormatted(state);
//this is true, selectPersonFormatted is memoized because selectFirstName
//  and selectLastName return the same value both times they are called
console.log(one === two);
```

## Parameterized and memoized

The example showing memoized selector only takes state as an argument. In this part I'll show how to create a memoized selector that takes a parameter to be used in components. We want to select a person by id. There is a list of ids that List component renders as Items:

```js
const List = ({ items }) => (
  <ul>
    {items.map((item) => (
      <Item key={item.id} id={item.id} />
    ))}
  </ul>
);
```

The Item component gets a prop named id and will use that to select the item from state, here is the selector for that:

```js
const selectItems = (state) => state.items;
const createSelectItemById = (itemId) =>
  createSelector([selectItems], (items) => {
    const item = items.find(({ id }) => id === itemId);
    //if you just return the item here then memoization
    //  doesn't matter, it will always return the same
    //  item, you could still use useMemo in your
    //  component to skip the find code but if you
    //  return a new reference like below then I would
    //  certainly use useMemo in the component so Item
    //  components in the list won't needlessly re render
    //  Actual DOM re render may not happen depending
    //  on the jsx returned and the code properly using
    //  useCallback for handlers you may pass as jsx
    //  properties
    return {
      ...item,
      fullName: `${item.first} ${item.last}`,
    };
  });
```

Here is a how to use it wrong in the Item component:

```js
const Item = ({ id }) => {
  const selectItemById = createSelectItemById(id);
  const item = useSelector(selectItemById);
};
```

Every time Item renders the `selectItemById` is created again and nothing is memoized because each render re creates the selector. To solve this we can use `React.useMemo`. Here is the correct way to use `createSelectItemById`.

```js
const Item = ({ id }) => {
  //selectItemById is only re created when id changes
  const selectItemById = React.useMemo(
    () => createSelectItemById(id),
    [id]
  );
  const item = useSelector(selectItemById);
};
```

Now when List renders multiple Item component each Item component will have it's own `selectItemById` selector that is not re created unless the id prop changes.

## Performance

Having your results memoized means that when an action is dispatched that changes something in state that is not relevant to your component then your component won't re render. This can improve performance and prevent unneeded re renders but does cost a little as well. As you can see with the previous example; each item creates a `selectItemById` function and that function is a selector created with reselect so it's 2 memoized curried functions that take time to be created and take up memory.

If your component often re renders when it should not then memoization will help. But if your component re renders because it needs to (state that it is using has changed so it will render something different) then creating all these memoized curried functions does not do much since they are just re created every time.

In this sample application all the selectors used are [here](https://github.com/amsterdamharu/selectors/blob/master/src/selectors.js). There is an action dispatched when clicking on the "dispatch unrelated" link that will [re create state without changing any values](https://github.com/amsterdamharu/selectors/blob/master/src/store.js#L13-L19) and you can see that when clicking on the link it does not cause unneeded renders.
