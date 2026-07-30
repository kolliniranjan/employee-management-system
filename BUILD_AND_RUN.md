# How to Build & Run Locally

## Prerequisites
1. JDK 17 installed (`java -version` should show 17.x)
2. Maven 3.8+ installed (`mvn -version`)
3. MySQL 8.x running locally on port 3306

## Steps

### 1. Create the database user/credentials
Edit `src/main/resources/application.properties` and set your real MySQL
username/password:
    spring.datasource.username=root
    spring.datasource.password=<your_actual_password>

(The database itself, `employee_management_db`, will be auto-created thanks
to `createDatabaseIfNotExist=true` in the JDBC URL — you do NOT need to
manually create it.)

### 2. Build the project
    mvn clean install

Expected result: `BUILD SUCCESS`, and a jar produced at
`target/employee-management-system.jar`

### 3. Run the project
    mvn spring-boot:run

Expected console output includes:
    Tomcat started on port(s): 8080 (http)
    Started EmployeeManagementSystemApplication in X.XXX seconds

### 4. Verify
Open: http://localhost:8080
(No endpoints exist yet — Phase 1 only sets up infrastructure — so you'll
see a Whitelabel 404 page. That is EXPECTED and CORRECT at this stage; it
proves Spring Boot's DispatcherServlet is running.)
