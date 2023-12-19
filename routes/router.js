const express = require("express");
const route = express.Router();
const caseController = require("../controller/caseController");
const authController = require("../controller/authController");
const userController = require("../controller/userController");
const scheduleController = require("../controller/scheduleController")
const render = require("../services/render");
const {
  isAuthenticated,
  isJudge,
  isLawyer,
  isAdmin,
  isCourtAdmin
} = require("../middleware/auth");

// To take input from frontend
// route.post("/submitForm", isAuthenticated, (req, res) => {
//     try {
//         const { district, /* other form fields */ } = req.body;

//         // Create a new case instance and save it to the database
//         const newCase = new Case({ district, /* other form fields */ });
//         newCase.save();

//         // Respond with a success message
//         res.status(201).json({ message: 'Form submitted successfully' });
//     } catch (error) {
//         // Handle errors and respond with an error message
//         console.error(error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });

/**
 *  @description Root Route
 *  @method GET /
 */
route.get("/", render.homeRoutes);

/**
 * @description get cases by court type
 * @method GET /getCasesByCourtType/:courtType
 */
route.get(
  "/getCasesByCourtType/:courtType",
  isAuthenticated,
  caseController.getCasesByCourtType
);

/**
 * @description update case
 * @method PUT /updateCase
 */
try {
  route.put(
    "/updateCase/:id",
    isAuthenticated,
    isLawyer,
    caseController.updateCase
  );
} catch (err) {
  console.log(err);
}

// you must sign in before using this
/**
 * @description case management
 *  @method GET /allCases
 */
// route.get("/allCases", isAuthenticated, isJudge, caseController.getAllCases);

route.get("/allCases", caseController.getAllCases);

/**
 * @description add case
 * @method POST /addCase
 */

route.post("/addCase", isAuthenticated, isLawyer, caseController.addCase);

/**
 * @description delete case
 * @method DELETE /deleteCase
 */
route.delete(
  "/deleteCase/:caseId",
  isAuthenticated,
  isLawyer,
  caseController.deleteCase
);

//! Authentication Routes

/**
 * @description Signup
 * @method POST /signup
 */
route.post("/signup", authController.signup);

/**
 * @description Signin
 * @method POST /signin
 */
route.post("/signin", authController.signin);

/**
 * @description Logout
 * @method  /logout
 */

route.get("/logout", isAuthenticated, authController.logout);

/**
 * @description user profile
 * @method  /me
 */
route.get("/me", isAuthenticated, authController.userProfile);

//! User Routes

/**
 * @description get all users
 * @method GET /allusers
 */
route.get("/allusers", isAuthenticated, isAdmin, userController.allUsers);

/**
 * @description get Single users
 * @method GET /user/:id
 */
route.get("/user/:id", isAuthenticated, userController.singleUser);

/**
 * @description get all users
 * @method PUT /users
 */
route.put("/user/edit/:id", isAuthenticated, userController.editUser);

// /**
//  * @description get user cases with details
//  * @method GET /userCasesDetails
//  */
// route.get("/getUserCases", isAuthenticated, authController.getUserCases);

/**
 * @description get user cases with details
 * @method GET /userCasesDetails
 */
route.get("/getUserCasesDetails", isAuthenticated, caseController.getUserCasesDetails);

/**
 * @description get all users
 * @method GET /allusers
 */
route.get("/usertype", isAuthenticated, authController.usertype);

//! routes for judge
/**
 * 
 * @description schedule all cases, input courtId
 * @method POST /schedule
 */

route.post('/scheduleCasesJudge', isAuthenticated, isJudge, scheduleController.scheduleCases);

/**
 * @description update the Sverity of the, input CourtID and CaseID
 * @method PUT
 */
route.put('/updateSeverity', isAuthenticated, isJudge, scheduleController.updateSeverity);

//! Court Admin routes

/**
 * @description schedule all cases 
 */
route.post('/scheduleCases', isAuthenticated, isCourtAdmin, scheduleController.scheduleCases);




module.exports = route;
