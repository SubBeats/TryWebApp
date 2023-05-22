// Получаем ссылки на элементы select
const select1 = document.getElementById('select1');
const select2 = document.getElementById('select2');
const select3 = document.getElementById('select3');

// Определяем функцию для загрузки данных для второго поля
async function loadSelect2Data() {

    let data = [];
    // Отправляем запрос на сервер для получения данных
    // Основываясь на выбранном значении в первом поле
    const doctor_id = select1.value;
    // Здесь нужно использовать выбранный параметр, чтобы отправить запрос на сервер, и получить данные для select2
    // В качестве примера мы просто жестко закодируем значения для select2
    try {
        const response = await fetch('http://localhost:8080/make_app/fisrt', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ doctor_id })
        });

        const result = await response.json();
        data = result;
        console.log(data);
    } catch (error) {
        console.error(error);
    }



    // Очищаем текущий список значений для select2
    select2.innerHTML = '';

    // Добавляем новые значения в список для select2
    const uniqueDates = new Set();//для уникальности дат в selection
    data.forEach(date => {
        const datex = new Date(date);
        const formattedDate = datex.toLocaleDateString('ru-RU');
        if (!uniqueDates.has(formattedDate)) {
            uniqueDates.add(formattedDate);
            const option = document.createElement('option');
            option.textContent = formattedDate;
            select2.appendChild(option);
        }
    });

    // Загружаем данные для третьего поля
    loadSelect3Data();
}

// Определяем функцию для загрузки данных для третьего поля
async function loadSelect3Data() {
    // Отправляем запрос на сервер для получения данных
    // Основываясь на выбранных значениях в первом и втором полях
    const doctor_id = select1.value;
    const date = new Date(select2.value.split('.').reverse().join('-'));

    // Здесь нужно использовать выбранные параметры, чтобы отправить запрос на сервер, и получить данные для select3
    // В качестве примера мы просто жестко закодируем значения для select3
    let data = [];
    if (date !== '') {
        try {
            const response = await fetch('http://localhost:8080/make_app/second', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ doctor_id, date })
            });

            const result = await response.json();
            data = result;
            console.log(data);
        } catch (error) {
            console.error(error);
        }
        // Очищаем текущий список значений для select3
        select3.innerHTML = '';

        // Создаем новый элемент option с пустым текстом и добавляем его в начало списка
        // const emptyOption = document.createElement('option');
        // emptyOption.textContent = '';
        // select2.insertBefore(emptyOption, select2.firstChild);

        //преобразовать его в массив JavaScript-объектов 
        const dataArray = JSON.parse(data);
        // Добавляем новые значения в список для select3
        dataArray.forEach(date => {
            const option = document.createElement('option');
            option.textContent = date.time;
            select3.appendChild(option);
        });
    }
}

const add = async () => {

        const selectedOption = select0.options[select0.selectedIndex];
        const type = selectedOption.textContent;
        //const type = select0.select0.value;
        const doctor_name = select1.value;
        // const doctor = select1.options[select1.selectedIndex];
        // const doctor_name = doctor.textContent;
        
        const date = new Date(select2.value.split('.').reverse().join('-'));
        const time = select3.value;
        console.log(date);

        // Отправляем POST запрос на сервер с данными
        try {
            const response = await fetch('http://localhost:8080/book', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ type,doctor_name, date, time })
            });

            const result = await response.json();
            console.log(result);

            // Выводим сообщение об успешной отправке данных и очищаем поля
            alert('Данные успешно отправлены!');
            select1.selectedIndex = 0; // сброс выбранного значения
            select2.innerHTML = ''; // очистка списка выбранных дат
            select3.innerHTML = ''; // очистка списка выбранных временных интервалов

        } catch (error) {
            console.error(error);
        }
};


    //Select();
    // Привязываем функцию для загрузки данных для второго поля
    // К событию изменения значения в первом поле
    select1.addEventListener('change', loadSelect2Data);
    // Привязываем функцию для загрузки данных для третьего поля
    // К событию изменения значения во втором поле
    select2.addEventListener('change', loadSelect3Data);
    // Загружаем данные для первого поля при загрузке страницы

    const deleteClientForm = document.querySelector('#make_opp');
    deleteClientForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        await add();
      });



