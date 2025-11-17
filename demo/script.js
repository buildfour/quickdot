// Demo data
const demoTransactions = [
    {
        type: 'received',
        from: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
        to: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        amount: '1,250.00',
        fee: '0.01',
        hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        timestamp: '2 hours ago',
        status: 'confirmed'
    },
    {
        type: 'sent',
        from: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        to: '5DTestUPts3kjeXSTMyerHihn1uwMfLj8vU8sqF7qYrFabHE',
        amount: '500.00',
        fee: '0.02',
        hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        timestamp: '5 hours ago',
        status: 'confirmed'
    },
    {
        type: 'received',
        from: '5GNJqTPyNqANBkUVMN1LPPrxXnFouWXoe2wNSmmEoLctxiZY',
        to: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        amount: '2,100.50',
        fee: '0.01',
        hash: '0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba',
        timestamp: '1 day ago',
        status: 'confirmed'
    },
    {
        type: 'sent',
        from: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        to: '5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy',
        amount: '750.25',
        fee: '0.02',
        hash: '0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321',
        timestamp: '2 days ago',
        status: 'confirmed'
    },
    {
        type: 'received',
        from: '5Ck5SLSHYac6WFt5UZRSsdJjwmpSZq85fd5TRNAdZQVzEAPT',
        to: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        amount: '325.75',
        fee: '0.01',
        hash: '0x1111222233334444555566667777888899990000aaaabbbbccccddddeeeefffff',
        timestamp: '3 days ago',
        status: 'confirmed'
    },
    {
        type: 'sent',
        from: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        to: '5HKPmK9GYtE1PSLsS1qiYU9xQ9Si1NcEhdeCq9sw5bqu4ns8',
        amount: '892.40',
        fee: '0.03',
        hash: '0xaaabbbcccdddeeefffaaabbbcccdddeeefffaaabbbcccdddeeefffaaabbbcccddd',
        timestamp: '4 days ago',
        status: 'confirmed'
    }
];

const demoContacts = [
    { name: 'Alice Johnson', address: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty', avatar: 'AJ', category: 'Personal' },
    { name: 'Bob Smith', address: '5DTestUPts3kjeXSTMyerHihn1uwMfLj8vU8sqF7qYrFabHE', avatar: 'BS', category: 'Business' },
    { name: 'Carol Wilson', address: '5GNJqTPyNqANBkUVMN1LPPrxXnFouWXoe2wNSmmEoLctxiZY', avatar: 'CW', category: 'Personal' },
    { name: 'David Brown', address: '5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy', avatar: 'DB', category: 'Exchange' },
    { name: 'Emma Davis', address: '5Ck5SLSHYac6WFt5UZRSsdJjwmpSZq85fd5TRNAdZQVzEAPT', avatar: 'ED', category: 'Personal' },
    { name: 'Frank Miller', address: '5HKPmK9GYtE1PSLsS1qiYU9xQ9Si1NcEhdeCq9sw5bqu4ns8', avatar: 'FM', category: 'Business' }
];

const demoActivities = [
    { icon: 'paper-plane', title: 'Sent 500 DOT to Bob Smith', time: '5 hours ago' },
    { icon: 'arrow-down', title: 'Received 1,250 DOT from Alice Johnson', time: '2 hours ago' },
    { icon: 'user-plus', title: 'Added new contact: Emma Davis', time: '1 day ago' },
    { icon: 'shield-alt', title: 'Security backup completed', time: '3 days ago' }
];

// Application state
let currentTheme = 'light';
let currentPage = 'dashboard';

// Initialize app
function initApp() {
    loadRecentTransactions();
    loadQuickContacts();
    loadRecentActivity();
    loadContactsGrid();
    loadTransactionHistory();
    
    // Set up search functionality
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
    
    // Set up send form calculations
    const sendAmountInput = document.getElementById('send-amount');
    if (sendAmountInput) {
        sendAmountInput.addEventListener('input', updateSendCalculations);
    }
}

// Login functionality
function loginDemo() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('main-app').classList.remove('hidden');
    initApp();
}

