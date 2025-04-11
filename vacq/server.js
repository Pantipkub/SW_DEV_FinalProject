const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const connectDB = require('./config/db');

const mongoSanitize=require('express-mongo-sanitize');  /*add ใหม่ตอนทำ Asm10 Security*/

const helmet=require('helmet'); /*Asm10*/

const {xss}=require('express-xss-sanitizer'); /*Asm10*/

const rateLimit=require('express-rate-limit'); /*Asm10*/

const swaggerJsDoc = require('swagger-jsdoc');  /*ASM11 OpenAPI*/
const swaggerUI = require('swagger-ui-express');

const hpp=require('hpp');

const cors = require('cors');    /*add ใหม่ for integrating with frontend*/

//Load env vars
dotenv.config({ path: "./config/config.env" });

//Connect to database
connectDB();

//Route fies
const massageCenters = require("./routes/massageCenters");
const auth = require("./routes/auth");
const appointments = require('./routes/appointments');

const app = express();

//Rate Limiting
const limiter=rateLimit({
    windowsMs:10*60*1000,//10 mins
    max:100
});

const swaggerOptions={  /*ASM11*/
    swaggerDefinition:{
        openapi: '3.0.0',
        info: {
            title: 'Library API',
            version: '1.0.0',
            description: 'A simple Express VacQ API'
        },
        servers: [
            {
                url: 'http://localhost:5000/api/v1'
            }
        ],
    },
    apis:['./routes/*.js'],
};

// add ใหม่
app.use(cors()); // This will allow all domains by default

//Body parser
app.use(express.json());
//Sanitize data
app.use(mongoSanitize());
//Set security headers
app.use(helmet());
//Prevent XSS attacks
app.use(xss());
//Rate Limiting
app.use(limiter);
//Prevent http param pollutions 
app.use(hpp());

const swaggerDocs=swaggerJsDoc(swaggerOptions);
app.use('/api-docs',swaggerUI.serve, swaggerUI.setup(swaggerDocs));

app.use("/api/v1/massageCenters", massageCenters); //If the request refers to "/api/v1/massageCenters", it will forward to the massageCenters ("./routes/massageCenters" path as of the line above)
app.use("/api/v1/auth", auth);
app.use('/api/v1/appointments', appointments);



//Cookie parser
app.use(cookieParser());

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, console.log("Server running in", process.env.NODE_ENV, " mode on port ", PORT));

//Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise)=>{
    console.log(`Error: ${err.message}`);
    //Close server & exit process
    server.close(()=>process.exit(1));
});
