const axios = require('axios')
const config = require('./config.json')
const cache = require('./cache.js')
exports.getIp = async (req,res,next) => {
    let ip = req.params.ipAddress
    let cachedValue = res.locals.cachedValue
    if(cachedValue){
        res.send({"country_name":cachedValue})
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
                    res.status(404).send({"error":'Malformed or non-existing IP'})
                }else{
                    cache.ipCache.set(ip,resp.data.country_name)
                    res.send({"country_name":resp.data.country_name})
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
        //*******perhaps delete the inner catch here*********
        let resp = await axios.get(requestURL)
        if(!resp.data.country){res.status(404).send({"error":'Malformed or non-existing IP'})}
        else{
            cache.ipCache.set(ip,resp.data.country)
            res.send({"country_name":resp.data.country})
        }
    }catch(e){res.status(404).send({"error":'Malformed or non-existing IP'})}
}