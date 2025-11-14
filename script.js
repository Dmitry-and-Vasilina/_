// URL вашего Google Apps Script
const SERVER_URL = 'https://script.google.com/macros/s/AKfycbyR45fspxBAka9e_xOBLfezNJTPJ7obCWKYFbmVqbSDL_YyK7z6bP8aDlLj8OiC7HkK/exec';

// Глобальные переменные для сохранения данных
let currentNameValue = '';
let currentAlcoholValues = [];

// Таймер до свадьбы
function updateCountdown() {
    const weddingDate = new Date('2026-06-26T13:00:00').getTime();
    const now = new Date().getTime();
    const distance = weddingDate - now;

    if (distance < 0) {
        document.getElementById('days').textContent = '00';
        document.getElementById('hours').textContent = '00';
        document.getElementById('minutes').textContent = '00';
        document.getElementById('seconds').textContent = '00';
        return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById('days').textContent = days.toString().padStart(2, '0');
    document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
    document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
    document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
}

// Основной код формы
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ script.js загружен и выполняется!');
    
    // Запуск таймера
    updateCountdown();
    setInterval(updateCountdown, 1000);

    const form = document.getElementById('rsvpForm');
    const responseMessage = document.getElementById('responseMessage');
    
    if (!form) {
        console.error('❌ Форма не найдена!');
        return;
    }

    // Сохраняем имя в реальном времени
    const nameField = document.getElementById('guestName');
    if (nameField) {
        nameField.addEventListener('input', function() {
            currentNameValue = this.value;
            console.log('Сохраненное имя:', currentNameValue);
        });
    }

    // Сохраняем алкоголь в реальном времени
    const alcoholCheckboxes = document.querySelectorAll('input[name="mainGuestAlcohol"]');
    alcoholCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            currentAlcoholValues = Array.from(document.querySelectorAll('input[name="mainGuestAlcohol"]:checked')).map(cb => cb.value);
            console.log('Сохраненный алкоголь:', currentAlcoholValues);
        });
    });

    // Обработчик отправки формы
    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        console.log('🎯 Форма отправляется...');

        const submitBtn = document.getElementById('submitBtn');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправляем...';

        try {
            // Используем сохраненные значения
            const mainGuestName = currentNameValue || '';
            const mainGuestAlcohol = currentAlcoholValues.length > 0 ? currentAlcoholValues : 
                Array.from(document.querySelectorAll('input[name="mainGuestAlcohol"]:checked')).map(cb => cb.value);

            console.log('Данные для отправки:', { name: mainGuestName, alcohol: mainGuestAlcohol });

            // Простая валидация
            if (!mainGuestName.trim()) {
                throw new Error('Пожалуйста, введите ваше имя и фамилию');
            }
            if (mainGuestAlcohol.length === 0) {
                throw new Error('Пожалуйста, выберите предпочтения по алкоголю');
            }

            // Создаем объект для отправки
            const dataToSend = {
                mainGuest: {
                    name: mainGuestName.trim(),
                    alcohol: mainGuestAlcohol
                },
                plusOnes: []
            };

            console.log('Отправляемые данные:', dataToSend);

            // Отправляем данные на Google Apps Script
            const response = await fetch(SERVER_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend)
            });

            if (!response.ok) {
                throw new Error(`Ошибка сети: ${response.status}`);
            }

            const result = await response.json();
            console.log('Ответ от сервера:', result);

            if (result.success) {
                responseMessage.textContent = '✅ ' + (result.message || 'Спасибо! Ваш ответ успешно отправлен. Ждём вас на свадьбе! 🎉');
                responseMessage.className = 'success';
                
                // Сбрасываем форму и сохраненные значения
                form.reset();
                currentNameValue = '';
                currentAlcoholValues = [];
                
                // Автоматически скрываем сообщение об успехе через 5 секунд
                setTimeout(() => {
                    responseMessage.classList.add('hidden');
                }, 5000);
            } else {
                throw new Error(result.message || 'Ошибка при отправке');
            }

        } catch (error) {
            console.error('Ошибка:', error);
            responseMessage.textContent = '❌ ' + error.message;
            responseMessage.className = 'error';
            responseMessage.classList.remove('hidden');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });

    console.log('✅ Обработчик формы установлен!');
});