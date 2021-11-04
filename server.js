/*Setting the variables for the other files and requiring inquire */
const connection = require('./config/connection');
const inquirer = require('inquirer');
const cTable = require('console.table');
const validate = require('./validate');



//Questions to gether employee information
const userInput = () => {
    inquirer.prompt([
    {
        type: 'list',
        name: 'options',
        message: "What would you like to do?",
        choices: ['View all Employees',
                    'Add Employee',
                    'Update Employee Role',
                    'View All Roles',
                    'Add Role',
                    'View All Departments',
                    'Add Department'
            ]
    }
])
.then((answers) => {
    const {options} = answers;
    //console.log("Hi2");
    if (options === 'View all Employees') {
        viewAllEmployees();
    }

    if (options === 'Add Employee') {
        addEmployee();
    }

    if (options === 'Update Employee Role') {
        updateEmployeeRole();
    }
    if (options === 'View All Roles') {
        viewAllRoles();
    }

    if (options === 'Add Role') {
        addRole();
    }

    if (options === 'View All Departments') {
        viewAllDepartments();
    }

    if (options === 'Add Department') {
        addDepartment();
    }

}).catch(err => console.log('err: ', err))
};
//console.log("Hi");
//View all employees
const viewAllEmployees = () => {
    let sql =     `SELECT employee.id, 
    employee.first_name, 
    employee.last_name, 
    role.title, 
    department.department_name AS 'department', 
    role.salary
    FROM employee, role, department 
    WHERE department.id = role.department_id 
    AND role.id = employee.role_id
    ORDER BY employee.id ASC`;
connection.query(sql, (error, response) => {
if (error) throw error;
console.table(response);
userInput();
});
};


//View all roles
const viewAllRoles = () => {
    const sql =     `SELECT role.id, role.title, department.department_name AS department
    FROM role
    INNER JOIN department ON role.department_id = department.id`;
    connection.query(sql, (error, response) => {
    if (error) throw error;
    //console.log(response);
    console.table(response);
    userInput();
    });
    };
        
    

//View all departments
const viewAllDepartments = () => {
    const sql =   `SELECT department.id AS id, department.department_name AS department FROM department`; 
connection.query(sql, (error, response) => {
if (error) throw error;
console.table(response);
userInput();
});
};

//Add a new employee
const addEmployee = () => {
    inquirer.prompt([
      {
        type: 'input',
        name: 'fistName',
        message: "What is the employee's first name?",
        validate: addFirstName => {
          if (addFirstName) {
              return true;
          } else {
              console.log('Please enter a first name');
              return false;
          }
        }
      },
      {
        type: 'input',
        name: 'lastName',
        message: "What is the employee's last name?",
        validate: addLastName => {
          if (addLastName) {
              return true;
          } else {
              console.log('Please enter a last name');
              return false;
          }
        }
      }
    ])
      .then(answer => {
      const crit = [answer.fistName, answer.lastName]
      const roleSql = `SELECT role.id, role.title FROM role`;
      connection.query(roleSql, (error, data) => {
        if (error) throw error; 
        const roles = data.map(({ id, title }) => ({ name: title, value: id }));
        inquirer.prompt([
              {
                type: 'list',
                name: 'role',
                message: "What is the employee's role?",
                choices: roles
              }
            ])
              .then(roleChoice => {
                const role = roleChoice.role;
                crit.push(role);
                const managerSql =  `SELECT * FROM employee`;
                connection.query(managerSql, (error, data) => {
                  if (error) throw error;
                  const managers = data.map(({ id, first_name, last_name }) => ({ name: first_name + " "+ last_name, value: id }));
                  inquirer.prompt([
                    {
                      type: 'list',
                      name: 'manager',
                      message: "Who is the employee's manager?",
                      choices: managers
                    }
                  ])
                    .then(managerChoice => {
                      const manager = managerChoice.manager;
                      crit.push(manager);
                      const sql =   `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                                    VALUES (?, ?, ?, ?)`;
                      connection.query(sql, crit, (error) => {
                      if (error) throw error;
                      console.log("Employee has been added!")
                      viewAllEmployees();
                });
              });
            });
          });
       });
    });
  };

