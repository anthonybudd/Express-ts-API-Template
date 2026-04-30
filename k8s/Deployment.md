# Deployment


### Namespace
Set `KUBECONFIG` and create a namespace.

```sh
export KUBECONFIG=/path/to/kubeconfig.yaml

kubectl create namespace express-api`

kubectl config set-context --current --namespace=express-api
```


### JWT Secrets
Create a public and private RSA key for JWT signing.

```sh
cd /tmp

openssl genrsa -out private.pem 2048

openssl rsa -in private.pem -outform PEM -pubout -out public.pem

kubectl --namespace=express-api create secret generic express-api-jwt-secret \
    --from-file=./private.pem \
    --from-file=./public.pem

rm ./private.pem ./public.pem 
```


### Env Secrets
Make a new secrets config file and add your secrets

```sh
cp secrets.example.yml secrets.yml

nano secrets.yml

kubectl apply -f ./k8s/secrets.yml
```


### Build & Push Container Image
```sh
docker buildx build --platform linux/amd64 --push -t registry.digitalocean.com/express-api/app:latest
```

### Create Deployment
```sh
kubectl apply -f ./k8s/api.deployment.yml \
  -f ./k8s/api.service.yml 
```

### Build & Deploy
```sh
export KUBECONFIG=/path/to/kubeconfig.yaml && \
docker buildx build --platform linux/amd64 --push -t registry.digitalocean.com/express-api/app:latest . && \
kubectl rollout restart deployment express-api && \
kubectl get pods -w
```


### Migrate
Migrate the DB

```sh
export POD="$(kubectl --namespace=express-api get pods --field-selector=status.phase==Running --no-headers -o custom-columns=":metadata.name")"

kubectl --namespace=express-api exec -ti $POD -- /bin/bash -c 'sequelize db:migrate && sequelize db:seed:all'
```

### Useful K8S commands
##### Set $POD as the name of the pod in K8s
```sh
export POD="$(kubectl --namespace=express-api get pods --field-selector=status.phase==Running --no-headers -o custom-columns=":metadata.name")"
```

##### Execute bash script inside running container
```sh
kubectl exec -ti $POD -- /bin/bash -c "sequelize db:migrate"
```

##### Get logs for $POD
```sh
kubectl logs $POD
```
