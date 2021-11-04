INSERT INTO department(department_name)
VALUES("Engineering"), ("Sales"), ("Finance"), ("Legal"), ("Marketing");

INSERT INTO role(title, salary, department_id)
VALUES("Engineer", 85000, 1), 
("Senior Engineer", 125000, 1), 
("Manager", 150000, 1 | 2 | 3), 
("Financial Analyst", 70000, 3), 
("Product Manager", 155000, 5);

INSERT INTO employee(first_name, last_name, role_id, manager_id)
VALUES ('John', 'Smith', 1, NULL), 
('James', 'Smith', 1, null), 
('Alex', 'Anderson', 1, 2), 
('Jimmy', 'Jones', 2, 2), 
('Max', 'Powers', 4, null);