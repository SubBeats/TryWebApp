
const PORT = 8080;

const express = require('express');
const password = require('password');
const bcrypt = require('bcrypt');
const app = express();
const session = require('express-session');

const LocalStrategy = require('passport-local').Strategy;
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const path = require('path');
const { log } = require('console');
const router = express.Router();

app.use(express.static(path.join(__dirname, 'views')));
app.use(bodyParser.json());


app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}))

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'my'
});

connection.connect((err) => {
  if (err) {
    console.error('Ошибка подключения к базе данных: ' + err.stack);
    return;
  }
  console.log('Подключено к базе данных с ID: ' + connection.threadId);
});

//для проверки аутентификации пользователя
function caheckAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  }
  res.redirect('/login');

}

// для проверки роли пользователя
function chechRole(role) {
  return function (req, res, next) {
    if (req.session.user && req.session.user.role === role) {
      return next();
    }
    res.redirect('/login');
  }
}

app.engine('.html', require('ejs').renderFile);

app.get('/', function (req, res) {
  console.log('Main page');

  if (req.session.user) {
    if (req.session.user.role === 'admin') {
      connection.query('SELECT * FROM my.staff where role =  ?', ['user'], (error, results) => {
        if (error) throw error;
        console.log("Аутентификация администратора прошла " + req.session.user);
        res.render('Admin.html', { results });
      });
    } else if (req.session.user.role === 'doctor') {
      connection.query('SELECT * FROM my.appointments where doctor_id =  ? and status = 0', [req.session.user.id], (error, results) => {
        console.log("Аутентификация прошла вы врач");
        res.render('doctor_page.html', { results });
      });
    }
    else {
      console.log("Аутентификация прошла " + req.session.user);
      res.render('Main.html', { user: true });
    }
  } else {
    console.log("Аутентификация не прошла " + false);
    res.render('Main.html', { user: false });
  }
});

app.get('/add/new_admin', caheckAuthenticated, chechRole('admin'), function (req, res) {
  console.log('Main page');

  connection.query('SELECT * FROM my.staff where role =  ?', ['admin'], (error, results) => {
    if (error) throw error;

    if (req.session.user) {
      if (req.session.user.role === 'admin') {
        res.render('./add_smf/Add_admin.html', { results });
      }
    }
  });
});

app.get('/add/new_doctor', caheckAuthenticated, chechRole('admin'), function (req, res) {
  console.log('Main page');

  connection.query('SELECT * FROM my.doctors', (error, results) => {
    if (error) throw error;

    if (req.session.user) {
      if (req.session.user.role === 'admin') {
        res.render('./add_smf/Add_doctor.html', { results });
      }
    }
  });
});

app.get('/register', function (req, res) {
  console.log('Test register');
  connection.query('SELECT * FROM staff', (error, results) => {
    if (error) throw error;
    res.render('sing_up.html', { animals: results });
  });
})

app.post('/register', (req, res) => {
  console.log('POST register');
  const { first_name, second_name, email, password, phone_number, role } = req.body;
  console.log(first_name);

  //хеширование паролей 
  bcrypt.hash(password, 10, (err, hash) => {
    console.log('попытка хеша');
    // Вставляем данные нового пользователя в базу данных
    connection.query('INSERT INTO Staff (first_name, second_name, email, password, phone_number,role) VALUES (?, ?, ?, ?, ?,?)', [first_name, second_name, email, password, phone_number, role], (err, results) => {
      if (err) {
        console.log(err);
        res.json({ success: false, message: 'Ошибка при регистрации пользователя' });
      }
      console.log('запись успешна');
      res.json({ success: true });
    });
  });
});

app.post('/apply', (req, res) => {
  console.log('POST apply');
  const { client_id, service_id } = req.body;
  console.log(client_id);
  
  // Создаем два промиса для запросов к базе данных
  const getClientPromise = new Promise((resolve, reject) => {
    connection.query('SELECT * FROM my.staff where id = ?', [client_id], (err, results) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(results[0]);
    });
  });

  const getServicePromise = new Promise((resolve, reject) => {
    connection.query('SELECT * FROM my.services where id = ?', [service_id], (err, results) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(results[0]);
    });
  });

  // Дожидаемся завершения выполнения обоих промисов
  Promise.all([getClientPromise, getServicePromise])
    .then(([client, services]) => {
      const data = {
        client,
        services
      };
      console.log(data);
      res.json({ data });
    })
    .catch(error => {
      console.error(error);
      res.status(500).send('Internal Server Error');
    });
});

