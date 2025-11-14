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
        
        // Если свадьба уже прошла, показываем сообщение
        const countdownContainer = document.querySelector('.countdown');
        if (countdownContainer && !countdownContainer.querySelector('.wedding-passed')) {
            const passedMessage = document.createElement('div');
            passedMessage.className = 'wedding-passed';
            passedMessage.innerHTML = '<p>🎉 Свадьба состоялась! Спасибо всем, кто был с нами!</p>';
            passedMessage.style.cssText = 'margin-top: 20px; font-size: 1.2em; color: rgba(255,255,255,0.9);';
            countdownContainer.appendChild(passedMessage);
        }
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

// Функция для получения выбранных чекбоксов по имени
function getSelectedAlcohol(name) {
    const checkboxes = document.querySelectorAll(`input[name="${name}"]:checked`);
    const selected = Array.from(checkboxes).map(cb => cb.value);
    
    // Если не выбран ни один чекбокс, возвращаем пустой массив для валидации
    return selected.length > 0 ? selected : [];
}

// Функция для валидации формы
function validateForm(mainGuestName, mainGuestAlcohol) {
    if (!mainGuestName.trim()) {
        return 'Пожалуйста, введите ваше имя и фамилию';
    }
    
    if (mainGuestName.length < 2) {
        return 'Имя должно содержать минимум 2 символа';
    }
    
    if (mainGuestAlcohol.length === 0) {
        return 'Пожалуйста, выберите предпочтения по алкоголю';
    }
    
    return null;
}

// Функция для сброса формы
function resetForm() {
    const form = document.getElementById('rsvpForm');
    const plusOnesContainer = document.getElementById('plusOnesContainer');
    const responseMessage = document.getElementById('responseMessage');
    
    form.reset();
    plusOnesContainer.innerHTML = '<h3>Вы придёте не один?</h3><p>Добавьте информацию о ваших спутниках.</p>';
    responseMessage.className = 'hidden';
    
    // Сбрасываем глобальный счетчик
    window.plusOneCount = 0;
}

