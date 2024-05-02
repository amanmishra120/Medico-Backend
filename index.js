const express= require('express');
const cors= require('cors');
const dotenv=require('dotenv')
const {MongoClient} = require('mongodb');


dotenv.config();
const app=express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static('public'));

const PORT=3000;
let Collection;

const connect=async()=>{
  try{
    const client=await MongoClient.connect(process.env.MONGO_URI);
    const db=await client.db(process.env.DB_NAME);
    Collection=await db.collection(process.env.COLLECTION_NAME)
  }catch(err){
    console.log(err);
  }
}

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      console.log('Username and Password required')
      return res.status(400).send('Username and Password required');
    }
    if (!Collection) {
      await connect();
    }
    const user = await Collection.findOne({ username });
    if (!user) {
      console.log('Invalid Username')
      return res.status(404).send('Invalid Username');
    }
    if (user.password !== password) {
      console.log('Invalid Password')
      return res.status(401).send('Invalid Password');
    }
    console.log('Login Successful')
    return res.status(200).send('Login Successful');
  } catch (err) {
    console.log(err);
    return res.status(500).send('Internal Server Error');
  }
});


app.post('/signup', async (req, res) => {
  try{
    const {email,username,password}=req.body;
    if(!Collection){
      await connect();
    }
    const user=await Collection.findOne({username});
    if(user){
      console.log('Username already exists');
      return res.status(409).send('Username already exists');
    }
    await Collection.insertOne({username,password});
    console.log('User registered successfully');
    return res.status(200).send('User registered successfully');
  }catch(err){
    console.log(err);
    return res.status(500).send('Internal Server Error');
  }
})

app.get('/login',(req,res)=>{
  res.sendFile(__dirname+'/public/log.html');
})
app.get('/signup',(req,res)=>{
  res.sendFile(__dirname+'/public/signup.html');
})

app.get('/',(req,res)=>{
  res.sendFile(__dirname+'/public/index.html');
})

app.listen(PORT,async()=>{
  try{
  await connect();
  console.log('Connected to database');
  console.log(`Server is running on port ${PORT}`);
  }catch(err){
    console.log(err);
  }
})