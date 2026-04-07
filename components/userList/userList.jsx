import React from "react";
import {
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";
import "./userList.css";
import axios from "axios";

/**
 * Define UserList, a React component of project #5
 */
class UserList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      users: null,
    };
  }

  componentDidMount() {
    axios.get("/user/list")
      .then((response) => {
        this.setState({ users: response.data });
      })
      .catch((error) => {
        console.error("Error fetching user list:", error);
      });
  }

  render() {
    return (
      <div>
        <List component="nav">
          {this.state.users ? (
            this.state.users.map((user) => (
              <React.Fragment key={user._id}>
                <ListItem button component={Link} to={`/photos/${user._id}`}>
                  <ListItemText
                    primary={`${user.first_name} ${user.last_name}`}
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))
          ) : (
            <Typography variant="body1">Loading users...</Typography>
          )}
        </List>
      </div>
    );
  }
}

export default UserList;
