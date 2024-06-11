const rateLimit  = require("express-rate-limit");
const config = require('./config.json')
const cache = require('./cache.js')
exports.defaultRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 HOUR
    limit: config.default.rateLimit, 
    standardHeaders: true, 
    legacyHeaders: false, 
    handler: (req, res, next, options) =>{
        //this FN is called when the default endpoint is in a rateLimited state
        //sets a rateLimited flag and passes execution to the fallback endpoint
        console.log(`${config.default.baseURL} rateLimit reached`)
        res.locals.rateLimitExceeded = true;
        next()
        
    },
    skip: (req, res) => {
       //If IP is found in cache then ignore rateLmiting behavior and return cached value 
       let cachedValue = cache.ipCache.get(req.params.ipAddress)
       if(cachedValue){
            console.log(`cache hit!`)
            res.locals.cachedValue = cachedValue;
            return true
       }
       else return false
    }
});

exports.fallbackRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 HOUR
    limit: config.fallback.rateLimit, 
    standardHeaders: true, 
    legacyHeaders: false, 
    handler: (req, res, next, options) =>{
        //runs when both endpoints are currently rateLimited and sends a statusCode + Msg
        console.log(`${config.fallback.baseURL} rateLimit reached`)
        res.status(options.statusCode).send(options.message)
    },
    skip: (req, res) => {
        //no need to implement this because the cache always gets checked in the first rateLimiter
    }
});