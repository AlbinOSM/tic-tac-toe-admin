// Database
let database = {
    players: [
        { username: "Albin", password: "admin123", coins: 1000, wins: 5, isAdmin: true },
        { username: "player1", password: "pass1", coins: 50, wins: 3, isAdmin: false },
        { username: "player2", password: "pass2", coins: 30, wins: 1, isAdmin: false }
    ],
    games: []
};

// Load database from localStorage or initialize
function loadDatabase() {
    const savedData = localStorage.getItem('tictactoe_db');
    if (savedData) {
        database = JSON.parse(savedData);
    }
}

// Save database to localStorage
function saveDatabase() {
    localStorage.setItem('tictactoe_db', JSON.stringify(database));
    updatePlayerStats();
}

// Game State
let currentPlayer = null;
let board = Array(9).fill("");
let gameOver = false;
let selectedPlayer = null;
let isAdmin = false;

// DOM Elements
const authScreens = document.getElementById('auth-screens');
const dashboard = document.getElementById('dashboard');
const gameSection = document.getElementById('game-section');
const adminSection = document.getElementById('admin-section');
const adminLink = document.getElementById('admin-link');

// Auth Elements
const authTabs = document.querySelectorAll('.auth-tab');
const authContents = document.querySelectorAll('.auth-content');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const adminLoginBtn = document.getElementById('admin-login-btn');

// Game Elements
const boardElement = document.getElementById('board');
const statusElement = document.getElementById('status');
const resetGameBtn = document.getElementById('reset-game-btn');

// Admin Elements
const searchBtn = document.getElementById('search-btn');
const clearSearchBtn = document.getElementById('clear-search-btn');
const savePlayerBtn = document.getElementById('save-player-btn');
const deletePlayerBtn = document.getElementById('delete-player-btn');
const playersTable = document.getElementById('players-table');
const logoutBtn = document.getElementById('logout-btn');

// Navigation Elements
const navLinks = document.querySelectorAll('.sidebar-nav a[data-section]');

// Initialize the app
function init() {
    loadDatabase();
    setupEventListeners();
}

// Set up all event listeners
function setupEventListeners() {
    // Auth tab switching
    authTabs.forEach(tab => {
        tab.addEventListener('click', () => switchAuthTab(tab.dataset.tab));
    });

    // Auth buttons
    loginBtn.addEventListener('click', login);
    registerBtn.addEventListener('click', register);
    adminLoginBtn.addEventListener('click', adminLogin);
    logoutBtn.addEventListener('click', logout);

    // Game buttons
    resetGameBtn.addEventListener('click', resetGame);

    // Admin buttons
    searchBtn.addEventListener('click', () => {
        const searchTerm = document.getElementById('search-player').value;
        refreshPlayersTable(searchTerm);
    });
    
    clearSearchBtn.addEventListener('click', resetSearch);
    savePlayerBtn.addEventListener('click', updatePlayer);
    deletePlayerBtn.addEventListener('click', deletePlayer);

    // Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            showSection(link.dataset.section);
        });
    });
}

// Auth Functions
function switchAuthTab(tab) {
    authTabs.forEach(t => t.classList.remove('active'));
    authContents.forEach(c => c.classList.remove('active'));
    
    document.querySelector(`.auth-tab[data-tab="${tab}"]`).classList.add('active');
    document.getElementById(`${tab}-form`).classList.add('active');
}

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    const player = database.players.find(p => p.username === username && p.password === password);
    
    if (player) {
        currentPlayer = player;
        isAdmin = player.isAdmin || false;
        showDashboard();
    } else {
        alert("Invalid username or password");
    }
}

function register() {
    const username = document.getElementById('new-username').value;
    const password = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    if (password !== confirmPassword) {
        alert("Passwords don't match!");
        return;
    }
    
    if (database.players.some(p => p.username === username)) {
        alert("Username already exists!");
        return;
    }
    
    const newPlayer = {
        username,
        password,
        coins: 10,
        wins: 0,
        isAdmin: false
    };
    
    database.players.push(newPlayer);
    currentPlayer = newPlayer;
    isAdmin = false;
    
    saveDatabase();
    showDashboard();
}

function adminLogin() {
    const username = "Albin";
    const password = document.getElementById('admin-password').value;
    
    const admin = database.players.find(p => p.username === username && p.password === password && p.isAdmin);
    
    if (admin) {
        currentPlayer = admin;
        isAdmin = true;
        showDashboard();
        showSection('admin');
    } else {
        alert("Invalid admin credentials");
    }
}

function logout() {
    currentPlayer = null;
    isAdmin = false;
    authScreens.style.display = 'block';
    dashboard.style.display = 'none';
    resetGame();
    
    // Reset forms
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    document.getElementById('new-username').value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-password').value = '';
    document.getElementById('admin-password').value = '';
    switchAuthTab('login');
}

// Dashboard Functions
function showDashboard() {
    authScreens.style.display = 'none';
    dashboard.style.display = 'grid';
    
    // Update UI
    document.getElementById('sidebar-avatar').textContent = currentPlayer.username.charAt(0).toUpperCase();
    document.getElementById('sidebar-username').textContent = currentPlayer.username;
    document.getElementById('sidebar-role').textContent = isAdmin ? 'Administrator' : 'Player';
    
    document.getElementById('header-avatar').textContent = currentPlayer.username.charAt(0).toUpperCase();
    
    // Show/hide admin link based on role
    adminLink.style.display = isAdmin ? 'block' : 'none';
    
    updatePlayerStats();
    renderBoard();
    
    if (isAdmin) {
        showSection('admin');
    } else {
        showSection('game');
    }
}

