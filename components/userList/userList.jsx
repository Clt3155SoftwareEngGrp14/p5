import React from 'react';
import {
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
}
from '@mui/material';
import { Link } from 'react-router-dom';
import './userList.css';

/**
 * Define UserList, a React component of project #5
 */
class UserList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      users: window.models.userListModel()
    };
  }

  render() {
    return (
      <div>
        <List component="nav">
          {this.state.users.map((user) => (
            <React.Fragment key={user._id}>
              <ListItem button component={Link} to={`/users/${user._id}`}>
                <ListItemText primary={`${user.first_name} ${user.last_name}`} />
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </div>
    );
  }
}

export default UserList;
