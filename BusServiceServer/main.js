require('dotenv').config()
//load libraries
const express = require('express')
const withQuery = require('with-query').default
const fetch = require('node-fetch')
const cors = require('cors')
const morgan = require('morgan')
const expressWS = require('express-ws')
const mysql = require('mysql2/promise')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer');
const {MongoClient} = require('mongodb');

//passport core
const passport = require('passport')
//passport strategy
const LocalStrategy = require('passport-local').Strategy
const GoogleStrategy = require('passport-google-oauth20').Strategy;

//PORT
const PORT = parseInt(process.argv[2]) || parseInt(process.env.PORT) || 3000

const SESSION = {}

//create express instance
const app = express()
const appWS = expressWS(app)

const BASE_URL = 'http://datamall2.mytransport.sg/ltaodataservice/'

app.use(morgan('combined'))
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static(__dirname+'/BusServiceApp'))

const fetchBusArrival = async (params, user) => {
    const url = withQuery(BASE_URL + 'BusArrivalv2', {
        BusStopCode: params.busStopCode,
        ServiceNo: params.serviceNo || ''
    })
    const headers = {'AccountKey': process.env.ACCOUNT_KEY}
    const results = await fetch(url, {headers})
    let data = await results.json()
    console.log('results: ', data)
    const currentTime = new Date().getTime();
    const busArrivals = data.Services.map(d => {
        const nextBusArrival = new Date(d.NextBus.EstimatedArrival).getTime();
        const nextBus2Arrival = new Date(d.NextBus2.EstimatedArrival).getTime();
        const nextBusEstimated = (nextBusArrival-currentTime)/(60*1000)
        const nextBus2Estimated = (nextBus2Arrival-currentTime)/(60*1000)
        return {
            'serviceNo': d.ServiceNo, 
            'operator': d.Operator,
            'nextBus': {
                'estimatedArrival': Math.floor(nextBusEstimated),
                'load': d.NextBus.Load,
                'feature': d.NextBus.Feature,
                'type': d.NextBus.Type
            },
            'nextBus2': {
                'estimatedArrival': Math.floor(nextBus2Estimated),
                'load': d.NextBus2.Load,
                'feature': d.NextBus2.Feature,
                'type': d.NextBus2.Type
            }
        }
    })
    const sorted_busArrivals = busArrivals.sort((a,b) =>  a.serviceNo-b.serviceNo )
    //console.log(sorted_busArrivals)
    user.send(JSON.stringify(sorted_busArrivals))
}

const fetchBusServices = async () => {
    let skip = 0
    let busServiceData = []
    let length;
    do{
        length = 0;
        const url = withQuery(BASE_URL + 'BusServices',{
            $skip: skip
        })
        const headers = {'AccountKey': process.env.ACCOUNT_KEY}

        const results = await fetch(url, {headers})
        let data = await results.json()
        console.log('results: ', data.value.length)

        data.value.map(each => {
            busServiceData.push(each)
        })
        skip += 500
        length = data.value.length
        //const currentTime = new Date().getTime();
    }while(length == 500)
    
    busServiceData.push({timestamp: new Date()})

    insertBusServices(busServiceData)
}

const fetchBusStops = async () => {
    let skip = 0
    let busStopCodes = []
    let length;
    do{
        length = 0;
        const url = withQuery(BASE_URL + 'BusStops',{
            $skip: skip
        })
        const headers = {'AccountKey': process.env.ACCOUNT_KEY}

        const results = await fetch(url, {headers})
        let data = await results.json()
        console.log('results: ', data.value.length)

        data.value.map(each => {
            busStopCodes.push(each)
        })
        skip += 500
        length = data.value.length
        //const currentTime = new Date().getTime();
    }while(length == 500)
    
    busStopCodes.push({timestamp: new Date()})

    insertBusStops(busStopCodes)
}

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
		port: 465,
		secure: true,
    auth: {
      user: process.env.EMAIL_ADDRESS,
      pass: process.env.EMAIL_PASSWORD
    }
});
  
const welcomeMail = (recipient) => {
    return{
        from: process.env.EMAIL_ADDRESS,
        to: recipient.email,
        subject: 'Thank you for creating an account with us!',
        html: `<b>You have created an account with Bus Arrival App!</b><br><hr>
            Username: <b>${recipient.username}</b><br>
            Created on: <b>${new Date()}</b>`
    }
};
  
