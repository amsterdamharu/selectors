import * as React from 'react';
import ReactDOM from 'react-dom';
import * as Redux from 'redux';
import * as ReactRedux from 'react-redux';
import * as Reselect from 'reselect';

const { Provider, useDispatch, useSelector } = ReactRedux;
const { createStore, applyMiddleware, compose } = Redux;
const { createSelector } = Reselect;
const { useState, memo } = React;

const id = ((num) => () => num++)(1);
const initialState = {
  comments: [],
};
//action types
const ADD_COMMENT = 'ADD_COMMENT';
//action creators
const addComment = (comment) => ({
  type: ADD_COMMENT,
  payload: comment,
});
const reducer = (state, { type, payload }) => {
  if (type === ADD_COMMENT) {
    return {
      ...state,
      comments: [payload, ...state.comments],
    };
  }
  return state;
};
//selectors
const selectComments = (state) => state.comments;
const selectCommentsMap = createSelector(
  [selectComments],
  (comments) =>
    comments.reduce(
      (comments, comment) =>
        comments.set(comment.id, comment),
      new Map()
    )
);
const recursiveUpdate = (updated, nestedMap) => {
  const recur = (updated) => {
    nestedMap.set(updated.id, updated);
    if (updated.id === 'root') {
      return;
    }
    const parent = nestedMap.get(updated.pid);
    const newParent = {
      ...parent,
      children: parent.children.map((child) =>
        child.id === updated.id ? updated : child
      ),
    };
    return recur(newParent);
  };
  return recur(updated, nestedMap);
};
const addNewComment = (comment, nestedMap) => {
  comment = { ...comment, children: [] };
  nestedMap.set(comment.id, comment);
  const parent = nestedMap.get(comment.pid);
  const updatedParent = {
    ...parent,
    children: [comment, ...parent.children],
  };
  recursiveUpdate(updatedParent, nestedMap);
};
const selectGroupedComments = (() => {
  const nestedMap = new Map([
    ['root', { id: 'root', children: [] }],
  ]);
  return createSelector(
    [selectCommentsMap],
    (currentMap) => {
      [...currentMap.entries()].forEach(([id, comment]) => {
        //add comment to nestedComments
        if (!nestedMap.get(id)) {
          addNewComment(comment, nestedMap);
        }
      });
      //I let you figure out how to remove a comment
      //  [...nestedMap.entries()].forEach
      //    check if id is not in curentMap
      return nestedMap.get('root').children;
    }
  );
})(); //IIFE

//creating store with redux dev tools
const composeEnhancers =
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(
  reducer,
  initialState,
  composeEnhancers(
    applyMiddleware(() => (next) => (action) =>
      next(action)
    )
  )
);
const AddComment = memo(function AddComment({
  pid = 'root',
}) {
  const [text, setText] = useState('');
  const dispatch = useDispatch();
  return (
    <div>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        onClick={() => {
          dispatch(addComment({ text, id: id(), pid }));
          setText('');
        }}
      >
        Add comment to {pid}
      </button>
    </div>
  );
});
const Comment = memo(function Comment({ comment }) {
  const { id, text, children } = comment;
  console.log('rendering comment:', id);
  return (
    <li>
      <h3>
        comment: {text}, id: {id}
      </h3>
      <Comments key={id} comments={children} />
      <AddComment pid={id} />
    </li>
  );
});
const Comments = memo(function Comments({ comments }) {
  return (
    <div>
      {Boolean(comments.length) && (
        <ul>
          {comments.map((comment) => (
            <Comment key={comment.id} comment={comment} />
          ))}
        </ul>
      )}
    </div>
  );
});
const App = () => {
  React.useEffect(test, []);
  const comments = useSelector(selectGroupedComments);
  return (
    <div>
      <Comments comments={comments} />
      <AddComment pid="root" />
    </div>
  );
};

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);

function test() {
  [id(), id(), id()].forEach((id) =>
    store.dispatch({
      type: 'ADD_COMMENT',
      payload: {
        text: 'root',
        id,
        pid: 'root',
      },
    })
  );
  [id(), id(), id()].forEach((id) =>
    store.dispatch({
      type: 'ADD_COMMENT',
      payload: {
        text: '1',
        id,
        pid: 1,
      },
    })
  );
  [id(), id(), id()].forEach((id) =>
    store.dispatch({
      type: 'ADD_COMMENT',
      payload: {
        text: '6',
        id,
        pid: 6,
      },
    })
  );
}
