const ingestionQueue = require("../queue");
const db = require("../db");

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * 
 * @dev BullMQ based queue will take the filePath and return the jobId for 
 * tracking the job.
 * 
 * Note: The Current version only includes providing the filePath and 
 * the worker would read content from that location for processing.
 */
exports.ingestController = async (req, res) => {
  try {
    const { filePath } = req.body;

    const job = await ingestionQueue.add("ingestion", {
      filePath,
    });

    const jobId = job.id;

    return res.status(200).json({
      status: "Ingestion initiated",
      jobId: jobId,
      message: "Check /api/events/ingestion-status/" + jobId + " for updates.",
    });
  } catch (error) {
    console.error("Ingestion failed with error: ", error);
    return res.status(500).json({
      status: "Ingestion failed",
      message: "Intenal Server Error",
    });
  }
};

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * 
 * While worker processes the file content and insert into the rows
 * client can check the status of the job by providing the jobId
 */
exports.ingestionStatus = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await ingestionQueue.getJob(jobId);
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    const status = await job.getState();
    const result = job.returnvalue || null;

    let queueStatus;
    if (status === "completed") queueStatus = "Completed";
    else if (
      status === "waiting" ||
      status === "active" ||
      status === "delayed"
    )
      friendlyStatus = "Processing";
    else if (status === "failed") queueStatus = "Failed";
    else queueStatus = status;

    return res.json({
      jobId,
      status: friendlyStatus,
      ...result,
    });
  } catch (error) {
    console.error("Failed to get ingestion status with error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};


/**
 * 
 * @param {*} req 
 * @param {*} res 
 * 
 * As per the request query is specified, DB query is modified and then executed.
 */
exports.searchEvent = async (req, res) => {
  try {
    const {
      name,
      start_date_after,
      end_date_before,
      sortBy,
      sortOrder = "asc",
      page = 1,
      limit = 10,
    } = req.query;

    let query = "SELECT event_id, event_name FROM historical_events WHERE 1=1";
    const params = [];

    if (name) {
      query += " AND LOWER(event_name) LIKE ?";
      params.push(`%${name.toLowerCase()}%`);
    }

    if (start_date_after) {
      query += " AND start_date >= ?";
      params.push(start_date_after);
    }

    if (end_date_before) {
      query += " AND end_date <= ?";
      params.push(end_date_before);
    }

    // If sortBy is not speicified then cannot modify the sortOrder query
    const canSorts = ["start_date", "end_date", "event_name"];
    if (sortBy && canSorts.includes(sortBy)) {
      const order = sortOrder.toLowerCase() === "desc" ? "DESC" : "ASC";
      query += ` ORDER BY ${sortBy} ${order}`;
    }

    query += " LIMIT ? OFFSET ?";
    params.push(Number(limit), Number((page - 1) * limit));

    const [rows] = await db.query(query, params);

    return res.json({
      totalEvent: rows.length,
      page: Number(page),
      limit: Number(limit),
      events: rows,
    });
  } catch (error) {
    console.error("Failed to search with error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
