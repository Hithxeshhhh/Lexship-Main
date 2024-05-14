//development
const express = require("express");
const cors = require('cors');
const router = require("./routes/routes");
require("dotenv").config();
const app = express();
const port = process.env.PORT
app.use(express.json())
app.use(express.static('public'));
const corsOptions={
    exposedHeaders:['successful','failed']
}
app.use(cors(corsOptions))
app.use("/api/v1",router)
app.listen(port, ()=>{console.log(`App running on ${port}`)})

//production
// const express = require("express");
// const cors = require('cors');
// const router = require("./routes/routes");
// const https = require('https');
// const fs = require('fs');
// require("dotenv").config();

// const app = express();
// const options = {
//     key: fs.readFileSync('/etc/letsencrypt/live/dev1.lexship.biz/privkey.pem'),
//     cert: fs.readFileSync('/etc/letsencrypt/live/dev1.lexship.biz/fullchain.pem')
// }
// const port = process.env.PORT

// app.use(express.json())
// app.use(express.static('public'));
// app.use(cors())
// app.use("/api/v1",router)

// https.createServer(options, app).listen(5000);

