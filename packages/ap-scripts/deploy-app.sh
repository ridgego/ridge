## 应用修改以下参数
APP_NAME=ikun
BRANCH=BranchV8.2.100.1
APP_DEPLOY_URL=https://10.10.3.12:4999

rm -rf /opt/local/$APP_NAME

mkdir /opt/local/$APP_NAME

cd /opt/local/$APP_NAME

wget --no-check-certificate -O $APP_NAME.gz.tar https://10.10.3.12:4999/api/fre/app/export/$APP_NAME?branch=$BRANCH

curl https://10.10.3.12:4999/api/fre/app/trash -X POST -H "Content-Type:application/json" -d '{"name":"ikun"}' -v -k

curl -F "file=@ikun.gz.tar" -X POST https://10.10.3.12:4999/api/fre/app/import -v -k

