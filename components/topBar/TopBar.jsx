import React from 'react';
import {
  AppBar, Toolbar, Typography
} from '@mui/material';
import { withRouter } from 'react-router-dom';
import './TopBar.css';

/**
 * Define TopBar, a React component of project #5
 */
class TopBar extends React.Component {
  constructor(props) {
    super(props);
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
        </Toolbar>
      </AppBar>
    );
  }
}

export default withRouter(TopBar);
