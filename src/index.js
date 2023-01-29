const path = require("path");
const express = require("express");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const cors = require("cors");
const bodyParser = require("body-parser");
const db = require("./db/db");
const app = express();
const port = process.env.PORT || 3000;

/**************NECESSARY INCLUDES*********** */

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

//**********IMPORTING ROUTES********* */
const errorController = require("./middleware/errorHandler");
const staffSignUpRoutes = require("./modules/staff/staff.routes");
const hospitalSignUpRoutes = require("./modules/hospital/hospital.routes");
const adminRoutes = require("./modules/admin/admin.routes");
const fileUpload = require("./modules/common/fileUpload/fileUpload.routes");
const other = require("./modules/common/zipToAddress/zipToAddress.routes");
const jobRoutes = require("./modules/job/job.routes");
const ratingRoutes = require("./modules/Rating/rating.routes");
const agreementRoutes = require("./modules/agreement/agreement.routes");

//*****************USING THE ROUTES************************* */

app.use("/v1/LHS/staff", staffSignUpRoutes);
app.use("/v1/LHS/hospital", hospitalSignUpRoutes);
app.use("/v1/LHS/admin", adminRoutes);
app.use("/v1/LHS/file", fileUpload);
app.use("/v1/LHS/other", other);
app.use("/v1/LHS/job", jobRoutes);
app.use("/v1/LHS/rating", ratingRoutes);
app.use("/v1/LHS/agreement", agreementRoutes);

app.use(errorController);
app.use(express.static("public"));
app.get("*", (req, res) => {
  res.sendFile("index.html", { root: path.join(__dirname, "../public/") });
});
//*************************************************************/

app.listen(port, () => {
  console.log("*************************************************************");
  console.log(
    `Server is up on port ${port}! Started at ${new Date().toUTCString()}`
  );
  console.log(`*************************************************************`);
});
