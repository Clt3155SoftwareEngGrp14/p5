import React from "react";
import { Typography } from "@mui/material";
import "./userDetail.css";
import fetchModel from "../../lib/fetchModelData";

/**
 * Define UserDetail, a React component of project #5
 */
class UserDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
    };
  }

  componentDidMount() {
    this.fetchUser(this.props.match.params.userId);
  }

  componentDidUpdate(prevProps) {
    const prevUserId = prevProps.match.params.userId;
    const currentUserId = this.props.match.params.userId;
    if (prevUserId !== currentUserId) {
      this.fetchUser(currentUserId);
    }
  }

  fetchUser(userId) {
    fetchModel(`/user/${userId}`)
      .then((response) => {
        this.setState({ user: response.data });
      })
      .catch((error) => {
        console.error("Error fetching user:", error);
      });
  }

  render() {
    const { user } = this.state;

    if (!user) {
      return <Typography variant="body1">Loading...</Typography>;
    }

    return (
      <div>
        <Typography variant="h4">
          {user.first_name} {user.last_name}
        </Typography>
        <Typography variant="body1">
          <strong>Location:</strong> {user.location}
        </Typography>
        <Typography variant="body1">
          <strong>Occupation:</strong> {user.occupation}
        </Typography>
        <Typography variant="body1">
          <strong>Description:</strong> {user.description}
        </Typography>
      </div>
    );
  }
}

export default UserDetail;