function signOut() {
    document.getElementById('main-app').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('hidden');
}

// Page navigation
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    
    // Show selected page
    document.getElementById(pageId).classList.add('active');
    
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelectorAll('.bottom-nav-item').forEach(item => item.classList.remove('active'));
    
    document.querySelectorAll(`[data-page="${pageId}"]`).forEach(item => item.classList.add('active'));
    
    currentPage = pageId;
}

// Theme toggle
function toggleTheme() {
    const body = document.body;
    const themeIcon = document.querySelector('.theme-toggle i');
    
    if (currentTheme === 'light') {
        body.setAttribute('data-theme', 'dark');
        themeIcon.className = 'fas fa-sun';
        currentTheme = 'dark';
    } else {
        body.removeAttribute('data-theme');
        themeIcon.className = 'fas fa-moon';
        currentTheme = 'light';
    }
}

// Load demo data
function loadRecentTransactions() {
    const container = document.getElementById('recent-transactions');
    if (!container) return;
    
    container.innerHTML = '';
    
    demoTransactions.slice(0, 5).forEach(tx => {
        const transactionEl = createTransactionElement(tx);
        container.appendChild(transactionEl);
    });
}

function loadTransactionHistory() {
    const container = document.getElementById('transaction-history');
    if (!container) return;
    
    container.innerHTML = '';
    
    demoTransactions.forEach(tx => {
        const transactionEl = createTransactionElement(tx, true);
        container.appendChild(transactionEl);
    });
}

