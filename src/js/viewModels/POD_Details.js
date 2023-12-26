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
  "require",
  "knockout",
  "ojs/ojarraydataprovider",
  "ojs/ojinputtext",
  "ojs/ojbutton",
  "ojs/ojtable",
  "ojs/ojmessages",
], function (accUtils, require, ko, ArrayDataProvider) {
  function POD_DetailsViewModel() {
    var self = this;
    if (!sessionStorage.getItem("userId")) {
      window.location = "?ojr=Login";
    }
    self.messages = ko.observableArray([]);
    self.messagesDataProvider = new oj.ArrayDataProvider(self.messages);
    self.scrollPos = ko.observable({ rowIndex: 0 });
    self.podDtlsArray = ko.observableArray([]);
    self.podName = ko.observable("");
    self.podDbUserName = ko.observable("");
    self.tableSpace = ko.observable("");
    self.url = ko.observable("");

    self.loadMore = function () {
      self.scrollPos({ rowIndex: self.scrollPos._latestValue.rowIndex + 10 });
    };

    function getPodDtls() {
      let url =
        riteUTils.riteProps.podcloudconfigs +
        "/" +
        sessionStorage.getItem("X-TENANT-ID");
      $(".progress").show();
      getDetails(url)
        .then((res) => {
          if (res.payload && res.statusCode == "OK") {
            self.podDtlsArray([]);
            for (let i = 0; i < res.payload[0].modules.length; i++) {
              let obj = {
                SNo: i + 1,
                moduleName: res.payload[0].modules[i].moduleCode,
                userName: res.payload[0].modules[i].userName,
                password: res.payload[0].modules[i].password.replace(/./g, "*"),
              };
              self.podDtlsArray.push(obj);
              self.podName(res.payload[0].podName);
              self.podDbUserName(res.payload[0].podDbUserName);
              self.tableSpace(res.payload[0].tableSpace);
              self.url(res.payload[0].url);
            }
            $(".progress").hide();
          } else {
            self.messages.push({
              severity: "error",
              summary: res.message,
              autoTimeout: 0,
            });
          }
        })
        .catch((err) => {
          console.log(err);
          $(".progress").hide();
          self.messages.push({
            severity: "error",
            summary: err.response.data.message,
            autoTimeout: 0,
          });
        });
    }
    this.dataprovider = new ArrayDataProvider(self.podDtlsArray, {
      keyAttributes: "SNo",
    });

    self.urlOpen = function (event) {
      let popup = document.getElementById("popup1");
      popup.open("#urlPopup");
    };

    this.connected = () => {
      accUtils.announce("Pod Details page loaded", "assertive");
      document.title = "POD Details";
      getPodDtls();

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
  return POD_DetailsViewModel;
});
11;
