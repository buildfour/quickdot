const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { verifyJWT } = require('../middleware/auth');
const { contactValidation } = require('../middleware/validation');

/**
 * Contact Routes
 * Base path: /api/contact
 */

// All contact routes require authentication
router.use(verifyJWT);

// Get all contacts
router.get('/list', contactController.getContacts);

// Search contacts
router.get('/search', contactController.searchContacts);

// Create new contact
router.post('/create', contactValidation.create, contactController.createContact);

// Update contact
router.put('/:contactId', contactValidation.update, contactController.updateContact);

// Delete contact
router.delete('/:contactId', contactValidation.delete, contactController.deleteContact);

module.exports = router;
