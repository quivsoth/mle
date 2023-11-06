#Uncomment your container management tool

#Podman needs to be installed
echo "Running Podman Build..."
podman-compose up -d
podman exec -it pkmongo mongoimport --db shop --collection products --type json --file products.json --jsonArray


#Docker needs to be installed
#echo "Running Docker Build"
#docker-compose up
#docker exec -it pkmongo mongoimport --db shop --collection products --type json --file products.json --jsonArray

echo "Build Complete."