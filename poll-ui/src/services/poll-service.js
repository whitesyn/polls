export const pollService = {
  getAll,
  get,
  create,
  remove,
  update,
  vote
};

const API_HOST = process.env.REACT_APP_API_HOST;

function getAll() {
  const requestOptions = {
    method: 'GET'
  };

  return fetch(`${API_HOST}/poll`, requestOptions).then(handleResponse);
}

function create(poll) {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(poll)
  };

  return fetch(`${API_HOST}/poll`, requestOptions).then(handleResponse);
}

function get(pollId) {
  const requestOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  return fetch(`${API_HOST}/poll/${pollId}`, requestOptions).then(
    handleResponse
  );
}

function remove(pollId) {
  const requestOptions = {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  return fetch(`${API_HOST}/poll/${pollId}`, requestOptions).then(
    handleResponse
  );
}

function update(pollId, poll) {
  const requestOptions = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(poll)
  };

  return fetch(`${API_HOST}/poll/${pollId}`, requestOptions).then(
    handleResponse
  );
}

function vote(pollId, score) {
  score = parseFloat(score);

  const requestOptions = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ score })
  };

  return fetch(`${API_HOST}/poll/${pollId}/vote`, requestOptions).then(
    handleResponse
  );
}

function handleResponse(response) {
  return response.text().then(text => {
    const data = text && JSON.parse(text);
    if (!response.ok) {
      const error = (data && data.message) || response.statusText;
      return Promise.reject(error);
    }

    return data;
  });
}

export default pollService;
