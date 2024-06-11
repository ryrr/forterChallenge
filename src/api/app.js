//APP CODE
//code up some unit testing?
const express = require("express"); 
const cors = require('cors')
const logic = require('./logic.js')
const middleware = require('./middleware.js')
const config = require('./config.json')
const PORT = config.serverPort
const [rateLimiter,fallbackRateLimiter] = [middleware.defaultRateLimiter,middleware.fallbackRateLimiter]

const app = express(); 
app.use(express.json());
app.use(cors())



//only the first endpoint here is user accessible as the endpoints are the same route and the first one will ALWAYS be called
//two endpoints needed for separate vendor rateLimiting
app.get('/ipInfo/:ipAddress',rateLimiter,logic.getIp)
app.get('/ipInfo/:ipAddress',fallbackRateLimiter,logic.fallbackGetIp)

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));