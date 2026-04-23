import React from "react";
import ReactDOM from "react-dom";
import { HashRouter, Route, Switch, Redirect } from "react-router-dom";
import { Grid, Paper, Typography } from "@mui/material";
import "./styles/main.css";

// import necessary components
import TopBar from "./components/topBar/TopBar";
import UserDetail from "./components/userDetail/userDetail";
import UserList from "./components/userList/userList";
import UserPhotos from "./components/userPhotos/userPhotos";
import LoginRegister from "./components/loginRegister/LoginRegister";

class PhotoShare extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentUser: null,
      uploadTrigger: 0,
    };
  }

  handleLoginUser = (user) => {
    this.setState({ currentUser: user });
  };

  handleLogoutUser = () => {
    this.setState({ currentUser: null });
  };

  handlePhotoUpload = () => {
    this.setState({ uploadTrigger: this.state.uploadTrigger + 1 });
  };

  render() {
    return (
      <HashRouter>
        <div>
          <Grid container spacing={8}>
            <Grid item xs={12}>
              <TopBar currentUser={this.state.currentUser} onLogout={this.handleLogoutUser} onPhotoUpload={this.handlePhotoUpload} />
            </Grid>
            <div className="main-topbar-buffer" />
            <Grid item sm={3}>
              <Paper className="main-grid-item">
                {this.state.currentUser && <UserList />}
              </Paper>
            </Grid>
            <Grid item sm={9}>
              <Paper className="main-grid-item">
                <Switch>
                  <Route
                    path="/login-register"
                    render={(props) => (
                      <LoginRegister
                        {...props}
                        onLoginUser={this.handleLoginUser}
                        currentUser={this.state.currentUser}
                      />
                    )}
                  />
                  {this.state.currentUser ? (
                    <Switch>
                      <Route
                        path="/users/:userId"
                        render={(props) => <UserDetail {...props} />}
                      />
                      <Route
                        path="/photos/:userId"
                        render={(props) => <UserPhotos {...props} uploadTrigger={this.state.uploadTrigger} />}
                      />
                      <Route path="/users" component={UserList} />
                      <Route path="/" render={() => <Typography variant="h4">Welcome to your photos</Typography>} />
                    </Switch>
                  ) : (
                    <Redirect path="/" to="/login-register" />
                  )}
                </Switch>
              </Paper>
            </Grid>
          </Grid>
        </div>
      </HashRouter>
    );
  }
}

ReactDOM.render(<PhotoShare />, document.getElementById("photoshareapp"));
