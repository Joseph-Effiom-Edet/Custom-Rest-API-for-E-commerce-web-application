const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./verifyToken");
const Cart = require("../models/Cart");

const router = require("express").Router();

//CREATE CART DETAILS
router.post("/", verifyToken, async (req, res) => {
  const newCart = new Cart(req.body);
  try {
    const savedCart = await newCart.save();
    res.status(200).json(savedCart);
  } catch (err) {
    res.status(500).json(err);
  }
});

//UPDATE CART DETAILS
router.put("/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    //UPDATE THE CART DETAILS IN THE DATABASE WITH THE NEW DETAILS
    const updatedCart = await Cart.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    //RESPOND WITH THE UPDATED DATA
    res.status(200).json(updatedCart);
  } catch (err) {
    res.status(500).json(err);
  }
});

//DELETE CART DETAILS
router.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    //DELETE CART DATA FROM DATABASE
    await Cart.findByIdAndDelete(req.params.id);
    res.status(200).json("Cart has been deleted");
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET USER CART
router.get("/find/:userId", verifyTokenAndAuthorization, async (req, res) => {
  try {
    //FIND CART IN DATABASE WITH SPECIFIC ID
    const cart = await Cart.findOne({ userId: req.params.userId });
    //RESPOND WITH CART DETAILS
    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json(err);
  }
});

//ADMIN GET ALL CARTs DETAILS
router.get("/", verifyTokenAndAdmin, async (req, res) => {
  try {
    //FIND ALL CARTS IN DATABASE
    const carts = await Cart.find();
    //RESPOND WITH ALL CARTS DETAILS EXCEPT PASSWORD
    res.status(200).json(carts);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
