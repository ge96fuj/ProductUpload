import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt'
import { config } from 'dotenv';
const uri = "mongodb+srv://skovichh:55333932sD@projectdb.80hvk7x.mongodb.net/?retryWrites=true&w=majority"

export async function connectToCluster(uri) {
    let mongoClient;
    mongoClient = new MongoClient(uri);

    try {
        console.log('Connecting to MongoDB Atlas cluster...');
        await mongoClient.connect();
        console.log('Successfully connected to MongoDB Atlas!');
 
        return mongoClient;
    } catch (error) {
        console.error('Connection to MongoDB Atlas failed!', error);
        process.exit();
    }
 }


 export async function executeDatabaseOperations() {
    const uri = process.env.DB_URI;
    let mongoClient;
 
    try {
        mongoClient = await connectToCluster(uri);
        const db = mongoClient.db('project');
        const collection = db.collection('userss');



    } finally {
        await mongoClient.close();
    }
 }


 export async function CreateUser(data) {

    const uri = process.env.DB_URI;
    let mongoClient;
 
    try {
        mongoClient = await connectToCluster(uri);
        const db = mongoClient.db('ecommerce');
        const collection = db.collection('userss');

        await collection.insertOne(data);


    } finally {
        await mongoClient.close();
    }

 }
   export async function findUser( emaill) {


        const uri = process.env.DB_URI;
        let mongoClient;
     
        try {
            mongoClient = await connectToCluster(uri);
            const db = mongoClient.db('project');
            const collection = db.collection('userss');
           const cursor = await collection.findOne({ email : emaill })
           await mongoClient.close();

          
           if (!cursor) {
            console.log('No documents found.');
            return 0;
          } else {
            // Assuming there is a 'name' field in the documents
            const foundName = cursor.email;
            console.log('Found name:', foundName);
            return foundName;
          }


    
        } finally {
            await mongoClient.close();
        }



     }








     export async function Checkpassword(email, pwd2) {
        const result = [];
      config()
        const uri = process.env.DB_URI;
        console.log('MongoDB connection string:', uri);
      
        try {
          const client = new MongoClient(uri);
          await client.connect();
      
          const db = client.db('project');
          const collection = db.collection('userss');
          const user = await collection.findOne({ email }, { projection: { password: 1 } });
      
          await client.close();
      
          if (!user) {
            result.push('0');
            result.push('User not found');
            return result;
          }

          console.log("user password" , user.password)
      
          const isValidPassword = await bcrypt.compare(pwd2, user.password)
          console.log(isValidPassword)

          if (isValidPassword) {
            console.log('Password is correct');
            result.push('1');
            return result;
          } else {
            result.push('0');
            result.push('Password is incorrect');
            return result;
          }
        } catch (error) {
          console.error('Error checking password:', error);
          return ['0', 'Error checking password'];
        }
      }


      module.exports = CreateUser