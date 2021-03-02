Zipi-SmokeTest: 
====================
Zipi-SmkTest: Is a service developed to avoid sporadic failures in development environments. Applying Smoke-Test techniques. The service performs verifications of environments composed of micro-services. It is a great alternative to remediate sporadic failures that cause wasted time in later stages of development.

Keyworld: Smoke Test, Sporadic failures, automatic, test

Content:
===================

* [Smoke Test Coverage](#markdown-header-span-elements) 
* [How use the service with Docker](#markdown-header-span-elements)
	* [Run service](#markdown-header-emphasis)
	* [Run example of smoke-test](#markdown-header-emphasis)
		* [Case: Pase Test](#markdown-header-emphasis)
* [Use of Enviroment variable in Zipi-Smk-Service](#markdown-header-emphasis)
	* [General settings](#markdown-header-emphasis)
	* [Criterial settings](#markdown-header-emphasis)
	

# Smoke Test Coverage:  

| Test Coverage                       | Docker                       | Kubernetes  |
| :---                                | :---                         | :---:       | 
| Check TCP-Network                   | OK                           |  -          |
| Check Volume Access                 | OK                           |  -          |
| Check Logs                          | OK                           |  -          |
| Check EndPoints                     | OK                           |  -          |
| Check Cross Connection              | OK                           |  -          |
| Check List of EndPoints             | OK                           |  -          |
| Monitoring Resources                | OK                           |  -          |



# How use the service with Docker

## Run service 
     docker run -d --name=smktest cannit/zipi_smktest:latest
		
## Run example of smoke-test
You can use the following example to understand how it works in service. In this guide you will find two examples, one of a fault environment where the Smoke-Test service detects the problem and makes a report. The other example shows a case where the problem has been solved and the service passes the Smoke-test.

### Case: Pase Test
In this case, two services are shown that have to be connected in order to function. The first service is a database (MongoDB) and the second service is the Django backend, with a JWT authentication service.
Is necessary for this example suite create one file with the name docker-compose.yml


     docker-compose -f example_use_1/docker-compose_example_no1.yml up -d

#### 1) Run example_1 using docker-compose.yml (PASS TEST)
# docker-compose.yml

    version: '3.7'
    services:
      database:
        image: mongo:latest
        container_name: database
        environment:
          MONGO_INITDB_ROOT_USERNAME: admin
          MONGO_INITDB_ROOT_PASSWORD: admin
          MONGODB_USERNAME: admin
          MONGODB_PASSWORD: admin
          MONGODB_DATABASE: admin
        ports:
          - 27017:27017
        networks:
          - host      

      backend:
        image: cannit/zipi_backend_example_1:latest
        container_name: backend
        ports:
          - 8000:8000
        depends_on:
          - database  
        environment:
          - DJANGO_ENV=docker  
        command:  >
              bash -c "python manage.py migrate
              && python manage.py shell -c \"from django.contrib.auth.models import User; User.objects.filter(username='admin1').exists() or User.objects.create_superuser('admin', 'admin1@example.com', 'admin')\"
              && python manage.py runserver 0.0.0.0:8000"
        networks:
          - host

      smoke-test: 
        image:  smktest2021/smktest:latest
        container_name: smoke-test
        depends_on:
          - backend
        privileged: true  
        volumes:
          - /var/run/docker.sock:/var/run/docker.sock
        environment:
          - PROJECT_NAME=example2_how_use_criterial
          - ZIPI_CONFIGURATION=env_variable
          - MODE_CONNECT=docker
          - SMOKE_TEST_CRITERIA=Service_Protocol_Coverage    
          - RETRIES_NUMBER=0
          - TO_BREAK_PIPELINE=false
          - ENDPOINT_HOST=http://backend:8000
          - SERVICES_NAME=['database','backend']
          - LOGS_ERROR_EXCEPTION="['Watching for file changes with StatReloader']"
          - LOG_NUMBER_OF_LINE=5
          - LOG_KEYWORD=['error','TypeError']
          - CLEAN_LOGS_REPORTS_NUMBER=4
          - WAIT_TIME_SECONDS=10
          - MONITORING_TIME=10
        networks:
          - host 
    networks:
      host:

This example recreates a stability problem in the absence of the database. The smokeTest service finds the fault.
#### 2) Run example_2 using docker-compose.yml (Fail Test)

    version: '3.7'
    services:   
      backend:
        image: cannit/zipi_backend_example_1:latest
        container_name: backend
        ports:
          - 8000:8000 
        environment:
          - DJANGO_ENV=docker  
        command:  >
              bash -c "python manage.py migrate
              && python manage.py shell -c \"from django.contrib.auth.models import User; User.objects.filter(username='admin1').exists() or User.objects.create_superuser('admin', 'admin1@example.com', 'admin')\"
              && python manage.py runserver 0.0.0.0:8000"
        networks:
          - host

      smoke-test: 
        image:  smktest2021/smktest:latest
        container_name: smoke-test
        depends_on:
          - backend
        privileged: true  
        volumes:
          - /var/run/docker.sock:/var/run/docker.sock
        environment:
          - PROJECT_NAME=example2_how_use_criterial
          - ZIPI_CONFIGURATION=env_variable
          - MODE_CONNECT=docker
          - SMOKE_TEST_CRITERIA=Service_Protocol_Coverage    
          - RETRIES_NUMBER=0
          - TO_BREAK_PIPELINE=false
          - ENDPOINT_HOST=http://backend:8000
          - SERVICES_NAME=['database','backend']
          - LOGS_ERROR_EXCEPTION="['Watching for file changes with StatReloader']"
          - LOG_NUMBER_OF_LINE=5
          - LOG_KEYWORD=['error','TypeError']
          - CLEAN_LOGS_REPORTS_NUMBER=4
          - WAIT_TIME_SECONDS=10
          - MONITORING_TIME=10
        networks:
          - host 
    networks:
      host:
## Use of Enviroment variable in Zipi-Smk-Service

The following are the environment variables that can be modified in the service.

### General settings
This is the segment of environment variables that can be used in the general configuration of the service.

| ENVIROMENT VARIABLE                | Default Value | Description  |
| :---                                | :---          | :---         | 
| ZIPI_CONFIGURATION                  | env_variable  |  You can select whether you want to read the configuration data from the config.json file (config_file) or from environment variables.          |
| MODE_CONNECT                        | docker        | Is possible select connect mode (docker or kubernetes)|
| WAIT_TIME_SECONDS                   | 10            | Waiting time for downed services | 
| RETRIES_NUMBER                      | 3             | Number of times the test will be repeated before rhombing the pipeline. To avoid the flaky test|
| TO_BREAK_PIPELINE                   | true         | Break the pipeline after finding a fault.
| SMOKE_TEST_CRITERIA                 | SERVICE_AVAILABILITY | Select the available criteria to apply to your test case. It can be documented from the Criteria in the Smoke-Test Criteria section |
| MONITORING_TIME                     | 20  | Time (seconds) to monitor resources before starting the test. Only available for the Docker version at this time. | 

### Criterial settings

These are the options directly related to the criteria that you can use.


| ADEQUACY CRITERIA       | TEST CASES       |  Description  |
| :---                    | :---             | :---          |
| Execution_unit_coverage | SERVICES_UP      |  This criterion requires the test suite to run the execution units,possibly checking their status, either directly by accessing the unitor indirectly by exploiting the features of the underlying infrastructure, if available |
| Service coverage        | PING_TCP_NETWORK | This criterion requires the test suite to check if it is possible to establish a connection with each service. Of course the test may also exercise the service, but for the purpose of service coverage establishing a connect is enough to guarantee that the service can be successfully reached through the network |
| Service Protocol Coverage | PING_TCP_NETWORK, LOG_CHECK, ACTIVATE_ENDPOINT |This criterion requires the test suite to check that each service is responding to the supported protocols |
| Resources_Up | VOLUME_PERMITS | This criterion requires the test suite to check that each resource is available, that is, it is accessible and usable |
| Everything_Up | PING_TCP_NETWORK, VOLUME_PERMITS, LOG_CHECK, ACTIVATE_ENDPOINT | The test suite satisfies the everything up criterion if it satisfies both the service protocol coverage and the resource coverage.The everything up criterion guarantees that all services and re-sources of the system are up and running |
| Endpoints_coverage | ACTIVATE_ALL_ENDPOINT, LOG_CHECK | This criterion requires the test suite to sample every specified ready only endpoint to assure that the service is providing its functionalities. This level of testing is interesting when there is the intention to check the capability of the service to operate beyond the basic capability to open connections on the supported protocols. |
| Full_Service_Coverage | PING_TCP_NETWORK, LOG_CHECK, VOLUME_PERMITS, ACTIVATE_ALL_ENDPOINT | The test suite satisfies the full service coverage if it satisfies both everything up and endpoints coverage.This level of coverage is similar to Everything Up, but services are fully checked also considering their read-only endpoints. |
| Dependency_coverage | CROSS_LOGS | This criterion requires the test suite to stimulate every depen-dency to make sure connections between services and connectionsbetween services and resources are correctly established |      
| System_coverage | PING_TCP_NETWORK, LOG_CHECK, VOLUME_PERMITS, ACTIVATE_ALL_ENDPOINT, CROSS_LOGS | he test suite satisfies the system coverageif it satisfies both full service coverage and dependency coverage | 
