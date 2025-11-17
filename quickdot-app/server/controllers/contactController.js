const DatabaseService = require('../services/databaseService');
const PolkadotService = require('../services/polkadotService');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Contact Controller
 * Handles contact management endpoints
 */

/**
 * Get all contacts
 * GET /api/contact/list
 */
exports.getContacts = asyncHandler(async (req, res) => {
  const uid = req.user.uid;
  
  const contacts = await DatabaseService.getUserContacts(uid);
  
  res.json({
    success: true,
    contacts,
    count: contacts.length,
  });
});

/**
 * Create new contact
 * POST /api/contact/create
 */
exports.createContact = asyncHandler(async (req, res) => {
  const { name, address, note } = req.body;
  const uid = req.user.uid;
  
  // Validate address
  if (!PolkadotService.validateAddress(address)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid Polkadot address',
    });
  }
  
  const contactId = await DatabaseService.createContact(uid, {
    name,
    address,
    note: note || '',
  });
  
  res.status(201).json({
    success: true,
    contactId,
    message: 'Contact created successfully',
  });
});

/**
 * Update contact
 * PUT /api/contact/:contactId
 */
exports.updateContact = asyncHandler(async (req, res) => {
  const { contactId } = req.params;
  const { name, note } = req.body;
  const uid = req.user.uid;
  
  const updates = {};
  if (name) updates.name = name;
  if (note !== undefined) updates.note = note;
  
  await DatabaseService.updateContact(contactId, uid, updates);
  
  res.json({
    success: true,
    message: 'Contact updated successfully',
  });
});

/**
 * Delete contact
 * DELETE /api/contact/:contactId
 */
exports.deleteContact = asyncHandler(async (req, res) => {
  const { contactId } = req.params;
  const uid = req.user.uid;
  
  await DatabaseService.deleteContact(contactId, uid);
  
  res.json({
    success: true,
    message: 'Contact deleted successfully',
  });
});

/**
 * Search contacts
 * GET /api/contact/search
 */
exports.searchContacts = asyncHandler(async (req, res) => {
  const { query } = req.query;
  const uid = req.user.uid;
  
  const contacts = await DatabaseService.getUserContacts(uid);
  
  // Simple search by name or address
  const results = contacts.filter(contact => 
    contact.name.toLowerCase().includes(query.toLowerCase()) ||
    contact.address.toLowerCase().includes(query.toLowerCase())
  );
  
  res.json({
    success: true,
    contacts: results,
    count: results.length,
  });
});

module.exports = exports;
