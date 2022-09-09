const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  //GET JWT FROM HEADER OF REQUEST
  const authHeader = req.headers.token;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    //VERIFY THE JWT
    jwt.verify(token, process.env.JWT_KEY, (err, user) => {
      if (err) {
        res.status(403).json("Token is not valid");
        return;
      } else {
        //CREATE A NEW KEY IN THE REQ AND ASSIGN IT THE VALUE OF THE USER DETAILS GOTTEN FROM THE JWT
        req.user = user;
      }
      //CALL THE NEXT CALLBACK FUNCTION
      next();
    });
  } else {
    //IF THERE IS AN ERROR
    res.status(401).json("You are not Authenticated");
  }
};

//CHECK TO CONFIRM THAT IT A USER AND NOT AN ADMIN
const verifyTokenAndAuthorization = (req, res, next) => {
  verifyToken(req, res, () => {
    //CHECK IF THE ID FROM THE JWT MATCHES THAT OF THE LOGGED IN USER
    if (req.user.id === req.params.id || req.user.isAdmin) {
      //CALL THE NEXT CALLBACK FUNCTION
      next();
    } else {
      //IF THERE IS AN ERROR
      res.status(403).json("You are not allowed to do that");
    }
  });
};

//CHECK TO CONFIRM THAT IT IS AN ADMIN AND NOT A USER
const verifyTokenAndAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    //CHECK IF THE ID FROM THE JWT MATCHES THAT OF THE LOGGED IN ADMIN
    if (req.user.isAdmin) {
      //CALL THE NEXT CALLBACK FUNCTION
      next();
    } else {
      //IF THERE IS AN ERROR
      res.status(403).json("You are not allowed to do that");
    }
  });
};

module.exports = {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
};
