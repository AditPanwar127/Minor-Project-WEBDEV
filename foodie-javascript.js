// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initApp();
});

// Global State
const appState = {
    currentPage: 'welcome-page',
    foodItems: [
        { 
            id: 1, 
            name: 'Organic apples', 
            expiryDate: '2022-10-31', 
            category: 'Fruits',
            quantity: 5,
            units: 'pieces',
            image: 'Organic Apples.webp'
        },
        { 
            id: 2, 
            name: 'Organic apples', 
            expiryDate: '2022-10-30', 
            category: 'Fruits',
            quantity: 3,
            units: 'pieces',
            image: 'Organic Apples.webp'
        },
        { 
            id: 3, 
            name: 'Organic apples', 
            expiryDate: '2022-10-31', 
            category: 'Fruits',
            quantity: 2,
            units: 'pieces',
            image: 'Organic Apples.webp'
        }
    ],
    recipes: [
        {
            id: 1,
            title: 'Vegan Apple Pie',
            prepTime: '30 min',
            servings: '6 servings',
            author: 'FreshBite',
            image: 'Vegan Apple Pie.jpg'
        },
        {
            id: 2,
            title: 'Vegan Apple Pie',
            prepTime: '45 min',
            servings: '6 servings',
            author: 'FreshBite',
            image: 'Vegan Apple Pie.jpg'
        },
        {
            id: 3,
            title: 'Vegan Apple Pie',
            prepTime: '30 min',
            servings: '6 servings',
            author: 'FreshBite',
            image: 'Vegan Apple Pie.jpg'
        }
    ],
    selectedFoodItem: null,
    selectedRecipe: null,
    editMode: 'add' // 'add' or 'edit'
};

// Application Initialization
function initApp() {
    // Set up event listeners
    setupEventListeners();
    
    // Show the welcome page by default
    showPage('welcome-page');
    
    // Update inventory status
    updateInventoryStatus();
}

// Event Listeners Setup
function setupEventListeners() {
    // Form submissions
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            showPage('home-page');
        });
    }
    
    // Add "Add Item" button click event
    const addItemBtn = document.querySelector('.add-item-btn');
    if (addItemBtn) {
        addItemBtn.addEventListener('click', function() {
            appState.editMode = 'add';
            appState.selectedFoodItem = null;
            resetEditItemForm();
            showModal('edit-item-modal');
        });
    }
    
    // Set up calendar day click events
    const calendarDays = document.querySelectorAll('.calendar-day');
    calendarDays.forEach(day => {
        day.addEventListener('click', function() {
            // Remove current-day class from all days
            calendarDays.forEach(d => d.classList.remove('current-day'));
            // Add current-day class to clicked day
            this.classList.add('current-day');
            
            // Get the date of the clicked day (not implemented in this demo)
            // showExpiringItemsForDate(date);
        });
    });
    
    // Set up edit item form
    const editItemForm = document.getElementById('edit-item-form');
    if (editItemForm) {
        editItemForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveItem();
        });
    }
    
    // Setup food item edit button clicks
    setupFoodItemActions();
    
    // Setup recipe card clicks
    setupRecipeCardClicks();
}

// Page Navigation
function showPage(pageId) {
    // Hide all pages
    const pages = document.querySelectorAll('[id$="-page"]');
    pages.forEach(page => {
        page.style.display = 'none';
    });
    
    // Show the selected page
    const selectedPage = document.getElementById(pageId);
    if (selectedPage) {
        selectedPage.style.display = pageId === 'welcome-page' ? 'flex' : 'block';
        appState.currentPage = pageId;
    }
}

// Modal Functions
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Item Management
function updateInventoryStatus() {
    const inventoryStatus = document.querySelector('.inventory-status p');
    if (inventoryStatus) {
        const totalItems = appState.foodItems.length;
        const expiringSoon = appState.foodItems.filter(item => {
            const expiryDate = new Date(item.expiryDate);
            const today = new Date();
            const diffTime = expiryDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays <= 5 && diffDays >= 0;
        }).length;
        
        inventoryStatus.textContent = `${totalItems} items, ${expiringSoon} expiring soon`;
    }
}

function renderFoodItems() {
    const foodItemsList = document.querySelector('.food-items-list');
    if (foodItemsList) {
        // Clear the list except the "Add Item" button
        const addItemBtn = foodItemsList.querySelector('.add-item-btn');
        foodItemsList.innerHTML = '';
        
        // Add all food items
        appState.foodItems.forEach(item => {
            const foodItemEl = createFoodItemElement(item);
            foodItemsList.appendChild(foodItemEl);
        });
        
        // Add the "Add Item" button back
        foodItemsList.appendChild(addItemBtn);
    }
}

