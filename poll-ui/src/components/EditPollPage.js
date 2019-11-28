import React from 'react';
import { Link } from 'react-router-dom';

import pollService from '../services/poll-service';

class EditPollPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      pollId: '',
      poll: {
        title: '',
        description: ''
      },
      submitted: false,
      loading: false,
      error: ''
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    const {
      match: { params }
    } = this.props;

    this.setState({
      pollId: params.pollId,
      loading: true
    });

    pollService.get(params.pollId).then(
      poll => this.setState({ poll: poll, loading: false }),
      error => this.setState({ error, loading: false })
    );
  }

  handleChange(e) {
    const { name, value } = e.target;

    const { poll } = this.state;
    poll[name] = value;

    this.setState({ poll: { ...poll } });
  }

  handleSubmit(e) {
    e.preventDefault();

    this.setState({ submitted: true });
    const { pollId, poll } = this.state;

    // stop here if form is invalid
    if (!poll.title.trim() || !poll.description.trim()) {
      return;
    }

    this.setState({ loading: true });
    pollService.update(pollId, poll).then(
      p => {
        const { from } = this.props.location.state || {
          from: { pathname: '/' }
        };
        this.props.history.push(from);
      },
      error => this.setState({ error, loading: false })
    );
  }

  render() {
    const { poll, submitted, loading, error } = this.state;

    const isEmptyTitle = !poll.title.trim();
    const isEmptyDescription = !poll.description.trim();

    return (
      <div className="col-md-12">
        <h1>Edit poll</h1>

        <p>
          <Link to="/">Back to Home Page</Link>
        </p>

        <form name="form" onSubmit={this.handleSubmit}>
          <div
            className={
              'form-group' + (submitted && isEmptyTitle ? ' has-error' : '')
            }
          >
            <label htmlFor="title">Title</label>
            <input
              type="text"
              className="form-control"
              name="title"
              value={poll.title}
              onChange={this.handleChange}
            />
            {submitted && isEmptyTitle && (
              <div className="help-block">Title is required</div>
            )}
          </div>
          <div
            className={
              'form-group' +
              (submitted && isEmptyDescription ? ' has-error' : '')
            }
          >
            <label htmlFor="description">Description</label>
            <textarea
              className="form-control"
              name="description"
              value={poll.description}
              onChange={this.handleChange}
            />
            {submitted && isEmptyDescription && (
              <div className="help-block">Description is required</div>
            )}
          </div>
          <div className="form-group">
            <button className="btn btn-primary" disabled={loading}>
              Update
            </button>
            {loading && (
              <img
                alt="loading"
                src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA=="
              />
            )}
          </div>
          {error && <div className="alert alert-danger">{error}</div>}
        </form>
      </div>
    );
  }
}

export default EditPollPage;