function showSection(section) {
    gameSection.style.display = 'none';
    adminSection.style.display = 'none';
    
    // Update active nav link
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.dataset.section === section) {
            link.classList.add('active');
        }
    });
    
    if (section === 'game') {
        gameSection.style.display = 'block';
        document.getElementById('content-title').textContent = 'Tic Tac Toe';
    } else if (section === 'admin' && isAdmin) {
        adminSection.style.display = 'block';
        document.getElementById('content-title').textContent = 'Admin Dashboard';
        refreshPlayersTable();
    }
}

function updatePlayerStats() {
    if (!currentPlayer) return;
    
    document.getElementById('player-avatar').textContent = currentPlayer.username.charAt(0).toUpperCase();
    document.getElementById('player-name').textContent = currentPlayer.username;
    document.getElementById('player-coins').textContent = currentPlayer.coins;
    document.getElementById('player-wins').textContent = currentPlayer.wins;
    document.getElementById('stat-coins').textContent = currentPlayer.coins;
    document.getElementById('stat-wins').textContent = currentPlayer.wins;
}

// Admin Functions
function refreshPlayersTable(filter = "") {
    playersTable.innerHTML = "";
    
    const players = filter 
        ? database.players.filter(p => 
            p.username.toLowerCase().includes(filter.toLowerCase()) && 
            !p.isAdmin
          ) 
        : database.players.filter(p => !p.isAdmin);
    
    players.forEach(player => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${player.username}</td>
            <td>${player.coins}</td>
            <td>${player.wins}</td>
            <td>
                <button class="btn btn-primary btn-sm" onclick="selectPlayer('${player.username}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
            </td>
        `;
        playersTable.appendChild(row);
    });
}

function selectPlayer(username) {
    selectedPlayer = database.players.find(p => p.username === username);
    document.getElementById('edit-username').value = selectedPlayer.username;
    document.getElementById('edit-coins').value = selectedPlayer.coins;
}

function updatePlayer() {
    if (!selectedPlayer) {
        alert("Please select a player first");
        return;
    }
    
    const newCoins = parseInt(document.getElementById('edit-coins').value);
    if (isNaN(newCoins)) {
        alert("Please enter a valid number for coins");
        return;
    }
    
    selectedPlayer.coins = newCoins;
    saveDatabase();
    refreshPlayersTable();
    alert("Player updated successfully");
    
    // Update current player stats if editing self
    if (currentPlayer.username === selectedPlayer.username) {
        currentPlayer.coins = newCoins;
        updatePlayerStats();
    }
}

function deletePlayer() {
    if (!selectedPlayer || selectedPlayer.isAdmin) {
        alert("Cannot delete admin or no player selected");
        return;
    }
    
    if (confirm(`Are you sure you want to delete ${selectedPlayer.username}? This cannot be undone.`)) {
        database.players = database.players.filter(p => p.username !== selectedPlayer.username);
        saveDatabase();
        selectedPlayer = null;
        document.getElementById('edit-username').value = "";
        document.getElementById('edit-coins').value = "";
        refreshPlayersTable();
    }
}

function searchPlayer() {
    const searchTerm = document.getElementById('search-player').value;
    refreshPlayersTable(searchTerm);
}

function resetSearch() {
    document.getElementById('search-player').value = "";
    refreshPlayersTable();
}

// Game Functions
function renderBoard() {
    boardElement.innerHTML = "";
    
    board.forEach((cell, index) => {
        const cellElement = document.createElement('div');
        cellElement.className = `cell ${cell || ''}`;
        cellElement.textContent = cell;
        
        if (!cell && !gameOver) {
            cellElement.addEventListener('click', () => makeMove(index));
        }
        
        boardElement.appendChild(cellElement);
    });
}

function makeMove(index) {
    if (board[index] || gameOver || !currentPlayer) return;
    
    board[index] = "X";
    if (checkWin("X")) {
        statusElement.textContent = "You win!";
        currentPlayer.wins++;
        currentPlayer.coins += 5;
        gameOver = true;
        saveDatabase();
    } else if (board.every(cell => cell)) {
        statusElement.textContent = "It's a tie!";
        gameOver = true;
    } else {
        statusElement.textContent = "Computer's turn";
        setTimeout(computerMove, 500);
    }
    
    renderBoard();
}

function computerMove() {
    const emptyCells = board.map((cell, index) => cell === "" ? index : null).filter(val => val !== null);
    if (emptyCells.length === 0) return;
    
    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    board[emptyCells[randomIndex]] = "O";
    
    if (checkWin("O")) {
        statusElement.textContent = "Computer wins!";
        gameOver = true;
    } else if (board.every(cell => cell)) {
        statusElement.textContent = "It's a tie!";
        gameOver = true;
    } else {
        statusElement.textContent = "Your turn";
    }
    
    renderBoard();
}

function checkWin(player) {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6]             // diagonals
    ];
    
    return winPatterns.some(pattern => 
        pattern.every(index => board[index] === player)
    );
}

function resetGame() {
    board = Array(9).fill("");
    gameOver = false;
    statusElement.textContent = "Player X's turn";
    renderBoard();
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Make selectPlayer globally available
window.selectPlayer = selectPlayer;