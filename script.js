// ====================
// 1. БУРГЕР-МЕНЮ
// ====================

const burgerBtn = document.querySelector('.burger-btn');
const navList = document.querySelector('.nav-list');
const body = document.body;

if (burgerBtn && navList) {
    function toggleMenu() {
        burgerBtn.classList.toggle('active');
        navList.classList.toggle('active');
        body.classList.toggle('menu-open');
    }

    burgerBtn.addEventListener('click', toggleMenu);

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            burgerBtn.classList.remove('active');
            navList.classList.remove('active');
            body.classList.remove('menu-open');
        });
    });
}

// ====================
// 2. КОРЗИНА ПОКУПОК
// ====================

let cartItems = JSON.parse(localStorage.getItem('shoppingCart')) || [];
let cartTotal = 0;

let cartButtons, cartCounter, cartIcon, cartModal, cartItemsList, 
    cartTotalItems, cartTotalPrice, closeModal, continueShoppingBtn, checkoutButton;

function initCartElements() {
    cartButtons = document.querySelectorAll('.btn-buy');
    cartCounter = document.querySelector('.cart-counter');
    cartIcon = document.querySelector('.cart-icon');
    cartModal = document.getElementById('cartModal');
    cartItemsList = document.getElementById('cartItemsList');
    cartTotalItems = document.getElementById('cartTotalItems');
    cartTotalPrice = document.getElementById('cartTotalPrice');
    closeModal = document.querySelector('.close-modal');
    continueShoppingBtn = document.getElementById('continueShopping');
    checkoutButton = document.getElementById('checkoutButton');
}

function saveCartToStorage() {
    localStorage.setItem('shoppingCart', JSON.stringify(cartItems));
}

function updateCartCounter() {
    if (!cartCounter) return;
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    cartCounter.textContent = totalItems;
    
    if (cartIcon) {
        if (totalItems > 0) {
            cartIcon.classList.add('has-items');
        } else {
            cartIcon.classList.remove('has-items');
        }
    }
}

function updateCartTotal() {
    cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function addToCart(productId, productName, productPrice) {
    const price = parseFloat(
        productPrice
            .replace(/\s/g, '')
            .replace(',', '.')
    );
    
    const existingItem = cartItems.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cartItems.push({
            id: productId,
            name: productName,
            price: price,
            quantity: 1
        });
    }
    
    updateCartTotal();
    updateCartCounter();
    saveCartToStorage();
    renderCartItems();
    showNotification(`"${productName}" добавлен в корзину!`);
}

function removeFromCart(productId) {
    cartItems = cartItems.filter(item => item.id !== productId);
    updateCartTotal();
    updateCartCounter();
    saveCartToStorage();
    renderCartItems();
    showNotification('Товар удалён из корзины', 'warning');
}

function updateQuantity(productId, newQuantity) {
    const item = cartItems.find(item => item.id === productId);
    if (item) {
        item.quantity = Math.max(1, newQuantity);
        updateCartTotal();
        updateCartCounter();
        saveCartToStorage();
        renderCartItems();
    }
}

function renderCartItems() {
    if (!cartItemsList || !cartTotalItems || !cartTotalPrice || !checkoutButton) return;
    
    if (cartItems.length === 0) {
        cartItemsList.innerHTML = '<p class="cart-empty">Корзина пуста</p>';
        cartTotalItems.textContent = '0';
        cartTotalPrice.textContent = '0 ₽';
        checkoutButton.disabled = true;
        checkoutButton.style.opacity = '0.6';
        return;
    }
    
    checkoutButton.disabled = false;
    checkoutButton.style.opacity = '1';
    
    let itemsHTML = '';
    let totalItemsCount = 0;
    
    cartItems.forEach(item => {
        totalItemsCount += item.quantity;
        const itemTotal = item.price * item.quantity;
        
        itemsHTML += `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-image">
                    <img src="images/product${item.id}.png" alt="${item.name}">
                </div>
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-price">${item.price.toFixed(2)} ₽ × ${item.quantity} = ${itemTotal.toFixed(2)} ₽</div>
                    <div class="cart-item-controls">
                        <div class="quantity-controls">
                            <button class="quantity-btn minus" data-id="${item.id}" data-action="minus">−</button>
                            <span class="quantity-value">${item.quantity}</span>
                            <button class="quantity-btn plus" data-id="${item.id}" data-action="plus">+</button>
                        </div>
                        <button class="remove-item" data-id="${item.id}">
                            ❌ Удалить
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    cartItemsList.innerHTML = itemsHTML;
    cartTotalItems.textContent = totalItemsCount;
    cartTotalPrice.textContent = `${cartTotal.toFixed(2)} ₽`;
    
    document.querySelectorAll('.quantity-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const action = this.getAttribute('data-action');
            const item = cartItems.find(item => item.id == id);
            
            if (item) {
                if (action === 'plus') {
                    updateQuantity(id, item.quantity + 1);
                } else {
                    updateQuantity(id, item.quantity - 1);
                }
            }
        });
    });
    
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            removeFromCart(id);
        });
    });
}

// ====================
// 3. МОДАЛЬНОЕ ОКНО
// ====================

function openCartModal() {
    if (!cartModal) {
        console.log('Модальное окно не найдено');
        return;
    }
    cartModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    renderCartItems();
}

function closeCartModal() {
    if (!cartModal) return;
    cartModal.classList.remove('active');
    document.body.style.overflow = '';
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#25D366' : '#ff9800'};
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 10001;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// ====================
// 4. ИНИЦИАЛИЗАЦИЯ ОБРАБОТЧИКОВ
// ====================

function initEventListeners() {
    if (cartButtons) {
        cartButtons.forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.getAttribute('data-id');
                const productName = this.getAttribute('data-name');
                const productPrice = this.getAttribute('data-price');
                
                addToCart(productId, productName, productPrice);
            });
        });
    }
    
    if (cartIcon) {
        cartIcon.addEventListener('click', function(e) {
            e.preventDefault();
            openCartModal();
        });
    }
    
    if (closeModal) {
        closeModal.addEventListener('click', closeCartModal);
    }
    
    if (continueShoppingBtn) {
        continueShoppingBtn.addEventListener('click', closeCartModal);
    }
    
    if (cartModal) {
        cartModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeCartModal();
            }
        });
    }
    
    if (checkoutButton) {
        checkoutButton.addEventListener('click', function() {
            if (cartItems.length === 0) return;
            
            const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
            alert(`Заказ оформлен! Сумма: ${cartTotal.toFixed(2)} ₽\nТоваров: ${totalItems} шт.\n\nСпасибо за покупку!`);
            
            cartItems = [];
            localStorage.removeItem('shoppingCart');
            updateCartCounter();
            closeCartModal();
            renderCartItems();
            showNotification('Заказ успешно оформлен!', 'success');
        });
    }
}

// ====================
// 5. ЗАГРУЗКА СТРАНИЦЫ
// ====================

document.addEventListener('DOMContentLoaded', function() {
    initCartElements();
    updateCartTotal();
    updateCartCounter();
    renderCartItems();
    initEventListeners();
    console.log('Корзина инициализирована, иконка:', cartIcon);
});