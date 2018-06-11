# Sample Node.js Express Cloudant Server

Creates a simple node.js express API server, which is connected to a Cloudant DB.

## Before you Begin

For running locally, the Server uses the vcap-local.json file to load the Cloudant DB Config. When deployed, the process.env.VCAP_SERVICES variable must point to the config required for the CloudantDB Connection.