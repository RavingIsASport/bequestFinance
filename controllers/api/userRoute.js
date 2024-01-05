const router = require("express").Router();
const User = require("../../models/userModel");

router.post("/login", async ({ body }, res) => {
  const { email, password } = body;
  const user = await User.findOne({ email });

  if (!user) {
    res.send("No user with this email found!");
  }

  const correctPw = await user.isCorrectPassword(password);
  if (!correctPw) {
    res.send("incorrect password");
  }
  res.send("logged in");
});

router.post("/api/newuser", ({ body }, res) => {
  const { firstName, lastName, email, password } = body;
  const newUser = new User({
    firstName: firstName,
    lastName: lastName,
    email: email,
    password: password,
  });

  newUser.save();
  res.send("user saved");
});
module.exports = router;
