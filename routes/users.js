var express = require("express");
var router = express.Router();
var _ = require("lodash");
var logger = require("../lib/logger");
var log = logger();
var fs = require("fs");
var path = require("path");

var usersFilePath = path.join(__dirname, "../init_data.json");
var users = require(usersFilePath).data;
var curId = _.size(users);

/* Home */
router.get("/", function (req, res) {
  res.render("index.html");
});

/* GET users listing. */
router.get("/admin", function (req, res) {
  const allUsers = _.toArray(users);
  log.info("Listed users", allUsers);
  res.render("admin.html", { users: allUsers });
});

/* GET sign up form. */
router.get("/sign", function (req, res) {
  res.render("signup.html");
});

/* Create a new user */
router.post("/sign", function (req, res) {
  var user = req.body;
  user.id = curId++;
  if (!user.state || (user.state !== "pending" && user.state !== "active")) {
    user.state = "pending";
  }
  users[user.id] = user;
  log.info("Created user", user);

  fs.writeFile(
    usersFilePath,
    JSON.stringify({ data: users }, null, 2),
    function (err) {
      if (err) {
        log.error("Error writing to JSON file", err);
        return res.status(500).send("Server error");
      }

      // redirect to users list
      res.redirect("/");
    }
  );
});

/* Get a specific user by id */
router.get("/:id", function (req, res, next) {
  var user = users[req.params.id];
  if (!user) {
    return next();
  }
  res.json(users[req.params.id]);
});

/* Delete a user by id */
router.delete("/:id", function (req, res) {
  var user = users[req.params.id];
  delete users[req.params.id];
  res.status(204);
  log.info("Deleted user", user);
  res.json(user);
});

/* Update a user by id */
router.put("/:id", function (req, res, next) {
  var user = req.body;
  if (user.id != req.params.id) {
    return next(new Error("ID paramter does not match body"));
  }
  users[user.id] = user;
  log.info("Updating user", user);
  res.json(user);
});

// redirect to users list if not found
router.use(function (req, res) {
  res.redirect("/");
})
module.exports = router;