//Add a new role
const addRole = () => {
    const sql = 'SELECT * FROM department'
    connection.query(sql, (error, response) => {
        if (error) throw error;
        let deptNamesArray = [];
        response.forEach((department) => {deptNamesArray.push(department.department_name);});
        deptNamesArray.push('Create Department');
        inquirer
          .prompt([
            {
              name: 'departmentName',
              type: 'list',
              message: 'Which department is this new role in?',
              choices: deptNamesArray
            }
          ])
          .then((answer) => {
            if (answer.departmentName === 'Create Department') {
              this.addDepartment();
            } else {
              addRoleResume(answer);
            }
          });
  
        const addRoleResume = (departmentData) => {
          inquirer
            .prompt([
              {
                name: 'newRole',
                type: 'input',
                message: 'What is the name of your new role?',
                validate: validate.validateString
              },
              {
                name: 'salary',
                type: 'input',
                message: 'What is the salary of this new role?',
                validate: validate.validateSalary
              }
            ])
            .then((answer) => {
              let createdRole = answer.newRole;
              let departmentId;
  
              response.forEach((department) => {
                if (departmentData.departmentName === department.department_name) {departmentId = department.id;}
              });
  
              let sql =   `INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`;
              let crit = [createdRole, answer.salary, departmentId];
  
              connection.query(sql, crit, (error) => {
                if (error) throw error;
                console.log('Role successfully created!');
                viewAllRoles();
              });
            });
        };
      });
    };


//Add a new department
const addDepartment = () => {
    inquirer
      .prompt([
        {
          name: 'newDepartment',
          type: 'input',
          message: 'What is the name of your new Department?',
          validate: validate.validateString
        }
      ])
      .then((answer) => {
        let sql =     `INSERT INTO department (department_name) VALUES (?)`;
        connection.query(sql, answer.newDepartment, (error, response) => {
          if (error) throw error;
          console.log(answer.newDepartment + ` Department successfully created!`);
          viewAllDepartments();
        });
      });
};


// Update an Employee's Role
const updateEmployeeRole = () => {
    let sql =       `SELECT employee.id, employee.first_name, employee.last_name, role.id AS "role_id"
                    FROM employee, role, department WHERE department.id = role.department_id AND role.id = employee.role_id`;
    connection.query(sql, (error, empResponse) => {
      if (error) throw error;
      let employeeNamesArray = [];
      empResponse.forEach((employee) => {employeeNamesArray.push(`${employee.first_name} ${employee.last_name}`);});

      let sql =     `SELECT role.id, role.title FROM role`;
      connection.query(sql, (error, response) => {
        if (error) throw error;
        let rolesArray = [];
        response.forEach((role) => {rolesArray.push(role.title);});

        
        inquirer
          .prompt([
            {
              name: 'chosenEmployee',
              type: 'list',
              message: 'Which employee has a new role?',
              choices: employeeNamesArray
            },
            {
              name: 'chosenRole',
              type: 'list',
              message: 'What is their new role?',
              choices: rolesArray
            }
          ])
          .then((answer) => {
            let newTitleId;
            let employeeId;

            response.forEach((role) => {
              if (answer.chosenRole === role.title) {
                newTitleId = role.id;
                //console.log(role.id);
              }
            });

            empResponse.forEach((employee) => {
              console.log(employee);
              if (
                answer.chosenEmployee ===
                //answer.chosenEmployee
                `${employee.first_name} ${employee.last_name}`
              ) {
                employeeId = employee.id;
                //employeeId = answer.chosenEmployee.id;
                //employeeId = 17;
                console.log(employee.id);
                //console.log(employee);
                //console.log(answer.chosenEmployee);
                //console.log(answer);
                console.log(employeeId);
                //console.log(answer.chosenRole);
                //console.log(answer.chosenEmployee.id);
                //console.log("HIIIII");
                console.log(employee.first_name);
                console.log(employee.last_name);
              }
            });

            let sqls =    `UPDATE employee SET employee.role_id = ? WHERE employee.id = ?`;
            connection.query(
              sqls,
              [newTitleId, employeeId],
              (error) => {
                if (error) throw error;
                console.log(`Employee Role Updated`);
                console.log(newTitleId);
                console.log(employeeId);
                console.log(answer.chosenEmployee);
                //console.log(`${employee.first_name} ${employee.last_name}`);
                userInput();
              }
            );
          });
      });
    });
  };

userInput();







