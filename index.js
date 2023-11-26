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
app.use(cors());
app.use(express.json());

async function run() {
    try {
        // await client.connect();

        const contests = client.db("contestDB").collection("contests");

        app.get('/', (req, res) => {
            res.send('Server is running')
        })

        // Popular
        app.get('/popular', async (req, res) => {
            const query = { attemptCount: { $gt: 0 } };
            const options = { sort: { attemptCount: -1 } };
            const result = await contests.find(query, options).limit(5).toArray();
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