const router = require("express").Router();
const User = require("../../models/userModel");
const UserData = require("../../models/userData");
const jwt = require("jsonwebtoken");
const { withAuth } = require("../../middleware/withAuth");

// generate jwt
const generateJWT = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

// user routes
// get user
router.get("/api/user/me", withAuth, async (req, res) => {
  let { _id, firstName, email, notes } = await User.findById(
    req.user.id
  ).populate("notes");
  res.status(200).json({
    id: _id,
    firstName,
    email,
  });
});

// get user notes
router.get("/api/user/notes", withAuth, async (req, res) => {
  let { firstName, notes } = await User.findById(req.user.id).populate("notes");
  try {
    res.status(200).json({
      firstName,
      notes,
    });
  } catch {
    throw new Error("No user or notes");
  }
});

// create new user
router.post("/api/newuser", async ({ body }, res) => {
  const { firstName, lastName, email, password } = body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("user exists");
  }
  const newUser = await User.create({
    firstName,
    lastName,
    email,
    password,
  });

  if (newUser) {
    res.status(201).json({
      _id: newUser.id,
      firstName: newUser.firstName,
      email: newUser.email,
      token: generateJWT(newUser._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid data");
  }
});

// login route
router.post("/api/user/login", async ({ body }, res) => {
  const { email, password } = body;
  const user = await User.findOne({ email });
  const correctPw = await user.isCorrectPassword(password);

  if (user && correctPw) {
    res.json({
      _id: user.id,
      firstName: user.firstName,
      email: user.email,
      token: generateJWT(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Wrong credentials");
  }
});

// user data routes
// create user note
router.post("/api/newdata", withAuth, async ({ body, user }, res) => {
  const { title, main } = body;
  const newdata = await UserData.create({ title, main });
  await User.findOneAndUpdate(
    { _id: user.id },
    { $push: { notes: newdata._id } },
    { new: true }
  );
  res.send(newdata);
});

// update user notes
router.put("/api/user/notes/:id", withAuth, async (req, res) => {
  let user = await User.findById(req.user.id).populate("notes");
  const updatedNote = await UserData.findByIdAndUpdate(
    req.params.id,
    req.body,

    { new: true }
  );
  try {
    res.status(200).json({
      user,
      updatedNote,
    });
  } catch {
    throw new Error("No, user or notes");
  }
});

// delete user note
router.delete("/api/user/notes/:id", withAuth, async (req, res) => {
  try {
    await UserData.findByIdAndDelete(req.params.id);
    res.status(200).json({
      message: "note removed",
    });
  } catch {
    throw new Error("No user or notes");
  }
});
module.exports = router;
