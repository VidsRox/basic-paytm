const express = require("express");
const { User, Account } = require("../db")
const jwt = require("jsonwebtoken")
const z = require("zod");
const bcrypt = require('bcrypt')

const { JWT_SECRET } = require("../config");

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
    const {success, error} = signupSchema.safeParse(req.body);
    if (!success) {
        return res.status(411).json({
            message: "Validation failed",
            error: error.errors // Return detailed validation errors
        });
    }

        const existingUser = await User.findOne({
            username: body.username
        })

        if(existingUser) {
            return res.status(411).json({
                message: "Email already taken / Incorrect inputs"
            }) 
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        
        const dbUser = await User.create({
            username: req.body.username,
            password: hashedPassword,
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
        const { username, password } = req.body;

        const user = await User.findOne({ username });

        if (user) {
            console.log('User found:', user.username); // Debugging output

            const isMatch = await bcrypt.compare(password, user.password);
            console.log('Password match:', isMatch); // Debugging output

            if (isMatch) {
                const token = jwt.sign({ userId: user._id }, JWT_SECRET);
                return res.json({ token });
            } else {
                return res.status(400).json({ message: "Invalid username or password" });
            }
        } else {
            return res.status(400).json({ message: "Invalid username or password" });
        }
    } catch (error) {
        console.error('Error handling /signin request:', error.message);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});
  

const updateBody = z.object({
    password: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional()
})

router.put("/", authMiddleware, async (req, res) => {
    const { success, error } = updateBody.safeParse(req.body);
    if (!success) {
        return res.status(411).json({ message: "Error while updating information", error: error.errors });
    }

    try {
        const updatedUser = await User.updateOne({ _id: req.userId }, req.body);
        res.json({ message: "Updated successfully", updatedUser });
    } catch (err) {
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
});

router.get("/bulk", async (req, res) => {
    try {
        // Retrieve the 'filter' query parameter from the request URL, defaulting to an empty string if not provided.
        // This allows the API to filter users based on a search string.
        const filter = req.query.filter || "";

        // Perform an asynchronous database query on the 'User' collection to find users.
        // The query looks for users whose 'firstName' or 'lastName' fields match the 'filter' string.
        // The '$or' operator checks either condition, and the '$regex' operator enables pattern matching.
        const users = await User.find({
            $or: [
                {
                    firstName: {
                        "$regex": filter, // Match 'firstName' with the provided filter string
                        "$options": "i"  // Case-insensitive matching
                    }
                },
                {
                    lastName: {
                        "$regex": filter, // Match 'lastName' with the provided filter string
                        "$options": "i"  // Case-insensitive matching
                    }
                }
            ]
        });

        // Check if any users were found; if not, respond with a 404 status and a message indicating no users were found.
        if (users.length === 0) {
            return res.status(404).json({ message: "No users found" });
        }

        // If users are found, respond with a JSON object containing the filtered user data.
        // The 'map' function creates an array of objects with selected fields for each user.
        res.json({
            users: users.map(user => ({
                username: user.username,   // Include the 'username' field
                firstName: user.firstName, // Include the 'firstName' field
                lastName: user.lastName,   // Include the 'lastName' field
                _id: user._id              // Include the user's unique identifier '_id'
            }))
        });
    } catch (error) {
        // If an error occurs during the query or data processing, respond with a 500 status code and an error message.
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});


module.exports = router;