const express = require('express'); //buat manggil express
const bcrypt = require('bcrypt'); //buat manggil bcrypt
const session = require('express-session'); //buat manggil session
const flash = require('express-flash'); //buat manggil flash

const db = require ('./connection/db'); //mengkoneksikan database
const upload = require('./middlewares/uploadFile');//mengkoneksikan dengan multer untuk penyimpanan file
db.connect (function (err, _,done) {
    if (err) throw err; //jika terjadi error akan mengeluarkan pesan errornya
    
    console.log('database connection success');
    done();
});
const app = express();
const PORT = 5008;
// Boolean => true/false
const isLogin = false; //true
let projects = [];

app.set('view engine', 'hbs');
app.use(flash());
app.use(
  session({
    secret: 'rahasia',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 150 },
  })
);

app.use('/public', express.static(__dirname + '/public')); //untuk mengakses direktori public
app.use('/uploads', express.static(__dirname + '/uploads')) //untuk mengakses direktori upload

app.use(express.urlencoded({ extended: false })); //mengakses data yang diberikan pengguna
//untuk melakukan route ke website
app.get('/', function (req, res) {
    console.log('Session isLogin: ', req.session.isLogin);
    console.log('Session user: ', req.session.user);

    db.connect(function (err, client, done) {
        //const query = `SELECT * FROM tb_project`;
        let query = '';

        if (req.session.isLogin) {
            query = `SELECT tb_project.*, tb_user.id AS "user_id", tb_user.name, tb_user.email 
                    FROM tb_project LEFT JOIN tb_user 
                    ON tb_user.id = tb_project.author_id 
                    WHERE tb_user.id=${req.session.user.id}`; //ketika user login,dia hanya dapat melihat project yang ia tambahkan dan apabila dia logout
        } else { 
            query = `SELECT tb_project.*, tb_user.id AS "user_id", tb_user.name, tb_user.email 
                    FROM tb_project LEFT JOIN tb_user
                    ON tb_user.id = tb_project.author_id`;// dia akan melihat seluruh project yang diinput seluruh pengguna
    }
        if (err) throw err;
        client.query(query, function (err, result) {
            if (err) throw err;
            console.log(query)
            console.log(result.rows);
            done(); 
            let data = result.rows;
            //perulangan //mengembalikan data/return
            let dataProjects = data.map(function (data) {

                let user_id = data.user_id;
                let name = data.name;
                let email = data.email;

                delete data.user_id;
                delete data.name;
                delete data.email;
                delete data.author_id;

                const PATH = 'http://localhost:5008/uploads/';// memberi akses terhadap file hasil upload
                return {
                    ...data,
                    isLogin: req.session.isLogin,
                    duration: getTimeDistance(data.startdate, data.enddate),
                    image: PATH + data.image,
                    author: {
                        user_id,
                        name,
                        email,
                    }
                };
            });
            res.render('index', { user: req.session.user, isLogin: req.session.isLogin, projects: dataProjects });
        });
        });
    });    

app.get('/project-delete/:id', function (req, res) {
    let id = req.params.id;

    db.connect(function (err, client, done) {
    if (err) throw err;
    const query = `DELETE FROM tb_project WHERE id=${id}`;

    client.query(query, function (err, result) {
        if (err) throw err;
        let data = result.rows;
        done();
    });
    });

    res.redirect('/');
    });
app.get('/addProject', function (req, res) {
    db.connect(function (err, client, done) {
        const query = `SELECT * FROM tb_user`;
        if (err) throw err;
        client.query(query, function (err, result) {
            if (err) throw err;
            console.log(result.rows);
            done(); 
            let data = result.rows;
            //perulangan //mengembalikan data/return
            let dataProjects = data.map(function (data) {
                return {
                    ...data,
                    isLogin: req.session.isLogin,
                };
            });
            res.render('addProject', { user: req.session.user, isLogin: req.session.isLogin, projects: dataProjects });
        });
    });    
});

