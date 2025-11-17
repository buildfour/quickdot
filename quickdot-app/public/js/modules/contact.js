/**
 * Contact Module
 * Handles contact management
 */

const ContactModule = {
  contacts: [],

  async init() {
    this.setupEventListeners();
  },

  setupEventListeners() {
    // Add contact button
    document.getElementById('add-contact-btn')?.addEventListener('click', () => {
      this.showAddContactModal();
    });

    // Contact search
    document.getElementById('contact-search')?.addEventListener('input', (e) => {
      this.filterContacts(e.target.value);
    });
  },

  async loadContacts() {
    try {
      const response = await API.getContacts();
      
      if (response.success) {
        this.contacts = response.contacts;
        this.renderContacts();
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  },

  renderContacts() {
    const container = document.getElementById('contact-list');
    if (!container) return;

    if (this.contacts.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-address-book"></i>
          <p>No contacts yet</p>
          <button class="primary-btn" onclick="ContactModule.showAddContactModal()">Add Your First Contact</button>
        </div>
      `;
      return;
    }

    container.innerHTML = this.contacts.map(contact => `
      <div class="contact-card">
        <div class="contact-avatar">
          ${contact.name.charAt(0).toUpperCase()}
        </div>
        <div class="contact-info">
          <div class="contact-name">${contact.name}</div>
          <div class="contact-address">${Utils.shortenAddress(contact.address)}</div>
          ${contact.note ? `<div class="contact-note">${contact.note}</div>` : ''}
        </div>
        <div class="contact-actions">
          <button class="icon-btn" onclick="ContactModule.copyContactAddress('${contact.address}')" title="Copy address">
            <i class="fas fa-copy"></i>
          </button>
          <button class="icon-btn" onclick="ContactModule.sendToContact('${contact.address}')" title="Send">
            <i class="fas fa-paper-plane"></i>
          </button>
          <button class="icon-btn" onclick="ContactModule.editContact('${contact.id}')" title="Edit">
            <i class="fas fa-edit"></i>
          </button>
          <button class="icon-btn danger" onclick="ContactModule.deleteContact('${contact.id}')" title="Delete">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `).join('');
  },

  showAddContactModal() {
    const content = `
      <form id="add-contact-form">
        <div class="form-group">
          <label>Name</label>
          <input type="text" id="contact-name" placeholder="John Doe" required>
        </div>
        <div class="form-group">
          <label>Polkadot Address</label>
          <input type="text" id="contact-address" placeholder="5..." required>
        </div>
        <div class="form-group">
          <label>Note (Optional)</label>
          <input type="text" id="contact-note" placeholder="Friend, Exchange, etc.">
        </div>
        <button type="submit" class="primary-btn full-width">
          <i class="fas fa-plus"></i>
          Add Contact
        </button>
      </form>
    `;

    UI.showModal(content, 'Add New Contact');

    setTimeout(() => {
      document.getElementById('add-contact-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.addContact();
      });
    }, 100);
  },

  async addContact() {
    try {
      const name = document.getElementById('contact-name').value;
      const address = document.getElementById('contact-address').value;
      const note = document.getElementById('contact-note').value;

      UI.showLoading('Adding contact...');

      const response = await API.createContact({ name, address, note });

      UI.hideLoading();

      if (response.success) {
        UI.closeAllModals();
        await this.loadContacts();
        UI.showToast('Contact added successfully!', 'success');
      }
    } catch (error) {
      UI.hideLoading();
      UI.showToast(error.message || 'Failed to add contact', 'error');
    }
  },

  async copyContactAddress(address) {
    const success = await Utils.copyToClipboard(address);
    if (success) {
      UI.showToast('Address copied!', 'success');
    }
  },

  sendToContact(address) {
    document.getElementById('send-to-address').value = address;
    UI.showPage('send');
  },

  async deleteContact(contactId) {
    UI.showConfirmation('Are you sure you want to delete this contact?', async () => {
      try {
        UI.showLoading('Deleting contact...');
        
        await API.deleteContact(contactId);
        
        UI.hideLoading();
        await this.loadContacts();
        UI.showToast('Contact deleted successfully!', 'success');
      } catch (error) {
        UI.hideLoading();
        UI.showToast(error.message || 'Failed to delete contact', 'error');
      }
    });
  },

  filterContacts(query) {
    if (!query) {
      this.renderContacts();
      return;
    }

    const filtered = this.contacts.filter(contact =>
      contact.name.toLowerCase().includes(query.toLowerCase()) ||
      contact.address.toLowerCase().includes(query.toLowerCase())
    );

    const container = document.getElementById('contact-list');
    if (!container) return;

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-search"></i>
          <p>No contacts found</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(contact => `
      <div class="contact-card">
        <div class="contact-avatar">
          ${contact.name.charAt(0).toUpperCase()}
        </div>
        <div class="contact-info">
          <div class="contact-name">${contact.name}</div>
          <div class="contact-address">${Utils.shortenAddress(contact.address)}</div>
          ${contact.note ? `<div class="contact-note">${contact.note}</div>` : ''}
        </div>
        <div class="contact-actions">
          <button class="icon-btn" onclick="ContactModule.copyContactAddress('${contact.address}')" title="Copy address">
            <i class="fas fa-copy"></i>
          </button>
          <button class="icon-btn" onclick="ContactModule.sendToContact('${contact.address}')" title="Send">
            <i class="fas fa-paper-plane"></i>
          </button>
          <button class="icon-btn danger" onclick="ContactModule.deleteContact('${contact.id}')" title="Delete">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `).join('');
  },
};

window.ContactModule = ContactModule;