function createTransactionElement(tx, detailed = false) {
    const div = document.createElement('div');
    div.className = 'transaction-item';
    div.onclick = () => showTransactionDetails(tx);
    
    div.innerHTML = `
        <div class="transaction-icon ${tx.type}">
            <i class="fas fa-${tx.type === 'sent' ? 'arrow-up' : 'arrow-down'}"></i>
        </div>
        <div class="transaction-details">
            <div class="transaction-type">${tx.type === 'sent' ? 'Sent' : 'Received'}</div>
            <div class="transaction-address">${tx.type === 'sent' ? tx.to : tx.from}</div>
            ${detailed ? `<div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.25rem;">Hash: ${tx.hash.substring(0, 20)}...</div>` : ''}
        </div>
        <div class="transaction-right">
            <div class="transaction-amount ${tx.type === 'sent' ? 'negative' : 'positive'}">
                ${tx.type === 'sent' ? '-' : '+'}${tx.amount} DOT
            </div>
            <div class="transaction-time">${tx.timestamp}</div>
        </div>
    `;
    
    return div;
}

function loadQuickContacts() {
    const container = document.getElementById('quick-contacts');
    if (!container) return;
    
    container.innerHTML = '';
    
    demoContacts.slice(0, 4).forEach(contact => {
        const contactEl = createQuickContactElement(contact);
        container.appendChild(contactEl);
    });
}

function createQuickContactElement(contact) {
    const div = document.createElement('div');
    div.className = 'contact-item';
    
    div.innerHTML = `
        <div class="contact-avatar">${contact.avatar}</div>
        <div class="contact-details">
            <div class="contact-name">${contact.name}</div>
            <div class="contact-address">${contact.address.substring(0, 8)}...${contact.address.slice(-8)}</div>
        </div>
        <button class="quick-send-btn" onclick="quickSendTo('${contact.address}', event)">
            <i class="fas fa-paper-plane"></i>
        </button>
    `;
    
    return div;
}

function loadRecentActivity() {
    const container = document.getElementById('recent-activity');
    if (!container) return;
    
    container.innerHTML = '';
    
    demoActivities.forEach(activity => {
        const activityEl = createActivityElement(activity);
        container.appendChild(activityEl);
    });
}

function createActivityElement(activity) {
    const div = document.createElement('div');
    div.className = 'activity-item';
    
    div.innerHTML = `
        <div class="activity-icon-wrapper">
            <i class="fas fa-${activity.icon}"></i>
        </div>
        <div class="activity-content">
            <div class="activity-title">${activity.title}</div>
            <div class="activity-time">${activity.time}</div>
        </div>
    `;
    
    return div;
}

function loadContactsGrid() {
    const container = document.getElementById('contacts-grid');
    if (!container) return;
    
    container.innerHTML = '';
    
    demoContacts.forEach(contact => {
        const contactEl = createContactCard(contact);
        container.appendChild(contactEl);
    });
}

function createContactCard(contact) {
    const div = document.createElement('div');
    div.className = 'contact-card';
    
    div.innerHTML = `
        <div class="contact-header">
            <div class="contact-avatar">${contact.avatar}</div>
            <div class="contact-name">${contact.name}</div>
        </div>
        <div class="contact-address">${contact.address}</div>
        <div class="contact-actions">
            <button class="contact-btn primary" onclick="quickSendTo('${contact.address}')">Send</button>
            <button class="contact-btn" onclick="editContact('${contact.name}')">Edit</button>
            <button class="contact-btn" onclick="deleteContact('${contact.name}')">Delete</button>
        </div>
    `;
    
    return div;
}

// Modal functionality
function showModal(title, content, showFooter = true) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = content;
    document.getElementById('modal-footer').style.display = showFooter ? 'flex' : 'none';
    document.getElementById('modal').classList.add('show');
}

function closeModal() {
    document.getElementById('modal').classList.remove('show');
}

function confirmModal() {
    // Handle modal confirmation based on current modal type
    closeModal();
}

// Specific modal functions
function showNotifications() {
    showModal('Notifications', `
        <div style="text-align: center; padding: 2rem;">
            <i class="fas fa-bell" style="font-size: 3rem; color: var(--accent-color); margin-bottom: 1rem;"></i>
            <p style="color: var(--text-secondary);">No new notifications</p>
        </div>
    `, false);
}

function showSwapModal() {
    showModal('Swap Tokens', `
        <div style="text-align: center; padding: 2rem;">
            <i class="fas fa-exchange-alt" style="font-size: 3rem; color: var(--accent-color); margin-bottom: 1rem;"></i>
            <p style="margin-bottom: 1rem;">Token swap functionality</p>
            <p style="color: var(--text-secondary); font-size: 0.9rem;">This feature would integrate with DEX protocols to enable token swapping.</p>
        </div>
    `);
}

function showAddContactModal() {
    showModal('Add New Contact', `
        <div class="form-group">
            <label class="form-label">Contact Name</label>
            <input type="text" class="form-input" id="new-contact-name" placeholder="Enter contact name">
        </div>
        <div class="form-group">
            <label class="form-label">Polkadot Address</label>
            <input type="text" class="form-input" id="new-contact-address" placeholder="Enter Polkadot address">
        </div>
        <div class="form-group">
            <label class="form-label">Category (Optional)</label>
            <select class="form-input" id="new-contact-category">
                <option>Personal</option>
                <option>Business</option>
                <option>Exchange</option>
                <option>Other</option>
            </select>
        </div>
        <div class="form-group">
            <label class="form-label">Notes (Optional)</label>
            <input type="text" class="form-input" id="new-contact-notes" placeholder="Add notes about this contact">
        </div>
    `);
}

function showBackupModal() {
    showModal('Backup Seed Phrase', `
        <div style="text-align: center; margin-bottom: 1.5rem;">
            <i class="fas fa-shield-alt" style="font-size: 3rem; color: var(--warning); margin-bottom: 1rem;"></i>
            <p style="font-weight: 700; color: var(--warning); margin-bottom: 1rem;">⚠️ Keep this safe and private!</p>
            <p style="color: var(--text-secondary); font-size: 0.9rem;">Write down these 12 words in order. This is the only way to recover your wallet.</p>
        </div>
        <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; font-family: monospace; font-weight: 700;">
                <div>1. abandon</div><div>2. ability</div><div>3. able</div>
                <div>4. about</div><div>5. above</div><div>6. absent</div>
                <div>7. absorb</div><div>8. abstract</div><div>9. absurd</div>
                <div>10. abuse</div><div>11. access</div><div>12. accident</div>
            </div>
        </div>
        <div style="background: rgba(220, 53, 69, 0.1); padding: 1rem; border-radius: 8px; color: var(--danger); font-size: 0.85rem;">
            <strong>Security Warning:</strong> Never share your seed phrase. QuickDot will never ask for it. Store it safely offline.
        </div>
    `);
}

function showPrivateKeyModal() {
    showModal('Export Private Key', `
        <div style="text-align: center; margin-bottom: 1.5rem;">
            <i class="fas fa-key" style="font-size: 3rem; color: var(--danger); margin-bottom: 1rem;"></i>
            <p style="font-weight: 700; color: var(--danger); margin-bottom: 1rem;">🔑 Private Key Export</p>
            <p style="color: var(--text-secondary); font-size: 0.9rem;">Your private key gives complete control over your wallet. Handle with extreme care.</p>
        </div>
        <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
            <div style="font-family: monospace; font-weight: 700; word-break: break-all; color: var(--text-primary);">
                0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
            </div>
        </div>
        <div style="background: rgba(220, 53, 69, 0.1); padding: 1rem; border-radius: 8px; color: var(--danger); font-size: 0.85rem;">
            <strong>Critical Warning:</strong> Anyone with this private key can access your funds. Only export if absolutely necessary.
        </div>
    `);
}

function showDeleteAccountModal() {
    showModal('Delete Account', `
        <div style="text-align: center; margin-bottom: 1.5rem;">
            <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: var(--danger); margin-bottom: 1rem;"></i>
            <p style="font-weight: 700; color: var(--danger); margin-bottom: 1rem;">⚠️ Account Deletion</p>
            <p style="color: var(--text-secondary); font-size: 0.9rem;">This action cannot be undone. Your account and all associated data will be permanently deleted.</p>
        </div>
        <div style="background: rgba(220, 53, 69, 0.1); padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
            <p style="color: var(--danger); font-weight: 700; margin-bottom: 0.5rem;">Before deleting:</p>
            <ul style="color: var(--danger); font-size: 0.9rem; padding-left: 1.5rem;">
                <li>Make sure you have backed up your seed phrase</li>
                <li>Transfer any remaining DOT to another wallet</li>
                <li>Export any important transaction data</li>
            </ul>
        </div>
        <div class="form-group">
            <label class="form-label" style="color: var(--danger);">Type "DELETE" to confirm</label>
            <input type="text" class="form-input" id="delete-confirmation" placeholder="Type DELETE to confirm">
        </div>
    `);
}

function showTransactionDetails(tx) {
    showModal('Transaction Details', `
        <div class="transaction-item" style="margin-bottom: 1.5rem; cursor: default;">
            <div class="transaction-icon ${tx.type}">
                <i class="fas fa-${tx.type === 'sent' ? 'arrow-up' : 'arrow-down'}"></i>
            </div>
            <div style="flex: 1;">
                <div style="font-weight: 700; font-size: 1.1rem; margin-bottom: 0.5rem;">
                    ${tx.type === 'sent' ? 'Sent' : 'Received'} ${tx.amount} DOT
                </div>
                <div style="color: var(--text-secondary); font-size: 0.9rem;">${tx.timestamp}</div>
            </div>
            <div style="color: ${tx.type === 'sent' ? 'var(--danger)' : 'var(--success)'}; font-weight: 700;">
                ${tx.type === 'sent' ? '-' : '+'}${tx.amount} DOT
            </div>
        </div>
        
        <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem;">
                <span style="color: var(--text-secondary);">Hash:</span>
                <span style="font-family: monospace; font-size: 0.8rem; word-break: break-all;">${tx.hash.substring(0, 30)}...</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem;">
                <span style="color: var(--text-secondary);">From:</span>
                <span style="font-family: monospace; font-size: 0.8rem;">${tx.from.substring(0, 10)}...${tx.from.slice(-10)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem;">
                <span style="color: var(--text-secondary);">To:</span>
                <span style="font-family: monospace; font-size: 0.8rem;">${tx.to.substring(0, 10)}...${tx.to.slice(-10)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem;">
                <span style="color: var(--text-secondary);">Fee:</span>
                <span>${tx.fee} DOT</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem;">
                <span style="color: var(--text-secondary);">Status:</span>
                <span style="color: var(--success);"><i class="fas fa-check-circle"></i> ${tx.status}</span>
            </div>
        </div>
    `, false);
}

// Send form functionality
function updateSendCalculations() {
    const amount = parseFloat(document.getElementById('send-amount').value) || 0;
    const selectedFee = document.querySelector('.fee-option.selected');
    const feeAmount = selectedFee ? parseFloat(selectedFee.querySelector('.fee-amount').textContent.replace(' DOT', '')) : 0.01;
    
    document.getElementById('total-amount').textContent = amount.toFixed(2) + ' DOT';
    document.getElementById('total-fee').textContent = feeAmount.toFixed(2) + ' DOT';
    document.getElementById('total-with-fee').textContent = (amount + feeAmount).toFixed(2) + ' DOT';
}

function setMaxAmount() {
    document.getElementById('send-amount').value = '18245.49'; // Available minus fee
    updateSendCalculations();
}

function selectFeeOption(element, type) {
    document.querySelectorAll('.fee-option').forEach(option => option.classList.remove('selected'));
    element.classList.add('selected');
    updateSendCalculations();
}

function confirmSendTransaction() {
    const recipientAddress = document.getElementById('recipient-address').value;
    const amount = document.getElementById('send-amount').value;
    const note = document.getElementById('transaction-note').value;
    
    if (!recipientAddress || !amount) {
        alert('Please fill in recipient address and amount');
        return;
    }
    
    showModal('Confirm Transaction', `
        <div style="text-align: center; margin-bottom: 1.5rem;">
            <i class="fas fa-paper-plane" style="font-size: 3rem; color: var(--accent-color); margin-bottom: 1rem;"></i>
            <p style="font-weight: 700; font-size: 1.2rem; margin-bottom: 0.5rem;">Send ${amount} DOT</p>
            <p style="color: var(--text-secondary);">Please review and confirm your transaction</p>
        </div>
        
        <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem;">
                <span style="color: var(--text-secondary);">To:</span>
                <span style="font-family: monospace; font-size: 0.8rem;">${recipientAddress.substring(0, 10)}...${recipientAddress.slice(-10)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem;">
                <span style="color: var(--text-secondary);">Amount:</span>
                <span style="font-weight: 700;">${amount} DOT</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem;">
                <span style="color: var(--text-secondary);">Fee:</span>
                <span>${document.getElementById('total-fee').textContent}</span>
            </div>
            ${note ? `<div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem;">
                <span style="color: var(--text-secondary);">Note:</span>
                <span>${note}</span>
            </div>` : ''}
            <hr style="border: none; border-top: 1px solid var(--border-color); margin: 0.75rem 0;">
            <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 1.1rem;">
                <span>Total:</span>
                <span>${document.getElementById('total-with-fee').textContent}</span>
            </div>
        </div>
        
        <div style="background: rgba(127, 255, 212, 0.1); padding: 1rem; border-radius: 8px; color: var(--primary-color); font-size: 0.9rem;">
            <i class="fas fa-info-circle"></i> This transaction will be broadcast to the Polkadot network and cannot be reversed.
        </div>
    `);
}

// Utility functions
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        // Show temporary notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--success);
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            font-weight: 700;
            z-index: 3000;
            animation: fadeInOut 2s ease-in-out;
        `;
        notification.innerHTML = '<i class="fas fa-check"></i> Copied to clipboard!';
        document.body.appendChild(notification);
        
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 2000);
    }).catch(() => {
        alert('Failed to copy to clipboard');
    });
}

