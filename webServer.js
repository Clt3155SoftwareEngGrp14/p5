/**
 * This builds on the webServer of previous projects in that it exports the
 * current directory via webserver listing on a hard code (see portno below)
 * port. It also establishes a connection to the MongoDB named 'project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch
 * any file accessible to the current user in the current directory or any of
 * its children.
 *
 * This webServer exports the following URLs:
 * /            - Returns a text status message. Good for testing web server
 *                running.
 * /test        - Returns the SchemaInfo object of the database in JSON format.
 *                This is good for testing connectivity with MongoDB.
 * /test/info   - Same as /test.
 * /test/counts - Returns the population counts of the cs collections in the
 *                database. Format is a JSON object with properties being the
 *                collection name and the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the
 * database:
 * /user/list         - Returns an array containing all the User objects from
 *                      the database (JSON format).
 * /user/:id          - Returns the User object with the _id of id (JSON
 *                      format).
 * /photosOfUser/:id  - Returns an array with all the photos of the User (id).
 *                      Each photo should have all the Comments on the Photo
 *                      (JSON format).
 */

const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");

const async = require("async");

const express = require("express");
const app = express();
const fs = require("fs");
const multer = require("multer");

const processFormBody = multer({storage: multer.memoryStorage()}).single('uploadedphoto');

const session = require("express-session");

// Load the Mongoose schema for User, Photo, and SchemaInfo
const User = require("./schema/user.js");
const Photo = require("./schema/photo.js");
const SchemaInfo = require("./schema/schemaInfo.js");

// XXX - Your submission should work without this line. Comment out or delete
// this line for tests and before submission!
// const models = require("./modelData/photoApp.js").models;
mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1/project6", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// We have the express static module
// (http://expressjs.com/en/starter/static-files.html) do all the work for us.
app.use(express.static(__dirname));

app.use(session({secret: "secretKey", resave: false, saveUninitialized: false}));
app.use(express.json());

app.get("/", function (request, response) {
  response.send("Simple web server of files from " + __dirname);
});

/**
 * Use express to handle argument passing in the URL. This .get will cause
 * express to accept URLs with /test/<something> and return the something in
 * request.params.p1.
 * 
 * If implement the get as follows:
 * /test        - Returns the SchemaInfo object of the database in JSON format.
 *                This is good for testing connectivity with MongoDB.
 * /test/info   - Same as /test.
 * /test/counts - Returns an object with the counts of the different collections
 *                in JSON format.
 */
app.get("/test/:p1", function (request, response) {
  // Express parses the ":p1" from the URL and returns it in the request.params
  // objects.
  console.log("/test called with param1 = ", request.params.p1);

  const param = request.params.p1 || "info";

  if (param === "info") {
    // Fetch the SchemaInfo. There should only one of them. The query of {} will
    // match it.
    SchemaInfo.find({}, function (err, info) {
      if (err) {
        // Query returned an error. We pass it back to the browser with an
        // Internal Service Error (500) error code.
        console.error("Error in /user/info:", err);
        response.status(500).send(JSON.stringify(err));
        return;
      }
      if (info.length === 0) {
        // Query didn't return an error but didn't find the SchemaInfo object -
        // This is also an internal error return.
        response.status(500).send("Missing SchemaInfo");
        return;
      }

      // We got the object - return it in JSON format.
      console.log("SchemaInfo", info[0]);
      response.end(JSON.stringify(info[0]));
    });
  } else if (param === "counts") {
    // In order to return the counts of all the collections we need to do an
    // async call to each collections. That is tricky to do so we use the async
    // package do the work. We put the collections into array and use async.each
    // to do each .count() query.
    const collections = [
      { name: "user", collection: User },
      { name: "photo", collection: Photo },
      { name: "schemaInfo", collection: SchemaInfo },
    ];
    async.each(
      collections,
      function (col, done_callback) {
        col.collection.countDocuments({}, function (err, count) {
          col.count = count;
          done_callback(err);
        });
      },
      function (err) {
        if (err) {
          response.status(500).send(JSON.stringify(err));
        } else {
          const obj = {};
          for (let i = 0; i < collections.length; i++) {
            obj[collections[i].name] = collections[i].count;
          }
          response.end(JSON.stringify(obj));
        }
      }
    );
  } else {
    // If we know understand the parameter we return a (Bad Parameter) (400)
    // status.
    response.status(400).send("Bad param " + param);
  }
});

/**
 * URL /admin/login - Sets the session user
 */
app.post("/admin/login", function (request, response) {
  const login_name = request.body.login_name;
  const password = request.body.password;

  User.findOne({ login_name: login_name }, function(err, user) {
    if (err) {
      console.error("Error in /admin/login:", err);
      response.status(500).send(JSON.stringify(err));
      return;
    }
    if (!user) {
      console.log("User with login_name:" + login_name + " not found.");
      response.status(400).send("Login name not found");
      return;
    }
    // Simple password check (assuming passwords are "weak" as defined in loadDatabase.js)
    if (password && user.password !== password) {
      console.log("Incorrect password for user:" + login_name);
      response.status(400).send("Incorrect password");
      return;
    }
    
    // Set user session
    request.session.user = {
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      login_name: user.login_name
    };
    response.status(200).send(request.session.user);
  });
});

/**
 * URL /admin/logout - Destroys the session
 */
app.post("/admin/logout", function (request, response) {
  if (!request.session.user) {
    response.status(400).send("No valid session to logout from");
    return;
  }
  request.session.destroy(function (err) {
    if (err) {
      response.status(500).send("Could not log out");
      return;
    }
    response.status(200).send("User logged out");
  });
});

