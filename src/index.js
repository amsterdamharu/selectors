import * as React from 'react';
import ReactDOM from 'react-dom';
import * as Redux from 'redux';
import * as ReactRedux from 'react-redux';
import * as Reselect from 'reselect';
import * as immer from 'immer';

const { Provider, useDispatch, useSelector } = ReactRedux;
const { createStore, applyMiddleware, compose } = Redux;
const { createSelector } = Reselect;
const { produce } = immer;
const later = (value) =>
  new Promise((resolve) =>
    setTimeout(() => resolve(value), 2000)
  );
//fake api
const api = (() => {
  const data = new Array(30)
    .fill()
    .map((_, i) => ({ id: i + 1 }));
  return {
    get: (query) => {
      if (query.id) {
        const item = data.find(({ id }) => id === query.id);
        return later(
          item ? item : Promise.reject('not found')
        );
      }
      const { page, size } = query;
      return later(
        data.slice((page - 1) * size, page * size)
      );
    },
  };
})();

//action types
const ASYNC_REQUESTED = 'ASYNC_REQUESTED';
const ASYNC_SUCCEEDED = 'ASYNC_SUCCEEDED';
const ASYNC_FAILED = 'ASYNC_FAILED';
//action creators
const asyncRequested = (query) => ({
  type: ASYNC_REQUESTED,
  payload: query,
});
const asyncSucceeded = ({ query, result }) => ({
  type: ASYNC_SUCCEEDED,
  payload: { query, result },
});
const asyncFailed = ({ query, error }) => ({
  type: ASYNC_FAILED,
  payload: { query, error },
});
const asyncGetData = (query) => (dispatch, getState) => {
  dispatch(asyncRequested(query));
  api
    .get(query)
    .then((result) =>
      dispatch(asyncSucceeded({ result, query }))
    )
    .catch((error) =>
      dispatch(asyncFailed({ error, query }))
    );
};
//helper to convert query to object property key
const asKey = (query) => JSON.stringify(query);
//initialize the store
const reducer = (state, { type, payload }) => {
  if (type === ASYNC_REQUESTED) {
    const query = payload;
    if (query.id) {
      return produce(state, (draft) => {
        draft.data.items[query.id] = {
          ...state.data.items[query.id],
          ...LAOADING,
        };
      });
    }
    return produce(state, (draft) => {
      draft.data.queries[asKey(query)] = {
        ...state.data.queries[asKey(query)],
        ...LAOADING,
      };
    });
  }
  if (type === ASYNC_FAILED) {
    const { query, error } = payload;
    if (query.id) {
      return produce(state, (draft) => {
        draft.data.items[query.id] = {
          ...state.data.items[query.id],
          ...AVAILABLE,
          error,
        };
      });
    }
  }
  if (type === ASYNC_SUCCEEDED) {
    const { query, result } = payload;
    if (query.id) {
      return produce(state, (draft) => {
        draft.data.items[query.id] = {
          ...state.data.items[query.id],
          ...asResult(result),
        };
      });
    }
    return produce(state, (draft) => {
      draft.data.queries[asKey(query)] = asResult(
        result.map(({ id }) => id)
      );
      draft.data.items = result.reduce(
        (items, item) => {
          items[item.id] = asResult(item);
          return items;
        },
        { ...state.data.items }
      );
    });
  }
  return state;
};
const composeEnhancers =
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(
  reducer,
  { data: { queries: {}, items: {} } },
  composeEnhancers(
    applyMiddleware(
      ({ dispatch, getState }) => (next) => (action) =>
        typeof action === 'function'
          ? action(dispatch, getState)
          : next(action)
    )
  )
);

//a result (promise represented as object literal) has 4 properties
//  loading, requested, error and value if result is available
//  then value can be used
const AVAILABLE = {
  loading: false,
  requested: true,
  error: false,
};
const LAOADING = {
  loading: true,
  requested: true,
  error: false,
};
const NOT_REQUESTED = {
  loading: false,
  error: false,
  requested: false,
};
// if an item has a loading, requested and error prop then it is
//   an async result (promise represented as object literal)
const isResult = (item) =>
  ['loading', 'requested', 'error'].reduce(
    (result, key) => result && item.hasOwnProperty(key),
    true
  );
//forces the item to be a result, if you pass for example the
//  value 2 as item then it will return
//  {loading:false,error:false,requested:true,value:2}
const asResult = (item) =>
  isResult(item)
    ? item
    : {
        ...AVAILABLE,
        value: item,
      };
//gets a result and returns if it is available, this means
//  loading and error is false and requested is true
const isAvailable = (result) =>
  !result.loading && !result.error && result.requested;
