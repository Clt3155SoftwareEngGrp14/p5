import React from "react";
import { Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from "@mui/material";
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
      commentDialogOpen: false,
      selectedPhotoId: null,
      commentText: "",
      submittingComment: false,
    };
  }

  componentDidMount() {
    this.fetchPhotos(this.props.match.params.userId);
  }

  componentDidUpdate(prevProps) {
    const prevUserId = prevProps.match.params.userId;
    const currentUserId = this.props.match.params.userId;
    if (
      prevUserId !== currentUserId ||
      prevProps.uploadTrigger !== this.props.uploadTrigger
    ) {
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

  openCommentDialog = (photoId) => {
    this.setState({
      commentDialogOpen: true,
      selectedPhotoId: photoId,
      commentText: "",
    });
  };

  closeCommentDialog = () => {
    this.setState({
      commentDialogOpen: false,
      selectedPhotoId: null,
      commentText: "",
    });
  };

  handleCommentTextChange = (event) => {
    this.setState({ commentText: event.target.value });
  };

  submitComment = () => {
    const { commentText, selectedPhotoId } = this.state;
    
    if (!commentText.trim()) {
      alert("Please enter a comment");
      return;
    }

    this.setState({ submittingComment: true });

    axios.post(`/commentsOfPhoto/${selectedPhotoId}`, { comment: commentText })
      .then((response) => {
        // Add the new comment to the photo in state
        const updatedPhotos = this.state.photos.map((photo) => {
          if (photo._id === selectedPhotoId) {
            return {
              ...photo,
              comments: [...(photo.comments || []), response.data],
            };
          }
          return photo;
        });

        this.setState({
          photos: updatedPhotos,
          commentDialogOpen: false,
          selectedPhotoId: null,
          commentText: "",
          submittingComment: false,
        });
      })
      .catch((error) => {
        console.error("Error posting comment:", error);
        this.setState({ submittingComment: false });
        alert("Error posting comment: " + (error.response?.data || error.message));
      });
  };

  render() {
    const { photos, commentDialogOpen, commentText, submittingComment } = this.state;

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

            <Button
              variant="contained"
              size="small"
              onClick={() => this.openCommentDialog(photo._id)}
              style={{ marginTop: "10px" }}
            >
              Add Comment
            </Button>
          </div>
        ))}

        <Dialog open={commentDialogOpen} onClose={this.closeCommentDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Add Comment</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Comment"
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              value={commentText}
              onChange={this.handleCommentTextChange}
              placeholder="Enter your comment here..."
              style={{ marginTop: "10px" }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.closeCommentDialog} disabled={submittingComment}>
              Cancel
            </Button>
            <Button onClick={this.submitComment} variant="contained" disabled={submittingComment}>
              {submittingComment ? "Posting..." : "Post Comment"}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

export default UserPhotos;