// Any route subsequent to this will require an authenticated session
app.use(function (request, response, next) {
  if (request.session && request.session.user) {
    next();
  } else {
    response.status(401).send("Unauthorized");
  }
});

/**
 * URL /user/list - Returns all the User objects.
 */
app.get("/user/list", function (request, response) {
  User.find({}, "_id first_name last_name", function (err, users) {
    if (err) {
      console.error("Error in /user/list:", err);
      response.status(500).send(JSON.stringify(err));
      return;
    }
    response.status(200).send(users);
  });
});

/**
 * URL /user/:id - Returns the information for User (id).
 */
app.get("/user/:id", function (request, response) {
  const id = request.params.id;
  User.findById(id, "_id first_name last_name location description occupation", function (err, user) {
    if (err) {
      console.error("Error in /user/:id:", err);
      response.status(400).send(JSON.stringify(err));
      return;
    }
    if (user === null) {
      console.log("User with _id:" + id + " not found.");
      response.status(400).send("Not found");
      return;
    }
    response.status(200).send(user);
  });
});

app.post("/photos/new", function (request, response) {
  processFormBody(request, response, function (err) {
    if (err || !request.file) {
      console.error("Error in photo upload:", err);
      response.status(400).send("No file included or upload error");
      return;
    }

    // Ensure there is a logged-in user
    if (!request.session || !request.session.user) {
      response.status(401).send("Unauthorized: Please log in to upload a photo.");
      return;
    }

    // Generate a unique filename using a timestamp prefix
    const timestamp = new Date().valueOf();
    const filename = "U" + String(timestamp) + request.file.originalname;

    // Write the file to the images directory
    fs.writeFile("./images/" + filename, request.file.buffer, function (writeErr) {
      if (writeErr) {
        console.error("Error writing file:", writeErr);
        response.status(500).send("Error saving file to server.");
        return;
      }

      // Create the new Photo object in the database
      Photo.create({
        file_name: filename,
        date_time: new Date(),
        user_id: request.session.user._id,
        comments: []
      }, function (dbErr, newPhoto) {
        if (dbErr) {
          console.error("Error creating Photo record:", dbErr);
          response.status(500).send(JSON.stringify(dbErr));
          return;
        }
        
        // Return the newly created photo
        response.status(200).send(newPhoto);
      });
    });
  });
});

/**
 * URL /photosOfUser/:id - Returns the Photos for User (id).
 * Uses async to load from Photos and Users; comments include nested author
 * (_id, first_name, last_name). Plain objects are produced via
 * JSON.parse(JSON.stringify()) before mutating nested comment data.
 */
app.get("/photosOfUser/:id", function (request, response) {
  const id = request.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    console.log("Photos for user with _id:" + id + " not found (invalid id).");
    response.status(400).send("Not found");
    return;
  }

  async.waterfall(
    [
      function (cb) {
        User.findById(id).exec(cb);
      },
      function (user, cb) {
        if (user === null) {
          cb({ status: 400, message: "Not found" });
          return;
        }
        Photo.find({ user_id: id }).exec(cb);
      },
      function (photos, cb) {
        let photosData;
        try {
          photosData = JSON.parse(JSON.stringify(photos));
        } catch (cloneErr) {
          cb(cloneErr);
          return;
        }

        const commentUserIds = new Set();
        photosData.forEach(function (photo) {
          (photo.comments || []).forEach(function (c) {
            if (c.user_id) {
              commentUserIds.add(String(c.user_id));
            }
          });
        });

        const lookupIds = Array.from(commentUserIds).map(function (sid) {
          return new mongoose.Types.ObjectId(sid);
        });

        if (lookupIds.length === 0) {
          cb(null, photosData, []);
          return;
        }

        User.find({ _id: { $in: lookupIds } }, "_id first_name last_name").exec(
          function (userErr, users) {
            if (userErr) {
              cb(userErr);
              return;
            }
            let usersData;
            try {
              usersData = JSON.parse(JSON.stringify(users || []));
            } catch (cloneErr) {
              cb(cloneErr);
              return;
            }
            cb(null, photosData, usersData);
          }
        );
      },
      function (photosData, usersData, cb) {
        const userMap = {};
        usersData.forEach(function (u) {
          userMap[String(u._id)] = {
            _id: u._id,
            first_name: u.first_name,
            last_name: u.last_name,
          };
        });

        const payload = photosData.map(function (photo) {
          const comments = (photo.comments || []).map(function (c) {
            const uid = c.user_id ? String(c.user_id) : null;
            const author = uid ? userMap[uid] : null;
            return {
              _id: c._id,
              comment: c.comment,
              date_time: c.date_time,
              user:
                author ||
                (c.user_id
                  ? { _id: c.user_id, first_name: "", last_name: "" }
                  : { _id: null, first_name: "", last_name: "" }),
            };
          });
          return {
            _id: photo._id,
            file_name: photo.file_name,
            date_time: photo.date_time,
            user_id: photo.user_id,
            comments: comments,
          };
        });

        cb(null, payload);
      },
    ],
    function (err, photosData) {
      if (err) {
        if (err.status === 400) {
          response.status(400).send(err.message);
          return;
        }
        console.error("Error in /photosOfUser/:id:", err);
        response.status(500).send(JSON.stringify(err));
        return;
      }
      response.status(200).send(photosData);
    }
  );
});

const server = app.listen(3000, function () {
  const port = server.address().port;
  console.log(
    "Listening at http://localhost:" +
      port +
      " exporting the directory " +
      __dirname
  );
});
