import React from "react";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { withRouter } from "react-router-dom";
import "./TopBar.css";
import axios from "axios";

/**
 * Define TopBar, a React component of project #5
 */
class TopBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      version: null,
      contextName: "App Context",
    };
  }

  componentDidMount() {
    axios.get("/test/info")
      .then((response) => {
        this.setState({ version: response.data.__v });
      })
      .catch((error) => {
        console.error("Error fetching version info:", error);
      });

    this.updateContext();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.location.pathname !== this.props.location.pathname) {
      this.updateContext();
    }
  }

  updateContext() {
    const { pathname } = this.props.location;

    if (pathname.startsWith("/users/")) {
      const userId = pathname.split("/")[2];
      axios.get(`/user/${userId}`)
        .then((response) => {
          const user = response.data;
          this.setState({
            contextName: `${user.first_name} ${user.last_name}`,
          });
        })
        .catch((err) => console.error("Error fetching user context:", err));
    } else if (pathname.startsWith("/photos/")) {
        this.setState({
        contextName: "Photo View",
      });
    } else {
      this.setState({ contextName: "App Context" });
    }
  }

  handleLogout = () => {
    axios.post("/admin/logout")
      .then(() => {
        this.props.onLogout();
      })
      .catch((error) => console.error("Error logging out:", error));
  }

  handleNewPhoto = (e) => {
    e.preventDefault();
    if (this.uploadInput && this.uploadInput.files.length > 0) {
      const domForm = new FormData();
      domForm.append('uploadedphoto', this.uploadInput.files[0]);
      axios.post('/photos/new', domForm)
        .then((res) => {
          console.log("Photo uploaded successfully:", res);
          this.props.history.push(`/photos/${this.props.currentUser._id}`);
        })
        .catch(err => {
          console.error(`Error uploading photo: ${err}`);
          alert("Error uploading photo. Please try again.");
        });
    } else {
      alert("Please choose a file before uploading.");
    }
  };
  

  render() {
    return (
      <AppBar className="topbar-appBar" position="absolute">
        <Toolbar>
          <Typography variant="h5" color="inherit" style={{ flexGrow: 1 }}>
            TXJoh&apos;s Photo App
          </Typography>

          {this.props.currentUser ? (
            <div style={{ display: "flex", alignItems: "center", marginRight: "16px" }}>
              <input 
                type="file" 
                accept="image/*" 
                ref={(domFileRef) => { this.uploadInput = domFileRef; }} 
                style={{ marginRight: "10px" }}
              />
              
              <Button 
              variant="contained" 
              color="secondary" 
              onClick={this.handleNewPhoto}
              style={{ marginRight: "20px" }}
              >
                Add Photo
              </Button>
              
              <Typography variant="h6" color="inherit" style={{ marginRight: 16 }}>
                Hi {this.props.currentUser.first_name}
              </Typography>
              <Button color="inherit" onClick={this.handleLogout}>
                Logout
              </Button>
            </div>
          ) : (
            <Typography variant="h6" color="inherit" style={{ marginRight: "16px" }}>
              Please Login
            </Typography>
          )}

          <Typography variant="h5" color="inherit">
            {this.props.currentUser ? this.state.contextName : ""}
          </Typography>
          {this.state.version !== null && (
            <Typography
              variant="h5"
              color="inherit"
              style={{ marginLeft: "16px" }}
            >
              v{this.state.version}
            </Typography>
          )}
        </Toolbar>
      </AppBar>
    );
  }
}

export default withRouter(TopBar);
