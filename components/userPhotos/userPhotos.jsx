import React from 'react';
import {
  Typography
} from '@mui/material';
import { Link } from 'react-router-dom';
import './userPhotos.css';

/**
 * Define UserPhotos, a React componment of project #5
 */
class UserPhotos extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const userId = this.props.match.params.userId;
    const photos = window.models.photoOfUserModel(userId);

    return (
      <div>
        {photos.map((photo) => (
          <div key={photo._id} style={{ marginBottom: '30px' }}>
            <img
              src={`/images/${photo.file_name}`}
              alt="user photo"
              style={{ width: '300px', marginBottom: '10px' }}
            />

            <Typography variant="body2" style={{ marginBottom: '10px' }}>
              <strong>Created:</strong> {photo.date_time}
            </Typography>

            <Typography variant="h6">Comments</Typography>

            {photo.comments && photo.comments.length > 0 ? (
              photo.comments.map((comment) => (
                <div key={comment._id} style={{ marginBottom: '10px' }}>
                  <Typography variant="body2">
                    <Link to={`/users/${comment.user._id}`}>
                      {comment.user.first_name} {comment.user.last_name}
                    </Link>
                  </Typography>
                  <Typography variant="body2">
                    {comment.comment}
                  </Typography>
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