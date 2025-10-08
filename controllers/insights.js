const db = require("../db");
const { toMySQLDateTime } = require("../utils");

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * 
 * 
 * This endpoint will take input as start date and the
 * end date, and try to fetch the pair of events that overlapp withing this time period
 * and also specify the overlapping time period.
 */
exports.overlappingEvents = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ error: "startDate and endDate are required" });
    }

    const start = toMySQLDateTime(startDate); // mySQL compatible date time
    const end = toMySQLDateTime(endDate);  // mySQL compatible date time


    // self joining the tables and finding the pairs.
    const [rows] = await db.query(
      `
      SELECT 
        t1.event_id AS event1_id,
        t1.event_name AS event1_name,
        t1.start_date AS event1_start,
        t1.end_date AS event1_end,
        t2.event_id AS event2_id,
        t2.event_name AS event2_name,
        t2.start_date AS event2_start,
        t2.end_date AS event2_end,
        TIMESTAMPDIFF(
          MINUTE,
          GREATEST(t1.start_date, t2.start_date, ?),
          LEAST(t1.end_date, t2.end_date, ?)
        ) AS overlap_duration_minutes
      FROM historical_events t1
      JOIN historical_events t2
        ON t1.event_id < t2.event_id
        AND t1.start_date < t2.end_date
        AND t1.end_date > t2.start_date
      WHERE t1.start_date < ? AND t1.end_date > ?
        AND t2.start_date < ? AND t2.end_date > ?;
      `,
      [start, end, end, start, end, start]
    );

    const formatted = rows.map((row) => ({
      overlappingEventPairs: [
        {
          event_id: row.event1_id,
          event_name: row.event1_name,
          start_date: row.event1_start,
          end_date: row.event1_end,
        },
        {
          event_id: row.event2_id,
          event_name: row.event2_name,
          start_date: row.event2_start,
          end_date: row.event2_end,
        },
      ],
      overlap_duration_minutes: row.overlap_duration_minutes,
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    console.error("Failed to fetch the overlapping events with error: ", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
