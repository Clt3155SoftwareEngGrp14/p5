import React from "react";
import { Typography } from "@mui/material";
import { Link } from "react-router-dom";
import "./userPhotos.css";
import axios from "axios";

/**
 * Define UserPhotos, a React componment of project #5
 */
class UserPhotos extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      photos: null,
    };
  }

  componentDidMount() {
    this.fetchPhotos(this.props.match.params.userId);
  }

  componentDidUpdate(prevProps) {
    const prevUserId = prevProps.match.params.userId;
    const currentUserId = this.props.match.params.userId;
    if (prevUserId !== currentUserId) {
      this.fetchPhotos(currentUserId);
    }
  }

  fetchPhotos(userId) {
    axios.get(`/photosOfUser/${userId}`)
      .then((response) => {
        this.setState({ photos: response.data });
      })
      .catch((error) => {
        console.error("Error fetching photos:", error);
      });
  }

  render() {
    const { photos } = this.state;

    if (!photos) {
      return <Typography variant="body1">Loading...</Typography>;
    }

    return (
      <div>
        {photos.map((photo) => (
          <div key={photo._id} style={{ marginBottom: "30px" }}>
            <img
              src={`/images/${photo.file_name}`}
              alt={photo.file_name}
              style={{ width: "300px", marginBottom: "10px" }}
            />

            <Typography variant="body2" style={{ marginBottom: "10px" }}>
              <strong>Created:</strong> {photo.date_time}
            </Typography>

            <Typography variant="h6">Comments</Typography>

            {photo.comments && photo.comments.length > 0 ? (
              photo.comments.map((comment) => (
                <div key={comment._id} style={{ marginBottom: "10px" }}>
                  <Typography variant="body2">
                    <Link to={`/users/${comment.user._id}`}>
                      {comment.user.first_name} {comment.user.last_name}
                    </Link>
                  </Typography>
                  <Typography variant="body2">{comment.comment}</Typography>
                  <Typography variant="caption" display="block">
                    {comment.date_time}
                  </Typography>
                </div>
              ))
            ) : (
              <Typography variant="body2">No comments.</Typography>
            )}
          </div>
        ))}
      </div>
    );
  }
}

export default UserPhotos;
