import React from 'react';
import { Link } from 'react-router-dom';

function PollListItem(props) {
  const { poll, onRemoveClick, onVoteChange } = props;

  return (
    <li className="list-group-item" key={poll.id}>
      <span className="label label-info">By: {poll.user}</span>
      &nbsp;
      <span className="label label-success">
        Created At:&nbsp;
        {new Date(poll.createdAt * 1000).toLocaleString()}
      </span>
      &nbsp;
      <span className="label label-default">
        Updated At:&nbsp;
        {new Date(poll.updatedAt * 1000).toLocaleString()}
      </span>
      <h3>{poll.title}</h3>
      <p>{poll.description}</p>
      <div>
        <b>All Votes:</b>&nbsp;
        <React.Fragment>
          {poll.votes &&
            Object.keys(poll.votes).map(user => {
              return (
                <span key={user}>
                  <span className="label label-info">
                    {user}: {poll.votes[user]}
                  </span>
                  &nbsp;
                </span>
              );
            })}
        </React.Fragment>
      </div>
      <div>
        Vote:
        <select onChange={e => onVoteChange(poll, e.target.value)}>
          <option disabled>Select your vote</option>
          <option value="0">0</option>
          <option value="0.5">0.5</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="5">5</option>
          <option value="8">8</option>
          <option value="13">13</option>
        </select>
      </div>
      <div>
        <Link to={`/edit/${poll.id}`}>
          <button type="button" className="btn btn-info btn-xs">
            Edit
          </button>
        </Link>
        &nbsp;
        <button
          type="button"
          className="btn btn-danger btn-xs"
          onClick={() => onRemoveClick(poll)}
        >
          Remove
        </button>
      </div>
    </li>
  );
}

export default PollListItem;
