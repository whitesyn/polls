import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Websocket from 'react-websocket';

import { getSingletonInstance } from '../helpers/event-bus';

import HomePage from './HomePage';
import AddPollPage from './AddPollPage';
import EditPollPage from './EditPollPage';

function App() {
  const eventBus = getSingletonInstance();

  const handleData = data => {
    try {
      let result = JSON.parse(data);
      eventBus.dispatchEvent(result.type, {
        ...result
      });
    } catch (e) {}
  };

  return (
    <div className="jumbotron">
      <div className="container">
        <div className="col-sm-8 col-sm-offset-2">
          <Router>
            <div>
              <Route exact path="/" component={HomePage} />
              <Route exact path="/add" component={AddPollPage} />
              <Route path="/edit/:pollId" component={EditPollPage} />
            </div>
          </Router>
        </div>
      </div>
      <Websocket
        url={`${process.env.REACT_APP_WS_HOST}`}
        onMessage={d => handleData(d)}
      />
    </div>
  );
}

export default App;
