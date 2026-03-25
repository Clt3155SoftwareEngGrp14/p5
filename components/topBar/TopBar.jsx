import React from 'react';
import {
  AppBar, Toolbar, Typography
} from '@mui/material';
import { withRouter } from 'react-router-dom';
import './TopBar.css';
import fetchModel from '../../lib/fetchModelData';

/**
 * Define TopBar, a React component of project #5
 */
class TopBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      version: null
    };
  }
  
  componentDidMount() {
    fetchModel('/test/info')
      .then(response => {
        this.setState({ version: response.data.__v });
      })
      .catch(error => {
        console.error('Error fetching version info:', error);
      });
  }
  
    render() {
    const { pathname } = this.props.location;
    let context = "App Context";

    if (pathname.startsWith("/users/")) {
      const userId = pathname.split("/")[2];
      const user = window.models.userModel(userId);
      if (user) {
        context = `${user.first_name} ${user.last_name}`;
      }
    } else if (pathname.startsWith("/photos/")) {
      const userId = pathname.split("/")[2];
      const user = window.models.userModel(userId);
      if (user) {
        context = `Photos of ${user.first_name} ${user.last_name}`;
      }
    }

    return (
      <AppBar className="topbar-appBar" position="absolute">
        <Toolbar>
          <Typography variant="h5" color="inherit" style={{ flexGrow: 1 }}>
            TXJoh's Photo App
          </Typography>
          <Typography variant="h5" color="inherit">
            {context}
          </Typography>
          {this.state.version !== null && (
            <Typography variant="h5" color="inherit" style={{ marginLeft: '16px' }}>
              v{this.state.version}
            </Typography>
          )}
        </Toolbar>
      </AppBar>
    );
  }
}

export default withRouter(TopBar);
