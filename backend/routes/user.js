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
            const isMatch = await bcrypt.compare(password, user.password);

            if (isMatch) {
                const token = jwt.sign({ userId: user._id }, JWT_SECRET);
                return res.json({ token });
            } else {
                return res.status(400).json({ message: "Invalid username or password" });
            }
        } else {
            return res.status(400).json({ message: "User doesn't exist" });
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

router.put("/update", authMiddleware, async (req, res) => {
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
        // Retrieve the filter query parameter from the request URL
        const filter = req.query.filter || "";

        // Extract the token from the Authorization header
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1]; // Bearer token

        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Decode the token to get the user ID
        const decoded = jwt.verify(token, JWT_SECRET); // Use your JWT secret
        const currentUserId = decoded._id; // Assuming token contains user ID as '_id'

        // Find users matching the filter and exclude the current user
        const users = await User.find({
            _id: { $ne: currentUserId }, // Exclude the current user
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

        if (users.length === 0) {
            return res.status(404).json({ message: "No users found" });
        }

        res.json({
            users: users.map(user => ({
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                _id: user._id
            }))
        });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

router.get("/me", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId); // Assuming req.userId is set by your authMiddleware
        if (user) {
            res.json({
                firstName: user.firstName,
                lastName: user.lastName
            });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

router.get("/verifyToken", authMiddleware, (req, res) => {
    res.status(200).json({ message: "Valid token" })
})

module.exports = router;