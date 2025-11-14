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
    // Запуск таймера
    updateCountdown();
    setInterval(updateCountdown, 1000);

    const form = document.getElementById('rsvpForm');
    const plusOnesContainer = document.getElementById('plusOnesContainer');
    const addPlusOneBtn = document.getElementById('addPlusOneBtn');
    const responseMessage = document.getElementById('responseMessage');
    let plusOneCount = 0;

    // Функция для получения выбранных чекбоксов по имени
    function getSelectedAlcohol(name) {
        const checkboxes = document.querySelectorAll(`input[name="${name}"]:checked`);
        const selected = Array.from(checkboxes).map(cb => cb.value);
        return selected.length > 0 ? selected : ['не выбрано'];
    }

    // Функция для добавления полей для спутника
    addPlusOneBtn.addEventListener('click', function() {
        plusOneCount++;
        const plusOneDiv = document.createElement('div');
        plusOneDiv.className = 'plus-one-fields';
        plusOneDiv.innerHTML = `
            <h4>Спутник #${plusOneCount}</h4>
            <div class="form-group">
                <label for="plusOneName${plusOneCount}">Имя и фамилия</label>
                <input type="text" id="plusOneName${plusOneCount}" name="plusOnes[${plusOneCount}][name]" required>
            </div>
            <div class="form-group">
                <label>Предпочтения по алкоголю</label>
                <div class="alcohol-checkboxes plus-one-alcohol">
                    <label class="checkbox-label">
                        <input type="checkbox" name="plusOnes[${plusOneCount}][alcohol]" value="красное вино"> Красное вино
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" name="plusOnes[${plusOneCount}][alcohol]" value="белое вино"> Белое вино
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" name="plusOnes[${plusOneCount}][alcohol]" value="шампанское"> Шампанское
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" name="plusOnes[${plusOneCount}][alcohol]" value="водка"> Водка
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" name="plusOnes[${plusOneCount}][alcohol]" value="виски"> Виски
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" name="plusOnes[${plusOneCount}][alcohol]" value="не пью"> Не пью алкоголь
                    </label>
                </div>
            </div>
            <button type="button" class="remove-plus-one-btn">Удалить</button>
        `;
        plusOnesContainer.appendChild(plusOneDiv);

        // Обработчик для кнопки удаления
        plusOneDiv.querySelector('.remove-plus-one-btn').addEventListener('click', function() {
            plusOnesContainer.removeChild(plusOneDiv);
            plusOneCount--;
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

        // Проверяем, что выбран хотя бы один вариант алкоголя
        if (mainGuestAlcohol.length === 0 || (mainGuestAlcohol.length === 1 && mainGuestAlcohol[0] === 'не выбрано')) {
            responseMessage.textContent = 'Пожалуйста, выберите предпочтения по алкоголю';
            responseMessage.className = 'error';
            submitBtn.disabled = false;
            submitBtn.textContent = 'Отправить ответ';
            return;
        }

        // Создаем объект для отправки
        const dataToSend = {
            mainGuest: {
                name: mainGuestName,
                alcohol: mainGuestAlcohol
            },
            plusOnes: []
        };

        // Собираем данные о спутниках
        const plusOneFields = document.querySelectorAll('.plus-one-fields');
        plusOneFields.forEach(field => {
            const nameInput = field.querySelector('input[type="text"]');
            const name = nameInput ? nameInput.value : '';
            const alcoholCheckboxes = field.querySelectorAll('input[type="checkbox"]:checked');
            const alcohol = Array.from(alcoholCheckboxes).map(cb => cb.value);
            
            if (name) {
                dataToSend.plusOnes.push({ name, alcohol });
            }
        });

        console.log('Отправляемые данные:', dataToSend);

        // ОТПРАВЛЯЕМ ДАННЫЕ НА СЕРВЕР
        fetch('https://wedding-production-21e8.up.railway.app/rsvp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataToSend)
        })
        .then(response => response.json())
        .then(data => {
            responseMessage.textContent = data.message || 'Спасибо! Ваш ответ записан.';
            responseMessage.className = 'success';
            form.reset();
            plusOnesContainer.innerHTML = '<h3>Вы придёте не один?</h3><p>Добавьте информацию о ваших спутниках.</p>';
            plusOneCount = 0;
        })
        .catch(error => {
            console.error('Ошибка:', error);
            responseMessage.textContent = 'Произошла ошибка. Попробуйте еще раз.';
            responseMessage.className = 'error';
        })
        .finally(() => {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Отправить ответ';
        });
    });
});