const sendMail = (recipient) => {
    const mail = welcomeMail(recipient)
    transporter.sendMail(mail, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

//configure the databases
const MONGO_URL = `mongodb+srv://liuting:${process.env.MONG_PW}@snmf2020.9dsmj.mongodb.net/snmf2020?retryWrites=true&w=majority`;
const MONGO_DB = 'snmf2020';
const MONGO_COLLECTION_USER = 'users';
const MONGO_COLLECTION_BUSSERVICE = 'busServices'
const MONGO_COLLECTION_BUSSTOPCODES = 'busStopCodes'

const pool = mysql.createPool({
    host: process.env.MYSQL_SERVER,
    port: process.env.MYSQL_SVR_PORT,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    //connectionLimit: process.env.MYSQL_CON_LIMIT,
    database: process.env.MYSQL_SCHEMA
})

const mongoClient = new MongoClient(MONGO_URL, {
    useNewUrlParser: true, useUnifiedTopology: true
})

const TOKEN_SECRET = process.env.TOKEN_SECRET

//start the server
//check the database are up before starting the server
const pingSQL = (async () => {
    const conn = await pool.getConnection();
    console.log('Pinging database...')
    await conn.ping();
    conn.release();
    return true
})()

const pingMONGO = (async() => {
    mongoClient.connect()
    return true
})()

const mkAuth = passport => {
    return (req, resp, next) => {
        passport.authenticate('local',
            (err, user, info) => {
                if(null != err) {
                    resp.status(403)
                    resp.type('application/json')
                    resp.json({error: err})
                    return
                }
                if (!user) {
                    resp.status(403)
                    resp.json(info)
                    return
                }
                //attach user to the request object
                req.user = user
                next()
            }
        )(req, resp, next)
    }
}

const checkAuth = (req, resp, next) => {
    // check if the request has Authorization header
    const auth = req.get('Authorization')
    if (null == auth) {
        resp.status(403)
        resp.json({ message: 'Forbidden-null' })
        return
    }
    // Bearer authorization
    const terms = auth.split(' ')
    if ((terms.length != 2) || (terms[0] != 'Bearer')) {
        resp.status(403)
        resp.json({message: 'Forbidden-wrong'})
        return
    }
    const token = terms[1]
    try {
        const verified = jwt.verify(token, TOKEN_SECRET)
        console.info(`Verified token`, verified)
        req.token = verified
        next()
    } catch (e) {
        resp.status(403)
        resp.json({message: 'Incorrect token', error: e})
        return
    }
}

//initialize passport, must be after json and urlencoded
app.use(passport.initialize())
app.use(passport.session());

const userDetails = (params) => {
    return {
        ts: new Date(),
        username: params.username,
        email: params.email,
        password: params.password || 'googlesignin',
        //image
    }
}

const checkAndAddBookmark = async (params) => {
    const conn = await pool.getConnection();
    try{
        //query string to insert data
        let check = await conn.query(`select bookmark_id from bookmarks where busStopCode = ? and email = ?`, 
        [params.busStopCode, params.email]);
        if(check[0].length == 0){
            await conn.query(`insert into bookmarks (email, busStopCode, roadName, description, bookmarked) values (?, ?, ?, ?, true)`, 
            [params.email, params.busStopCode, params.roadName, params.description])
            console.log('bookmark added')
            return true
        }
        throw new Error('bookmark exists')
    }
    finally{
        conn.release();
    }
}

const removeBookmark = async (bookmark_id) => {
    const conn = await pool.getConnection();
    try{
        //query string to insert data
        await conn.query(`delete from bookmarks where bookmark_id = ?`, [bookmark_id]);
    }
    catch(e){
        console.error(e);
        throw new Error(e)
    }
    finally{
        conn.release();
    }
}

const getBookmarks = async (email) => {
    const conn = await pool.getConnection();
    try{
        //query string to insert data
        const bookmarks = await conn.query(`select * from bookmarks where email = ?`, [email]);
        return bookmarks[0]
    }
    catch(e){
        console.error(e);
        throw new Error(e)
    }
    finally{
        conn.release();
    }
}

const getOneBookmark = async (bookmark_id) => {
    const conn = await pool.getConnection();
    try{
        //query string to insert data
        const bookmarks = await conn.query(`select * from bookmarks where bookmark_id = ?`, [bookmark_id]);
        return bookmarks[0]
    }
    catch(e){
        console.error(e);
        throw new Error(e)
    }
    finally{
        conn.release();
    }
}

const editBookmark = async (params) => {
    const conn = await pool.getConnection();
    try{
        //query string to insert data
        const bookmarks = await conn.query(`update bookmarks set busStopCode = ?, roadName=?, description=? where bookmark_id = ?`, 
        [params.busStopCode, params.roadName, params.description, params.bookmark_id]);
    }
    catch(e){
        console.error(e);
        throw new Error(e)
    }
    finally{
        conn.release();
    }
}

const deleteBookmarks = async (email) => {
    const conn = await pool.getConnection();
    try{
        //query string to insert data
        const bookmarks = await conn.query(`delete from bookmarks where email = ?`, [email]);
    }
    catch(e){
        console.error(e);
        throw new Error(e)
    }
    finally{
        conn.release();
    }
}

const findBusServiceTS = () => {
    return mongoClient
        .db(MONGO_DB)
        .collection(MONGO_COLLECTION_BUSSERVICE)
        .findOne({timestamp: {
            $exists: true
            }
        })
}

const findBusStopsTS = () => {
    return mongoClient
        .db(MONGO_DB)
        .collection(MONGO_COLLECTION_BUSSTOPCODES)
        .findOne({timestamp: {
            $exists: true
            }
        })
}

const insertBusServices = (busServiceData) => {
    return mongoClient
        .db(MONGO_DB)
        .collection(MONGO_COLLECTION_BUSSERVICE)
        .insertMany(busServiceData)
        .then((results) => {
            return results
        })
        .catch(err => console.error('error', err))
}

const updateBusServices = () => {
    return mongoClient
        .db(MONGO_DB)
        .collection(MONGO_COLLECTION_BUSSERVICE)
        .drop()
        .then(() => {
            fetchBusServices()
        })
        .catch(err => console.error('error', err))
}

const updateBusStops = () => {
    return mongoClient
        .db(MONGO_DB)
        .collection(MONGO_COLLECTION_BUSSTOPCODES)
        .drop()
        .then(() => {
            fetchBusStops()
        })
        .catch(err => console.error('error', err))
}

const insertBusStops = (busStopCodes) => {
    return mongoClient
        .db(MONGO_DB)
        .collection(MONGO_COLLECTION_BUSSTOPCODES)
        .insertMany(busStopCodes)
        .then((results) => {
            return results
        })
        .catch(err => console.error('error', err))
}

const getBusServicesList = () => {
    return mongoClient
        .db(MONGO_DB)
        .collection(MONGO_COLLECTION_BUSSERVICE)
        .distinct('ServiceNo')
        .then((results) => {
            const list = results.map(each => {
                return {
                    serviceNo: each,
                    bookmarked: false
                }
            })
            return list
        })
}

const getBusStopsList = () => {
    return mongoClient
        .db(MONGO_DB)
        .collection(MONGO_COLLECTION_BUSSTOPCODES)
        .find()
        .toArray()
        .then((results) => {
            return results
        })
}

const getBusService = (serviceNo) => {
    return mongoClient
        .db(MONGO_DB)
        .collection(MONGO_COLLECTION_BUSSERVICE)
        .find({ServiceNo: serviceNo})
        .toArray()
}

const createUser = (params) => {
    const user = userDetails(params)
    return mongoClient
        .db(MONGO_DB)
        .collection(MONGO_COLLECTION_USER)
        .insertOne(user)
}

const findUser = (params) => {
    return mongoClient
        .db(MONGO_DB)
        .collection(MONGO_COLLECTION_USER)
        .findOne({email: params.email})
}

const deleteUser = (email) => {
    try{
        mongoClient
        .db(MONGO_DB)
        .collection(MONGO_COLLECTION_USER)
        .deleteOne({email})
        return true
    }
    catch(e){
        console.error('delete error', e)
        return false
    }
}

const authUser = (params) => {
    return mongoClient
        .db(MONGO_DB)
        .collection(MONGO_COLLECTION_USER)
        .findOne({email: params.email, password: params.password})
}

const generateJWT = (req) => {
    try{
        //req.user is created by passport
        const currTime = (new Date()).getTime()/1000
        //generate JWT token
        const token = jwt.sign({
            sub: req.user.email,
            iss: 'myBusApp',
            iat: currTime,
            data: {
                username: req.user.username,
                loginTime: req.user.loginTime
            }
        }, TOKEN_SECRET)
        return token
    }
    catch(e){
        console.error('error logging in', e)
        throw new Error('error logging in')
    }
}

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

const localStrategyAuth = mkAuth(passport)

//configure passport with a strategy
passport.use('local', 
    new LocalStrategy(
        { usernameField: 'email', passwordField: 'password', passReqToCallback: true},
        (req, email, password, done) => {
            //perform the authentication
            console.log(`LocalStrategy >> email: ${email}, password: ${password}`)
            authUser({email, password})
                .then(authResult => {
                    console.log('authResult', authResult)
                    if(authResult){
                        done(null, 
                            //info about the user
                            {
                                username: authResult.username,
                                email: authResult.email,
                                loginTime: (new Date()).toString()
                            }
                        )
                        return  
                    }
                    else{
                        //incorrect login. can use null instead of false also
                        done('Incorrect username and/or password', false)
                    } 
                })
                .catch(e => done(e, false)) 
        }
    )
)
//passport with google
passport.use('google',
    new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/google/callback'
    }, (accessToken, refreshToken, profile, done) => {
        // passport callback function
        //check if user already exists in our db with the given profile ID
        findUser({email: profile.emails[0].value}).then((currentUser)=>{
          if(currentUser){
              console.log('registered previously')
            //if we already have a record with the given profile ID
            done(null, currentUser);
          } else{
               //if not, create a new user 
              createUser({username: profile.displayName, email: profile.emails[0].value})
                .then((newUser) =>{
                    console.log('new user created', newUser)
                done(null, newUser);
              });
           } 
        })
      })
);