// first argument is an array of results if all results are available
//   then the second argument recieves all the result values and returns
//   what the second argument returns, second argument is a modifier function
const resultsModifier = (results, callback) => {
  const resultValues = results.map(asResult);
  const notAvailable = resultValues.find(
    (result) => !isAvailable(result)
  );
  return (
    notAvailable ||
    asResult(
      callback(resultValues.map((result) => result.value))
    )
  );
};
//helper that gets a result and indicates if it was requested
const isRequested = (result) => result.requested;
//custom hook that will dispatch getting the result if it was
//  not requested
const useRequest = (query, result) => {
  const dispatch = useDispatch();
  React.useEffect(() => {
    isRequested(result) || dispatch(asyncGetData(query));
  }, [dispatch, query, result]);
};
//selectors
const selectData = (state) => state.data;
const selectQueries = createSelector(
  [selectData],
  (data) => data.queries
);
const createSelectQuery = (queryKey) =>
  createSelector(
    [selectQueries],
    (queries) => queries[queryKey] || NOT_REQUESTED
  );
const createSelectQueryItems = (queryKey) =>
  createSelector(
    [createSelectQuery(queryKey), selectItems],
    (queryResult, items) =>
      resultsModifier([queryResult], ([ids]) =>
        resultsModifier(
          ids.map((id) => items[id] || NOT_REQUESTED),
          (items) => ({ items })
        )
      )
  );
const selectItems = createSelector(
  [selectData],
  (data) => data.items
);
const createSelectItem = (id) =>
  createSelector(
    [selectItems],
    (items) => items[id] || NOT_REQUESTED
  );
//HOC components that gets a result and shows loading or error
const DefaultLoadingComponent = () => 'Loading...';
const DefaultErrorComponent = ({ error }) =>
  `there was an error: ${error}`;
const withLoading = (
  Component,
  LoadingComponent = DefaultLoadingComponent
) => ({ loading, ...props }) =>
  loading ? <LoadingComponent /> : <Component {...props} />;
const withNotRequested = (
  Component,
  NotRequested = DefaultLoadingComponent
) => ({ requested, ...props }) =>
  !requested ? <NotRequested /> : <Component {...props} />;

const withError = (
  Component,
  Error = DefaultErrorComponent
) => ({ error, ...props }) =>
  error ? (
    <Error error={error} />
  ) : (
    <Component {...props} />
  );
const withValue = (Component) => ({ value, ...props }) => (
  <Component {...props} {...value} />
);
const withResult = compose(
  withError,
  withNotRequested,
  withLoading,
  withValue
);

const Item = ({ item }) => (
  <pre>{JSON.stringify(item, undefined, 2)}</pre>
);
const ResultItem = withResult(Item);
const ItemContainer = React.memo(function ItemContainer(
  props
) {
  const selectItem = React.useMemo(
    () => createSelectItem(props.id),
    [props.id]
  );
  const itemResult = resultsModifier(
    [useSelector(selectItem)],
    ([item]) => ({ item })
  );
  useRequest({ id: props.id }, itemResult);
  return <ResultItem {...itemResult} />;
});
const Items = React.memo(function Items({ items }) {
  return (
    <ul>
      {items.map(({ id }) => (
        <li key={id}>
          <ItemContainer id={id} />
        </li>
      ))}
    </ul>
  );
});
const ResultItems = withResult(Items);
const ItemsContainer = React.memo(function ItemsContainer({
  query,
}) {
  const selectItems = React.useMemo(
    () => createSelectQueryItems(asKey(query)),
    [query]
  );
  const itemsResult = useSelector(selectItems);
  useRequest(query, itemsResult);

  return <ResultItems {...itemsResult} />;
});
const Pagination = React.memo(function Pagination({
  page,
  go,
}) {
  return (
    <div>
      <button onClick={() => go(page - 1)}>{'<'}</button>
      {page}
      <button onClick={() => go(page + 1)}>{'>'}</button>
    </div>
  );
});
const Page = React.memo(function Page() {
  const [page, setPage] = React.useState(1);
  const go = React.useCallback(
    (num) => num > 0 && setPage(num),
    []
  );
  return (
    <div>
      <Pagination go={go} page={page} />
      <ItemsContainer query={{ page, size: 5 }} />
      <Pagination go={go} page={page} />
    </div>
  );
});
const App = () => {
  return (
    <div>
      <h1>non existing item</h1>
      <ItemContainer id="nope" />
      <h1>paged list</h1>
      <Page />
    </div>
  );
};
window.store = store;
ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
