const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./verifyToken");
const Order = require("../models/Order");

const router = require("express").Router();

//CREATE ORDER DETAILS
router.post("/", verifyToken, async (req, res) => {
  const newOrder = new Order(req.body);
  try {
    const savedOrder = await newOrder.save();
    res.status(200).json(savedOrder);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

//UPDATE ORDER DETAILS
router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    //UPDATE THE ORDER DETAILS IN THE DATABASE WITH THE NEW DETAILS
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    //RESPOND WITH THE UPDATED DATA
    res.status(200).json(updatedOrder);
  } catch (err) {
    res.status(500).json(err);
  }
});

//DELETE ORDER DETAILS
router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    //DELETE ORDER DATA FROM DATABASE
    await Order.findByIdAndDelete(req.params.id);
    res.status(200).json("Order has been deleted");
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET USER ORDERS
router.get("/find/:userId", verifyTokenAndAuthorization, async (req, res) => {
  try {
    //FIND ORDERS IN DATABASE WITH SPECIFIC ID
    const orders = await Order.find({ userId: req.params.userId });
    //RESPOND WITH ORDERS DETAILS
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});

//ADMIN GET ALL ORDERS DETAILS
router.get("/", verifyTokenAndAdmin, async (req, res) => {
  try {
    //FIND ALL ORDERS IN DATABASE
    const orders = await Order.find();
    //RESPOND WITH ALL ORDERS DETAILS EXCEPT PASSWORD
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET MONTHLY INCOME
router.get("/income", verifyTokenAndAdmin, async (req, res) => {
  const productId = req.query.pid;
  const date = new Date();
  const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
  const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));

  try {
    //AGGREGATE USERS DATA FROM DATABASE USING LAST YEAR AS STARTING POINT AND ARRANGING THEM ACCORDING TO MONTHS
    const income = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: previousMonth },
          ...(productId && { products: { $elemMatch: { productId } } }),
        },
      },
      { $project: { month: { $month: "$createdAt" }, sales: "$amount" } },
      { $group: { _id: "$month", total: { $sum: "$sales" } } },
    ]);
    res.status(200).json(income);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
