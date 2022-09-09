const { verifyTokenAndAdmin } = require("./verifyToken");
const Product = require("../models/Product");

const router = require("express").Router();

//ADMIN CREATE PRODUCT DETAILS
router.post("/", verifyTokenAndAdmin, async (req, res) => {
  const newProduct = new Product(req.body);
  try {
    const savedProduct = await newProduct.save();
    res.status(200).json(savedProduct);
  } catch (err) {
    res.status(500).json(err);
  }
});

//ADMIN UPDATE SAVED PRODUCT DETAILS
router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    //UPDATE THE PRODUCT DETAILS IN THE DATABASE WITH THE NEW DETAILS
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    //RESPOND WITH THE UPDATED DATA
    res.status(200).json(updatedProduct);
  } catch (err) {
    res.status(500).json(err);
  }
});

//ADMIN DELETE PRODUCT DETAILS
router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    //DELETE PRODUCT DATA FROM DATABASE
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json("Product has been deleted");
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET PRODUCT
router.get("/find/:id", async (req, res) => {
  try {
    //FIND PRODUCT IN DATABASE WITH SPECIFIC ID
    const product = await Product.findById(req.params.id);
    //RESPOND WITH PRODUCT DETAILS
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET ALL PRODUCTS DETAILS
router.get("/", async (req, res) => {
  const qNew = req.query.new;
  const qCategory = req.query.category;
  try {
    //FIND ALL PRODUCTS IN DATABASE
    let products;
    if (qNew) {
      products = await Product.find().sort({ createdAt: -1 }).limit(1);
    } else if (qCategory) {
      products = await Product.find({ categories: { $in: [qCategory] } });
    } else {
      products = await Product.find();
    }
    //RESPOND WITH ALL PRODUCTS DETAILS EXCEPT PASSWORD
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
