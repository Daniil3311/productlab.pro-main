FROM nginx:latest

COPY ./build /var/www/

COPY GeoIP.dat /etc/nginx/GeoIP.dat
COPY GeoIPCity.dat /etc/nginx/GeoIPCity.dat
COPY nginx.conf /etc/nginx/nginx.conf
COPY .htpasswd /etc/nginx/htpasswd
COPY proxy_params /etc/nginx/proxy_params

