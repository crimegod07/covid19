// Simple Express server setup to serve for local testing/dev API server
const compression = require('compression');
const helmet = require('helmet');
const express = require('express');
const { GoogleSpreadsheet } = require('google-spreadsheet');

//loading env files
if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}
//extracting credentials from env
const {SHEET_ID, CLIENT_EMAIL, PRIVATE_KEY}= process.env

const app = express();
app.use(helmet());
app.use(compression());
app.use(function(req, res, next){
    //Website you wish to allow to connect
    res.setHeader("Access-Control-Allow-Origin", '*');
    //request method you wish to allow
    res.setHeader("Access-Control-Allow-Methods", 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    //Request Header you wish to allow
    res.setHeader("Access-Control-Allow-Headers", 'X-Requested-With,Content-Type');
    //set to true if you need the website to include cookies in request sent
    //to the API 
    res.setHeader("Access-Control-Allow-Credentials", true);
    //pass to next layer of middleware
    next();
})
app.use(express.json())
app.use(express.urlencoded({
    extended:true
}))


const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 3002;
const DIST_DIR = './dist';

app.use(express.static(DIST_DIR));


//google sheet function
async function accessSpreadsheet(data){

    try{
        const doc = new GoogleSpreadsheet(SHEET_ID);
    await doc.useServiceAccountAuth({
        client_email: CLIENT_EMAIL,
        private_key: PRIVATE_KEY.replace(/\\n/gm, '\n')
      });
      await doc.loadInfo(); // loads document properties and worksheets
      console.log(doc.title);
      

      //create a sheet and set the header now
      const sheet = await doc.sheetsByIndex[0]
      //append rows
      return await sheet.addRow(data)


 }catch(error){
        console.error(error)
    }
    
}
 

app.get('/api/v1/test', (req, res) => {
    res.json({ msg:"Api is running successfully", success: true });
});

app.get('/api/v1/sheetname',async (req, res) =>{
    const sheetName= await accessSpreadsheet()
    res.json({ sheetName, success: true });
} );

app.post('/api/v1/submit', async(req, res) => {
    console.log(req.body)
    await accessSpreadsheet(req.body)
    res.json({ msg: 'Data recieved successfully', success: true });
})

app.listen(PORT, () =>
    console.log(
        `✅   App is running on: http://${HOST}:${PORT}`
    )
);
