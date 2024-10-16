document.addEventListener('DOMContentLoaded', function() {
    const MAX_SEARCH_HISTORY = 20;
    const DISPLAY_SEARCH_HISTORY_COUNT = 5;

    // DOM elements
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const engineOptions = document.querySelectorAll('.engine-option');
    const colorOptions = document.querySelectorAll('.color-option');
    const body = document.body;
    const searchHistory = document.getElementById('searchHistory');
    const historyToggle = document.getElementById('history-toggle');
    const visibilityToggle = document.getElementById('visibility-toggle');
    const favorites = document.getElementById('favorites');
    const settings = document.getElementById('settings');

    // Search engine data
    const engineData = {
        'google': { homepage: 'https://www.google.com', searchUrl: 'https://www.google.com/search?q=' },
        'baidu': { homepage: 'https://www.baidu.com', searchUrl: 'https://www.baidu.com/s?wd=' },
        'bing': { homepage: 'https://www.bing.com', searchUrl: 'https://www.bing.com/search?q=' },
        'duckduckgo': { homepage: 'https://duckduckgo.com', searchUrl: 'https://duckduckgo.com/?q=' },
        'perplexity': { homepage: 'https://www.perplexity.ai', searchUrl: 'https://www.perplexity.ai/?q=' },
        'metaso': { homepage: 'https://metaso.cn', searchUrl: 'https://metaso.cn/?q=' }
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
    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', e => e.key === 'Enter' && performSearch());
    historyToggle.addEventListener('click', toggleHistory);
    visibilityToggle.addEventListener('click', toggleVisibility);

    // Setup functions
    function setupEngineOptions() {
        engineOptions.forEach(option => {
            const radio = option.querySelector('input[type="radio"]');
            const label = option.querySelector('.engine-label');
            
            if (radio.value === selectedEngine) {
                radio.checked = true;
            }
            
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
        const query = searchInput.value.trim();
        if (query) {
            addToSearchHistory(query);
            const selectedEngine = Array.from(engineOptions).find(option => option.querySelector('input[type="radio"]').checked);
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
            savedTheme !== 'default' && body.classList.add(`theme-${savedTheme}`);
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
            searchHistory.innerHTML = '';
            searchHistory.classList.remove('active');
        }
    }

    function updateHistoryToggleIcon() {
        const historyEnabledIcon = historyToggle.querySelector('.history-enabled-icon');
        const historyDisabledIcon = historyToggle.querySelector('.history-disabled-icon');

        console.log(historyEnabledIcon.hidden, historyDisabledIcon.hidden)

        historyEnabledIcon.hidden = !isHistoryEnabled;
        historyDisabledIcon.hidden  = isHistoryEnabled;
        
        historyToggle.setAttribute('data-tooltip', isHistoryEnabled ? 'Disable Search History' : 'Enable Search History');
    }

    function addToSearchHistory(query) {
        if (!isHistoryEnabled) return;

        const index = searchHistoryArray.indexOf(query);
        index !== -1 && searchHistoryArray.splice(index, 1);
        searchHistoryArray.unshift(query);
        searchHistoryArray.length > MAX_SEARCH_HISTORY && searchHistoryArray.pop();
        localStorage.setItem('searchHistory', JSON.stringify(searchHistoryArray));
    }

    function displaySearchHistory() {
        searchHistory.innerHTML = '';
        searchHistoryArray.slice(0, DISPLAY_SEARCH_HISTORY_COUNT).forEach((query, index) => {
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
                searchInput.value = query;
                performSearch();
            });
            item.querySelector('.delete-history-item').addEventListener('click', e => {
                e.stopPropagation();
                e.preventDefault();
                deleteHistoryItem(index);
            });
            searchHistory.insertBefore(item, searchHistory.firstChild);
        });
    }

    function deleteHistoryItem(index) {
        searchHistoryArray.splice(index, 1);
        localStorage.setItem('searchHistory', JSON.stringify(searchHistoryArray));
        displaySearchHistory();
        searchHistoryArray.length > 0 ? searchHistory.classList.add('active') : searchHistory.classList.remove('active');
    }

    // Setup color options
    colorOptions.forEach(option => {
        option.addEventListener('click', function() {
            const color = this.getAttribute('data-color');
            body.className = color !== 'default' ? `theme-${color}` : '';
            updateThemeColors(color);
            localStorage.setItem('selectedTheme', color);
        });
    });

    // Search input event listeners
    searchInput.addEventListener('focus', () => {
        if (searchHistoryArray.length > 0) {
            displaySearchHistory();
            requestAnimationFrame(() => searchHistory.classList.add('active'));
        }
    });

    searchInput.addEventListener('input', () => {
        if (searchInput.value.trim() === '') {
            if (isHistoryEnabled && searchHistoryArray.length > 0) {
                displaySearchHistory();
                requestAnimationFrame(() => searchHistory.classList.add('active'));
            } else {
                searchHistory.classList.remove('active');
            }
        } else {
            searchHistory.classList.remove('active');
        }
    });

    // Initialize
    setupEngineOptions();
    initTheme();
    setupFavoriteOptions();
    displaySearchHistory();
    updateHistoryToggleIcon();
    initVisibility();

    // Global click event listener
    document.addEventListener('click', e => {
        if (!searchHistory.contains(e.target) && e.target !== searchInput) {
            searchHistory.classList.remove('active');
        }
    });

    function toggleVisibility() {
        isVisible = !isVisible;
        localStorage.setItem('isVisible', isVisible);
        updateVisibilityToggleIcon();
        document.body.setAttribute('data-visibility', isVisible ? 'visible' : 'hidden');
    }

    function updateVisibilityToggleIcon() {
        const visibilityEnabledIcon = visibilityToggle.querySelector('.visibility-enabled-icon');
        const visibilityDisabledIcon = visibilityToggle.querySelector('.visibility-disabled-icon');

        visibilityEnabledIcon.hidden = !isVisible;
        visibilityDisabledIcon.hidden = isVisible;
        
        visibilityToggle.setAttribute('data-tooltip', isVisible ? 'Hide bottom bar' : 'Show bottom bar');
    }

    function initVisibility() {
        updateVisibilityToggleIcon();
        document.body.setAttribute('data-visibility', isVisible ? 'visible' : 'hidden');
    }
});
