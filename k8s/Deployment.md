# Deployment


export KUBECONFIG=/Users/anthonybudd/Development/htv-dev-test/kubeconfig.yaml



### Namespace
Create a namespace

```sh
kubectl --kubeconfig=./kubeconfig.yml create namespace express-api`

kubectl config set-context --current --namespace=express-api
```


### JWT Secrets
```sh
openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -outform PEM -pubout -out public.pem
kubectl --kubeconfig=./kubeconfig.yml --namespace=express-api create secret generic express-api-jwt-secret \
    --from-file=./private.pem \
    --from-file=./public.pem
rm ./private.pem ./public.pem 
```


### Env Secrets
Make a new secrets config file and add your secrets

```sh
cp secrets.example.yml secrets.yml
```

Create the secrets using

```sh
kubectl --kubeconfig=./kubeconfig.yml apply -f ./k8s/secrets.yml
```


### Build & Push Container Image
```sh
docker buildx build --platform linux/amd64 --push -t registry.digitalocean.com/express-api/app:latest
```

### Create Deployment
```sh
kubectl --kubeconfig=./kubeconfig.yml apply -f ./k8s/api.deployment.yml
kubectl --kubeconfig=./kubeconfig.yml apply -f ./k8s/api.service.yml
```

### Deploy
```sh
docker buildx build --platform linux/amd64 --push -t registry.digitalocean.com/express-api/app:latest . && 
kubectl --kubeconfig=./kubeconfig.yml rollout restart deployment express-api && \
kubectl --kubeconfig=./kubeconfig.yml get pods -w
```


### Migrate
Migrate the DB
```sh
export POD="$(kubectl --kubeconfig=kubeconfig.yml --namespace=express-api get pods --field-selector=status.phase==Running --no-headers -o custom-columns=":metadata.name")"

kubectl --kubeconfig=./kubeconfig.yml --namespace=express-api exec -ti $POD -- /bin/bash -c 'sequelize db:migrate && sequelize db:seed:all'
```

### SSL
DigitalOcean tutorial: [https://www.digitalocean.com/community/tutorials/how-to-set-up-an-nginx-ingress-with-cert-manager-on-digitalocean-kubernetes](https://www.digitalocean.com/community/tutorials/how-to-set-up-an-nginx-ingress-with-cert-manager-on-digitalocean-kubernetes)

```sh
kubectl --kubeconfig=./kubeconfig.yml apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.1.1/deploy/static/provider/do/deploy.yaml

kubectl --kubeconfig=./kubeconfig.yml get pods -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx --watch

kubectl --kubeconfig=./kubeconfig.yml apply -f ./k8s/api.ingress.yml

kubectl --kubeconfig=./kubeconfig.yml apply -f https://github.com/jetstack/cert-manager/releases/download/v1.7.1/cert-manager.yaml

kubectl --kubeconfig=./kubeconfig.yml get pods --namespace cert-manager

kubectl --kubeconfig=./kubeconfig.yml create -f k8s/prod-issuer.yml
```

### Useful K8S commands
##### Set $POD as the name of the pod in K8s
```sh
export POD="$(kubectl --kubeconfig=kubeconfig.yml --namespace=express-api get pods --field-selector=status.phase==Running --no-headers -o custom-columns=":metadata.name")"
```

##### Execute bash script inside running container
```sh
kubectl --kubeconfig=kubeconfig.yml exec -ti $POD -- /bin/bash -c "sequelize db:migrate"
```

##### Get logs for $POD
```sh
kubectl --kubeconfig=kubeconfig.yml logs $POD
```

##### Create a cron job
```sh
kubectl --kubeconfig=kubeconfig.yml create job --from=cronjob/express-api-cron-job express-api-cron-job
```

##### Delete all faild cron jobs
```sh
kubectl --kubeconfig=kubeconfig.yml delete jobs --field-selector status.successful=0
```
