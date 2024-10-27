const express = require("express");
const { z } = require("zod");
const { PrismaClient } = require("@prisma/client");
// import { PrismaClient } from '@prisma/client'

const cors = require("cors");
const prisma = new PrismaClient();
const app = express();
const allowedOrigin = "http://localhost:5173";
app.use(express.json());

// // USing the cors functionality to block some other uses
// app.use(
//   cors({
//     origin: function (origin, callback) {
//       if (origin === allowedOrigin || !origin) {
//         // Allow access if the origin matches the allowed origin
//         callback(null, true);
//       } else {
//         // Block the request if the origin is not allowed
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
//   })
// );

app.use(cors());
// resume Schema
const resumeSchema = z.object({
  title: z.string().min(2),
  userEmail: z.string().email(),
});

//  1) // post to create the resume
app.post("/addresume", async (req, res) => {
  const { title, userEmail } = req.body;
  console.log(req.body);

  if (!resumeSchema.safeParse(req.body).success) {
    return res.status(501).json({
      status: "failed",
      message: "please provide all the details",
    });
  }

  try {
    const newResume = await prisma.resume.create({
      data: {
        title,
        userEmail,
      },
    });
    res.status(201).json({
      status: "sucess",
      data: {
        newResume,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(404).json({
      status: "failed",
      message: "there is an error while creating your resume",
    });
  }
});

// 2)  // add the experience
app.post("/addexperience", async (req, res) => {
  const {
    resumeId,
    startDate,
    endDate,
    companyName,
    summary,
    state,
    city,
    currentlyWorking,
    title,
  } = req.body;

  const experinceSchema = z.object({
    resumeId: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    companyName: z.string(),
    summary: z.string(),
    state: z.string(),
    city: z.string(),
    currentlyWorking: z.boolean(),
    title: z.string(),
  });

  if (!experinceSchema.safeParse(req.body).success) {
    return res.json({
      status: "failed",
      message: "please provide all the details",
    });
  }

  try {
    const newExperience = await prisma.experience.create({
      data: {
        title,
        currentlyWorking,
        city,
        state,
        summary,
        companyName,
        EndDate: endDate,
        startDate,
        resumeId: Number(resumeId),
      },
    });

    res.status(200).json({
      status: "success",
      data: {
        newExperience,
      },
    });
  } catch (err) {
    console.log("err", err);
    res.status(404).json({
      status: "failed",
      message: "Error occured while doing this ",
    });
  }
});

// 3)  Route to get the resume
app.post("/resume", async (req, res) => {
  console.log(req.body);
  const { userEmail } = req.body;
  const EmailSchema = z.string().email();

  if (!EmailSchema.safeParse(userEmail).success) {
    return res.status(404).json({
      status: "failed",
      message: "please provide a vallid email address",
    });
  }
  try {
    const resumes = await prisma.resume.findMany({
      where: {
        userEmail,
      },
    });

    res.status(200).json({
      status: "sucess",
      data: {
        resumes,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(404).json({
      status: "failed",
      message: "Erro while getting the resumes",
    });
  }
});

// Update the personal details of the resume
app.post("/resumeupdate", async (req, res) => {
  console.log(req.body);

  const { resumeId } = req.body;
  const body = req.body;
  const { email, firstName, lastName, phone, jobTitle, address, summary } =
    req.body;

  // let data=[];
  // for(let i=0 ; i>body.length; i++){
  //   if(body.resumeId){

  //   }else{

  //     data.push(body[i])
  //   }

  // }

  // title String
  // userEmail String ?
  // firstName String ?
  // lastName String ?
  // phone String ?
  // email String ?
  // address String ?
  // summary String ?

  try {
    const updatedResume = await prisma.resume.update({
      where: {
        resumeId: parseInt(resumeId),
      },
      data: {
        email: email || "",
        firstName: firstName || "",
        lastName: lastName || "",
        phone: phone || "",
        jobTitle: jobTitle || "",
        address: address || "",
        summary: summary || "",
      },
    });

    res.status(200).json({
      status: "success",
      data: {
        updatedResume,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(404).json({
      message: "there is an error while updating  the data",
      status: "failed",
    });
  }
});

app.post("/updatesummary", async (req, res) => {
  const { resumeId, summary } = req.body;


  // checking for the resumeId and summary
  if (!resumeId || !summary) {
    return res.status(400).json({
      message: "please provide all the details",
      status: "failed",
    });
  }

  try {
    const updatedResume = await prisma.resume.update({
      where: {
        resumeId:parseInt(resumeId),
      },
      data: {
        summary:summary,
      },
    });

    res.status(200).json({
      data: updatedResume,
      status: "success",
    });
  } catch (err) {
    console.log(err);
    res.status(404).json({
      status: "failed",
      message: "there is an error occured while updating your resume ...",
    });
  }
});

app.listen(3000, () => {
  console.log("I am running at port 3000");
});
