const router = require("express").Router();
const User = require("../models/Users");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");

// USER REGISTERATION
router.post("/register", async (req, res) => {
  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    //ENCRYPT USER PASSWORD UPON REGISTERATION
    password: CryptoJS.AES.encrypt(
      req.body.password,
      process.env.PASS_KEY
    ).toString(),
  });

  try {
    const savedUser = await newUser.save(); //SAVE USER DETAILS TO MONGODB
    res.status(201).json(savedUser); //RESPOND WITH USER DETAILS SAVED IN MONGODB
  } catch (err) {
    res.status(500).json(err);
  }
});

// USER LOGIN
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username }); //FIND USER DETAILS IN MONGODB DATABASE
    if (!user) {
      res.status(401).json("Wrong credentials");
      return;
    }

    const hashedPasssword = CryptoJS.AES.decrypt(
      //DECRYPT PASSWORD FROM DATABASE SO THAT IT CAN COMPARE WITH INPUTED LOGIN PASSWORD
      user.password,
      process.env.PASS_KEY
    );

    const Originalpassword = hashedPasssword.toString(CryptoJS.enc.Utf8); // DECRYPTED PASSWORD FROM DATABASE

    //COMPARE INPUTED PASSWORD WITH PASSWORD IN DATABASE
    if (Originalpassword !== req.body.password) {
      res.status(401).json("Wrong credentials");
      return;
    }

    //CREATE JWT FOR USER AFTER THEY LOGIN SUCCESSFULLY
    const accessToken = jwt.sign(
      {
        id: user._id,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_KEY,
      { expiresIn: "1000d" }
    );

    //RESPOND WITH USER DETAILS EXCEPT PASSWORD
    const { password, ...others } = user._doc;
    res.status(200).json({ ...others, accessToken });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