app.post('/apply/close_app', (req, res) => {
  console.log('POST apply');
  const { id} = req.body;
  console.log(id);
  
  // Создаем два промиса для запросов к базе данных
  const getClientPromise = new Promise((resolve, reject) => {
    connection.query('UPDATE `my`.`appointments` SET status = 1 WHERE id = ?', [id], (err, results) => {
      if (err) {
        reject(err);
        return;
      }
    });
  });
  //res.redirect('/');
});


//страница входа 
app.get('/login', (req, res) => {
  res.render('Login.html')
})
//Аутентификация пользователя
app.post('/login', (req, res) => {
  const { email, password, role } = req.body;
  console.log("login :" + email);
  console.log("Password : " + password);
  console.log("role : " + role);
  //поиск пользователя
  if (role === 'doctor') {
    connection.query('SELECT * FROM my.doctors  where email = ? and password = ?', [email, password], async (error, results) => {
      if (error) throw error;
      req.session.user = results[0];
      console.log("role: " + req.session.user.role)
      if (results.length === 0) {
        return res.json({ success: false, message: 'Неправильный email или пароль' });
      }
      else {
        return res.json({ success: true });
      }
    });
  }
  else {
    connection.query('SELECT * FROM my.staff WHERE email = ? AND password = ?', [email, password], async (error, results) => {
      if (error) throw error;
      req.session.user = results[0];
      console.log("to main");
      //console.log(req.session.user.role);
      if (results.length === 0) {
        return res.json({ success: false, message: 'Неправильный email или пароль' });
      }
      else {
        return res.json({ success: true });
      }
    });
  }
});

app.post('/add_client', (req, res) => {
  console.log('add_clien');
  const { name, second_name, email, password, phone_number, role } = req.body;
  console.log(name);

  // Вставляем данные нового пользователя в базу данных
  connection.query('INSERT INTO Staff (first_name, second_name, email, password, phone_number,role) VALUES (?, ?, ?, ?, ?,?)', [name, second_name, email, password, phone_number, role], (err, results) => {
    if (err) {
      console.log(err);
      res.status(200).json({ message: 'Клиент успешно добавлен' });
    }
    console.log('запись успешна');
    res.redirect('/');
  });
});


app.post('/add/add_admin', (req, res) => {
  console.log('POST add_admin');
  const { name, second_name, email, password, phone_number, role } = req.body;
  console.log(name);

  // Вставляем данные нового пользователя в базу данных
  connection.query('INSERT INTO Staff (first_name, second_name, email, password, phone_number,role) VALUES (?, ?, ?, ?, ?,?)', [name, second_name, email, password, phone_number, role], (err, results) => {
    if (err) {
      console.log(err);
      res.status(200).json({ message: 'Клиент успешно добавлен' });
    }
    console.log('запись успешна');
    res.redirect('/');
  });
});

app.post('/delete_client', (req, res) => {
  console.log('POST delete_client');
  const { id } = req.body;
  console.log("id удаляемого клиента: " + id);

  // Вставляем данные нового пользователя в базу данных
  connection.query('DELETE FROM Staff WHERE id = (?)', [id], (err, results) => {
    if (err) {
      console.log(err);
      res.status(200).json({ message: 'Клиент успешно добавлен' });
    }
    console.log('удаление клиента');
    res.redirect('/');
  });
});

app.post('/add_new_note', caheckAuthenticated, chechRole('admin'), (req, res) => {
  console.log('POST new_note');
  const { dateValue, timeValue, id } = req.body;
  console.log(dateValue);

  // Вставляем данные нового пользователя в базу данных
  connection.query('INSERT INTO available_dates (doctor, date, time) VALUES (?, ?, ?)', [id, dateValue, timeValue], (err, results) => {
    if (err) {
      console.log(err);
      rres.status(500).json({ message: 'Произошла ошибка при добавлении записи.' });
    }
    console.log('запись успешна');
    res.json({ success: true });
    //res.redirect('/admin');
  });
});


