const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1qp2qmz.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// Middleware
app.use(cors({
    origin: ['http://localhost:5173']
}));
app.use(express.json());

async function run() {
    try {
        // await client.connect();

        const contests = client.db("contestDB").collection("contests");
        const userCollection = client.db("contestDB").collection("users");

        app.get('/', (req, res) => {
            res.send('Server is running')
        })

        // store user data
        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email }
            const existingUser = await userCollection.findOne(query);
            if (existingUser) {
                return res.send({ message: 'user already exist', insertedId: null })
            }
            const result = await userCollection.insertOne(user);
            res.send(result)
        })

        // All contests
        app.get('/allContest/:category', async (req, res) => {
            const category = req.params.category;
            const query = { category: category }
            const result = await contests.find(query).toArray();
            res.send(result)
        })

        // Search by category
        app.get('/search/:category', async (req, res) => {
            const category = req.params.category;
            const query = { category: category }
            const result = await contests.find(query).toArray();
            res.send(result)
        })

        // Contest details by id
        app.get('/details/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await contests.findOne(query);
            res.send(result)
        })

        // Popular
        app.get('/popular', async (req, res) => {
            const query = { participant: { $size: 1 } };
            const options = { sort: { participant: -1 } };
            const result = await contests.find(query, options).limit(5).toArray();
            res.send(result)
        })

        // User participants
        app.get('/user/:email', async (req, res) => {
            const email = req.params.email;
            const query = { participant: email }
            const result = await contests.find(query).toArray();
            res.send(result)
        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {

        // await client.close();
    }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})