const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const bodyParser = require("body-parser");
require("dotenv").config();
const fs = require("fs");
const PORT = process.env.PORT || 8000;


// express app
const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(morgan("dev"));

// reading contents of the /routes folder
fs.readdirSync("./routes/").map((r) => {
  app.use("/api/", require("./routes/" + r));
});


// listening to port
app.listen(PORT, () => console.log("Server running at PORT: ", PORT));