app.post('/addProject', upload.single('image'), function (req, res) {
    //let id = req.params.id;
    let data = req.body;
    if (data.name == '' || data.startdate == '' || data.enddate ==''|| data.description == '' || data.image == '') {
        return res.redirect('/addProject');
    };
    console.log(data);
    db.connect(function (err, client, done) {
        if (err) throw err;
        const query = `INSERT INTO tb_project( project_name, startdate, enddate, description, nodejs, nextjs, reactjs, typescript, image, author_id) 
                        VALUES( '${data.project_name}', '${renderDate(new Date(data.startdate))}', '${renderDate(new Date(data.enddate))}', '${data.description}', ${checkboxRender(data.nodejs)}, ${checkboxRender(data.nextjs)}, ${checkboxRender(data.reactjs)}, ${checkboxRender(data.typescript)}, '${req.file.filename}',${req.session.user.id})`;

        client.query(query, function (err, result) {
        if (err) throw err;
        done();
        console.log(result.rows)
        let data = result.rows;
        });
    });
       res.redirect('/');
});

app.get('/projectDetail/:id', function (req, res) {
    let id = req.params.id;
        db.connect(function (err, client, done) {
            const query = `SELECT tb_project.*, tb_user.id AS "user_id", tb_user.name, tb_user.email 
                            FROM tb_project LEFT JOIN tb_user 
                            ON tb_user.id = tb_project.author_id 
                            WHERE tb_project.id=${id}`;;
            if (err) throw err;
            client.query(query, function (err, result) {
                if (err) throw err;
                console.log(result.rows);
                done(); 
                let data = result.rows[0];
                //perulangan //mengembalikan data/return
                
                data = {
                    ...data,
                    startdate: renderDate(data.startdate),
                    enddate: renderDate(data.enddate),
                    duration: getTimeDistance(data.startdate, data.enddate),
                    isLogin: req.session.isLogin,
                    author: {
                        user_id: data.user_id,
                        name: data.name,
                        email: data.email,
                    }
                };
                    delete data.user_id;
                    delete data.name;
                    delete data.email;
                    delete data.author_id;
                
                res.render('projectDetail', { projects: data, user: req.session.user, isLogin: req.session.isLogin});
            });
    });
});

app.get('/project-edit/:id', function (req, res) {
    let id = req.params.id;
    db.connect(function (err, client, done) {
        const query = `SELECT * FROM tb_project WHERE id=${id}`;
        if (err) throw err;
        client.query(query, function (err, result) {
            if (err) throw err;
             
            let data = result.rows[0];
            //perulangan //mengembalikan data/return
            data = {
                ...data,
                //untuk merender type data date
                startdate: renderFullDate(data.startdate),
                enddate: renderFullDate(data.enddate),
                isLogin: req.session.isLogin,
                image: PATH + data.image,
                //memanggil data checked
                nodejs: checkboxRender(data.nodejs),
                nextjs: checkboxRender(data.nextjs),
                reactjs: checkboxRender(data.reactjs),
                typescript: checkboxRender(data.typescript),
            };
            console.log(data)
            res.render('project-edit', { projects: data, user: req.session.user, isLogin: req.session.isLogin});
            done();
        });
});
});
app.post('/project-edit/:id', function (req, res) {
    let id = req.params.id;
    let data = req.body;

    console.log(data);
    db.connect(function (err, client, done) {
        if (err) throw err;
        const query = `UPDATE tb_project
        SET project_name='${data.project_name}', startdate='${renderDate(new Date(data.startdate))}', enddate='${data.enddate}', 
        description='${data.description}', nodejs=${checkboxRender(data.nodejs)}, nextjs=${checkboxRender(data.nextjs)}, reactjs=${checkboxRender(data.reactjs)}, 
        typescript=${checkboxRender(data.typescript)}, image='${data.image}'
        WHERE id=${id}`;
        console.log(query);
        client.query(query, function (err, result) {
        if (err) throw err;
        console.log(result.rows)

        let data = result.rows[0];
        //perulangan //mengembalikan data/return
        /*data = {
            ...data,
            //untuk merender type data date
            startdate: renderFullDate(data.startdate),
            enddate: renderFullDate(data.enddate),
            isLogin: req.session.isLogin,
            //memanggil data checked
            nodejs: checkboxRender(data.nodejs),
            nextjs: checkboxRender(data.nextjs),
            reactjs: checkboxRender(data.reactjs),
            typescript: checkboxRender(data.typescript),
        };
        */
        /*let dataProjects = data.map(function(data) {
            return {
                ...data
                isLogin: req.session.isLogin,
            }
        }) */
        done();
        });
    });

        res.redirect('/');
});

