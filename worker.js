const { Worker } = require("bullmq");
const fs = require("fs");
const readline = require("readline");
const db = require("./db");
const {toMySQLDateTime}=require('./utils');



/**
 * This is the worker that will manage the background jobs.
 * Reads the content from the file path and then parses the fields
 * and note how much lines are been processed and found error with
 * asyncronously making query with the mySQL database to insert into 
 * the rows.
 * 
 * 
 * Note: This version of engine only has the feature to take the filePath and 
 * read the content of the file using nodejs modules.
 */
const ingestionWorker = new Worker(
  "ingestionQueue",
  async (job) => {
    const jobId = job.id;
    const { filePath } = job.data;
    console.log(`Processing JobId:${jobId} for file: ${filePath}`);

    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    let processedLine = 0,
      errorLine = 0;

    for await (const line of rl) {
      if (!line.trim()) continue;

      const parts = line.split("|");
      if (parts.length < 6) {
        errorLine++;
        continue;
      }

      const [
        event_id,
        event_name,
        start_date,
        end_date,
        parent_event_id,
        ...descParts
      ] = parts;

      const despcription = descParts.join("|");

      try {
        const duration = Math.floor(
          (new Date(end_date) - new Date(start_date)) / 60000 || 0
        );

        await db.query(
          "INSERT INTO historical_events (event_id, event_name, start_date, end_date, duration_minutes, parent_event_id, description)  VALUES (?,?,?,?,?,?,?)",
          [
            event_id,
            event_name,
            toMySQLDateTime(start_date),
            toMySQLDateTime(end_date),
            duration,
            parent_event_id === "NULL" ? null : parent_event_id,
            despcription,
          ]
        );

        processedLine++;
      } catch (error) {
        console.error(`Error inserting line: ${line}`, error);
        errorLine++;
      }
    }

    console.log(
      `Job ${jobId} completed — Processed: ${processedLine}, Errors: ${errorLine}`
    );
    return { processedLine, errorLine };
  },
  {
    connection: {
      host: "127.0.0.1",
      port: 6379,
    },
  }
);


// Logging work progress
ingestionWorker.on("completed", (job, result) => {
  console.log(`Job ${job.id} completed with result:`, result);
});

ingestionWorker.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed:`, err);
});