function handleSearch(event) {
    const query = event.target.value.toLowerCase();
    console.log('Searching for:', query);
    // In a real app, this would filter transactions, contacts, etc.
}

function quickSendTo(address, event) {
    if (event) event.stopPropagation();
    showPage('send');
    setTimeout(() => {
        document.getElementById('recipient-address').value = address;
        document.getElementById('send-amount').focus();
    }, 100);
}

function showContactSelector() {
    let contactOptions = '';
    demoContacts.forEach(contact => {
        contactOptions += `<div class="contact-item" onclick="selectContactForSend('${contact.address}', '${contact.name}')">
            <div class="contact-avatar">${contact.avatar}</div>
            <div class="contact-details">
                <div class="contact-name">${contact.name}</div>
                <div class="contact-address">${contact.address}</div>
            </div>
        </div>`;
    });
    
    showModal('Select Contact', contactOptions, false);
}

function selectContactForSend(address, name) {
    document.getElementById('recipient-address').value = address;
    closeModal();
}

function scanQRCode() {
    showModal('QR Code Scanner', `
        <div style="text-align: center; padding: 2rem;">
            <i class="fas fa-qrcode" style="font-size: 3rem; color: var(--accent-color); margin-bottom: 1rem;"></i>
            <p style="margin-bottom: 1rem;">QR Code Scanner</p>
            <p style="color: var(--text-secondary); font-size: 0.9rem;">Camera access would be used here to scan QR codes containing Polkadot addresses.</p>
        </div>
    `);
}

