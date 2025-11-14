// Конфигурация
const CONFIG = {
    ALCOHOL_OPTIONS: [
        'Вино красное',
        'Вино белое',
        'Шампанское',
        'Водка',
        'Виски',
        'Коньяк',
        'Пиво',
        'Не пью алкоголь'
    ],
    GOOGLE_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbyR45fspxBAka9e_xOBLfezNJTPJ7obCWKYFbmVqbSDL_YyK7z6bP8aDlLj8OiC7HkK/exec'
};

// Управление алкогольными опциями
const alcoholManager = {
    init: function() {
        this.initializeMainAlcoholOptions();
    },

    initializeMainAlcoholOptions: function() {
        const container = document.getElementById('alcoholOptions');
        this.createAlcoholOptions(container, 'main');
    },

    createAlcoholOptions: function(container, prefix) {
        CONFIG.ALCOHOL_OPTIONS.forEach(option => {
            const div = document.createElement('div');
            div.className = 'alcohol-option';
            const id = `${prefix}_${option.replace(/\s+/g, '_')}`;
            
            div.innerHTML = `
                <input type="checkbox" id="${id}" value="${option}">
                <label for="${id}">${option}</label>
            `;
            
            div.addEventListener('click', (e) => {
                if (e.target.type !== 'checkbox') {
                    const checkbox = div.querySelector('input[type="checkbox"]');
                    checkbox.checked = !checkbox.checked;
                    div.classList.toggle('selected', checkbox.checked);
                }
            });

            // Обработка клика по checkbox
            const checkbox = div.querySelector('input[type="checkbox"]');
            checkbox.addEventListener('change', function() {
                div.classList.toggle('selected', this.checked);
            });

            container.appendChild(div);
        });
    },

    getSelectedAlcohol: function(container) {
        const selected = [];
        container.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
            selected.push(checkbox.value);
        });
        return selected;
    }
};

// Управление дополнительными гостями
const guestManager = {
    additionalGuestCount: 0,

    addAdditionalGuest: function() {
        this.additionalGuestCount++;
        const container = document.getElementById('additionalGuests');
        const guestDiv = document.createElement('div');
        guestDiv.className = 'additional-guest';
        guestDiv.dataset.guestId = this.additionalGuestCount;
        
        guestDiv.innerHTML = `
            <h3>Дополнительный гость ${this.additionalGuestCount}</h3>
            <div class="form-group">
                <label>Имя и фамилия *</label>
                <input type="text" class="additional-guest-name" required 
                       placeholder="Мария Петрова" data-guest="${this.additionalGuestCount}">
            </div>
            <div class="form-group">
                <label>Выберите алкогольные напитки:</label>
                <div class="alcohol-options" id="additionalAlcohol${this.additionalGuestCount}"></div>
            </div>
            <button type="button" class="btn btn-remove" 
                    onclick="guestManager.removeAdditionalGuest(${this.additionalGuestCount})">
                Удалить гостя
            </button>
        `;
        
        container.appendChild(guestDiv);

        // Инициализация опций алкоголя для дополнительного гостя
        const alcoholContainer = document.getElementById(`additionalAlcohol${this.additionalGuestCount}`);
        alcoholManager.createAlcoholOptions(alcoholContainer, `additional_${this.additionalGuestCount}`);
    },

    removeAdditionalGuest: function(guestId) {
        const guestElement = document.querySelector(`[data-guest-id="${guestId}"]`);
        if (guestElement) {
            guestElement.remove();
        }
    },

    getAdditionalGuestsData: function() {
        const additionalGuests = [];
        const guestElements = document.querySelectorAll('.additional-guest');
        
        guestElements.forEach(guestElement => {
            const nameInput = guestElement.querySelector('.additional-guest-name');
            const name = nameInput ? nameInput.value.trim() : '';
            
            if (name) {
                const alcoholContainer = guestElement.querySelector('.alcohol-options');
                const alcohol = alcoholManager.getSelectedAlcohol(alcoholContainer);
                
                additionalGuests.push({
                    name: name,
                    alcohol: alcohol
                });
            }
        });
        
        return additionalGuests;
    },

    validateAdditionalGuests: function() {
        const guestElements = document.querySelectorAll('.additional-guest');
        let isValid = true;
        
        guestElements.forEach(guestElement => {
            const nameInput = guestElement.querySelector('.additional-guest-name');
            if (nameInput && !nameInput.value.trim()) {
                nameInput.style.borderColor = '#ef5350';
                isValid = false;
            } else if (nameInput) {
                nameInput.style.borderColor = '';
            }
        });
        
        return isValid;
    }
};

// Обработка формы
const formHandler = {
    submitForm: function() {
        // Валидация основного гостя
        const mainGuestName = document.getElementById('guestName').value.trim();
        if (!this.validateMainGuest(mainGuestName)) {
            return;
        }

        // Валидация дополнительных гостей
        if (!guestManager.validateAdditionalGuests()) {
            alert('Пожалуйста, заполните имена всех дополнительных гостей');
            return;
        }

        // Показать индикатор загрузки
        this.showLoading();

        // Сбор данных
        const formData = this.collectFormData(mainGuestName);

        // Отправка данных
        this.sendData(formData);
    },

    validateMainGuest: function(name) {
        const nameInput = document.getElementById('guestName');
        
        if (!name) {
            nameInput.style.borderColor = '#ef5350';
            alert('Пожалуйста, введите ваше имя и фамилию');
            return false;
        }
        
        nameInput.style.borderColor = '';
        return true;
    },

    collectFormData: function(mainGuestName) {
        const mainAlcoholContainer = document.getElementById('alcoholOptions');
        const mainGuestAlcohol = alcoholManager.getSelectedAlcohol(mainAlcoholContainer);
        const additionalGuests = guestManager.getAdditionalGuestsData();

        return {
            mainGuest: {
                name: mainGuestName,
                alcohol: mainGuestAlcohol
            },
            additionalGuests: additionalGuests,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        };
    },

    sendData: function(formData) {
        fetch(CONFIG.GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        })
        .then(() => {
            this.handleSuccess();
        })
        .catch(error => {
            this.handleError(error);
        });
    },

    showLoading: function() {
        document.getElementById('loading').style.display = 'block';
    },

    hideLoading: function() {
        document.getElementById('loading').style.display = 'none';
    },

    handleSuccess: function() {
        this.hideLoading();
        this.showSuccessMessage();
        this.logSubmission();
    },

    handleError: function(error) {
        this.hideLoading();
        console.error('Error:', error);
        alert('Произошла ошибка при отправке данных. Пожалуйста, проверьте подключение к интернету и попробуйте еще раз.');
    },

    showSuccessMessage: function() {
        document.getElementById('invitationForm').classList.add('hidden');
        document.getElementById('successMessage').classList.remove('hidden');
        
        // Прокрутка к сообщению об успехе
        document.getElementById('successMessage').scrollIntoView({ 
            behavior: 'smooth' 
        });
    },

    logSubmission: function() {
        console.log('Форма успешно отправлена');
    }
};

// Утилиты
const utils = {
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    alcoholManager.init();
    
    // Добавляем обработчик Enter для полей ввода
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const focused = document.activeElement;
            if (focused && focused.type === 'text') {
                formHandler.submitForm();
            }
        }
    });
    
    console.log('Wedding invitation form initialized');
});

// Глобальные функции для onclick атрибутов
window.guestManager = guestManager;
window.formHandler = formHandler;