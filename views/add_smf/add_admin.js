
  const addAdmin = async () => {
    const name = document.querySelector('#admin-name').value;
    const second_name = document.querySelector('#admin-secondname').value;
    const email = document.querySelector('#admin-email').value;
    const password = document.querySelector('#admin-password').value;
    const phone_number = document.querySelector('#admin-phone').value;
    const role = 'admin';

    console.log("admin add :" + name);

    const response = await fetch('http://localhost:8080/add/add_admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, second_name, email, password, phone_number,role }),
      });
  
      if (response.ok) {
        console.log('Клиент успешно добавлен');
        window.location.assign('http://localhost:8080/add/new_admin');// автоматически обновляем страницу
      } else {
        console.error('Ошибка при добавлении админа');
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
    const deleteClientForm = document.querySelector('#delete-client-form');
    deleteClientForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      await deleteClient();
    });
    const addAdminForm = document.querySelector('#add-admin-form');
    addAdminForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      await addAdmin();
    });

  });