app.get('/contact', function (req, res) {
    db.connect(function (err, client, done) {
        const query = `SELECT * FROM tb_user`;
        if (err) throw err;
        client.query(query, function (err, result) {
            if (err) throw err;
            console.log(result.rows);
            done(); 
            let data = result.rows;
            //perulangan //mengembalikan data/return
            let dataProjects = data.map(function (data) {
                return {
                    ...data,
                    isLogin: req.session.isLogin,
                };
            });
            res.render('contact', { user: req.session.user, isLogin: req.session.isLogin, projects: dataProjects });
        });
    });    
});

app.get ('/register', function (req, res) {
    res.render('register');
});
app.post ('/register', function (req, res) {
    const data = req.body; //req data
    console.log(data);
    if (data.name == '' || data.email == '' || data.password == '') {
      req.flash('error', 'Please insert all field!');
      return res.redirect('/register');
    }
  
    const hashedPassword = bcrypt.hashSync(data.password, 10);
  
    db.connect(function (err, client, done) {
      if (err) throw err;
  
      const query = `INSERT INTO public.tb_user(name,email,password) VALUES ('${data.name}','${data.email}','${hashedPassword}')`;
        //eksekusi query
      client.query(query, function (err, result) {
        if (err) throw err;
        done();
        console.log(result.rows)
        /*let data = result.rows;
        data = {
            ...data,
        };*/
        req.flash('success', 'Success register your account!');
        res.redirect('/login');
      });
    });
});

app.get('/login', function (req, res) {
    res.render('login');
});
  
app.post('/login', function (req, res) {
    const data = req.body;
  
    if (data.email == '' || data.password == '') {
      req.flash('error', 'Please insert email/password!');
      return res.redirect('/login');
    }
  
    db.connect(function (err, client, done) {
      if (err) throw err;
  
      const query = `SELECT * FROM tb_user WHERE email = '${data.email}'`;
  
      client.query(query, function (err, result) {
        if (err) throw err;
        done();
    // Check email yang sudah terkoneksi database
      if (result.rows.length == 0) {
        req.flash('error', 'Email not found!');
        return res.redirect('/login');
      }

    // Check password yang sesuai dengan email diatas
      const isMatch = bcrypt.compareSync(
        data.password,
        result.rows[0].password
      );

      if (isMatch == false) {
        req.flash('error', 'Wrong Password!');
        return res.redirect('/login');
      }
    // Mendapatkan email dan password  
      req.session.isLogin = true;
      req.session.user = {
        id: result.rows[0].id,
        email: result.rows[0].email,
        name: result.rows[0].name,
      };
    // user= true diarahkan ke halaman home  
      res.redirect('/');
    });
  });
});

app.get('/logout', function (req, res) {
    req.session.destroy();
    res.redirect('/');
  });

app.listen(PORT, function () {
    console.log('Server Starting on PORT: ${PORT}');
});

//perhitungan durasi
function getTimeDistance(start, end) {
    let duration= ""
    let startdate = new Date(start)
    let enddate = new Date(end)
    let distance = enddate - startdate

    let yearDistance = Math.floor(distance / (12 * 4 * 7 * 24 * 60 * 60 * 1000))

    if (yearDistance != 0) {
        return duration += `${yearDistance} Tahun`
    } else {
        let monthDistance = Math.floor(distance / (4 * 7 * 24 * 60 * 60 * 1000))
        if (monthDistance != 0) {
            return duration += `${monthDistance} Bulan`
        } else {
            let weekDistance = Math.floor(distance / (7 * 24 * 60 * 60 * 1000))
            if (weekDistance != 0) {
                return duration += `${weekDistance} Minggu`
            } else {
                let dayDistance = Math.floor(distance / (24 * 60 * 60 * 1000))

                return duration += `${dayDistance} Hari`
            }
        }
    } 
}

//fungsi render fulltime dd/mm/yyyy
function renderFullDate(time) {

    let hari = [
        "00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31"
    ]

    let bulan = [
        '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12',
      ];

    let date = time.getDate();
    let monthIndex = time.getMonth();
    let year = time.getFullYear();

    let fullTime = `${year}-${bulan[monthIndex]}-${hari[date]}`;
    
    return fullTime;
}
//fungsi render fulltime dd month yyyy
function renderDate(time) {

    let hari = [
        "00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31"
    ]

    let bulan = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];

    let date = time.getDate();
    let monthIndex = time.getMonth();
    let year = time.getFullYear();

    let fullTime = `${hari[date]} ${bulan[monthIndex]} ${year}`;

    return fullTime;
}
//fungsi pengkondisian checkbox
function checkboxRender(technologies) {
    if (technologies == "true") {
        return true
    } else if (technologies != true) {
        return false
    }
}