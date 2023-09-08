push to aws ecr for staging 
aws ecr get-login-password --region eu-west-1 | docker login --username AWS --password-stdin 223306416160.dkr.ecr.eu-west-1.amazonaws.com
docker build . -t 223306416160.dkr.ecr.eu-west-1.amazonaws.com/among-us:latest
docker push 223306416160.dkr.ecr.eu-west-1.amazonaws.com/among-us:latest


local development 
docker build . -t gamesocket:latest
docker run -p 3000:3000 gamesocket:latest