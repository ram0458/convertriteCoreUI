/**
 * @license
 * Copyright (c) 2014, 2023, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 * @ignore
 */
/*
 * Your about ViewModel code goes here
 */
define([
  "../accUtils",
  "knockout",
  "axios",
  "ojs/ojarraydataprovider",
  "ojs/ojinputtext",
  "ojs/ojformlayout",
  "ojs/ojdialog",
  "ojs/ojmessages",
], function (accUtils, ko, axios, ArrayDataProvider) {
  function LoginViewModel() {
    var self = this;
    self.isLogin = ko.observable(false);
    self.rolesData = ko.observableArray([]);
    self.email = ko.observable("");
    self.password = ko.observable("");
    self.usersData = ko.observableArray([]);
    self.messages = ko.observableArray([]);
    self.messagesDataProvider = new ArrayDataProvider(self.messages);
    self.isPassword = ko.observable(false);
    self.podsData = ko.observableArray([]);
    self.img = ko.observable("../../css/images/RiteLogoNew.png");
    //self.img = ko.observable("");
    // Below are a set of the ViewModel methods invoked by the oj-module component.
    // Please reference the oj-module jsDoc for additional information.

    /**
     * Optional ViewModel method invoked after the View is inserted into the
     * document DOM.  The application can put logic that requires the DOM being
     * attached here.
     * This method might be called multiple times - after the View is created
     * and inserted into the DOM and after the View is reconnected
     * after being disconnected.
     */
    self.signIn = function () {
      self.isLogin(!self.isLogin());
    };
    const checkUserDetails = async () => {
      axios.defaults.headers.common["Authorization"] =
        sessionStorage.getItem("id_token");
      getUserDetails();
    };
    if (sessionStorage.getItem("userName") == null) {
      checkUserDetails();
    }
    if (
      sessionStorage.getItem("user_role") == null &&
      sessionStorage.getItem("userName") !== null
    ) {
      getUserDetails();
    }
    // function checkRegisterUser(){
    //   if(sessionStorage.getItem('userId')){
    //   $(".progress").show();
    //   let config = {
    //       "url": props.userregistrationstatusbyemail + "?email=" + sessionStorage.getItem('userId'),
    //       "method": "GET",
    //       headers: {
    //           'Content-Type': 'application/json'
    //       }
    //     };
    //     axios(config)
    //     .then(function (response) {
    //         if(response){
    //             if(response.data.userRegStatus=="Reg"){
    //                $(".progress").hide();
    //                getRolesLovData();

    //             }
    //             else{
    //              $(".progress").hide();
    //               self.messages.push({
    //                   severity: 'error',
    //                   summary: 'Not a Register User',
    //                   autoTimeout: 0
    //               });
    //               setTimeout(() => {
    //                   window.location='?ojr=Login';
    //                   sessionStorage.clear();
    //               }, 1500);

    //             }
    //         }
    //     });
    //   }
    //  }

    //   function getRolesLovData() {
    //       if(sessionStorage.getItem('userId')){
    //       let config = {
    //          "url": props.getrolesbyemail + "?emailId=" + sessionStorage.getItem('userId'),
    //           "method": "GET",
    //           headers: {
    //               'Content-Type': 'application/json',
    //           }
    //       };
    //       axios(config)
    //           .then(function (response) {
    //               if (response) {
    //                   self.rolesData([]);
    //                   for (let i = 0; i < response.data.length; i++) {
    //                       if (response.data[i].roleName) {
    //                           self.rolesData.push({
    //                               'id': response.data[i].roleId,
    //                               'value': response.data[i].roleName,
    //                               'label': response.data[i].roleName
    //                           });
    //                       }
    //                   }
    //                   self.isLogin(true);
    //                   sessionStorage.setItem('roles',JSON.stringify(self.rolesData()));
    //               }
    //           });
    //       }
    //   }

    this.showHomePage = function (event) {
      let podData = event.target.innerText.trim();
      if (self.podsData()) {
        self.podsData().forEach((pod) => {
          if (pod.value == podData) {
            sessionStorage.setItem("X-TENANT-ID", pod.id);
            sessionStorage.setItem("podName", pod.value);

            //axios.defaults.headers.common['roleid'] =  role.id;
          }
        });
      }

      // axios.defaults.headers.common['role'] =  usrRole;
      window.location = "?ojr=Dashboard";
    };

    //getting user as register or not
    self.login = function () {
      if (!self.isPassword()) {
        if (self.email()) {
          let url = riteUTils.riteProps.getClientdetails + self.email();
          getDetails(url)
            .then((res) => {
              if (res) {
                sessionStorage.setItem("userName", res.payload.userName);
                sessionStorage.setItem("Otype", res.payload.userLoginType);
                if (res.payload.userLoginType == "Password") {
                  self.isPassword(true);
                }
                if (res.payload.userLoginType == "Basic") {
                  signIn();
                }
              }
            })
            .catch((err) => {
              console.log(err);
              self.messages.push({
                severity: "error",
                summary: "Please Enter Valid Email!",
                autoTimeout: 0,
              });
            });

          //  let usrData=self.usersData();
          //   for(let i=0;i<usrData.length;i++){
          //     if(usrData[i].email==self.email() && usrData[i].userLoginType=="Basic"){
          //       signIn();
          //     }
          //     if(usrData[i].email==self.email() && usrData[i].userLoginType=="Password"){
          //       self.isPassword(true);
          //       sessionStorage.setItem('userId',self.email());
          //     }
          //   }
        } else {
          self.messages.push({
            severity: "error",
            summary: "Please Enter Valid Email!",
            autoTimeout: 0,
          });
        }
      } else {
        if (self.password()) {
          let url = riteUTils.riteProps.loginUser;
          $(".progress").show();
          let data = {
            username: sessionStorage.getItem("userName"),
            password: self.password(),
          };
          postDetails(url, data)
            .then((res) => {
              if (res.statusCode == "OK") {
                sessionStorage.setItem(
                  "id_token",
                  res.payload.tokenType + " " + res.payload.accessToken
                );
                sessionStorage.setItem("userId", self.email());
                sessionStorage.setItem("usrValue", res.payload.id);
                sessionStorage.setItem(
                  "roles",
                  JSON.stringify(res.payload.roles)
                );
                //  getClientAdminDtls();
                getUserDetails();
                $(".progress").hide();
              } else {
                $(".progress").hide();
                self.messages.push({
                  severity: "error",
                  summary: res.message,
                  autoTimeout: 0,
                });
              }
            })
            .catch((err) => {
              if (err.response.status == 412) {
                $(".progress").hide();
                self.messages.push({
                  severity: "error",
                  summary: err.response.data.message,
                  autoTimeout: 0,
                });
                setTimeout(() => {
                  self.isPassword(false);
                  self.email("");
                  self.password("");
                }, 3000);
              } else {
                $(".progress").hide();
                self.messages.push({
                  severity: "error",
                  summary: err.response.data.message,
                  autoTimeout: 0,
                });
              }
            });
          // let usrData=self.usersData();
          // for(let i=0;i<usrData.length;i++){
          //   if(usrData[i].email==self.email() && usrData[i].password==self.password()){
          //     getAssignedPods();
          //   }

          // }
        } else {
          self.messages.push({
            severity: "error",
            summary: "Please Enter Password!",
            autoTimeout: 0,
          });
        }
      }
    };
    function getAssignedPods() {
      if (sessionStorage.getItem("userId") && self.usersData()) {
        let usrData = self.usersData();

        self.rolesData([]);
        self.podsData([]);
        if (usrData.email == sessionStorage.getItem("userId")) {
          for (let k = 0; k < usrData.roles.length; k++) {
            let podobj = {
              id: usrData.roles[k].pod.podId,
              value: usrData.roles[k].pod.podName,
              label: usrData.roles[k].pod.podName,
            };
            let roleobj = {
              id: usrData.roles[k].roleId,
              value: usrData.roles[k].roleName,
              label: usrData.roles[k].roleName,
            };
            self.isLogin(true);
            self.rolesData.push(roleobj);
            //check unique pods
            self.podsData.push(podobj);
          }
        }
        sessionStorage.setItem("user_role", self.rolesData()[0].value);
        sessionStorage.setItem("roleid", self.rolesData()[0].id);
        sessionStorage.setItem("roles", JSON.stringify(self.rolesData()));
        self.podsData(getUniqArray(self.podsData()));
      }
    }
    function getUniqArray(pods) {
      return pods.filter((a, i) => pods.findIndex((s) => a.id === s.id) === i);
    }

    //getting client id based on clientid usersgetting

    function getClientIds() {
      let url = riteUTils.riteProps.getClientdetails + "clientdetails";
      getDetails(url).then((res) => {
        if (res.payload) {
          res.payload.forEach((itm) => {
            if (itm.clientId == sessionStorage.getItem("clientId")) {
              let downloadUrl = "data:image/png;base64," + res.payload[0].logo;
              self.img(downloadUrl);
            }
          });
        }
      });
    }

    function getUserDetails() {
      let url;
      if (sessionStorage.getItem("Otype")) {
        if (sessionStorage.getItem("Otype") == "Password") {
          url =
            riteUTils.riteProps.getClients +
            "/" +
            "1" +
            "/users" +
            "/" +
            sessionStorage.getItem("usrValue") +
            "/withlicensedpods";
        }
        if (sessionStorage.getItem("Otype") == "Basic") {
          url =
            riteUTils.riteProps.userswithemail +
            "/" +
            sessionStorage.getItem("userId") +
            "/withlicensedpods";
        }
      }
      if (url) {
        var riteHeaders = {
          headers: {
            Authorization: sessionStorage.getItem("id_token"),
            "Content-Type": "application/json",
          },
        };
        axios
          .get(url, riteHeaders)
          .then((res) => {
            if (res.data.statusCode == "OK") {
              if (res.data.payload) {
                self.usersData(res.data.payload);
                sessionStorage.setItem("userVal", res.data.payload.userId);
                sessionStorage.setItem(
                  "clientId",
                  res.data.payload.client.clientId
                );
                sessionStorage.setItem(
                  "clientName",
                  res.data.payload.client.clientName
                );
                if (sessionStorage.getItem("clientId")) {
                  getClientIds();
                  getAssignedPods();
                }
              }
            }
          })
          .catch((error) => {
            console.log(error);
          });
      }
    }

    this.connected = () => {
      accUtils.announce("Login page loaded.", "assertive");
      document.title = "Login";
      // getClientIds();
      // Implement further logic if needed
    };

    /**
     * Optional ViewModel method invoked after the View is disconnected from the DOM.
     */
    this.disconnected = () => {
      // Implement if needed
    };

    /**
     * Optional ViewModel method invoked after transition to the new View is complete.
     * That includes any possible animation between the old and the new View.
     */
    this.transitionCompleted = () => {
      // Implement if needed
    };
  }

  /*
   * Returns an instance of the ViewModel providing one instance of the ViewModel. If needed,
   * return a constructor for the ViewModel so that the ViewModel is constructed
   * each time the view is displayed.
   */
  return LoginViewModel;
});
