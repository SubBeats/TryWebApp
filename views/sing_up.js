function myFunction(event) { // создаем функцию myFunction() с аргументом event
    event.preventDefault(); // предотвращаем действие по умолчанию для отправки формы
    const form = document.getElementById("myForm"); // получаем форму по id
    const formData = new FormData(form); // создаем объект FormData из формы

    const first_name = document.getElementById('first_name').value;
    const second_name = document.getElementById('second_name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const phone_number = document.getElementById('phone_number').value;
    const role = 'user';
   fetch('http://localhost:8080/register', { // отправляем AJAX-запрос на сервер
      method: "POST",
     headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ first_name, second_name, email, password, phone_number,role })
    })
    .then(response => { // обрабатываем ответ от сервера
      const result =  response.json().then(result =>{
        if (result.success) { // если запрос успешный
        alert("Регистрация прошла успешно!"); // выводим сообщение об успешной регистрации
        document.getElementById('first_name').value = '';
        document.getElementById('second_name').value = '';
        document.getElementById('email').value = '';
        document.getElementById('password').value = '';
        document.getElementById('phone_number').value = '';
        } else {
        alert(result.message); // выводим сообщение об ошибке регистрации
        }
      })
      
    })
    .catch(error => { // обрабатываем ошибку
      alert("Произошла ошибка: " + error.message); // выводим сообщение с описанием ошибки
    });
  }