//resources
app.post('/login', localStrategyAuth, (req, resp) => {
    const token = generateJWT(req)
    if(token){
        resp.status(200)
        resp.json({message: `Logged in at ${new Date()}`, token, user: req.user.username})
    }
    else{
        resp.status(403)
        resp.end()
    }
})

app.get("/auth/google", passport.authenticate("google", {
    scope: ["profile", "email"]
}));

app.get("/auth/google/callback", passport.authenticate('google'),
    (req, resp) => {
        const token = generateJWT(req)
        if(token){
            let responseHTML = '<html><head><title>Main</title></head><body></body><script>res = %value%; window.opener.postMessage(res, "*");window.close();</script></html>'
            responseHTML = responseHTML.replace('%value%', JSON.stringify({
                user: req.user.username,
                token
            }));
            resp.status(200).send(responseHTML); 
        }
    });

app.post('/createUser', (req, resp) => {
    const username = req.body.username
    const email = req.body.email
    findUser(req.body)
        .then(results => {
            if(results){
                console.log('user exists, please log in')
                resp.status(409)
                resp.json({message: 'User exists, please log in'})
            }
            else{
                console.log('user does not exist, create')
                createUser(req.body)
                .then(() => {
                    sendMail({email, username})
                    resp.status(200)
                    resp.json({message: 'Account created!'})
                })
                .catch(err => console.error('err', err))
            }
        })
})

