const express = require('express');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const app = express();
const PORT = process.env.PORT || 3000;

// ВАШ РЕАЛЬНЫЙ ТОКЕН
const BOT_TOKEN = '8044113138:AAGY9F1YVBXbyKrqX_wXGsnn42IYYm0YAJ0';
const CHAT_ID = '409598781'; // Ваш chat_id

app.use(express.json());

// Разрешаем CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.post('/rsvp', async (req, res) => {
    try {
        const { mainGuest, plusOnes } = req.body;

        console.log('=== ПОЛУЧЕНЫ ДАННЫЕ ===');
        console.log('mainGuest:', mainGuest);
        console.log('plusOnes:', plusOnes);
        console.log('======================');

        const allGuests = [mainGuest, ...plusOnes];
        
        let message = `🎉 *Новый ответ на приглашение!*\n\n`;
        message += `*Общее количество гостей:* ${allGuests.length}\n\n`;
        message += `*Список гостей:*\n`;

        allGuests.forEach((guest, index) => {
            message += `${index + 1}. *Имя, Фамилия:* ${guest.name}\n`;
            
            // Алкоголь может быть массивом или строкой
            const alcoholText = Array.isArray(guest.alcohol) 
                ? guest.alcohol.join(', ')
                : guest.alcohol;
                
            message += `   *Алкоголь:* ${alcoholText}\n`;
            
            if (index < allGuests.length - 1) {
                message += '\n';
            }
        });

        console.log('Сообщение для Telegram:', message);

        // Отправляем сообщение в Телеграм
        const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
        const response = await fetch(telegramUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message,
                parse_mode: 'Markdown'
            })
        });

        const telegramResponse = await response.json();
        console.log('Ответ от Telegram:', telegramResponse);

        if (telegramResponse.ok) {
            console.log('✅ Сообщение успешно отправлено в Telegram!');
            res.json({ success: true, message: 'Спасибо! Ваш ответ успешно отправлен.' });
        } else {
            console.error('❌ Ошибка Telegram API:', telegramResponse);
            res.status(500).json({ success: false, message: 'Ошибка при отправке уведомления.' });
        }

    } catch (error) {
        console.error('❌ Ошибка на сервере:', error);
        res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера.' });
    }
});

// ЗАПУСК СЕРВЕРА
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
    console.log(`🤖 Токен бота: установлен`);
});