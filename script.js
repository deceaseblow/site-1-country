const mainPage = document.getElementById('main-page');
const detailsPage = document.getElementById('details-page');
const countriesContainer = document.getElementById('countries-container');
const randomCountryContainer = document.getElementById('random-country');
const countryDetailContainer = document.getElementById('country-detail-container');
const regionLinks = document.querySelectorAll('.region-link');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const lookBtn = document.getElementById('look-btn');
const showMoreBtn = document.getElementById('show-more-btn');
const backToHomeBtn = document.getElementById('back-to-home');

let allCountries = [];
let filteredCountries = [];
let displayedCount = 20;
let currentlyDisplayedCountries = [];

// Country to exclude
const EXCLUDED_COUNTRY = "Armenia";

// Function to filter out Armenia
function filterExcludedCountry(countries) {
    return countries.filter(country => country.name !== EXCLUDED_COUNTRY);
}

// Check if URL contains a country code
function checkForCountryInURL() {
    const path = window.location.pathname;
    if (path.includes('/details/')) {
        const countryCode = path.split('/details/')[1];
        if (countryCode) {
            // Once countries are loaded, show the details page
            const checkInterval = setInterval(() => {
                if (allCountries.length > 0) {
                    clearInterval(checkInterval);
                    const country = allCountries.find(c => c.alpha3Code === countryCode);
                    if (country && country.name !== EXCLUDED_COUNTRY) {
                        showDetailsPage(country);
                    } else {
                        // Redirect to home if trying to access excluded country
                        history.pushState({}, '', '/');
                        detailsPage.classList.add('hidden');
                        mainPage.classList.remove('hidden');
                    }
                }
            }, 100);
        }
    }
}

// Fetch countries data
fetch("https://raw.githubusercontent.com/TheOksigen/purfect_data/refs/heads/main/country.json")
    .then(response => response.json())
    .then(data => {
        // Filter out Armenia from all countries data
        allCountries = filterExcludedCountry(data);
        filteredCountries = [...allCountries];
        displayRandomCountry();
        displayCountries(filteredCountries.slice(0, displayedCount));
        currentlyDisplayedCountries = filteredCountries.slice(0, displayedCount);
        checkForCountryInURL();
    })
    .catch(error => console.error("Error fetching data:", error));

// Display countries function
function displayCountries(countries, append = false) {
    if (countries.length === 0 && !append) {
        countriesContainer.innerHTML = '<p class="text-center w-full text-gray-500 text-lg">No countries found matching your search.</p>';
        return;
    }
    
    // If it's a fresh display (not adding more), clear the container
    if (!append) {
        countriesContainer.innerHTML = '';
        currentlyDisplayedCountries = [];
    }
    
    countries.forEach(country => {
        // Skip Armenia
        if (country.name === EXCLUDED_COUNTRY) {
            return;
        }
        
        // Skip if country is already displayed
        if (currentlyDisplayedCountries.some(c => c.alpha3Code === country.alpha3Code)) {
            return;
        }
        
        currentlyDisplayedCountries.push(country);
        
        const countryCard = document.createElement('div');
        countryCard.className = 'bg-white rounded-lg overflow-hidden w-72 shadow-md hover:shadow-lg transition duration-300 cursor-pointer';
        countryCard.dataset.alpha3Code = country.alpha3Code || '';
        
        countryCard.innerHTML = `
            <div class="h-60 flex justify-center items-center overflow-hidden">
                <img src="${country.flags.png}" alt="${country.name} flag" class="w-full h-full object-cover">
            </div>
            <div class="p-4">
                <p class="text-xs font-semibold text-gray-500 mb-1 uppercase">${country.region || 'Unknown Region'}</p>
                <h3 class="text-lg font-semibold m-0 mb-1">${country.name}, <span class="italic font-normal">${country.capital || 'No Capital'}</span></h3>
                <div class="flex justify-between mt-3 text-sm">
                    <p>Population: ${country.population.toLocaleString()}</p>
                    <p>${country.area ? country.area.toLocaleString() + ' km²' : 'Area Unknown'}</p>
                </div>
            </div>
        `;
        
        // Add click event to navigate to detail page
        countryCard.addEventListener('click', () => {
            showDetailsPage(country);
            updateURL(country.alpha3Code);
        });
        
        countriesContainer.appendChild(countryCard);
    });
}

