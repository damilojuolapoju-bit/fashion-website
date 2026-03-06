// ==================== DOM STRUCTURE DOCUMENTATION ====================
/*
 * DOM STRUCTURE - Lumière Couture Website
 * 
 * html
 * ├── head
 * │   ├── meta charset
 * │   ├── meta viewport
 * │   ├── title
 * │   └── link (CSS)
 * └── body
 *     └── div#app
 *         ├── div.marquee-section
 *         │   └── div.marquee
 *         │       └── span#marquee-text
 *         ├── header.header
 *         │   └── div.container
 *         │       ├── div.logo
 *         │       └── nav.nav
 *         │           └── ul.nav-list
 *         │               └── li (multiple)
 *         ├── main
 *         │   ├── section.hero / .products-section / .events-section / etc.
 *         │   │   └── div.container
 *         │   │       └── Various content elements
 *         │   └── section (multiple)
 *         ├── footer.footer
 *         │   └── div.container
 *         │       └── Footer content
 *         └── script (src=script.js)
 */

// ==================== GLOBAL VARIABLES ====================

let cart = [];
let bookings = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed');
    initializeApp();
    loadFromLocalStorage();
    updateMarquee();
});

// ==================== INITIALIZATION ====================

function initializeApp() {
    // Set active navigation link based on current page
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Initialize cart display
    updateCartDisplay();
    
    // Initialize bookings display
    updateBookingsDisplay();
    
    console.log('Application initialized');
}

// ==================== MARQUEE FUNCTIONALITY ====================

function updateMarquee() {
    const marqueeText = document.getElementById('marquee-text');
    if (marqueeText) {
        const text = marqueeText.textContent;
        marqueeText.style.animation = 'none';
        setTimeout(() => {
            marqueeText.style.animation = 'scroll 30s linear infinite';
        }, 10);
    }
}

// ==================== NAVIGATION & SCROLL ====================

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// ==================== PRODUCT FILTERING ====================

function filterProducts(category) {
    const products = document.querySelectorAll('.product-item');
    const buttons = document.querySelectorAll('.filter-btn');

    // Update active button
    buttons.forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Filter products
    products.forEach(product => {
        if (category === 'all') {
            product.classList.remove('hidden');
            product.style.animation = 'fadeIn 0.5s ease';
        } else {
            if (product.dataset.category === category) {
                product.classList.remove('hidden');
                product.style.animation = 'fadeIn 0.5s ease';
            } else {
                product.classList.add('hidden');
            }
        }
    });
}

// Add fade-in animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// ==================== SHOPPING CART ====================

function addToCart(productName) {
    // Get product details from the card
    const productCard = event.target.closest('.product-item');
    const price = productCard.querySelector('.price').textContent;
    const priceValue = parseFloat(price.replace('$', ''));

    const cartItem = {
        id: Date.now(),
        name: productName,
        price: priceValue,
        quantity: 1
    };

    // Check if item already exists in cart
    const existingItem = cart.find(item => item.name === productName);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push(cartItem);
    }

    updateCartDisplay();
    saveToLocalStorage();
    
    // Visual feedback
    showNotification(`${productName} added to cart!`);
}

function updateCartDisplay() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalContainer = document.getElementById('cart-total');

    if (!cartItemsContainer) return;

    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">Your cart is empty</p>';
        if (cartTotalContainer) {
            cartTotalContainer.textContent = 'Total: $0.00';
        }
        return;
    }

    let total = 0;

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const cartItemHTML = `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>Quantity: ${item.quantity}</p>
                </div>
                <div>
                    <p class="cart-item-price">$${itemTotal.toFixed(2)}</p>
                    <button class="remove-item" onclick="removeFromCart(${index})">Remove</button>
                </div>
            </div>
        `;
        cartItemsContainer.innerHTML += cartItemHTML;
    });

    if (cartTotalContainer) {
        cartTotalContainer.textContent = `Total: $${total.toFixed(2)}`;
    }
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartDisplay();
    saveToLocalStorage();
    showNotification('Item removed from cart');
}

// ==================== FORM SUBMISSIONS ====================

function submitInquiry(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const inquiryType = document.getElementById('inquiry-type').value;
    const message = document.getElementById('message').value;
    const newsletter = document.getElementById('newsletter').checked;

    // Validate form
    if (!name || !email || !inquiryType || !message) {
        showFormMessage('form-message', 'Please fill in all required fields', 'error');
        return;
    }

    // Create inquiry object
    const inquiry = {
        id: Date.now(),
        name,
        email,
        inquiryType,
        message,
        newsletter,
        timestamp: new Date().toLocaleString()
    };

    // In a real application, this would be sent to a server
    console.log('Inquiry submitted:', inquiry);

    // Show success message
    showFormMessage('form-message', '✅ Thank you! We\'ll respond to your inquiry within 24 hours.', 'success');

    // Reset form
    document.getElementById('inquiries-form').reset();

    // Store inquiry
    let inquiries = JSON.parse(localStorage.getItem('inquiries')) || [];
    inquiries.push(inquiry);
    localStorage.setItem('inquiries', JSON.stringify(inquiries));
}

