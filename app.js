const express = require('express')
const app = express()
const port = 4000 
const path = require('path');
const multer = require('multer');
const MongoClient = require('mongodb').MongoClient
const mongoose = require('mongoose');
var ObjectId = require('mongodb').ObjectId; 

let cardItems = []
let lastId 
loadLastId()

const uri = "mongodb+srv://skovichh:55333932sD@projectdb.80hvk7x.mongodb.net/?retryWrites=true&w=majority"
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); 
app.use(express.static('uploads')); 

app.use('/node_modules', express.static('node_modules'));

const productSchema = new mongoose.Schema({
    id: Number , 
    name: String,
    price: Number,
    category: String,
    description : String , 
    imagePath: String,
 });
 
 const Product = mongoose.model('Product', productSchema);
 app.set('view engine', 'ejs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
       cb(null, 'uploads/'); // Choose a directory to store the uploaded images
    },
    filename: (req, file, cb) => {
       cb(null, Date.now() + path.extname(file.originalname));
    }
 });
 const upload = multer({ storage: storage });


app.get('/products', async (req, res) =>  {


  const categoryFilter = req.query.category;
  const priceMin = req.query.priceMin;
  const priceMax = req.query.priceMax;


  const description = req.query.product
  if(description!==undefined){

   
   const product = await findProductById(description)
   console.log(product.name)

    res.render('productdescription.ejs', { product});


  }
 else {
  const products = await loadProductFiltered(categoryFilter,priceMin,priceMax)


  // Build a query string based on your needs

  res.render('index', { products});}
});





 



  app.post('/admin', upload.single('image'), async (req, res) => {

    const newProduct = new Product({
        id : ++lastId , 
        name: req.body.name,
        price: req.body.price,
        category: req.body.category,
        description : req.body.description,
        imagePath: req.file ? req.file.filename : '', // Save the filename if an image is uploaded
     });
     


if(newProduct!= null){
    let mongoClient;
    mongoClient = new MongoClient(uri);


    try {
        console.log('Connecting to MongoDB Atlas cluster...');
        await mongoClient.connect();
        console.log('Successfully connected to MongoDB Atlas!');
        const db = mongoClient.db('ecommercee');
        const collection = db.collection('products');
        await collection.insertOne(newProduct);
 
        
    } finally {
        await mongoClient.close();
    }



    console.log(req.body); // Form fields
    console.log(req.file); // Uploaded file details

  

}


    res.redirect('admin');
 });

 app.use(express.json());


  app.get('/admin', (req, res) => {
    res.render('adminpanel.ejs');
  });

  app.post('/checkout', (req, res) => {
  const cardItems = req.body.cartItems
  const cartItems = JSON.parse(cardItems);


cartItems.forEach(item => { console.log(item.name) })
res.render('checkout', { cartItems });


   
});

  app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
  });



async function loadLastId() {
  const uri = "mongodb+srv://skovichh:55333932sD@projectdb.80hvk7x.mongodb.net/?retryWrites=true&w=majority"

  let mongoClient;
  mongoClient = new MongoClient(uri);



  const newProduct = ({
    id : 0 , 
    name: 'id' ,
    price: '0',
    category: 'category',
    description : 'description',
    imagePath: 'nopath', // Save the filename if an image is uploaded
 });




try {
    console.log('Connecting to MongoDB Atlas cluster...');
    await mongoClient.connect();
    console.log('Successfully connected to MongoDB Atlas!');
    const db = mongoClient.db('ecommerce');
    const collection = db.collection('id');
    const cursor = await collection.find().toArray();
    idd= cursor[0].id
    lastId=cursor[0].id

    
} finally {
    await mongoClient.close();
}


}







  async function findProductById(idd ) {
    let filter = {}
    filter.id = { $eq: idd };

    let mongoClient;
    mongoClient = new MongoClient(uri);

    try {
        await mongoClient.connect()
         const db = mongoClient.db('ecommercee');
        const collection = db.collection('products');
      
        const id = parseInt(idd);
        // Find the product using the _id field
        const cursor = await collection.findOne({ id });
      
       if (!cursor) {
        console.log('No documents found.');
        
      } else {
        // Assuming there is a 'name' field in the documents
        
        await mongoClient.close();
        return cursor;
      }



    } finally {
    }



 }

 


 async function loadProductFiltered(category, priceMin, priceMax) {
  const mongoClient = new MongoClient(uri);

  try {
    await mongoClient.connect();
    const db = mongoClient.db('ecommercee');
    const collection = db.collection('products');

    // Construct the filter based on the provided parameters
    const numericPriceMin = parseInt(priceMin, 10);
const numericPriceMax = parseInt(priceMax, 10);

// Construct the filter with numeric values
const filter = {};
if(category="AllCategory")
  {
    category=null
  }
if (category) {
  filter.category = category
}



if (!isNaN(numericPriceMin) && !isNaN(numericPriceMax)) {
  filter.price = { $gte: numericPriceMin, $lte: numericPriceMax };
} else if (!isNaN(numericPriceMin)) {
  filter.price = { $gte: numericPriceMin };
} else if (!isNaN(numericPriceMax)) {
  filter.price = { $lte: numericPriceMax };
}

    // Perform the query with the constructed filter
    const cursor = await collection.find(filter).toArray();
  



 

    if (cursor.length === 0) {
      console.log('No documents found.');
      return [];
    } else {
      return cursor;
    }
  } finally {
    await mongoClient.close();
  }
}