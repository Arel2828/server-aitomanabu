import express from "express";
import dotenv from "dotenv";
import bodyParser, { json } from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import * as dynamoose from "dynamoose";
import courseRoutes from "./routes/courseRoutes";
import serverless from "serverless-http";
import seed from "./seed/seedDynamodb";
import {
  clerkMiddleware,
  createClerkClient,
  requireAuth,
} from "@clerk/express";
import userClerkRoutes from "./routes/userClerkRoutes";
import transactionRoutes from "./routes/transactionRoutes";
import userCourseProgressRoutes from "./routes/userCourseProgressRoutes";

//Route imports

// configurations
dotenv.config();

const isProduction = process.env.NODE_ENV === "production";
if (!isProduction) {
  dynamoose.aws.ddb.local();
}

export const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});
const corsConfig = {
  origin: "*",
  credential: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
};

const app = express();
app.use(helmet());
// app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.options("", cors(corsConfig));
app.use(cors(corsConfig));
app.use(clerkMiddleware());

//Routes
app.get("/", (req, res) => {
  res.send("hello World");
});
app.use("/courses", courseRoutes);
app.use("/user/clerk", requireAuth(), userClerkRoutes);
app.use("/transactions", requireAuth(), transactionRoutes);
app.use("/users/course-progress", requireAuth(), userCourseProgressRoutes);

const port = process.env.PORT || 3000;
if (!isProduction) {
  app.listen(port, () => {
    console.log(`SERVER running on port${port}`);
  });
}

export default app;

// aws production env
// const severlessApp = serverless(app);
// export const handler = async (event: any, context: any) => {
//   if (event.action === "seed") {
//     await seed();
//     return {
//       statusCode: 200,
//       body: JSON.stringify({ message: "Data seeded successfully" }),
//     };
//   } else {
//     return severlessApp(event, context);
//   }
// };
