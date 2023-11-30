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
    origin: ['https://contest-platform-d76ed.web.app'],

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

        // All user
        app.get('/allUser', async (req, res) => {
            const result = await userCollection.find().toArray();
            res.send(result)
        })

        // Find user role
        app.get('/userRole/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            const result = await userCollection.findOne(query);
            res.send(result)
        })

        // All user
        app.get('/allContest', async (req, res) => {
            const result = await contests.find().toArray();
            res.send(result)
        })

        // All contests by category
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
            const query = { participants: { $size: 1 } };
            const options = { sort: { participants: -1 } };
            const result = await contests.find(query, options).limit(5).toArray();
            res.send(result)
        })

        // User participants
        app.get('/user/:email', async (req, res) => {
            const email = req.params.email;
            const query = { participants: email }
            const result = await contests.find(query).toArray();
            res.send(result)
        })


        // Admin Dashboard
        app.patch('/allUser', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email }
            const updateDoc = {
                $set: {
                    role: user.role
                }
            }
            const result = await userCollection.updateOne(filter, updateDoc);
            res.send(result)
        })

        app.patch('/allContest', async (req, res) => {
            const user = req.body;
            const filter = { _id: new ObjectId(user.id) }
            const updateDoc = {
                $set: {
                    status: user.status
                }
            }
            const result = await contests.updateOne(filter, updateDoc);
            res.send(result)
        })

        app.delete('/allContest/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await contests.deleteOne(query);
            res.send(result)
        })

        // Payment
        app.get('/payment/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await contests.findOne(query);
            res.send(result)
        })

        app.patch('/payment', async (req, res) => {
            const user = req.body;
            const filter = { _id: new ObjectId(user?.id) }
            const updateDoc = {
                $push: {
                    participants: user.email
                }
            }
            const result = await contests.updateOne(filter, updateDoc);
            res.send(result)
        })

        // Creator Dashboard
        app.post('/allContest', async (req, res) => {
            const contest = req.body;
            const result = await contests.insertOne(contest);
            res.send(result)
        })

        app.get('/participants/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await contests.findOne(query);
            res.send(result)
        })

        // Edit Contest
        app.get('/editContest/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await contests.findOne(query);
            res.send(result)
        })

        app.put('/editContest/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const option = { upsert: true }
            const editContest = req.body;

            const newContest = {
                $set: {
                    name: editContest.name,
                    image: editContest.image,
                    price: editContest.price,
                    prize: editContest.prize,
                    category: editContest.category,
                    deadline: editContest.deadline,
                    details: editContest.details
                }
            }
            const result = await contests.updateOne(filter, newContest, option);
            res.send(result)
        })

        // Get winner
        app.get('/winner', async (req, res) => {
            const query = { winner: { $regex: "gmail.com" } }
            const result = await contests.find(query).limit(3).toArray();
            res.send(result)
        })


        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        // console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {

        // await client.close();
    }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})