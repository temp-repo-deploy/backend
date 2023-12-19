
const User = require('../models/user.js');
const Case = require('../models/caseModel.js');

const ErrorResponse = require('../utils/errorResponse');


exports.signup = async (req, res, next) => {
  const { email } = req.body;
  console.log(req.body)
  const userExist = await User.findOne({ email });
  console.log({ email })
  if (userExist) {
    return next(new ErrorResponse("E-mail already registred", 400));
  }
  try {
    const user = await User.create(req.body);
    res.status(201).json({
      success: true,
      user
    })
  } catch (error) {
    next(error);
  }
}


exports.signin = async (req, res, next) => {

  try {
    const { email, password } = req.body;
    //validation
    if (!email) {
      return next(new ErrorResponse("please add an email", 403));
    }
    if (!password) {
      return next(new ErrorResponse("please add a password", 403));
    }

    //check user email
    const user = await User.findOne({ email });
    if (!user) {
      return next(new ErrorResponse("invalid credentials", 400));
    }
    //check password
    const isMatched = await user.comparePassword(password);
    if (!isMatched) {
      return next(new ErrorResponse("invalid credentials", 400));
    }

    sendTokenResponse(user, 200, res);

  } catch (error) {
    next(error);
  }
}

const sendTokenResponse = async (user, codeStatus, res) => {
  const token = await user.getJwtToken();
  res
    .status(codeStatus)
    .cookie('token', token, { maxAge: 60 * 60 * 1000, httpOnly: true })
    .json({
      success: true,
      // role: user.role
      type: user.type

    })
}


// log out
exports.logout = (req, res, next) => {

  res.clearCookie('token');
  res.status(200).json({
    success: true,
    message: "logged out"
  })
}

let username = ""
// user profile
exports.userProfile = async (req, res, next) => {

  const user = await User.findById(req.user.id).select('-password');
  username = user.type;
  // console.log(username)

  res.status(200).json({
    success: true,
    user
  })
}

exports.usertype = async (req, res, next) => {
  try {
    // Assuming username is a global variable or defined in the same module
    res.status(200).json({
      success: true,
      userType: username // Use the username variable to get the user type
    });
  } catch (error) {
    // Handle any errors
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
};

exports.getUserCases = async (req, res, next) => {
  try {
    //   const user = await User.findById(req.user.id).populate('cases', 'objectId'); // Adjust 'cases' and 'objectId' based on your model definitions
    const user = await User.findById(req.user.id).populate('cases');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const caseObjectIds = user.cases.map(caseItem => caseItem.objectId); // Adjust 'objectId' based on your Case model fields

    res.status(200).json({
      success: true,
      caseObjectIds,
    });

  } catch (error) {
    next(error);
  }

};

exports.getUserCasesDetails = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'cases',
      populate: {
        path: 'objects', // Modify 'objects' based on your Case model fields
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    console.log('User Cases:', user.cases);

    // Log the objects within each case
    user.cases.forEach((caseItem) => {
      console.log(`Case ${caseItem._id}:`, caseItem);
    });

    res.status(200).json({
      success: true,
      cases: user.cases,
    });

  } catch (error) {
    console.error(error);
    next(error);
  }
};
