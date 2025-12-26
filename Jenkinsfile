pipeline {
    agent any

    environment {
        
        DOCKER_IMAGE = "lusunguskillset/porthole-backend"
        DOCKER_TAG = "latest"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Install Dependencies') {
            steps {
                dir('backend') {
                    script {
                        if (fileExists('package-lock.json')) {
                            sh 'npm ci'
                        } else {
                            sh 'npm install'
                        }
                    }
                }
            }
        }
      stage('Test') {
    steps {
        dir('backend') {
            sh '''
              if npm run | grep -q "test"; then
                npm test
              else
                echo "No tests defined, skipping test stage"
              fi
            '''
        }
    }
}
        stage('Build Docker Image') {
            steps {
                script {
                    sh 'docker build -t $DOCKER_IMAGE:$DOCKER_TAG ./backend'
                }
            }
        }
        stage('Push Docker Image') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', usernameVariable: 'DOCKERHUB_USER', passwordVariable: 'DOCKERHUB_PASS')]) {
                    sh 'echo $DOCKERHUB_PASS | docker login -u $DOCKERHUB_USER --password-stdin'
                    sh 'docker push $DOCKER_IMAGE:$DOCKER_TAG'
                }
            }
        }
        // stage('Deploy to Production') {
        //     steps {
        //         //deployment steps here, e.g., SSH to server and pull new image, restart container, etc.
        //         echo 'Deploying to production...'
        //     }
        // }
    }
    post {
        always {
            cleanWs()
        }
        failure {
            echo 'Build failed! Please check the Jenkins logs for details.'
        
        }
    }
}
