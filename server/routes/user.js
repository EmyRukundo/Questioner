const express = require ('express');
const getUsers = require('../controllers/user');

const router = express.Router();

router.get('/', getUsers.registerUser);

module.exports=router;