app.delete('/delete', 
    checkAuth,
    (req, resp) => {
        const email = req.token.sub
        const deleted = deleteUser(email)
        if(deleted){
            console.log('acc deleted')
            deleteBookmarks(email)
                .then(() => {
                    console.log('remove related bookmarks')
                    resp.status(200)
                    resp.json({message: 'account and bookmarks deleted'})
                })
                .catch(err => {
                    console.error('error removing')
                })
        }
        else{
            console.log('not deleted')
            resp.status(500)
            resp.end()
        }
})

app.get('/busServices', (req, resp) => {
    findBusServiceTS()
        .then((results) => {
            if(results){
                console.log('bus services already exists', results.timestamp)
                const currentTime = new Date()
                console.log(`currentTime, ${currentTime}, timestamp, ${results.timestamp}`)
                
                if((currentTime - results.timestamp) > 86400000){
                    console.log('drop n get again')
                    updateBusServices()
                }
                else{
                    return 'Bus services was fetched less than 24hours ago'
                }
            }
            else{
                fetchBusServices()
            }
        })
        .then(() => {
            getBusServicesList()
                .then(results => {
                    resp.status(200)
                    resp.json(results)
                })
        })
})

app.get('/busServices/:serviceNo', (req, resp) => {
    const serviceNo = req.params.serviceNo
    getBusService(serviceNo)
        .then(results => {
            resp.status(200)
            resp.json(results)
        })
})

