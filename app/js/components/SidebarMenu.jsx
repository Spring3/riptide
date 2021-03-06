import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import CountTo from 'react-count-to';
import List from 'grommet/components/List';
import ListItem from 'grommet/components/ListItem';
import { push } from 'react-router-redux';
import _ from 'underscore';

class SidebarMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      containers: 0,
      images: 0,
      services: 0,
      nodes: 0,
      tasks: 0
    };
    this.menuSelected = this.menuSelected.bind(this);
  }

  componentDidMount() {
    const { store } = this.context;
    const state = _.pick(store.getState().docker, 'containers', 'images', 'services', 'nodes', 'tasks');
    this.setState({
      containers: state.containers.items.length,
      images: state.images.items.length,
      services: state.services.items.length,
      nodes: state.nodes.items.length,
      tasks: state.tasks.items.length
    });
  }


  menuSelected(menuIndex) {
    const pages = ['containers', 'services', 'images', 'nodes', 'tasks'];
    const { store } = this.context;
    // TODO : check that currently selected page differs
    store.dispatch(push(`/${pages[menuIndex]}`));
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.state, nextProps)) {
      console.log('SidebarMenu.jsx');
      console.log(nextProps);
      this.setState(nextProps);
    }
  }

  render() {
    return (
      <List selectable={true} onSelect={this.menuSelected}>
        <ListItem justify={'between'} separator={'none'} pad={{ horizontal: 'medium', vertical: 'small' }}>
          <span>
            Containers
          </span>
          <span className='secondary'>
            <CountTo to={this.state.containers} speed={1000} />
          </span>
        </ListItem>
        <ListItem justify={'between'} separator={'none'} pad={{ horizontal: 'medium', vertical: 'small' }}>
          <span>
            Services
          </span>
          <span className='secondary'>
            <CountTo to={this.state.services} speed={1000} />
          </span>
        </ListItem>
        <ListItem justify={'between'} separator={'none'} pad={{ horizontal: 'medium', vertical: 'small' }}>
          <span>
            Images
          </span>
          <span className='secondary'>
            <CountTo to={this.state.images} speed={1000} />
          </span>
        </ListItem>
        <ListItem justify={'between'} separator={'none'} pad={{ horizontal: 'medium', vertical: 'small' }}>
          <span>
            Nodes
          </span>
          <span className='secondary'>
            <CountTo to={this.state.nodes} speed={1000} />
          </span>
        </ListItem>
        <ListItem justify={'between'} separator={'none'} pad={{ horizontal: 'medium', vertical: 'small' }}>
          <span>
            Tasks
          </span>
          <span className='secondary'>
            <CountTo to={this.state.tasks} speed={1000} />
          </span>
        </ListItem>
      </List>
    );
  }
}

const mapStateToProps = state => ({
  containers: state.docker.containers.items.length,
  images: state.docker.images.items.length,
  services: state.docker.services.items.length,
  nodes: state.docker.nodes.items.length,
  tasks: state.docker.tasks.items.length
});

const mapDispatchToProps = dispatch => ({
  dispatch
});

SidebarMenu.contextTypes = {
  store: PropTypes.object
};

module.exports = connect(mapStateToProps, mapDispatchToProps)(SidebarMenu);
