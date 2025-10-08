const express = require("express");
const {
  ingestController,
  ingestionStatus,
  searchEvent,
} = require("../controllers/events");

const router = express.Router();

router.post("/events/ingest", ingestController);
router.get("/events/ingestion-status/:jobId", ingestionStatus);
router.get("/events/search", searchEvent);

module.exports = router;
