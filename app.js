const express = require('express')
const app = express()
const port = 4000 
const path = require('path');
const multer = require('multer');
const MongoClient = require('mongodb').MongoClient
const mongoose = require('mongoose');
let cardItems = []

const uri = "mongodb+srv://skovichh:55333932sD@projectdb.80hvk7x.mongodb.net/?retryWrites=true&w=majority"
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); 
app.use(express.static('uploads')); 

app.use('/node_modules', express.static('node_modules'));

const productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    category: String,
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

 
  const products = await loadProductFiltered(categoryFilter,priceMin,priceMax)


  // Build a query string based on your needs

  res.render('index', { products});
});





 



  app.post('/admin', upload.single('image'), async (req, res) => {

    const newProduct = new Product({
        name: req.body.name,
        price: req.body.price,
        category: req.body.category,
        imagePath: req.file ? req.file.filename : '', // Save the filename if an image is uploaded
     });
     


if(newProduct!= null){
    let mongoClient;
    mongoClient = new MongoClient(uri);


    try {
        console.log('Connecting to MongoDB Atlas cluster...');
        await mongoClient.connect();
        console.log('Successfully connected to MongoDB Atlas!');
        const db = mongoClient.db('ecommerce');
        const collection = db.collection('productssss');

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



  async function loadProducts( ) {


   
    let mongoClient;
    mongoClient = new MongoClient(uri);
 
    try {
        await mongoClient.connect()
         const db = mongoClient.db('ecommerce');
        const collection = db.collection('productss');
       const cursor = await collection.find().toArray();

      
       if (!cursor) {
        console.log('No documents found.');
        
      } else {
        // Assuming there is a 'name' field in the documents
        
        console.log('Found name:');
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
    const db = mongoClient.db('ecommerce');
    const collection = db.collection('productssss');

    // Construct the filter based on the provided parameters
    const numericPriceMin = parseInt(priceMin, 10);
const numericPriceMax = parseInt(priceMax, 10);
console.log("sd"+category);

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