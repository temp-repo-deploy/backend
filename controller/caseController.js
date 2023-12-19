const mongoose = require("mongoose");
const Case = require("../models/caseModel.js");
const User = require("../models/user.js");
const MasterCase = mongoose.model("MasterCase", Case.schema);
const { ObjectId } = require("mongodb");
const axios = require("axios")

// exports.addCase = async (req, res) => {
//   try {
//     const { courtID, step, ...restOfData } = req.body;
//     const userID = req.user._id;

//     let caseDetails = {};
//     let petitionerDetails = {};
//     let responderDetails = {};
//     let otherCaseDetails = {};

//     // Extract relevant data based on the step
//     switch (step) {
//       case 1:
//         caseDetails = restOfData;
//         break;
//       case 2:
//         caseDetails = req.user.caseDetails; // Assuming user already has caseDetails from step 1
//         petitionerDetails = restOfData;
//         break;
//       case 3:
//         caseDetails = req.user.caseDetails;
//         petitionerDetails = req.user.petitionerDetails; // Assuming user already has petitionerDetails from step 2
//         responderDetails = restOfData;
//         break;
//       case 4:
//         caseDetails = req.user.caseDetails;
//         petitionerDetails = req.user.petitionerDetails;
//         responderDetails = req.user.responderDetails; // Assuming user already has responderDetails from step 3
//         otherCaseDetails = restOfData;
//         break;
//       default:
//         return res.status(400).json({ error: 'Invalid step' });
//     }

//     const caseModel = mongoose.model(`Case_${courtID}`, Case.schema);

//     const newCase = new caseModel({
//       courtID,
//       userID,
//       ...caseDetails,
//       petitioner: { ...petitionerDetails },
//       responder: { ...responderDetails },
//       ...otherCaseDetails,
//     });


//     await newCase.save();

//     // Update user's details based on the step
//     const updateFields = {};
//     switch (step) {
//       case 1:
//         updateFields.caseDetails = newCase._id;
//         break;
//       case 2:
//         updateFields.petitionerDetails = newCase._id;
//         break;
//       case 3:
//         updateFields.responderDetails = newCase._id;
//         break;
//       case 4:
//         updateFields.otherCaseDetails = newCase._id;
//         break;
//     }


//     await User.findByIdAndUpdate(userID, { $set: updateFields });



//     res.status(201).json({ message: 'Case details added successfully', case: newCase });
//   } catch (err) {
//     console.log(err.message);
//     res.status(500).json({ error: err.message });
//   }
// };




