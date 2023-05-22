
async function loadSelect(client_id, service_id,content) {
  const okBtn = document.getElementsByClassName("ok")[0];
  content.innerHTML = '';

  let data = [];
  console.log(client_id);

  fetch('/apply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ client_id, service_id })
  })
    .then(response => response.json())
    .then(data => {
      const clientName = data.data.client.first_name;
      const clientLastName = data.data.client.second_name;
      const serviceName = data.data.services.name;
      const serviceCost = data.data.services.cost;

      const p1 = document.createElement('p');
      p1.textContent = `Имя клиента: ${clientName} ${clientLastName}`;

      const p2 = document.createElement('p');
      p2.textContent = `Выбранная услуга: ${serviceName} (${serviceCost} руб.)`;

      content.appendChild(p1);
      content.appendChild(p2);
      content.appendChild(okBtn); 

      //modal.style.display = "block";
    })
    .catch(error => console.error(error));
};

async function closeApp(id){
  fetch('/apply/close_app', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ id })
  })
}


function openModal(event) {
  const modal = document.getElementById("myModal");
  const closeBtn = document.getElementsByClassName("close")[0];
  const okBtn = document.getElementsByClassName("ok")[0];
  const content = document.getElementById('modal_content');
  // Получаем объект из строки JSON в атрибуте value
  const data = JSON.parse(event.target.value);
  // Получаем свойства объекта
  const client_id = data.client_id;
  const service_id = data.service_id;
  // Выводим полученные данные в консоль для проверки
  console.log(client_id, service_id);

  modal.style.display = "block";
  loadSelect(client_id, service_id,content);
  content.appendChild(closeBtn);

  okBtn.addEventListener("click", async function() {
    console.log('Append');
    const id = data.id;
    modal.style.display = "none";//закрытие модального окна
    await closeApp(id);
    location.reload();
  });

  // Добавляем обработчик события клика на элементе для закрытия модального окна
  closeBtn.onclick = function () {
    modal.style.display = "none";
  }
};
