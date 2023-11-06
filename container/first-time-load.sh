#USAGE for docker 
#    sh ./first-time-load.sh docker
#USAGE for podman
#    sh ./first-time-load.sh podman

echo "Selected: $1"
if [ $1 = "podman" ]; then
	echo "Running Podman Build..."
	podman-compose up -d
	podman exec -it pkmongo mongoimport --db shop --collection products --type json --file products.json --jsonArray
elif [ $1 = "docker" ]; then
	echo "Running Docker Build"
	docker-compose -f $PWD/docker-compose-docker.yml up -d
	docker exec -it pkmongo mongoimport --db shop --collection products --type json --file products.json --jsonArray
else
	echo "ERROR: cannot find builder. You can only use 'podman' or 'docker'"

fi

#Podman needs to be installed
#echo "Running Podman Build..."
#podman-compose up -d
#podman exec -it pkmongo mongoimport --db shop --collection products --type json --file products.json --jsonArray
#Docker needs to be installed
#echo "Running Docker Build"
#docker-compose up
#docker exec -it pkmongo mongoimport --db shop --collection products --type json --file products.json --jsonArray

echo "Build Complete."