// Основной код формы
document.addEventListener('DOMContentLoaded', function() {
    // Запуск таймера
    updateCountdown();
    setInterval(updateCountdown, 1000);

    const form = document.getElementById('rsvpForm');
    const plusOnesContainer = document.getElementById('plusOnesContainer');
    const addPlusOneBtn = document.getElementById('addPlusOneBtn');
    const responseMessage = document.getElementById('responseMessage');
    
    // Инициализируем глобальный счетчик
    window.plusOneCount = 0;

    // Функция для добавления полей для спутника
    addPlusOneBtn.addEventListener('click', function() {
        window.plusOneCount++;
        const plusOneDiv = document.createElement('div');
        plusOneDiv.className = 'plus-one-fields';
        plusOneDiv.innerHTML = `
            <h4>Спутник #${window.plusOneCount}</h4>
            <div class="form-group">
                <label for="plusOneName${window.plusOneCount}">Имя и фамилия *</label>
                <input type="text" id="plusOneName${window.plusOneCount}" name="plusOnes[${window.plusOneCount}][name]" required>
            </div>
            <div class="form-group">
                <label>Предпочтения по алкоголю *</label>
                <div class="alcohol-checkboxes plus-one-alcohol">
                    <label class="checkbox-label">
                        <input type="checkbox" name="plusOnes[${window.plusOneCount}][alcohol]" value="красное вино"> Красное вино
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" name="plusOnes[${window.plusOneCount}][alcohol]" value="белое вино"> Белое вино
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" name="plusOnes[${window.plusOneCount}][alcohol]" value="шампанское"> Шампанское
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" name="plusOnes[${window.plusOneCount}][alcohol]" value="водка"> Водка
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" name="plusOnes[${window.plusOneCount}][alcohol]" value="виски"> Виски
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" name="plusOnes[${window.plusOneCount}][alcohol]" value="коньяк"> Коньяк
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" name="plusOnes[${window.plusOneCount}][alcohol]" value="не пью"> Не пью алкоголь
                    </label>
                </div>
            </div>
            <button type="button" class="remove-plus-one-btn">🗑️ Удалить</button>
        `;
        plusOnesContainer.appendChild(plusOneDiv);

        // Обработчик для кнопки удаления
        plusOneDiv.querySelector('.remove-plus-one-btn').addEventListener('click', function() {
            plusOnesContainer.removeChild(plusOneDiv);
            window.plusOneCount--;
        });
    });

    // Обработчик отправки формы
    form.addEventListener('submit', function(event) {
        event.preventDefault();

        const submitBtn = document.getElementById('submitBtn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправляем...';

        // Собираем данные формы
        const mainGuestName = document.getElementById('guestName').value;
        const mainGuestAlcohol = getSelectedAlcohol('mainGuestAlcohol');

        // Валидация формы
        const validationError = validateForm(mainGuestName, mainGuestAlcohol);
        if (validationError) {
            responseMessage.textContent = validationError;
            responseMessage.className = 'error';
            responseMessage.classList.remove('hidden');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Отправить ответ';
            return;
        }

        // Создаем объект для отправки
        const dataToSend = {
            mainGuest: {
                name: mainGuestName.trim(),
                alcohol: mainGuestAlcohol
            },
            plusOnes: []
        };

        // Собираем данные о спутниках
        const plusOneFields = document.querySelectorAll('.plus-one-fields');
        let hasPlusOneErrors = false;
        
        plusOneFields.forEach((field, index) => {
            const nameInput = field.querySelector('input[type="text"]');
            const name = nameInput ? nameInput.value.trim() : '';
            const alcoholCheckboxes = field.querySelectorAll('input[type="checkbox"]:checked');
            const alcohol = Array.from(alcoholCheckboxes).map(cb => cb.value);
            
            // Валидация данных спутников
            if (name && alcohol.length === 0) {
                responseMessage.textContent = `Пожалуйста, выберите алкоголь для спутника ${index + 1}`;
                responseMessage.className = 'error';
                responseMessage.classList.remove('hidden');
                hasPlusOneErrors = true;
                return;
            }
            
            if (alcohol.length > 0 && !name) {
                responseMessage.textContent = `Пожалуйста, введите имя для спутника ${index + 1}`;
                responseMessage.className = 'error';
                responseMessage.classList.remove('hidden');
                hasPlusOneErrors = true;
                return;
            }
            
            if (name && alcohol.length > 0) {
                dataToSend.plusOnes.push({ name, alcohol });
            }
        });

        if (hasPlusOneErrors) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Отправить ответ';
            return;
        }

        console.log('Отправляемые данные:', dataToSend);

        // ОТПРАВЛЯЕМ ДАННЫЕ НА СЕРВЕР
        fetch('https://wedding-production-21e8.up.railway.app/rsvp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataToSend)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка сети');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                responseMessage.textContent = data.message || 'Спасибо! Ваш ответ успешно отправлен. Ждём вас на свадьбе! 🎉';
                responseMessage.className = 'success';
                
                // Автоматически скрываем сообщение об успехе через 5 секунд
                setTimeout(() => {
                    if (responseMessage.className === 'success') {
                        responseMessage.classList.add('hidden');
                    }
                }, 5000);
                
                resetForm();
            } else {
                throw new Error(data.message || 'Ошибка при отправке');
            }
        })
        .catch(error => {
            console.error('Ошибка:', error);
            responseMessage.textContent = error.message || 'Произошла ошибка при отправке. Пожалуйста, попробуйте еще раз.';
            responseMessage.className = 'error';
        })
        .finally(() => {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Отправить ответ';
            responseMessage.classList.remove('hidden');
        });
    });

    // Добавляем обработчик для сброса формы при нажатии Escape
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            const activeElement = document.activeElement;
            if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'BUTTON') {
                resetForm();
            }
        }
    });
});

// Добавляем обработку ошибок загрузки страницы
window.addEventListener('error', function(event) {
    console.error('Ошибка на странице:', event.error);
});

// Добавляем обработчик для улучшения UX на мобильных устройствах
window.addEventListener('load', function() {
    // Предотвращаем масштабирование при фокусе на iOS
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            window.scrollTo(0, 0);
            document.body.scrollTop = 0;
        });
    });
});