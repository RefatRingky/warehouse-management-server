const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();


// middleware
app.use(cors());
app.use(express.json());

// JWT
function verifyJWT(req, res, next) {
    const tokenInfo = req.headers.authorization;

    if (!tokenInfo) {
        return res.status(401).send({ message: 'Unouthorize access' })
    }
    const token = tokenInfo.split(' ')[1];
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' })
        }
        else {
            req.decoded = decoded;
            next();
        }
    })
}




const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ck7mq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        await client.connect();
        const itemCollection = client.db('dressCollection').collection('item');
        app.get('/item', async (req, res) => {
            const query = {};
            const cursor = itemCollection.find(query);
            const items = await cursor.toArray();
            res.send(items);
        });
        app.get('/item/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const item = await itemCollection.findOne(query);
            res.send(item)

        });
        // POST

        app.post('/item', async (req, res) => {
            const newItem = req.body;
            const result = await itemCollection.insertOne(newItem);
            res.send(result);
        });
        // DELETE
        app.delete('/item/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await itemCollection.deleteOne(query);
            res.send(result);
        });
        // myItem
        // app.get('/myitem', async (req, res) => {
        //     const email = req.query.email

        //     const query = { email: email }
        //     const cursor = itemCollection.find(query)
        //     const items = await cursor.toArray()
        //     res.send(items)
        // });
        // Update
        app.put('/item/:id', async (req, res) => {
            const id = req.params.id;
            const updateItem = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    name: updateItem.name,
                    sname: updateItem.sname,
                    price: updateItem.price,
                    Quantity: updateItem.Quantity,
                    description: updateItem.description,
                    image: updateItem.image
                }
            }
            const result = await itemCollection.updateOne(filter, updateDoc, options);
            res.send(result)
        });
        

        // use jwt
        app.post('/login', (req, res) => {
            const email = req.body;
            const token = jwt.sign(email, process.env.SECRET_KEY)
            res.send({ token });
        })


    }

    finally {

    }
}

run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Running warehose');
});

app.listen(port, () => {
    console.log('Liseting the port', port);
})