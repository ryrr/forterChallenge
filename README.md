# forterChallenge
api for IPs

## App start instructions and prereqs
- run `npm install` to install dependencies
- Navigate to `src/api` and run `node app.js` to start the server
- App was created using Node version v14.11.5 so if some dependency is broken, use this version
- Endpoint is a `GET` @ localhost:`serverPort`/ipInfo/`ip`. Server port is configurable in config.js and ip is sent as a query param

## Configuration
- the file at `src/api/config.js` is the configuration for this project. You can configure the server port along with the ip-service providers and respective rate-limit here

## Libraries 
- `express`: The most widely known and well maintained API library for Node.js
- `node-cache`: Simple caching library
- `express-rate-limit`: Easy to use rate-limit configuration library compatable with express

## Structure
- `app.js`: Server and Routes
- `logic.js`: Methods that call our API providers and handle the client Request and Response
- `cache.js`: Provides access to the cache
- `middleware.js`: Rate limiting middleware
- `config.js`: Project configuration

## How it works
- There are two endpoints declared in `app.js` of the same route `/ipInfo/:ipAddress` the reason being that we need to attach rate-limiting middleware for each provider separately
- Only the first route is user accessible since the routes are the same and they are assessed in order of declaration, adhering to project requirements
- All requests go try route #1 initially, if the route becomes rate limited the middleware will pass the request to route #2 as a fallback
- If route #2 becomes rate limited at the same time as Route #1 it will send a 429 status and an appropriate message
- If Route #1 becomes rate limited and your queries begin to hit the fallback Route #2 the system will revert you back to the default Route #1 once the rate limit window on Route #1 expires
- Successful requests are stored in the cache and do not count towards the rate limit and can be repeatedly queried
- A successful request will get a response similar to code `200` and a body of {country_name:`retrieved_country_name`}

## Design Decisions 
- I used the await syntax for making async requests in the logic functions. This is a blocking call and wouldn't be optimal in a large solution. The better way to do it would handle it with a promise chain and return a response when the Promise resolves. However I decided to do it this way for code-terseness and the fact that the API is relatively small, it's not a production solution so the blocking call shouldn't matter much.
- Node-Cache allows for a TTL on cache entries, this would be ideal for a production solution when IPs may change and we want fresh data, however it seemed unneccessary for now
- The structuring of the directory into basicially one folder is not how I would do it in a prod setting, however we don't use any models or controllers or have more than one route for that matter. Due to the tiny nature of this project I found that structuring it this way is easier for navigation and readability. In a prod solution everything would be more spread out into appropriate folders
- In `config.js` I left many things hard coded, this is bad because it exposes API keys to the known universe and is a big security risk. The right way to do it would be to provide all the sensitive config in environment variables thru the command line. However for the sake of your time and not wanting to make you guys generate your own API keys I did it this way
- A non-ideal part of the API is that an initial failed request does count towards the rate-limit on a route, however this is because a failed request still counts as a request towards the limit by both providers. I felt that the best way to handle this situation would be to count the first failure towards the user's rate limit and cache it, so that duplicate failed results would not count.

## Testing
### I have provided console output so you can visualize what the system is doing ex. using fallback API, default API rate limit exceeded, cache hit! and others
- Scenario 1: A well formed request to the endpoint - expect a response like {country_name:`retrieved_country_name ex.US or United States`}
- Scenario 2: A well formed request that has already been made - expect a response like {country_name:`retrieved_country_name ex.US or United States`} from the Cache! should not count towards rate limit.
- Scenario 3: A well formed request to the endpoint once the default rate limit has triggered - expect a response like {country_name:`retrieved_country_name ex.US or United States`} but perhaps the `retrieved_country_name` format will be different since its relying on another provider.
- Scenario 4: A well formed request to the endpoint once both rate limits have been triggered - expect a 429 with a msg like `Too many requests, please try again later.`
- Scenario 5: A well formed request that has already been made, while one or both routes are rate limited - expect a response like {country_name:`retrieved_country_name ex.US or United States`} from the Cache!
- Scenario 6: A bad IP request to the endpoint - expect a 404 like `{"error":'Malformed or non-existing IP'}`
- Scenario 7: A duplicate bad IP request to the endpoint - expect a 404 like `{"error":'Malformed or non-existing IP'}` from the cache!
- Scenario 8: Trying to access a route that does not exist - expect a 404 like Cannot GET /`badRoute`/`ip`




//full test coverage how to implement, E2E testing instructions
