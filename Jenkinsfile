pipeline {
   agent any
   tools { nodejs 'node20' }
   stages {
      stage('Checkout') {
         steps { checkout scm }
      }
      stage('Node') {
         steps { sh 'node -v && npm -v' }
      }
      stage('Static Analysis') {
         steps {
            script { scannerHome = tool 'sonar-scanner' }
            withSonarQubeEnv('sonarqube') {
               sh "${scannerHome}/bin/sonar-scanner"
            }
         }
      }
   }
   post {
      always { deleteDir() }
   }
}