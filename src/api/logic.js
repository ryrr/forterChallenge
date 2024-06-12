const axios = require('axios')
const config = require('./config.json')
const cache = require('./cache.js')
exports.getIp = async (req,res,next) => {
    let ip = req.params.ipAddress
    let cachedValue = res.locals.cachedValue
    if(cachedValue){
        res.status(200).send(cachedValue)
    }else{
        let rateLimitExceeded = res.locals.rateLimitExceeded
        if(rateLimitExceeded){
            //pass execution to the fallback endpoint
            next()
        }
        else{
            console.log(`using ${config.default.baseURL}`)
            let requestURL = `${config.default.baseURL + ip}?` + `${config.default.tokenQueryParam}=${config.default.apiKey}` 
            try{
                let resp = await axios.get(requestURL)
                //we need this extra check because for some reason the ipStack API doesn't actually error when the request is bad
                if(!resp.data.country_name){
                    let errorObj = {"error":'Malformed or non-existing IP'}
                    cache.ipCache.set(ip,errorObj)
                    res.status(404).send(errorObj)
                }else{
                    let reply = {"country_name":resp.data.country_name}
                    cache.ipCache.set(ip,reply)
                    res.status(200).send(reply)
                }
            }
            catch(e){res.status(500).send('Something broke (probably a malformed URL)!')}
        }
    }
}
exports.fallbackGetIp = async (req,res) => {
    console.log(`using ${config.fallback.baseURL}`)
    let ip = req.params.ipAddress
    //No need to check cache here since the request always goes through the default method first
    //will get caught there and send res. Doing it here would be dead code
    let requestURL = `${config.fallback.baseURL + ip}?` + `${config.fallback.tokenQueryParam}=${config.fallback.apiKey}` 
    try{
        let resp = await axios.get(requestURL)
        let reply = {"country_name":resp.data.country}
        cache.ipCache.set(ip,reply)
        res.status(200).send(reply)
        
    }catch(e){res.status(404).send({"error":'Malformed or non-existing IP'})}
}