// Display a random country
function displayRandomCountry() {
    if (allCountries.length === 0) return;
    
    // Make sure not to pick Armenia
    let randomCountry;
    do {
        const randomIndex = Math.floor(Math.random() * allCountries.length);
        randomCountry = allCountries[randomIndex];
    } while (randomCountry.name === EXCLUDED_COUNTRY);
    
    randomCountryContainer.innerHTML = '';
    
    const countryCard = document.createElement('div');
    countryCard.className = 'bg-white rounded-lg overflow-hidden w-80 shadow-lg transform hover:scale-105 transition duration-300 cursor-pointer';
    countryCard.dataset.alpha3Code = randomCountry.alpha3Code || '';
    
    countryCard.innerHTML = `
        <div class="h-64 flex items-center overflow-hidden">
            <img src="${randomCountry.flags.png}" alt="${randomCountry.name} flag" class="w-full h-full object-cover">
        </div>
        <div class="p-4">
            <p class="text-xs font-semibold text-purple-600 mb-1 uppercase">Featured Country</p>
            <h3 class="text-xl font-bold m-0 mb-1">${randomCountry.name}</h3>
            <p class="italic text-gray-600 mb-2">${randomCountry.capital || 'No Capital'}</p>
            <div class="flex justify-between mt-3 text-sm">
                <p>Population: ${randomCountry.population.toLocaleString()}</p>
                <p>${randomCountry.area ? randomCountry.area.toLocaleString() + ' km²' : 'Area Unknown'}</p>
            </div>
        </div>
    `;
    
    // Add click event to navigate to detail page
    countryCard.addEventListener('click', () => {
        showDetailsPage(randomCountry);
        updateURL(randomCountry.alpha3Code);
    });
    
    randomCountryContainer.appendChild(countryCard);
}

// Show details page
function showDetailsPage(country) {
    // Don't show details for Armenia
    if (country.name === EXCLUDED_COUNTRY) {
        return;
    }
    
    mainPage.classList.add('hidden');
    detailsPage.classList.remove('hidden');
    
    countryDetailContainer.innerHTML = `
        <div class="bg-white rounded-lg shadow-lg overflow-hidden">
    <div class="flex">
        <div class="w-1/2">
            <div class="h-80 overflow-hidden">
                <img src="${country.flags.png}" alt="${country.name} flag" class="w-full h-full object-cover">
            </div>
        </div>
        <div class="w-1/2 p-8">
            <h1 class="text-4xl font-bold mb-4">${country.name}</h1>
            
            <a href="#" class="text-purple-600 hover:text-purple-800 mb-4 inline-block">${country.region || 'Unknown'}</a>
            
            <ul class="space-y-3 text-lg">
                <li><strong>Capital:</strong> ${country.capital || 'No Capital'}</li>
                <li><strong>Area:</strong> ${country.area ? country.area.toLocaleString() + ' km²' : 'Unknown'}</li>
                <li><strong>Population:</strong> ${country.population.toLocaleString()}</li>
            </ul>
        </div>
    </div>
</div>
    `;
}

// Update URL without reloading the page
function updateURL(countryCode) {
    if (countryCode) {
        const country = allCountries.find(c => c.alpha3Code === countryCode);
        if (country && country.name !== EXCLUDED_COUNTRY) {
            history.pushState({}, '', `/details/${countryCode}`);
        }
    }
}

// Back to home button
backToHomeBtn.addEventListener('click', function(e) {
    e.preventDefault();
    detailsPage.classList.add('hidden');
    mainPage.classList.remove('hidden');
    history.pushState({}, '', '/');
});