function selectTimeframe(button, timeframe) {
    document.querySelectorAll('.timeframe-btn').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    console.log('Selected timeframe:', timeframe);
    // In a real app, this would update the chart data
}

function toggleSetting(toggle) {
    toggle.classList.toggle('active');
}

function toggleUserMenu() {
    // In a real app, this would show a dropdown menu
    console.log('User menu clicked');
}

function editContact(name) {
    const contact = demoContacts.find(c => c.name === name);
    if (contact) {
        showModal('Edit Contact', `
            <div class="form-group">
                <label class="form-label">Contact Name</label>
                <input type="text" class="form-input" value="${contact.name}" id="edit-contact-name">
            </div>
            <div class="form-group">
                <label class="form-label">Polkadot Address</label>
                <input type="text" class="form-input" value="${contact.address}" id="edit-contact-address">
            </div>
            <div class="form-group">
                <label class="form-label">Category</label>
                <select class="form-input" id="edit-contact-category">
                    <option ${contact.category === 'Personal' ? 'selected' : ''}>Personal</option>
                    <option ${contact.category === 'Business' ? 'selected' : ''}>Business</option>
                    <option ${contact.category === 'Exchange' ? 'selected' : ''}>Exchange</option>
                    <option ${contact.category === 'Other' ? 'selected' : ''}>Other</option>
                </select>
            </div>
        `);
    }
}

function deleteContact(name) {
    showModal('Delete Contact', `
        <div style="text-align: center; margin-bottom: 1.5rem;">
            <i class="fas fa-user-times" style="font-size: 3rem; color: var(--danger); margin-bottom: 1rem;"></i>
            <p style="font-weight: 700; margin-bottom: 0.5rem;">Delete ${name}?</p>
            <p style="color: var(--text-secondary); font-size: 0.9rem;">This contact will be permanently removed from your address book.</p>
        </div>
    `);
}

function shareViaEmail() {
    const subject = 'My Polkadot Address';
    const body = 'Here is my Polkadot address: 5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
}

function shareViaSMS() {
    const message = 'My Polkadot address: 5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
    window.open(`sms:?body=${encodeURIComponent(message)}`);
}

function shareViaWhatsApp() {
    const message = 'My Polkadot address: 5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`);
}

function downloadQR() {
    alert('QR code download functionality would be implemented here');
}

function generatePaymentRequest() {
    alert('Payment request link generated (demo)');
}

// Initialize app when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('QuickDot Demo Ready - Click "Enter Demo" to start');
});
