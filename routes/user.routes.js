
import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import {client}  from '../index.js';


const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    // Check if email already exists
    const existingUser = await client.db("Task").collection("users").findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: 'OOPS!!👀Email already exists' });
    }
    // Encrypt the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // Create a new user
    const user =  await client.db("Task").collection("users").insertOne({
      email,
      password: hashedPassword,
      firstName,
      lastName
  
    });
    return res.status(201).json({ msg: 'User created Successfully😍👍' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});




// Login a user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    // Check if the email exists
    const user = await client.db("Task").collection("users").findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'OOPS!!👀Invalid Credentials' });
    }
    // Check if the password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'OOPS!!👀Invalid Credentials' });
    }
    // Generate a JSON web token
    const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY);
    res.header('x-auth-token', token).json({ msg: 'Login successful', token });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router; 
