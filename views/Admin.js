// Функция для добавления клиента
const addClient = async () => {
    const name = document.querySelector('#client-name').value;
    const second_name = document.querySelector('#client-secondname').value;
    const email = document.querySelector('#client-email').value;
    const password = document.querySelector('#client-password').value;
    const phone_number = document.querySelector('#client-phone').value;
    const role = 'user';

    console.log("client add :" + name);

    const response = await fetch('http://localhost:8080/add_client', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, second_name, email, password, phone_number,role }),
    });

    if (response.ok) {
      console.log('Клиент успешно добавлен');
      window.location.assign('http://localhost:8080/');// автоматически обновляем страницу
    } else {
      console.error('Ошибка при добавлении клиента');
    }
  };

  const addAdmin = async () => {
    const name = document.querySelector('#admin-name').value;
    const second_name = document.querySelector('#admin-secondname').value;
    const email = document.querySelector('#admin-email').value;
    const password = document.querySelector('#admin-password').value;
    const phone_number = document.querySelector('#admin-phone').value;
    const role = 'admin';

    console.log("admin add :" + name);

    const response = await fetch('http://localhost:8080/add_client', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, second_name, email, password, phone_number,role }),
    });

    if (response.ok) {
      console.log('Админ успешно добавлен');
      window.location.assign('http://localhost:8080/');// автоматически обновляем страницу
    } else {
      console.error('Ошибка при добавлении клиента');
    }
  };

  // Функция для удаления клиента
  const deleteClient = async () => {
    const id = document.querySelector('#client-id').value;
    console.log("Id выбранного клиента которого необходимо удалить: " + id)

    const response = await fetch('http://localhost:8080/delete_client', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });

    if (response.ok) {
      console.log('Клиент успешно удален');
      location.reload(); // автоматически обновляем страницу
    } else {
      console.error('Ошибка при удалении клиента');
    }
  };

  document.addEventListener('DOMContentLoaded', () => {//Это гарантирует, что скрипт будет запущен только после того, как загрузится HTML-документ.
    const addClientForm = document.querySelector('#add-client-form');
    addClientForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      await addClient();
    });
  
    const deleteClientForm = document.querySelector('#delete-client-form');
    deleteClientForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      await deleteClient();
    });
    const addAdminForm = document.querySelector('#add-admin-form');
    addClientForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      await addAdmin();
    });

  });
