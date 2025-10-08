# # The Chronologicon Engine

A Node.js application to manage and analyze historical events with hierarchical timelines, searching, and deep insights.Built with **MYSQL**, **ExpressJS** and **BullMQ**.

---


## Run Locally

Clone the project

```bash
  git clone https://github.com/satnam2609/chronologicon_engine
```

Go to the project directory

```bash
  cd chronologicon_engine
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm run dev
```


## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`PORT`

`DB_HOST`

`DB_USER`

`DB_PASSWORD`

`DATABASE`


## Features

- Ingest events asynchronously using **BullMQ queues**.  
- Create hierarchical timelines with parent/child relationships.  
- Search events with filters: partial name, start/end dates, sorting, pagination.  
- Generate insights on overlapping events with duration calculation.  
- Fully configurable using **environment variables**.



## API Reference

#### Ingest historical events data

```http
  GET /api/events/ingest
```

| filePath | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `Request Body` | `string` | **Required**. |

#### Check Status of Background work

```http
  GET /api/events/ingestion-status/:jobId
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `jobId`      | `string` | **Required**. Id of job to check status |

```http
  GET /api/events/search
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `name`      | `string` | **Optional**. Partial Searching |
| `start_date_after`      | `string` | **Optional**.|
| `end_date_before`      | `string` | **Optional**.  |
| `sortBy`      | `string` | **Optional**. name, start_date or end_date |
| `sortOrder`      | `string` | **Optional**. ASC or DESC |
| `page`      | `number` | **Optional**.Default 1 |
| `limit`      | `number` | **Optional**. Deafault 10 |


```http
  GET /api/insights/overlapping-events
```
```http
  GET /api/timeline/:rootEventId
```
