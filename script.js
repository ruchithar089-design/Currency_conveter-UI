const amountInput = document.getElementById('amount');
const fromCurrency = document.getElementById('from-currency');
const toCurrency = document.getElementById('to-currency');
const resultText = document.getElementById('result-text');
const rateInfo = document.getElementById('rate-info');
const convertBtn = document.getElementById('convert-btn');
const swapBtn = document.getElementById('swap-btn');

// Cache to prevent redundant API calls and handle rapid typing
const exchangeRateCache = {};

async function fetchRates(baseCurrency) {
    // If we already fetched (or are currently fetching) this currency, return the cached Promise
    if (exchangeRateCache[baseCurrency]) {
        return await exchangeRateCache[baseCurrency];
    }
    
    const fetchPromise = fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`)
        .then(res => res.json())
        .catch(err => {
            delete exchangeRateCache[baseCurrency]; // Clear cache on error
            throw err;
        });
        
    exchangeRateCache[baseCurrency] = fetchPromise;
    return fetchPromise;
}

// Store recent conversions
const recentConversionsContainer = document.getElementById('recent-conversions');
let recentConversions = [];

async function calculate(saveToHistory = false) {
    const amount = parseFloat(amountInput.value);
    const from = fromCurrency.value;
    const to = toCurrency.value;

    if (isNaN(amount) || amount < 0) {
        resultText.innerText = "0.00";
        rateInfo.innerHTML = '<i class="fas fa-exclamation-circle"></i> Please enter a valid amount';
        return;
    }

    try {
        resultText.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        rateInfo.innerText = "Fetching live rates...";

        const data = await fetchRates(from);
        
        const rate = data.rates[to];
        const convertedAmount = amount * rate;
        
        // Format currencies beautifully based on locale and currency type
        const formatterFrom = new Intl.NumberFormat('en-US', { style: 'currency', currency: from });
        const formatterTo = new Intl.NumberFormat('en-US', { style: 'currency', currency: to });
        
        resultText.innerText = `${formatterFrom.format(amount)} = ${formatterTo.format(convertedAmount)}`;
        rateInfo.innerHTML = `<i class="fas fa-info-circle"></i> 1 ${from} = ${formatterTo.format(rate)} (Updated: ${data.date})`;

        // Save to History when explicitly requested
        if (saveToHistory) {
            recentConversions.unshift({
                amount, from, to, convertedAmount,
                date: new Date().toLocaleTimeString()
            });
            
            if (recentConversions.length > 6) {
                recentConversions.pop();
            }
            
            if (recentConversionsContainer) {
                recentConversionsContainer.innerHTML = '';
                recentConversions.forEach(conv => {
                    const fFrom = new Intl.NumberFormat('en-US', { style: 'currency', currency: conv.from }).format(conv.amount);
                    const fTo = new Intl.NumberFormat('en-US', { style: 'currency', currency: conv.to }).format(conv.convertedAmount);
                    
                    recentConversionsContainer.innerHTML += `
                        <div class="work-card">
                            <div class="icon-3d stock-icon"><i class="fas fa-exchange-alt"></i></div>
                            <h3>${conv.from} <i class="fas fa-arrow-right" style="font-size:14px;color:#999;margin:0 5px;"></i> ${conv.to}</h3>
                            <p style="font-size: 16px; margin-top: 5px; color: #5c4033;">${fFrom} = <strong style="color: #3a2a2a;">${fTo}</strong></p>
                            <p style="font-size: 12px; color: #999; margin-top: 15px;">${conv.date}</p>
                        </div>
                    `;
                });
            }
        }
    } catch (error) {
        resultText.innerText = "Error";
        rateInfo.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Failed to fetch exchange rates. Try again later.';
        console.error(error);
    }
}

// Interactive event listeners
amountInput.addEventListener('input', () => calculate(false));
fromCurrency.addEventListener('change', () => calculate(false));
toCurrency.addEventListener('change', () => calculate(false));
convertBtn.addEventListener('click', () => calculate(true));

swapBtn.addEventListener('click', () => {
    swapBtn.classList.add('spin-anim');
    setTimeout(() => swapBtn.classList.remove('spin-anim'), 400);

    const temp = fromCurrency.value;
    fromCurrency.value = toCurrency.value;
    toCurrency.value = temp;
    calculate(false);
});

// Calculate on initial load
calculate(false);

// Auth Logic
const authPage = document.getElementById('auth-page');
const mainContent = document.getElementById('main-content');
const loginForm = document.getElementById('login-form');
const loginNavBtn = document.getElementById('login-nav-btn');
const learnMoreBtn = document.getElementById('learn-more-btn');

let isAuthenticated = false;

function handleAuthSuccess(e) {
    e.preventDefault();
    isAuthenticated = true;
    authPage.style.display = 'none';
    mainContent.style.display = 'block';
    loginNavBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
}

loginForm.addEventListener('submit', handleAuthSuccess);

learnMoreBtn.addEventListener('click', (e) => {
    e.preventDefault();
    authPage.style.display = 'none';
    mainContent.style.display = 'block';
    const allSections = document.querySelectorAll('.section');
    allSections.forEach(sec => sec.classList.remove('active'));
    document.getElementById('home').classList.add('active');
});

loginNavBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (isAuthenticated) {
        isAuthenticated = false;
        loginNavBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
        authPage.style.display = 'flex';
        mainContent.style.display = 'none';
    } else {
        authPage.style.display = 'flex';
        mainContent.style.display = 'none';
    }
});

// SPA Section Navigation (Tab Switching)
const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
const sections = document.querySelectorAll('.section');

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        
        sections.forEach(sec => sec.classList.remove('active'));
        const targetSection = document.getElementById(targetId);
        if (targetSection) targetSection.classList.add('active');
    });
});