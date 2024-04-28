// This script is a RESTful API designed for stock management purposes. It facilitates user registration,
// authentication, and CRUD operations on products within the inventory.
// This API ensures that data integrity through input validation error handling, distinguish between validation errors for cleare diagnostics.
// With endpoints for listing all products, filtering by category, updating, and deleting products, it serves as a fundamental tool for developing comprehensive stock control solutions with user authentication.

const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validatior');
const app = express();
app.use(express.json());

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
});
const UserModel = mongoose.model('User', userShema);

const productSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});
const ProductModel = mongoose.model('Product', productSchema);

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/inventory', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Authenticate middleware
const authenticate = async (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Endpoint for user registration with input validation
app.post('/register', [
    body('username').isAlphanumeric().withMessage('Username must be alphanumeric').notEmpty(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long').notEmpty().isAlphanumeric(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { username, password } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new UserModel({ username, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error("Error in user registration: " + err.message);
        if (err.code === 11000) { // MongoDB duplicate key error
            return res.status(400).json({ message: 'Username already exists' });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Endpoint for user login with input valdation
app.post('/login', [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {username, password} = req.body;
    try {
        const user = await UserModel.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }
        const token = jwt.sign({ username }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
        res.status(200).json({ token });
    } catch (err) {
        console.error("Error in user login: " + err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Endpoint to create a new product with input validation
app.post('/products', authenticate, [
    body('id').notEmpty().withMessage('ID is required'),
    body('name').notEmpty().withMessage('Name is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('price').notEmpty().withMessage('Price is required'),
    body('quantity').notEmpty().withMessage('Quantity is required'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { id, name, category, price, quantity } = req.body;
    try {
        const newProduct = new ProductModel({ id, name, category, price, quantity });
        await newProduct.save();
        res.status(201).json({ message: 'Product created successfully' });
    } catch (err) {
        console.error("Error in product creation: " + err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Endpoint to list all products
app.get('/products', authenticate, async (req, res) => {
    try {
        const products = await ProductModel.find();
        res.status(200).json(products);
    } catch (err) {
        console.error("Error in product listing: " + err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Endpoint to filter products by category
app.get('/products/:category', authenticate, async (req, res) => {
    const { category } = req.params;
    try {
        const products = await ProductModel.find({ category });
        if (products.length === 0) {
            return res.status(404).json({ message: 'No products found' });
        }
        res.status(200).json(products);
        } catch (err) {
        console.error("Error in product filtering: " + err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Endpoint to update a product with input validation
app.put('/products/:id', authenticate, [
    body('name').notEmpty().withMessage('Name is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('price').notEmpty().withMessage('Price is required'),
    body('quantity').notEmpty().withMessage('Quantity is required'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name, category, price, quantity } = req.body;
    try {
        const updatedProduct = await ProductModel.findOneAndUpdate({ id }, { name, category, price, quantity }, { new: true });
        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({ message: 'Product updated successfully' });
    } catch (err) {
        console.error("Error in product update: " + err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Endpoint to delete a product
app.delete('/products/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    try {
        const deletedProduct = await ProductModel.findOneAndDelete({ id });
        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (err) {
        console.error("Error in product deletion: " + err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});