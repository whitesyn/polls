import React from 'react';
import { Link } from 'react-router-dom';

import pollService from '../services/poll-service';
import { getSingletonInstance } from '../helpers/event-bus';

import PollListItem from './PollListItem';

class HomePage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      polls: [],
      error: ''
    };

    this.handleRemove = this.handleRemove.bind(this);
    this.handleVote = this.handleVote.bind(this);

    this.handleUpdatePollEvent = this.handleUpdatePollEvent.bind(this);
    this.handleDeletePollEvent = this.handleDeletePollEvent.bind(this);
    this.handleCreatePollEvent = this.handleCreatePollEvent.bind(this);

    const eventBus = getSingletonInstance();

    eventBus.addEventListener('CREATE_POLL', this.handleCreatePollEvent);
    eventBus.addEventListener('VOTE_POLL', this.handleUpdatePollEvent);
    eventBus.addEventListener('UPDATE_POLL', this.handleUpdatePollEvent);
    eventBus.addEventListener('DELETE_POLL', this.handleDeletePollEvent);

    this.eventBus = eventBus;
  }

  handleRemove(pollId) {
    pollService.remove(pollId).then(
      () => {},
      error => this.setState({ error })
    );
  }

  handleVote(pollId, score) {
    pollService.vote(pollId, score).then(
      updatedPoll => {},
      error => this.setState({ error })
    );
  }

  handleCreatePollEvent(e) {
    const { id, poll } = e.detail;

    const { polls } = this.state;
    let newPolls = [];
    if (polls && polls.length) {
      newPolls = [...polls];
    }

    const existingPollIndex = newPolls.findIndex(p => p.id === id);

    if (existingPollIndex !== -1) {
      return;
    }

    newPolls.push(poll);
    this.setState({ polls: newPolls });
  }

  handleUpdatePollEvent(e) {
    const { id, poll } = e.detail;

    const { polls } = this.state;
    if (!polls || !polls.length) {
      return;
    }
    const existingPollIndex = polls.findIndex(p => p.id === id);

    if (existingPollIndex !== -1) {
      polls.splice(existingPollIndex, 1, poll);
      this.setState({ polls: [...polls] });
    }
  }

  handleDeletePollEvent(e) {
    const { id } = e.detail;

    const { polls } = this.state;
    if (!polls || !polls.length) {
      return;
    }
    const existingPollIndex = polls.findIndex(p => p.id === id);

    if (existingPollIndex !== -1) {
      polls.splice(existingPollIndex, 1);
      this.setState({ polls: [...polls] });
    }
  }

  componentDidMount() {
    this.setState({
      polls: { loading: true }
    });
    pollService.getAll().then(polls => this.setState({ polls }));
  }

  componentWillUnmount() {
    this.eventBus.removeEventListener(
      'CREATE_POLL',
      this.handleCreatePollEvent
    );
    this.eventBus.removeEventListener('VOTE_POLL', this.handleUpdatePollEvent);
    this.eventBus.removeEventListener(
      'UPDATE_POLL',
      this.handleUpdatePollEvent
    );
    this.eventBus.removeEventListener(
      'DELETE_POLL',
      this.handleDeletePollEvent
    );
  }

  render() {
    const { polls, error } = this.state;

    return (
      <div className="col-md-12">
        <h1>Polls</h1>

        <p>
          <Link to="/add">Add poll</Link>
        </p>

        {polls.loading && <em>Loading polls...</em>}

        {error && <div className="alert alert-danger">{error}</div>}

        {!polls.length && !polls.loading && (
          <div className="alert alert-warning">No polls</div>
        )}

        {!!polls.length && (
          <div>
            <h2>All Polls:</h2>
            <ul className="list-group">
              {polls.map((poll, index) => (
                <PollListItem
                  key={poll.id}
                  poll={poll}
                  onRemoveClick={p => this.handleRemove(poll.id)}
                  onVoteChange={(p, score) => this.handleVote(poll.id, score)}
                />
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }
}

export default HomePage;
