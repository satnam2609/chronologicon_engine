const express = require("express");
const { overlappingEvents } = require("../controllers/insights");

const router = express.Router();

router.get("/insights/overlapping-events",overlappingEvents)

module.exports = router;
