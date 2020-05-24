# Griffon

A message queue for easily building workflows.  A griffon server acts a hub, connecting griffon clients.  Clients connect and kickoff tasks within a workflow, then relay the results when they are done.  Griffon tracks dependecies as clients connect, and provides a powerful architecture for developing against, debugging, and running complex workflows.


## Getting Started


### Prerequisites

Griffon is backed by a database. Currently the only supported data store is MongoDB. Make sure to have a working MongoDB connection string available to run the Griffon server.

### Installing

```
npm install griffon
```

### Running

```
const griffon = require('griffon')


// Connects the Griffon server to it's backing database.
await griffon.connectDB({mongo_uri: 'mongodb://127.0.0.1:27017/griffon'})

// Serves the Griffon Dashboard, which helps you visualize, debug, and rerun tasks within the workflow.
await griffon.serveDashboard({port: 3000})

// Serves the Griffon message queue, which clients connect to.
await griffon.serveWorkflow({port: 3001})
```

And that's it!