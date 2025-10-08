const db = require("../db");


/**
 * 
 * @param {*} req 
 * @param {*} res 
 * 
 * This endpoint takes the input as the rootEventId and then 
 * tries to fetch the event that has caused other events.
 * 
 * Core Idea: Using recusrive CTE for finding the hirearchical events.
 */
exports.getTimelineEvents = async (req, res) => {
  const { rootEventId } = req.params;

  try {
    const [rows] = await db.query(
      `
      WITH RECURSIVE event_tree AS (
          -- base case: root is the one which has parent_event_id as NULL
          SELECT * 
          FROM historical_events
          WHERE event_id = ?

          UNION ALL
          
          -- recursive finding of child nodes
          SELECT child.* 
          FROM historical_events AS child
          INNER JOIN event_tree AS parent
          ON child.parent_event_id = parent.event_id
      )
      SELECT * FROM event_tree;
      `,
      [rootEventId]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "Root event not found" });
    }

    const eventsMap = {};
    let root = null;

    // first pass
    rows.forEach((row) => {
      row.children = [];
      eventsMap[row.event_id] = row;
    });

    // second pass 
    rows.forEach((row) => {
      if (row.parent_event_id) {
        const parent = eventsMap[row.parent_event_id];
        parent.children.push(row);
      } else {
        root = row;
      }
    });

    res.json(root);
  } catch (error) {
    console.error("Failed to fetch events timeline with error: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
