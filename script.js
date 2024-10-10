document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const engineOptions = document.querySelectorAll('.engine-option');
    // const colorPalette = document.getElementById('color-palette');
    // const colorPicker = document.getElementById('color-picker');
    const colorOptions = document.querySelectorAll('.color-option');
    const body = document.body;

    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    const engineData = {
        'google': { homepage: 'https://www.google.com', searchUrl: 'https://www.google.com/search?q=' },
        'baidu': { homepage: 'https://www.baidu.com', searchUrl: 'https://www.baidu.com/s?wd=' },
        'bing': { homepage: 'https://www.bing.com', searchUrl: 'https://www.bing.com/search?q=' },
        'duckduckgo': { homepage: 'https://duckduckgo.com', searchUrl: 'https://duckduckgo.com/?q=' },
        'perplexity': { homepage: 'https://www.perplexity.ai', searchUrl: 'https://www.perplexity.ai/?q=' },
        'metaso': { homepage: 'https://metaso.cn', searchUrl: 'https://metaso.cn/?q=' }
    };

    function setupEngineOptions() {
        engineOptions.forEach(option => {
            const radio = option.querySelector('input[type="radio"]');
            const label = option.querySelector('.engine-label');
            
            label.addEventListener('click', (e) => {
                e.preventDefault();
                radio.checked = true;
            });
            
            label.addEventListener('dblclick', () => {
                const engineValue = radio.value;
                if (engineData[engineValue]) {
                    window.location.href = engineData[engineValue].homepage;
                }
            });
        });
    }

    function setupFavoriteOptions() {
        const favoriteOptions = document.querySelectorAll('.favorite-option');
        favoriteOptions.forEach(option => {
            const label = option.querySelector('.favorite-label');
            
            label.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = option.href;
            });
        });
    }

    function performSearch() {
        const query = encodeURIComponent(searchInput.value.trim());
        if (query) {
            const selectedEngine = Array.from(engineOptions).find(option => option.querySelector('input[type="radio"]').checked);

            if (selectedEngine) {
                const engineValue = selectedEngine.querySelector('input[type="radio"]').value;
                const searchUrl = engineData[engineValue]?.searchUrl;
                if (searchUrl) {
                    window.location.href = searchUrl + query;
                }
            } else {
                alert('Please select a search engine.');
            }
        }
    }

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

    function updateThemeColors(color) {
        const root = document.documentElement;
        root.style.setProperty('--theme-color-light', themeColors[color].light);
        root.style.setProperty('--theme-color-dark', themeColors[color].dark);
    }

    colorOptions.forEach(option => {
        option.addEventListener('click', function() {
            const color = this.getAttribute('data-color');
            body.className = color !== 'default' ? `theme-${color}` : '';
            updateThemeColors(color);
            localStorage.setItem('selectedTheme', color);
        });
    });

    function initTheme() {
        const savedTheme = localStorage.getItem('selectedTheme');
        if (savedTheme) {
            if (savedTheme !== 'default') {
                body.classList.add(`theme-${savedTheme}`);
            }
            updateThemeColors(savedTheme);
        }
    }

    setupEngineOptions();
    initTheme();
    setupFavoriteOptions();
});
