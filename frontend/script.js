document.addEventListener('DOMContentLoaded', function() {
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
                <div class="alcohol-checkboxes">
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
            const alcohol = getSelectedAlcohol(`plusOnes[${plusOneCount}][alcohol]`);
            
            if (name) {
                dataToSend.plusOnes.push({ name, alcohol });
            }
        });

        console.log('Отправляемые данные:', dataToSend);

        // ОТПРАВЛЯЕМ ДАННЫЕ НА СЕРВЕР
        fetch('http://wedding-production-21e8.up.railway.app', {
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