import './scss/styles.scss';
import 'regenerator-runtime';

import React from 'react';
import { render } from 'react-dom';
import Root from './js/containers/Root.jsx';

render(
  <Root />,
  document.getElementById('app')
);
