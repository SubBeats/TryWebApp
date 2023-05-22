function myFunction() {
    const form = document.querySelector('form');

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const first_name = document.getElementById('first_name').value;
      const second_name = document.getElementById('second_name').value;
      const email = document.getElementById('email').value;
      const pasword = document.getElementById('password').value;
      const phone_number = document.getElementById('phone_number').value;

      console.log(phone_number);

      //отправка данных на сервер с заголовком application/json
      const response = await fetch('/register', {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ first_name, second_name, email, pasword, phone_number })
      })

      //ответ от сервра в формате json
      const result = await response.json();
      if (result.success) {
        window.location.href = 'Login.html';
      } else {
        alert(result.message)
      }
    })
  }