import React from "react";
import { AppBar, Toolbar, Typography } from "@mui/material";
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
      const userId = pathname.split("/")[2];
      fetchModel(`/user/${userId}`)
        .then((response) => {
          const user = response.data;
          this.setState({
            contextName: `Photos of ${user.first_name} ${user.last_name}`,
          });
        })
        .catch((err) => console.error("Error fetching user context:", err));
    } else {
      this.setState({ contextName: "App Context" });
    }
  }

  render() {
    return (
      <AppBar className="topbar-appBar" position="absolute">
        <Toolbar>
          <Typography variant="h5" color="inherit" style={{ flexGrow: 1 }}>
            TXJoh&apos;s Photo App
          </Typography>
          <Typography variant="h5" color="inherit">
            {this.state.contextName}
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
