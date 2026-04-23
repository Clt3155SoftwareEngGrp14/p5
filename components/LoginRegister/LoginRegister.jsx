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
      errorMsg: "",
      // Registration state
      regLoginName: "",
      regPassword: "",
      regPasswordRepeat: "",
      regFirstName: "",
      regLastName: "",
      regLocation: "",
      regDescription: "",
      regOccupation: "",
      regErrorMsg: "",
      regSuccessMsg: ""
    };
  }

  handleLoginNameChange = (event) => {
    this.setState({ loginName: event.target.value });
  };

  handlePasswordChange = (event) => {
    this.setState({ password: event.target.value });
  };

  handleRegChange = (field) => (event) => {
    this.setState({ [field]: event.target.value });
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

  handleRegister = (event) => {
    event.preventDefault();
    this.setState({ regErrorMsg: "", regSuccessMsg: "" });

    const {
      regLoginName,
      regPassword,
      regPasswordRepeat,
      regFirstName,
      regLastName,
      regLocation,
      regDescription,
      regOccupation
    } = this.state;

    if (regPassword !== regPasswordRepeat) {
      this.setState({ regErrorMsg: "Passwords do not match." });
      return;
    }

    axios.post("/user", {
      login_name: regLoginName,
      password: regPassword,
      first_name: regFirstName,
      last_name: regLastName,
      location: regLocation,
      description: regDescription,
      occupation: regOccupation
    })
      .then(() => {
        this.setState({
          regSuccessMsg: "Registration successful! You can now log in.",
          regLoginName: "",
          regPassword: "",
          regPasswordRepeat: "",
          regFirstName: "",
          regLastName: "",
          regLocation: "",
          regDescription: "",
          regOccupation: "",
          regErrorMsg: ""
        });
      })
      .catch((error) => {
        this.setState({
          regErrorMsg: error.response && error.response.data 
            ? error.response.data 
            : "Registration failed."
        });
      });
  };

  render() {
    if (this.props.currentUser) {
      return <Redirect to={`/users/${this.props.currentUser._id}`} />;
    }

    return (
      <Box className="login-register-container">
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

        <Paper className="login-paper" elevation={3}>
          <form onSubmit={this.handleRegister} className="login-form">
            <Typography variant="h4" gutterBottom>
              Register as a New User
            </Typography>
            <TextField label="Login Name *" variant="outlined" fullWidth margin="normal" value={this.state.regLoginName} onChange={this.handleRegChange("regLoginName")} required />
            <TextField label="First Name *" variant="outlined" fullWidth margin="normal" value={this.state.regFirstName} onChange={this.handleRegChange("regFirstName")} required />
            <TextField label="Last Name *" variant="outlined" fullWidth margin="normal" value={this.state.regLastName} onChange={this.handleRegChange("regLastName")} required />
            <TextField label="Password *" variant="outlined" type="password" fullWidth margin="normal" value={this.state.regPassword} onChange={this.handleRegChange("regPassword")} required />
            <TextField label="Repeat Password *" variant="outlined" type="password" fullWidth margin="normal" value={this.state.regPasswordRepeat} onChange={this.handleRegChange("regPasswordRepeat")} required />
            <TextField label="Location" variant="outlined" fullWidth margin="normal" value={this.state.regLocation} onChange={this.handleRegChange("regLocation")} />
            <TextField label="Description" variant="outlined" fullWidth margin="normal" value={this.state.regDescription} onChange={this.handleRegChange("regDescription")} />
            <TextField label="Occupation" variant="outlined" fullWidth margin="normal" value={this.state.regOccupation} onChange={this.handleRegChange("regOccupation")} />
            
            {this.state.regErrorMsg && (
              <Typography color="error" className="error-message">
                {this.state.regErrorMsg}
              </Typography>
            )}
            {this.state.regSuccessMsg && (
              <Typography color="primary" className="success-message">
                {this.state.regSuccessMsg}
              </Typography>
            )}
            
            <Box mt={2}>
              <Button type="submit" variant="contained" color="secondary" fullWidth>
                Register Me
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    );
  }
}

export default LoginRegister;