exports.addCase = async (req, res) => {
  try {
    const { courtID, ...restOfData } = req.body;

    // Assuming req.user contains the user information
    const userID = req.user._id;

    // Create a new collection based on courtID
    const caseModel = mongoose.model(`Case_${courtID}`, Case.schema);

    // calculating the severity using the model     

    const caseDescriptionforModel = restOfData.caseDetails.caseDescription;
    console.log(caseDescriptionforModel);

    // converting section acts to string
    const sectionsActsArray = restOfData.legalDetails;
    const legalDetailsArray = sectionsActsArray;
    // Convert data to string
    const legalDetailsString = legalDetailsArray
      .map((details) => `${details.act} ${details.section}`)
      .join(', ');
    console.log(legalDetailsString);

    const sectionsActs = legalDetailsString;
    console.log(sectionsActs);

    // const url = `https://${API_ENDPOINT}/v1/projects/${PROJECT_ID}/locations/${LOCATION_ID}/publishers/google/models/${MODEL_ID}:predict`;

    const url = `https://us-central1-aiplatform.googleapis.com/v1/projects/global-incline-407709/locations/us-central1/publishers/google/models/text-bison:predict`;

    const TOKEN = `ya29.a0AfB_byD2RsdWjLgp324X1nFNGHjk-PayWFUG4kF1WFujlAes9vUAEWcU4Q1a3_6HGvne3q-x4DKTb5jhpeio0rVvFAzoRHlJNhUjtjc3u4bnY6lW8w0_8Me5B5r7UBtUs5jQnhsIodPJHMXijyOzVJAcQuNhreq5pBQmLn3_IS86_6YSPGz2ZmmFLuD89sghtQ_lzArr68hoxo0YXZZzon5_ZWYdVjM2v6yqMivhRJeycf-GzuLc1m9--r7M0XvA181fmxkAZ9CmRXmFLzF1vnowHD4_3Sx1DzCmWhdHcDsxSGeAy1OiP6fivg8kEVUiSOV5-I4exC_h1hL52QF8aoNmTU_bVIRYT6XV8vtx6J6cZHNR--0-ZjJUuwxMfJIx6YVj6uqCrYT5MTKBwjCdR4vXCv7n8U8aCgYKAcQSARISFQHGX2MiEvj3Iz8AAi2aETXj2oKcSg0422`;



    let caseId = "CS001";

    const data = {
      instances: [
        {
          content: `You are an assistant that should answer any questions based on Indian cases also use Indian penal codes and states laws and all the laws of India if asked, analyze the input to give severity of the case(from 1 to 10 ) based case complexity and nature of case and time to dispose the case and max punishable year from 1-10 along with the sections that could be imposed on it.
    
              input: Case ID
              input: Sections acts
              input: case description 
              output: Severity of the Case :
    
              input: Case ID - ${caseId}
              input: Sections acts : ${sectionsActs}
              input: case description : ${caseDescriptionforModel}
              output:
              `,
        },
      ],
      parameters: {
        candidateCount: 2,
        maxOutputTokens: 1024,
        temperature: 0.9,
        topP: 1,
        topK: 23,
      },
    };

    const response = await axios.post(url, data, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(response);
    const prediction = response.data.predictions[0].content;
    console.log(prediction);

    // Function to extract severity of the case using regex and convert to number
    function extractSeverityAsNumber(prediction) {
      const severityRegex = /\Severity of the Case:\*\*\ (\d+(?:\/\d+)?)/;
      const match = prediction.match(severityRegex);
      if (match && match.length > 1) {
        const severityString = match[1];
        return parseInt(severityString, 10);
      } else {
        return null;
      }
    }

    // Extracting severity of the case as a number
    const getSeverity = extractSeverityAsNumber(prediction);
    let severity = getSeverity;
    if (severity !== null) {
      console.log(`Severity of the case: ${severity}`);
    } else {
      severity = 10;
      // console.log("Severity information not found in the provided data.");
    }

    console.log(severity);
    // const severity = 155153;
    // Create a new document using the specific model
    const newCase = new caseModel({ courtID, userID, severity, ...restOfData });


    // Save the document to the specific courtID table
    await newCase.save();

    // Save the case ID to the user's cases array
    await User.findByIdAndUpdate(userID, { $addToSet: { cases: newCase._id } });

    // Update the mastercases table
    const masterCase = new MasterCase({ courtID, userID, severity, ...restOfData });
    await masterCase.save();






    res.status(201).json({ message: 'Case added successfully', case: newCase });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: err.message });
  }
};




exports.getAllCases = async (req, res) => {
  try {
    const mastercases = await Case.find();
    res.json(mastercases);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.updateCase = async (req, res) => {
  console.log("update case");
  const { id } = req.params;
  console.log(req.params);
  const { data } = req.body;
  console.log(data);
  try {
    const updatedCase = await Case.findByIdAndUpdate({ _id: id }, req.body);
    if (!updatedCase) {
      return res.status(404).json({ error: "Case not found" });
    }
    // console.log(updatedCase)
    await res.json({ message: "Case updated successfully", case: updatedCase });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteCase = async (req, res) => {
  console.log("delete case");
  const { caseId } = req.params;
  console.log(req.params);
  try {
    const deletedCase = await Case.findByIdAndDelete(caseId);
    if (!deletedCase) {
      return res.status(404).json({ error: "Case not found" });
    }
    res.json({ message: "Case deleted successfully", case: deletedCase });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// for the judge dashboard
exports.getCasesByCourtType = async (req, res) => {
  try {
    const { courtType } = req.params;
    const cases = await Case.find({ courtType });
    res.json(cases);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getUserCasesDetails = async (req, res, next) => {
  try {
    const userId = req.user.id;
    console.log("User ID:", userId);

    const user = await User.findById(userId).populate({
      path: "cases",
      populate: {
        path: "objects", // Adjust this path based on your Case model
      },
    });

    if (!user) {
      console.log("User not found");
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log("User Cases:", user.cases);

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
