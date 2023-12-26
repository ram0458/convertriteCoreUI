####STARTS###
FROM node
#RUN npm install -g @oracle/ojet-cli 
#RUN npm install -g @oracle/oraclejet-tooling 
#RUN npm install @oracle/oraclejet-tooling --save
#RUN ojet restore
#docker build -t eugeneflexagon/ojetbuilder .
# Create an image from a "builder" Docker image
FROM eugeneflexagon/ojetbuilder as build-container
#COPY . .
WORKDIR /RiteClientApp
RUN chmod -R a+rwx /RiteClientApp
# Copy all sources inside the new image
COPY ./ /RiteClientApp/
RUN npm install -g @oracle/ojet-cli
RUN npm install  

# Build the appliaction. As a result this will produce web folder.
RUN ojet build


# Create another Docker image which runs Jet application
# It contains Nginx on top of Alpine and our Jet appliction (web folder)
# This image is the result of the build and it is going to be stored in Docker Hub
FROM nginx:1.10.2-alpine
COPY --from=build-container /RiteClientApp/web /home/ubuntu/installations/SourceCode/AdminUI/ClientAdmin
EXPOSE 2500/tcp

