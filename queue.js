const { Queue } = require("bullmq");


/**
 * This queue will work as a producer to manage all the background works
 * for ingesting data via API
 * 
 * Note: Redis docker container is exposed locally and mapped to port 6379
 */
const ingestionQueue = new Queue("ingestionQueue", {
  connection: {
    host: "127.0.0.1",
    port: 6379,
  },
});



module.exports = ingestionQueue;