// Region filter event listeners
regionLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        
        regionLinks.forEach(link => link.classList.remove('text-purple-600'));
        this.classList.add('text-purple-600');
        
        const region = this.getAttribute('data-region');
        
        if (region === 'all') {
            filteredCountries = [...allCountries];
        } else {
            filteredCountries = allCountries.filter(country => 
                (country.region === region || 
                (region === 'Antarctic' && country.region === 'Polar')) && 
                country.name !== EXCLUDED_COUNTRY
            );
        }
        
        displayedCount = 20;
        displayCountries(filteredCountries.slice(0, displayedCount), false);
        updateShowMoreButton();
    });
});

// Search functionality
searchBtn.addEventListener('click', function() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    
    if (searchTerm) {
        filteredCountries = allCountries.filter(country => 
            (country.name.toLowerCase().includes(searchTerm) || 
            (country.capital && country.capital.toLowerCase().includes(searchTerm))) &&
            country.name !== EXCLUDED_COUNTRY
        );
    } else {
        filteredCountries = [...allCountries];
    }
    
    displayedCount = 20;
    displayCountries(filteredCountries.slice(0, displayedCount), false);
    updateShowMoreButton();
});

// Reset view
lookBtn.addEventListener('click', function() {
    searchInput.value = '';
    regionLinks.forEach(link => link.classList.remove('text-purple-600'));
    filteredCountries = [...allCountries];
    displayedCount = 20;
    displayCountries(filteredCountries.slice(0, displayedCount), false);
    updateShowMoreButton();
});

// Search on Enter key
searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchBtn.click();
    }
});

// Update show more button status
function updateShowMoreButton() {
    if (displayedCount >= filteredCountries.length) {
        showMoreBtn.textContent = 'No More Countries';
        showMoreBtn.disabled = true;
        showMoreBtn.classList.add('bg-gray-400');
        showMoreBtn.classList.remove('bg-purple-600', 'hover:bg-purple-700');
    } else {
        showMoreBtn.textContent = 'Show More';
        showMoreBtn.disabled = false;
        showMoreBtn.classList.remove('bg-gray-400');
        showMoreBtn.classList.add('bg-purple-600', 'hover:bg-purple-700');
    }
}

// Show more button functionality
showMoreBtn.addEventListener('click', function() {
    if (displayedCount >= filteredCountries.length) {
        updateShowMoreButton();
        return;
    }
    
    // Get the next batch of countries
    const nextBatch = filteredCountries.slice(displayedCount, displayedCount + 20)
        .filter(country => country.name !== EXCLUDED_COUNTRY);
    displayedCount += 20;
    
    // Append the new countries to the existing list
    displayCountries(nextBatch, true);
    
    // Update button status
    updateShowMoreButton();
    
    // Scroll to newly loaded countries
    if (nextBatch.length > 0) {
        const lastElement = countriesContainer.lastElementChild;
        if (lastElement) {
            lastElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
});

// Handle browser back/forward navigation
window.addEventListener('popstate', function() {
    if (window.location.pathname === '/' || window.location.pathname === '') {
        detailsPage.classList.add('hidden');
        mainPage.classList.remove('hidden');
    } else if (window.location.pathname.includes('/details/')) {
        const countryCode = window.location.pathname.split('/details/')[1];
        const country = allCountries.find(c => c.alpha3Code === countryCode);
        if (country && country.name !== EXCLUDED_COUNTRY) {
            showDetailsPage(country);
        } else {
            // Redirect to home if trying to access excluded country
            history.pushState({}, '', '/');
            detailsPage.classList.add('hidden');
            mainPage.classList.remove('hidden');
        }
    }
});

// Reset view and scroll to countries section
lookBtn.addEventListener('click', function() {
    searchInput.value = '';
    regionLinks.forEach(link => link.classList.remove('text-purple-600'));
    filteredCountries = [...allCountries];
    displayedCount = 20;
    displayCountries(filteredCountries.slice(0, displayedCount), false);
    updateShowMoreButton();
    
    // Add this to scroll to the countries container
    countriesContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
});