function createFoodItemElement(item) {
    const div = document.createElement('div');
    div.className = 'food-item';
    div.dataset.itemId = item.id;
    
    div.innerHTML = `
        <div class="food-item-image">
            <img src="${item.image}" alt="${item.name}">
        </div>
        <div class="food-item-info">
            <div class="food-item-title">${item.name}</div>
            <div class="food-item-expiry">Expires on ${formatDate(item.expiryDate)}</div>
        </div>
        <div class="food-item-actions">
            <a href="#" class="edit-item-btn">•••</a>
        </div>
    `;
    
    // Add click event for the edit button
    const editBtn = div.querySelector('.edit-item-btn');
    editBtn.addEventListener('click', function(e) {
        e.preventDefault();
        editFoodItem(item.id);
    });
    
    return div;
}

function editFoodItem(itemId) {
    appState.editMode = 'edit';
    const item = appState.foodItems.find(item => item.id === itemId);
    if (item) {
        appState.selectedFoodItem = item;
        populateEditItemForm(item);
        showModal('edit-item-modal');
    }
}

function populateEditItemForm(item) {
    document.getElementById('item-name').value = item.name;
    document.getElementById('expiry-date').value = item.expiryDate;
    document.getElementById('category').value = item.category;
    document.getElementById('quantity').value = item.quantity;
    document.getElementById('units').value = item.units;
    
    // Update modal title
    const modalTitle = document.querySelector('.modal-title');
    if (modalTitle) {
        modalTitle.textContent = 'Edit item';
    }
}

function resetEditItemForm() {
    document.getElementById('item-name').value = '';
    document.getElementById('expiry-date').value = '';
    document.getElementById('category').value = '';
    document.getElementById('quantity').value = '';
    document.getElementById('units').value = '';
    
    // Update modal title
    const modalTitle = document.querySelector('.modal-title');
    if (modalTitle) {
        modalTitle.textContent = 'Add new item';
    }
}

function saveItem() {
    const name = document.getElementById('item-name').value;
    const expiryDate = document.getElementById('expiry-date').value;
    const category = document.getElementById('category').value;
    const quantity = document.getElementById('quantity').value;
    const units = document.getElementById('units').value;
    
    if (!name || !expiryDate) {
        alert('Please fill in all required fields');
        return;
    }
    
    if (appState.editMode === 'edit' && appState.selectedFoodItem) {
        // Update existing item
        const index = appState.foodItems.findIndex(item => item.id === appState.selectedFoodItem.id);
        if (index !== -1) {
            appState.foodItems[index] = {
                ...appState.foodItems[index],
                name,
                expiryDate,
                category,
                quantity,
                units
            };
        }
    } else {
        // Add new item
        const newId = Math.max(...appState.foodItems.map(item => item.id), 0) + 1;
        appState.foodItems.push({
            id: newId,
            name,
            expiryDate,
            category,
            quantity,
            units,
            image: 'Organic Apples.webp' // Default image
        });
    }
    
    // Update UI
    renderFoodItems();
    updateInventoryStatus();
    
    // Close the modal
    closeModal('edit-item-modal');
}

function removeItem() {
    if (appState.editMode === 'edit' && appState.selectedFoodItem) {
        // Remove the item from the array
        appState.foodItems = appState.foodItems.filter(item => item.id !== appState.selectedFoodItem.id);
        
        // Update UI
        renderFoodItems();
        updateInventoryStatus();
        
        // Close the modal
        closeModal('edit-item-modal');
    }
}

// Calendar Functions
function initCalendar() {
    // This would be expanded to create calendar dynamically
    // For now, we're using the static HTML calendar
}

function highlightExpiringDates() {
    // Get all expiry dates
    const expiryDates = appState.foodItems.map(item => new Date(item.expiryDate));
    
    // For each calendar day, check if there's an expiring item
    const calendarDays = document.querySelectorAll('.calendar-day');
    calendarDays.forEach(day => {
        // This would need to be expanded to actually match dates
        // For demo purposes, we're not implementing this fully
    });
}

// Recipe Functions
function setupRecipeCardClicks() {
    const recipeCards = document.querySelectorAll('.recipe-card');
    recipeCards.forEach(card => {
        card.addEventListener('click', function() {
            // Here we would typically load the recipe details based on ID
            // For now, we just navigate to the recipe detail page
            showPage('recipe-detail-page');
        });
    });
}

// Utility Functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear().toString().substr(-2)}`;
}

function setupFoodItemActions() {
    // This gets called after food items are rendered
    const editButtons = document.querySelectorAll('.food-item-actions a');
    editButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const foodItem = this.closest('.food-item');
            const itemId = parseInt(foodItem.dataset.itemId);
            editFoodItem(itemId);
        });
    });

    // Set up remove item button in modal
    const removeButton = document.querySelector('.btn-secondary.modal-btn');
    if (removeButton) {
        removeButton.addEventListener('click', function() {
            removeItem();
        });
    }

    // Set up save button in modal
    const saveButton = document.querySelector('.btn-primary.modal-btn');
    if (saveButton) {
        saveButton.addEventListener('click', function() {
            saveItem();
        });
    }
}

// Initialize the app when window loads
window.onload = function() {
    initApp();
};