function bookAppointment(event) {
    event.preventDefault();

    const name = document.getElementById('app-name').value;
    const email = document.getElementById('app-email').value;
    const date = document.getElementById('app-date').value;
    const time = document.getElementById('app-time').value;
    const service = document.getElementById('app-service').value;
    const notes = document.getElementById('app-notes').value;

    // Validate form
    if (!name || !email || !date || !time || !service) {
        showFormMessage('appointment-message', 'Please fill in all required fields', 'error');
        return;
    }

    // Create booking object
    const booking = {
        id: Date.now(),
        name,
        email,
        date,
        time,
        service,
        notes,
        status: 'Confirmed',
        bookedAt: new Date().toLocaleString()
    };

    bookings.push(booking);
    updateBookingsDisplay();
    saveToLocalStorage();

    console.log('Appointment booked:', booking);

    // Show success message
    showFormMessage('appointment-message', '✅ Appointment confirmed! Check your email for details.', 'success');

    // Reset form
    document.getElementById('appointment-form').reset();
}

function showFormMessage(elementId, message, type) {
    const messageElement = document.getElementById(elementId);
    if (messageElement) {
        messageElement.textContent = message;
        messageElement.className = type;
        messageElement.style.display = 'block';

        // Auto-hide success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                messageElement.style.display = 'none';
            }, 5000);
        }
    }
}

// ==================== BOOKINGS MANAGEMENT ====================

function updateBookingsDisplay() {
    const bookingsList = document.getElementById('bookings-list');
    
    if (!bookingsList) return;

    bookingsList.innerHTML = '';

    if (bookings.length === 0) {
        bookingsList.innerHTML = '<p style="text-align: center; color: #999;">No bookings yet</p>';
        return;
    }

    bookings.forEach((booking, index) => {
        const bookingHTML = `
            <div class="booking-item">
                <h4>${booking.name}</h4>
                <p><strong>Service:</strong> ${booking.service}</p>
                <p><strong>Date:</strong> ${booking.date} at ${booking.time}</p>
                <p><strong>Status:</strong> <span style="color: #667eea; font-weight: bold;">${booking.status}</span></p>
                <p><strong>Email:</strong> ${booking.email}</p>
                ${booking.notes ? `<p><strong>Notes:</strong> ${booking.notes}</p>` : ''}
                <button class="remove-item" onclick="cancelBooking(${index})" style="margin-top: 10px;">Cancel Booking</button>
            </div>
        `;
        bookingsList.innerHTML += bookingHTML;
    });
}

function cancelBooking(index) {
    if (confirm('Are you sure you want to cancel this booking?')) {
        bookings.splice(index, 1);
        updateBookingsDisplay();
        saveToLocalStorage();
        showNotification('Booking cancelled');
    }
}

// ==================== BOARD MEMBER INTERACTIONS ====================

function showMemberDetails(element) {
    const bio = element.querySelector('.bio');
    const contact = element.querySelector('.contact');
    
    if (bio) bio.style.opacity = '1';
    if (contact) contact.style.opacity = '1';
}

function hideMemberDetails(element) {
    const bio = element.querySelector('.bio');
    const contact = element.querySelector('.contact');
    
    if (bio) bio.style.opacity = '0';
    if (contact) contact.style.opacity = '0';
}

// ==================== EVENT INTERACTIONS ====================

function toggleEventDetails(element) {
    const eventContent = element.querySelector('.event-content');
    if (eventContent) {
        eventContent.style.animation = eventContent.style.animation ? 'none' : 'slideIn 0.3s ease';
    }
}

function redirectToInquiries(event) {
    event.stopPropagation();
    window.location.href = 'inquiries.html';
}

// ==================== LOCAL STORAGE ====================

function saveToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
    localStorage.setItem('bookings', JSON.stringify(bookings));
}

function loadFromLocalStorage() {
    const savedCart = localStorage.getItem('cart');
    const savedBookings = localStorage.getItem('bookings');

    if (savedCart) {
        cart = JSON.parse(savedCart);
    }

    if (savedBookings) {
        bookings = JSON.parse(savedBookings);
    }

    updateCartDisplay();
    updateBookingsDisplay();
}

// ==================== NOTIFICATIONS ====================

function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background-color: #667eea;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    // Auto-remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Add notification animations
const notificationStyle = document.createElement('style');
notificationStyle.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }

    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(notificationStyle);

// ==================== UTILITY FUNCTIONS ====================

function formatPrice(price) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(price);
}

function getCurrentDate() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

// Set minimum date for appointment form to today
function setMinimumAppointmentDate() {
    const appDateInput = document.getElementById('app-date');
    if (appDateInput) {
        appDateInput.min = getCurrentDate();
    }
}

// Call on page load
window.addEventListener('load', function() {
    setMinimumAppointmentDate();
});

// ==================== CONSOLE LOG FOR DEBUGGING ====================
console.log('%cLumière Couture Website', 'color: #667eea; font-size: 20px; font-weight: bold;');
console.log('%cWelcome to our fashion house!', 'color: #764ba2; font-size: 14px;');
console.log('DOM Structure:', {
    app: document.getElementById('app'),
    header: document.querySelector('header'),
    main: document.querySelector('main'),
    footer: document.querySelector('footer'),
    marquee: document.getElementById('marquee-text')
});