// Защищенная страница для администраторов для добавления новых записей 
app.get('/admin', caheckAuthenticated, chechRole('admin'), (req, res) => {
  connection.query('SELECT * FROM doctors', (error, results) => {
    if (error) throw error;
    //console.log(results);
    res.render('new_date.html', { results });
  });
});

// Защищенная страница для обычных пользователей
app.get('/user', caheckAuthenticated, chechRole('user'), (req, res) => {
  console.log('user');
  res.render('main.html', { user: req.session.user });
});

// Выход из системы
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

app.get('/book', caheckAuthenticated, chechRole('user'), async (req, res) => {
  try {
    const doctors = await query("SELECT * FROM doctors");
    const services = await query("SELECT * FROM my.services");

    const data = {
      doctors,
      services
    };

    res.render('make_appointment.html', { data });
  } catch (error) {
    console.error(error);
    res.status(500).send("Ошибка на сервере");
  }
});

app.post('/book', caheckAuthenticated, chechRole('user'), async (req, res) => {
  console.log('post book');
  try {
    const { type, doctor_name, date, time } = req.body;
    const datex = new Date(date);
    const formattedDate = datex.toISOString().substring(0, 10);
    connection.query('SELECT id FROM my.available_dates where date = ? and time = ? LIMIT 1', [formattedDate, time], async (error, results) => {
      if (error) throw error;
      const id = results[0].id; // Получаем значение id из первого объекта в массиве результатов
      console.log('/book: ' + id);
      connection.query('UPDATE my.available_dates SET occupate = ? WHERE id = ?', [1, id], async (error, results) => {
        if (error) throw error;
        console.log(results);
      });
    });
    let staff_id;
    let doc_id;
    const tp = type.replace(/\s/g, '');
    console.log(tp + "= type");
    connection.query('SELECT * FROM my.services where name = ? ', [tp], async (error, results) => {
      if (error) throw error;
      staff_id = results[0].id; // Получаем значение id из первого объекта в массиве результатов
      console.log(staff_id + "= staff_id");

      connection.query('INSERT INTO my.appointments (service_id, doctor_id, client_id,date,time,status) VALUES (?,?,?,?,?,0)', [staff_id, doctor_name, req.session.user.id, formattedDate, time], (err, results) => {
        if (err) {
          console.log(err);
          res.status(500).json({ message: 'Произошла ошибка при добавлении записи.' });
        }
        console.log('запись успешна');
        res.json({ success: true });
        //res.redirect('/admin');
      });
    });

  } catch (error) {
    console.error(error);
    res.status(500).send("Ошибка на сервере");
  }

});

function query(sql) {
  return new Promise((resolve, reject) => {
    connection.query(sql, (error, results) => {
      if (error) return reject(error);
      resolve(results);
    });
  });
}

app.post('/make_app/fisrt', caheckAuthenticated, chechRole('user'), (req, res) => {

  console.log('make_app/fisrt');
  const { doctor_id } = req.body;
  // console.log(doctor_id);

  connection.query('select date from available_dates where doctor = ? and occupate = 0', [doctor_id], async (error, results) => {
    if (error) throw error;
    const datesArray = results.map(obj => obj.date); // преобразуем массив объектов в массив строк с датами
    console.log('/make_app/fisrt result: ' + datesArray);
    res.json(datesArray);
  });
});

app.post('/make_app/second', caheckAuthenticated, chechRole('user'), (req, res) => {

  console.log('make_app/second');
  const { doctor_id, date } = req.body;
  console.log(doctor_id);
  console.log(date);

  //Для преобразования даты в формат "год-месяц-день" ("2023-05-08") из формата ISO 8601 ("2023-05-08T00:00:00.000Z") 
  const datex = new Date(date);
  const formattedDate = datex.toISOString().slice(0, 10); // "2023-05-08"
  console.log(formattedDate);

  connection.query('SELECT time FROM my.available_dates where doctor = ? and occupate = 0 and date = ? ', [doctor_id, formattedDate], async (error, results) => {
    if (error) throw error;
    const datesArray = results.map(obj => obj.date);
    console.log('/make_app/second result: ' + JSON.stringify(results));
    console.log('/make_app/second result: ' + datesArray)
    res.json(JSON.stringify(results));
  });
});

//Запуск сервера
app.listen(PORT, 'localhost', () => {
  console.log('server started')
})

