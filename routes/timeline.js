const express = require("express");
const { getTimelineEvents } = require("../controllers/timeline");

const router = express.Router();


router.get('/timeline/:rootEventId',getTimelineEvents);

module.exports=router;