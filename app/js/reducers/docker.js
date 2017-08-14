import _ from 'underscore';

const initialState = {
  isRunning: false,
  containers: 0,
  images: 0,
  services: 0,
  tasks: 0,
  nodes: 0,
  authInProgress: false,
  authResult: null
};

module.exports = (state = initialState, action) => {
  switch (action.type) {
    case 'UPDATE_DOCKER_STATS': {
      return Object.assign({}, state, _.omit(action, 'type'));
    }
    case 'UPDATE_DOCKER_INFO': {
      return Object.assign({}, state, _.omit(action, 'type'));
    }
    case 'DOCKER_AUTH': {
      console.log(action);
      return Object.assign({}, state, { authResult: _.omit(action, 'type') });
    }
    case 'DOCKER_AUTH_START': {
      console.log('start');
      return Object.assign({}, state, { authInProgress: true });
    }
    case 'DOCKER_AUTH_END': {
      console.log('end');
      return Object.assign({}, state, { authInProgress: false });
    }
    default: {
      return state;
    }
  }
};