app.get('/bookmarks/create', 
    checkAuth,
    (req, resp) => {
        findBusStopsTS()
        .then((results) => {
            if(results){
                console.log('bus stops already exists', results.timestamp)
                const currentTime = new Date()
                console.log(`currentTime, ${currentTime}, timestamp, ${results.timestamp}`)
                
                if((currentTime - results.timestamp) > 86400000){
                    console.log('drop n get again')
                    updateBusStops()
                }
                else{
                    return new Error('Bus stops was fetched less than 24hours ago')
                }
            }
            else{
                fetchBusStops()
            }
        })
        .then(() => {
            getBusStopsList()
                .then(results => {
                    resp.status(200)
                    resp.json(results)
                })
        })
        .catch(err => {
            console.error('error fetching bus stop list', err)
            resp.status(500)
            resp.json({message: 'failed to fetch bus stop list'})
        })
    }
)

app.post('/bookmarks/create', 
    checkAuth,
    (req, resp) => {
        const busStopCode = req.body.busStopCode
        const roadName = req.body.roadName
        const description = req.body.description
        const email = req.token.sub
        findUser(email)
            .then(() => {
                checkAndAddBookmark({email, busStopCode, roadName, description})
                    .then(results => {
                        console.log('after adding', results)
                        resp.status(200)
                        resp.json({message: 'bookmark added'})
                    })
                    .catch(err => {
                        console.error('catching', err)
                        resp.status(500)
                        resp.json({message: 'failed to add bookmark, please check if you have a similar one'})
                    })
            })
            .catch(err => {
                console.error('no such user', err)
                resp.status(500)
                resp.json({message: 'failed to add bookmark'})
            })
    }
)

app.get('/bookmarks', 
    checkAuth,
    (req, resp) => {
        const email = req.token.sub
        getBookmarks(email)
            .then(results => {
                resp.status(200)
                resp.json(results)
            })
            .catch(err => {
                console.error('error getting bookmarks', err)
                resp.status(500)
                resp.json({message: 'failed to get bookmarks'})
            })
    }
)

app.get('/bookmarks/edit/:bookmark_id', 
    checkAuth,
    (req, resp) => {
        const bookmark_id = req.params.bookmark_id
        getOneBookmark(bookmark_id)
            .then(results => {
                resp.status(200)
                resp.json(results[0])
            })
            .catch(err => {
                console.error('error getting one bookmark', err)
                resp.status(500)
                resp.json({message: 'failed to get one bookmark'})
            })
    }
)

app.put('/bookmarks', 
    checkAuth,
    (req, resp) => {
        editBookmark(req.body)
            .then(() => {
                resp.status(200)
                resp.json({message: 'edited bookmark'})
            })
            .catch(err => {
                console.error('error updating', err)
                resp.status(500)
                resp.json({message: 'failed to edit'})
            })
    }
)

app.delete('/bookmarks/:bookmark_id', 
    checkAuth,
    (req, resp) => {
        const bookmark_id = req.params.bookmark_id
        console.log('remove bookmark_id', bookmark_id)
        removeBookmark(bookmark_id)
            .then(() => {
                resp.status(200)
                resp.json({message: 'deleted bookmark'})
            })
            .catch(err => {
                console.error('failed to delete', err)
                resp.status(500)
                resp.json({message: 'failed to delete bookmark'})
            })
    }
)

app.ws('/arrival/:busStopCode', (ws, req) => {
   
    const busStopCode = req.params.busStopCode
    const serviceNo = req.query.serviceNo
    const user = req.query.username
    console.log('starting connection: ', busStopCode,'serviceno', serviceNo, 'user', user)
    //const decode
    SESSION[user] = ws 
    fetchBusArrival({busStopCode, serviceNo}, SESSION[user])
    const refreshArrival = setInterval(() => {
        fetchBusArrival({busStopCode, serviceNo}, SESSION[user])
    }, 30000)

    //handle close
	ws.on('close', () => {
		console.log('Closing connection for', user, 'service no', serviceNo)
        clearInterval(refreshArrival)
        SESSION[user].close()
        delete SESSION[user]
	})
})

//start port
Promise.all([pingSQL, pingMONGO])
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Application started at PORT ${PORT}, at ${new Date()}`)
        })
    })
    .catch(e => {
        console.error('error connecting', e)
    })
