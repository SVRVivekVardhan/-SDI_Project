const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//PORT Number --Default--
const PORT = 3000;

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',   // Replace with your MySQL username
    password: 'Vardhan@2003', // Replace with your MySQL password
    database: 'student_enroll_data'
});

connection.connect(err => {
    if (err) {
        console.error('Error connecting to the MYSQL database:', err);
        return;
    }
    console.log('Connected to the MYSQL database');
});

// Handle form submission
app.post('/register', (req, res) => {
    const { firstName, lastName, phoneNumber, email, dob, location } = req.body;

    // Insert data into the student_enroll table
    const query = 'INSERT INTO student_enroll (firstName, lastName, phoneNumber, email, dob, location) VALUES (?, ?, ?, ?, ?, ?)';
    connection.query(query, [firstName, lastName, phoneNumber, email, dob, location], (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).send('Error enrolling student data : ' + err.message);
        }
        // Log the success message and send a response to the client
        console.log('Data inserted successfully:', result);
        res.send('Registration successful!');
    });
});


app.use(express.static(path.join(__dirname, 'src')));

app.get('/students', (req, res) => {
    const query = 'SELECT * FROM student_enroll';
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching students:', err);
            res.status(500).send('Error fetching students.');
            return;
        }

        let studentList = '<h1 style="text-align:center;">Students Enrollment List</h1>';
        studentList += '<table border="1" Style="margin: 0 auto; border-collapse:collapse;">';
        studentList += '<tr><th>ID</th><th>FirstName</th><th>LastName</th><th>PhoneNumber</th><th>Email</th><th>Date Of Birth</th><th>Location</th><th>Actions</th></tr>';
        
        results.forEach(student => {
            studentList += `
                <tr> 
                <td>${student.id}</td>
                <td>${student.firstName}</td>
                <td>${student.lastName}</td>
                <td>${student.phoneNumber}</td>
                <td>${student.email}</td>
                <td>${student.dob}</td>
                <td>${student.location}</td>
                <td><a href="/edit/${student.id}">Edit</a></td>
                </tr>
            `;
        });
        
        studentList += '</table>';
        res.send(studentList);
    });
});


// Serve the edit form with pre-filled data
app.get('/edit/:id', (req, res) => {
    const studentId = req.params.id;

    const query = 'SELECT * FROM student_enroll WHERE id = ?';
    connection.query(query, [studentId], (err, results) => {
        if (err) {
            console.error('Error fetching student data:', err);
            res.status(500).send('Error fetching student data.');
            return;
        }

        if (results.length > 0) {
            const student = results[0];
            res.send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Edit Student Enrolling</title>
                <style>
                body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                display: grid;
                justify-content: center;
                align-items: center;
                height: 100vh;
                background-color: #13ef4a;
                }
                .container {
                width: 500px;
                padding: 50px;
                background-color: #f19812;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                border-radius: 10px;}
                h2 {
                margin-bottom: 20px;
                text-align: center;
                }
                label {
                display: block;
                margin-bottom: 5px;
                font-weight: bold;
                }
                input[type="text"], input[type="email"], input[type="tel"], input[type="date"] {
                width: 100%;
                padding: 10px;
                margin-bottom: 15px;
                border: 1px solid #ccc;
                border-radius: 4px;
                font-size: 16px;
                }
                .buttons {
                display: flex;
                justify-content: space-between;
                }
                input[type="submit"], input[type="reset"], input[type="button"]{
                background-color: #4CAF50;
                color: white;
                padding: 10px 20px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 16px;
                }
                input[type="button"] {
                background-color: black;
                }
                input[type="reset"] {
                background-color: #f44336;
                }
                input[type="submit"]:hover, input[type="reset"]:hover,input[type="button"] {
                opacity: 0.8;
                }
                .details {
                margin-top: 20px;
                padding: 20px;
                background-color: #f9f9f9;
                border-radius: 8px;
                display: none;
                }
                </style>
                </head>
                <body>
                <div class="container">
                <img src="images/Stu_Reg_Icon.JPG" alt="Student Registration Icon" width="100px" height="100px" style="margin-left: auto; margin-right: auto; display: block;">
                <h2>Edit Student Enrolling</h2>
                <form id="editRegistrationForm" action="/update" method="POST" target="_self">
                <input type="hidden" id="id" name="id" value="${student.id}">
                
                <label for="firstName">First Name</label>
                <input type="text" id="firstName" name="firstName" value="${student.firstName}" placeholder="First Name" required>
                
                <label for="lastName">Last Name</label>
                <input type="text" id="lastName" name="lastName" value="${student.lastName}" placeholder="Last Name" required>
                
                <label for="phoneNumber">Phone Number</label>
                <input type="tel" id="phoneNumber" name="phoneNumber" pattern="[0-9]{10}" title="Please enter a valid 10-digit phone number" value="${student.phoneNumber}" placeholder="Phone Number" required>
                
                <label for="email">Email</label>
                <input type="email" id="email" name="email"  pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$" title="Please enter a valid email address" value="${student.email}" placeholder="Date Of Birth" required>
                
                <label for="dob">Date Of Birth</label>
                <input type="date" id="dob" name="dob" value="${student.dob}" placeholder="Date Of Birth" required>
                
                <label for="loction">Location</label>
                <input type="text" id="location" name="location" value="${student.location}" placeholder="Location" required>
                
                <div class="buttons">
                <input type="submit" value="Update">
                <a href="index.html"><input type="button" value="Go Back To Home" style="color: white;"></a>
                <input type="reset" value="Reset">
                </div>
                </form>
                </div>
                </body>
                </html>
            `);
        } else {
            res.send('Student details is not found!');
        }
    });
});

// Handle form submission for updating the student data
app.post('/update', (req, res) => {
    const { id, firstName, lastName, phoneNumber, email, dob, location } = req.body;

    const query = 'UPDATE student_enroll SET firstName = ?, lastName = ?, phoneNumber = ?, email = ?, dob = ?, location = ? WHERE id = ?';
    connection.query(query, [firstName, lastName, phoneNumber, email, dob, location, id], (err, results) => {
        if (err) {
            console.error('Error updating student data:', err);
            res.status(500).send('Error updating student data.');
            return;
        }
        res.send('Student data updated successfully!');
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
