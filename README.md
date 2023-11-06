# MLE - Baja La Bruja
Shopping cart for Baja La Bruja Vintage business.



Installation


CONTAINER ONLY
NOTE: you must have podman and podman-compose installed. 
    - Instructions for podman available here: https://podman.io/docs/installation    
    - Instructions for podman-compose available here: https://access.redhat.com/discussions/6979552



Inside the /container directory run
sh ./first-time-load.sh

This will trigger two containers (set to Podman currently). Images sitting under quay.io/pknezevich/mle

./container/buildassets are the artifacts responsible for the initial container build and are reference only.