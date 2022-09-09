const {
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./verifyToken");
const User = require("../models/Users");

const router = require("express").Router();

//UPDATE SAVED USER DETAILS
router.put("/:id", verifyTokenAndAuthorization, async (req, res) => {
  //IF THE USER CHANGES PASSWORD, ENCRYPT THE NEW PASSWORD
  if (req.body.password) {
    req.body.password = CryptoJS.AES.encrypt(
      req.body.password,
      process.env.PASS_KEY
    ).toString();
  }

  try {
    //UPDATE THE USER DETAILS IN THE DATABASE WITH THE NEW DETAILS
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    //RESPOND WITH THE UPDATED DATA
    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json(err);
  }
});

//DELETE USER DETAILS
router.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    //DELETE USER DATA FROM DATABASE
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json("User has been deleted");
  } catch (err) {
    res.status(500).json(err);
  }
});

//ADMIN GET USER DETAILS
router.get("/find/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    //FIND USER IN DATABASE WITH SPECIFIC ID
    const user = await User.findById(req.params.id);
    const { password, ...others } = user._doc;
    //RESPOND WITH USER DETAILS EXCEPT PASSWORD
    res.status(200).json(others);
  } catch (err) {
    res.status(500).json(err);
  }
});

//ADMIN GET ALL USERS DETAILS
router.get("/", verifyTokenAndAdmin, async (req, res) => {
  try {
    //FIND ALL USERS IN DATABASE
    const query = req.query.new;
    const users = query
      ? await User.find().sort({ _id: -1 }).limit(5)
      : await User.find();
    //RESPOND WITH ALL USERS DETAILS EXCEPT PASSWORD
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json(err);
  }
});

//ADMIN GET USER STATS
router.get("/stats", verifyTokenAndAdmin, async (req, res) => {
  //CREATE STARTING POINT FOR STATS (THIS TIME LAST YEAR)
  const date = new Date();
  const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));

  try {
    //AGGREGATE USERS DATA FROM DATABASE USING LAST YEAR AS STARTING POINT AND ARRANGING THEM ACCORDING TO MONTHS
    const data = await User.aggregate([
      { $match: { createdAt: { $gte: lastYear } } },
      { $project: { month: { $month: "$createdAt" } } },
      { $group: { _id: "$month", total: { $sum: 1 } } },
    ]);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});
module.exports = router;
