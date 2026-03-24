const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")

const app = express();
//middleware
app.use(cors())
app.use(express.json())
// Connection  
mongoose.connect(process.env.MONGO_URI)
.then(()=> console.log("Connected to MongoDB ATLAS (cloud)"))
.catch((err)=>{
    console.log("Connection Error",err)
})
// Creating finance schema
const financeSchema = new mongoose.Schema({
    type: String,
    amount: Number,
    description: String,
    date : {
        type: Date,
        default: Date.now
    },
    category : String
})
// Creating model
const Finance = mongoose.model("Finance",financeSchema)
// TESTing route
app.get("/",(req,res)=>{
    res.send("Finance API is running");
});
//Adding transaction route
app.post("/add-transaction",(req,res)=>{
    const transaction = new Finance({
    type: req.body.type,
    amount: req.body.amount,
    description: req.body.description,
    category: req.body.category,
    date: req.body.date
    
    })
    transaction.save().then(()=>{
        res.send("Transacrion saved");
    }).catch((err)=>{
        res.status(500).send("error saving transaction")
    })

})
//Reading the data
app.get("/transactions",(req,res)=>{
    Finance.find().then((data)=>{
        res.json(data);
    }).catch((err)=>{
        console.log(err);
        res.status(500).send("Error Fetching transactions")
    })
})
//Deleting by id 
app.delete("/delete-transaction/:id",async (req,res)=>{
    console.log("deleting id ",req.params.id)
    try{
    await Finance.findByIdAndDelete(req.params.id)
    res.json({message:"Transaction deleted"})
    } catch(error){
        res.status(500).json({error : "Error deleting"})
    }
})
//Deleting entire database after restart button
 // DELETE ALL TRANSACTIONS (Restart)
app.delete("/restart-transactions", async (req, res) => {
    try {
        await Finance.deleteMany({});
        res.json({ message: "All transactions cleared for the new month!" });
    } catch (error) {
        res.status(500).json({ error: "Error clearing transactions" });
    }
});
//Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});