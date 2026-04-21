import React from "react";
import { Redirect } from "react-router-dom";
import { Button, TextField, Typography, Box, Paper } from "@mui/material";
import axios from "axios";
import "./LoginRegister.css";

class LoginRegister extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loginName: "",
      password: "",
      errorMsg: ""
    };
  }

  handleLoginNameChange = (event) => {
    this.setState({ loginName: event.target.value });
  };

  handlePasswordChange = (event) => {
    this.setState({ password: event.target.value });
  };

  handleLogin = (event) => {
    event.preventDefault();
    axios.post("/admin/login", {
      login_name: this.state.loginName,
      password: this.state.password
    })
      .then((response) => {
        this.props.onLoginUser(response.data);
      })
      .catch((error) => {
        this.setState({
          errorMsg: error.response && error.response.data 
            ? error.response.data 
            : "Login failed"
        });
      });
  };

  render() {
    if (this.props.currentUser) {
      return <Redirect to={`/users/${this.props.currentUser._id}`} />;
    }

    return (
      <Paper className="login-paper" elevation={3}>
        <form onSubmit={this.handleLogin} className="login-form">
          <Typography variant="h4" gutterBottom>
            Please Login
          </Typography>
          <TextField
            label="Login Name"
            variant="outlined"
            fullWidth
            margin="normal"
            value={this.state.loginName}
            onChange={this.handleLoginNameChange}
            required
          />
          <TextField
            label="Password"
            variant="outlined"
            type="password"
            fullWidth
            margin="normal"
            value={this.state.password}
            onChange={this.handlePasswordChange}
          />
          {this.state.errorMsg && (
            <Typography color="error" className="error-message">
              {this.state.errorMsg}
            </Typography>
          )}
          <Box mt={2}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={!this.state.loginName}
            >
              Login
            </Button>
          </Box>
        </form>
      </Paper>
    );
  }
}

export default LoginRegister;
