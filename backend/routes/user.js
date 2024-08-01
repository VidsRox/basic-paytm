const express = require("express");
const { User, Account } = require("../db")
const jwt = require("jsonwebtoken")
const z = require("zod");

const JWT_SECRET = require("../config");

const { authMiddleware } = require("../middleware");

const router = express.Router();

const signupSchema = z.object({
    username: z.string(),
    password: z.string(),
    firstName: z.string(),
    lastName: z.string()
})

router.post("/signup", async(req, res) => {
    const body = req.body;
    const {success} = signupSchema.safeParse(req.body);
        if(!success) {
            return res.status(411).json({
                message: "Email already taken / Incorrect inputs"
            })  
        }

        const existingUser = await User.findOne({
            username: body.username
        })

        if(existingUser) {
            return res.status(411).json({
                message: "Email already taken / Incorrect inputs"
            }) 
        }

        const dbUser = await User.create({
            username: req.body.username,
            password: req.body.password,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
        });

        await Account.create({
            userId: dbUser._id,
            balance: 1 + Math.random() * 10000
        })
        
        const token = jwt.sign({
            userId: dbUser._id
        }, JWT_SECRET)

        
        
        res.json({
            message: "User created successfully",
            token: token
        })

})

const signinBody = z.object({
    username: z.string().email(),
    password: z.string()
})

router.post("/signin", async (req, res) => {
    try {
      const { success } = signinBody.safeParse(req.body);
      if (!success) {
        return res.status(411).json({ message: "Incorrect inputs" });
      }
  
      const user = await User.findOne({
        username: req.body.username,
        password: req.body.password
      });
  
      if (user) {
        const token = jwt.sign({ userId: user._id }, JWT_SECRET);
        res.json({ token });
      } else {
        res.status(400).json({ message: "Error while logging in" });
      }
    } catch (error) {
      console.error('Error handling /signin request:', error.message); // Log detailed error
      res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  });
  
  

const updateBody = z.object({
    password: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional()
})

router.put("/", authMiddleware, async(req, res) => {
    const { success } = updateBody.safeParse(req.body);
    if(!success){
        res.status(411).json({message: "error while updating information"})
    }

    await User.updateOne({_id: req.userId}, req.body);

    res.json({message: "Updated successfully"})
})

router.get("/bulk", async (req, res) => {

    // Retrieve the 'filter' query parameter from the request URL, defaulting to an empty string if not provided
    const filter = req.query.filter || "";

    // Perform an asynchronous database query on the 'User' collection to find users
    // The query looks for users whose 'firstName' or 'lastName' fields match the 'filter' string
    // The '$or' operator is used to check either condition, and the '$regex' operator is used for pattern matching
    const users = await User.find({
        $or: [{
            firstName: {
                "$regex": filter   // Match 'firstName' with the provided filter string
            }
        }, {
            lastName: {
                "$regex": filter   // Match 'lastName' with the provided filter string
            }
        }]
    });

    // Respond to the client with a JSON object containing the filtered user data
    res.json({
        // Map the 'users' array to return an array of objects with selected fields for each user
        user: users.map(user => ({
            username: user.username,   // Include the 'username' field
            firstName: user.firstName, // Include the 'firstName' field
            lastName: user.lastName,   // Include the 'lastName' field
            _id: user._id              // Include the user's unique identifier '_id'
        }))
    });
});


module.exports = router;