document.addEventListener('DOMContentLoaded', function() {
    const MAX_SEARCH_HISTORY = 100;

    // DOM elements
    const elements = {
        searchInput: document.getElementById('searchInput'),
        searchButton: document.getElementById('searchButton'),
        engineOptions: document.querySelectorAll('.engine-option'),
        colorOptions: document.querySelectorAll('.color-option'),
        body: document.body,
        searchHistory: document.getElementById('searchHistory'),
        historyToggle: document.getElementById('history-toggle'),
        visibilityToggle: document.getElementById('visibility-toggle'),
    };

    // Search engine data
    const engineData = {
        google: { homepage: 'https://www.google.com', searchUrl: 'https://www.google.com/search?q=' },
        baidu: { homepage: 'https://www.baidu.com', searchUrl: 'https://www.baidu.com/s?wd=' },
        bing: { homepage: 'https://www.bing.com', searchUrl: 'https://www.bing.com/search?q=' },
        duckduckgo: { homepage: 'https://duckduckgo.com', searchUrl: 'https://duckduckgo.com/?q=' },
        perplexity: { homepage: 'https://www.perplexity.ai', searchUrl: 'https://www.perplexity.ai/?q=' },
        metaso: { homepage: 'https://metaso.cn', searchUrl: 'https://metaso.cn/?q=' }
    };

    // Theme colors
    const themeColors = {
        default: { light: 'rgba(224, 224, 224, 0.2)', dark: '#e0e0e0' },
        light: { light: 'rgba(97, 97, 97, 0.2)', dark: '#616161' },
        blue: { light: 'rgba(13, 71, 161, 0.2)', dark: '#0D47A1' },
        green: { light: 'rgba(27, 94, 32, 0.2)', dark: '#1B5E20' },
        purple: { light: 'rgba(74, 20, 140, 0.2)', dark: '#4A148C' },
        orange: { light: 'rgba(191, 54, 12, 0.2)', dark: '#BF360C' },
        pink: { light: 'rgba(136, 14, 79, 0.2)', dark: '#880E4F' },
        teal: { light: 'rgba(0, 77, 64, 0.2)', dark: '#004D40' }
    };

    let searchHistoryArray = JSON.parse(localStorage.getItem('searchHistory')) || [];
    let isHistoryEnabled = localStorage.getItem('historyEnabled') !== 'false';
    let selectedEngine = localStorage.getItem('selectedEngine') || 'google';
    let isVisible = localStorage.getItem('isVisible') !== 'false';

    // Event listeners
    elements.searchButton.addEventListener('click', performSearch);
    elements.searchInput.addEventListener('keypress', e => e.key === 'Enter' && performSearch());
    elements.historyToggle.addEventListener('click', toggleHistory);
    elements.visibilityToggle.addEventListener('click', toggleVisibility);

    // Setup functions
    function setupEngineOptions() {
        elements.engineOptions.forEach(option => {
            const radio = option.querySelector('input[type="radio"]');
            const label = option.querySelector('.engine-label');
            
            radio.checked = radio.value === selectedEngine;

            label.addEventListener('click', e => {
                e.preventDefault();
                radio.checked = true;
                selectedEngine = radio.value;
                localStorage.setItem('selectedEngine', selectedEngine);
            });
            
            label.addEventListener('dblclick', () => {
                const engineValue = radio.value;
                engineData[engineValue] && (window.location.href = engineData[engineValue].homepage);
            });
        });
    }

    function setupFavoriteOptions() {
        document.querySelectorAll('.favorite-option').forEach(option => {
            option.querySelector('.favorite-label').addEventListener('click', e => {
                e.preventDefault();
                window.location.href = option.href;
            });
        });
    }

    // Search function
    function performSearch() {
        const query = elements.searchInput.value.trim();
        if (query) {
            addToSearchHistory(query);
            const selectedEngine = Array.from(elements.engineOptions).find(option => option.querySelector('input[type="radio"]').checked);
            if (selectedEngine) {
                const engineValue = selectedEngine.querySelector('input[type="radio"]').value;
                const searchUrl = engineData[engineValue]?.searchUrl;
                searchUrl && (window.location.href = searchUrl + query);
            } else {
                alert('Please select a search engine.');
            }
        }
    }

    // Theme functions
    function updateThemeColors(color) {
        const root = document.documentElement;
        root.style.setProperty('--theme-color-light', themeColors[color].light);
        root.style.setProperty('--theme-color-dark', themeColors[color].dark);
    }

    function initTheme() {
        const savedTheme = localStorage.getItem('selectedTheme');
        if (savedTheme) {
            savedTheme !== 'default' && elements.body.classList.add(`theme-${savedTheme}`);
            updateThemeColors(savedTheme);
        }
    }

    // History functions
    function toggleHistory() {
        isHistoryEnabled = !isHistoryEnabled;
        localStorage.setItem('historyEnabled', isHistoryEnabled);
        updateHistoryToggleIcon();

        if (!isHistoryEnabled) {
            searchHistoryArray = [];
            localStorage.removeItem('searchHistory');
            elements.searchHistory.innerHTML = '';
            elements.searchHistory.classList.remove('active');
        }
    }

    function updateHistoryToggleIcon() {
        const historyEnabledIcon = elements.historyToggle.querySelector('.history-enabled-icon');
        const historyDisabledIcon = elements.historyToggle.querySelector('.history-disabled-icon');

        historyEnabledIcon.hidden = !isHistoryEnabled;
        historyDisabledIcon.hidden  = isHistoryEnabled;
        
        elements.historyToggle.setAttribute('data-tooltip', isHistoryEnabled ? 'Disable Search History' : 'Enable Search History');
    }

    function addToSearchHistory(query) {
        if (!isHistoryEnabled) return;

        const index = searchHistoryArray.indexOf(query);
        if (index !== -1) searchHistoryArray.splice(index, 1);
        searchHistoryArray.unshift(query);
        if (searchHistoryArray.length > MAX_SEARCH_HISTORY) searchHistoryArray.pop();
        localStorage.setItem('searchHistory', JSON.stringify(searchHistoryArray));
    }

    function displaySearchHistory() {
        elements.searchHistory.innerHTML = '';
        searchHistoryArray.forEach((query, index) => {
            const item = createHistoryItem(query, index);
            elements.searchHistory.insertBefore(item, elements.searchHistory.firstChild);
        });

        elements.searchHistory.scrollTop = elements.searchHistory.scrollHeight;
    }

    function createHistoryItem(query, index) {
        const item = document.createElement('div');
        item.className = 'search-history-item';
        item.innerHTML = `
            <img src="svgs/history.svg" alt="History" class="search-history-icon">
            <span class="search-history-text">${query}</span>
            <button class="delete-history-item" data-index="${index}">
                <img src="svgs/delete.svg" alt="Delete" class="delete-icon">
            </button>
        `;
        item.querySelector('.search-history-text').addEventListener('click', () => {
            elements.searchInput.value = query;
            performSearch();
        });
        item.querySelector('.delete-history-item').addEventListener('click', e => {
            e.stopPropagation();
            e.preventDefault();
            deleteHistoryItem(index);
        });
        return item;
    }

    function deleteHistoryItem(index) {
        searchHistoryArray.splice(index, 1);
        localStorage.setItem('searchHistory', JSON.stringify(searchHistoryArray));
        displaySearchHistory();
        elements.searchHistory.classList.toggle('active', searchHistoryArray.length > 0);
    }

    // Setup color options
    elements.colorOptions.forEach(option => {
        option.addEventListener('click', function() {
            const color = this.getAttribute('data-color');
            elements.body.className = color !== 'default' ? `theme-${color}` : '';
            updateThemeColors(color);
            localStorage.setItem('selectedTheme', color);
        });
    });

    // Search input event listeners
    elements.searchInput.addEventListener('focus', () => {
        if (searchHistoryArray.length > 0) {
            displaySearchHistory();
            requestAnimationFrame(() => elements.searchHistory.classList.add('active'));
        }
    });

    elements.searchInput.addEventListener('input', () => {
        const query = elements.searchInput.value.trim().toLowerCase();
        if (query === '') {
            if (isHistoryEnabled && searchHistoryArray.length > 0) {
                displaySearchHistory();
                requestAnimationFrame(() => elements.searchHistory.classList.add('active'));
            } else {
                elements.searchHistory.classList.remove('active');
            }
        } else {
            const filteredHistory = searchHistoryArray.filter(item => item.toLowerCase().includes(query));
            displayFilteredHistory(filteredHistory);
        }
    });

    function displayFilteredHistory(filteredHistory) {
        elements.searchHistory.innerHTML = '';
        filteredHistory.forEach((query, index) => {
            const item = createHistoryItem(query, index);
            elements.searchHistory.insertBefore(item, elements.searchHistory.firstChild);
        });

        elements.searchHistory.classList.toggle('active', filteredHistory.length > 0);
        if (filteredHistory.length > 0) {
            elements.searchHistory.scrollTop = elements.searchHistory.scrollHeight;
        }
    }

    // Initialize
    setupEngineOptions();
    initTheme();
    setupFavoriteOptions();
    displaySearchHistory();
    updateHistoryToggleIcon();
    initVisibility();

    // Global click event listener
    document.addEventListener('click', e => {
        if (!elements.searchHistory.contains(e.target) && e.target !== elements.searchInput) {
            elements.searchHistory.classList.remove('active');
        }
    });

    function toggleVisibility() {
        isVisible = !isVisible;
        localStorage.setItem('isVisible', isVisible);
        updateVisibilityToggleIcon();
        document.body.setAttribute('data-visibility', isVisible ? 'visible' : 'hidden');
    }

    function updateVisibilityToggleIcon() {
        const visibilityEnabledIcon = elements.visibilityToggle.querySelector('.visibility-enabled-icon');
        const visibilityDisabledIcon = elements.visibilityToggle.querySelector('.visibility-disabled-icon');

        visibilityEnabledIcon.hidden = !isVisible;
        visibilityDisabledIcon.hidden = isVisible;
        
        elements.visibilityToggle.setAttribute('data-tooltip', isVisible ? 'Hide bottom bar' : 'Show bottom bar');
    }

    function initVisibility() {
        updateVisibilityToggleIcon();
        document.body.setAttribute('data-visibility', isVisible ? 'visible' : 'hidden');
    }
});
