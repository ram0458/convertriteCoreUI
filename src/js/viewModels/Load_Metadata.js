/**
 * @license
 * Copyright (c) 2014, 2023, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 * @ignore
 */
/*
 * Your dashboard ViewModel code goes here
 */
define([
  "../accUtils",
  "knockout",
  "axios",
  "ojs/ojcontext",
  "ojs/ojarraydataprovider",
  "ojs/ojselectsingle",
  "ojs/ojbutton",
  "ojs/ojfilepicker",
  "ojs/ojdialog",
  "ojs/ojdefer",
  "ojs/ojformlayout",
  "ojs/ojmessages",
  "ojs/ojvalidationgroup",
], function (accUtils, ko, axios, Context, ArrayDataProvider) {
  function Load_MetadataViewModel(params) {
    var self = this;
    if (!sessionStorage.getItem("userVal")) {
      window.location = "?ojr=Login";
    }
    self.typelabel = ko.observable(params.Type);
    this.groupValid = ko.observable();
    self.projectNameArray = ko.observableArray([]);
    self.projectName = ko.observable("");
    self.projectId = ko.observable("");
    self.parentObject = ko.observable("");
    self.parentObjArray = ko.observableArray([]);
    self.object = ko.observable("");
    self.objectCode = ko.observable("");
    self.objectName = ko.observable("");
    self.objectArray = ko.observableArray([]);
    self.TableCol = ko.observable("");
    self.messages = ko.observableArray();
    self.messagesDataProvider = new oj.ArrayDataProvider(self.messages);
    self.fileName = ko.observable("");
    self.metaDataTableName = ko.observable("");
    self.interfaceTableName = ko.observable("");
    self.fileDatExt = ko.observable("");

    this.secondaryCustomText = () => {
      return `
        * Table Name must be Unique
        , Column Name should not repeat, and Column Name should not have any Space or Special Characters except underscore (_)
      `;
    };

    function getProjectData() {
      $(".progress").show();
      let url = riteUTils.riteProps.getAllProjectHeaders;
      getDetails(url)
        .then((res) => {
          $(".progress").show();
          if (res) {
            for (let i = 0; i < res.length; i++) {
              self.projectNameArray.push({
                value: res[i].projectName,
                id: res[i].projectId,
                label: res[i].projectName,
              });
            }
            $(".progress").hide();
          }
        })
        .catch(function (error) {
          $(".progress").hide();
          console.log(error);
        });
    }

    this.projectNamedata = new ArrayDataProvider(self.projectNameArray, {
      keyAttributes: "id",
    });

    self.projectNameValueChange = function (event) {
      if (event.detail.value) {
        $(".progress").show();

        let url =
          riteUTils.riteProps.getParentObjectsByProjectId +
          "/" +
          self.projectName();
        getDetails(url)
          .then((res) => {
            if (res) {
              self.parentObjArray([]);
              self.objectArray([]);
              for (let i = 0; i < res.length; i++) {
                self.parentObjArray.push({
                  value: res[i].objectName,
                  id: res[i].objectId,
                  label: res[i].objectName,
                  objectCode: res[i].objectCode,
                });
              }
              $(".progress").hide();
            }
          })
          .catch(function (error) {
            $(".progress").hide();
          });
      }
    };
    this.parentobjectdata = new ArrayDataProvider(self.parentObjArray, {
      keyAttributes: "id",
    });

    self.pobjCodeValueChange = function (event) {
      if (event.detail.value) {
        $(".progress").show();
        self.parentObjArray().forEach((item) => {
          if (event.detail.value == item.id) {
            self.objectCode(item.objectCode);
          }
        });
        let url =
          riteUTils.riteProps.getObjectsByObjectCode +
          "/" +
          self.projectName() +
          "/" +
          self.objectCode();
        getDetails(url)
          .then((res) => {
            if (res) {
              self.objectArray([]);
              for (let i = 0; i < res.length; i++) {
                self.objectArray.push({
                  value: res[i].objectName,
                  id: res[i].objectId,
                  label: res[i].objectName,
                });
              }
              $(".progress").hide();
            }
          })
          .catch(function (error) {
            $(".progress").hide();
          });
      }
    };

    this.objectdata = new ArrayDataProvider(self.objectArray, {
      keyAttributes: "value",
    });

    self.objId = ko.observable();
    self.objectValueChange = function (event) {
      if (event.detail.value && self.typelabel() == "Cloud") {
        if (self.objectArray()) {
          self.objectArray().forEach((itm) => {
            if (itm.value == event.detail.value) {
              self.objId(itm.id);
            }
          });
        }
        $(".progress").show();
        let url = riteUTils.riteProps.getobjects + self.objId();
        getDetails(url)
          .then((res) => {
            if (res) {
              self.interfaceTableName(res.payload.insertTableName);
              $(".progress").hide();
            }
          })
          .catch(function (error) {
            $(".progress").hide();
          });
      }
    };
    self.resetSrcCldTemplate = function () {
      self.projectName("");
      self.object("");
      self.objectName("");
      self.parentObject("");
      self.metaDataTableName("");
    };

    self.uploadDisabled = ko
      .computed(function () {
        if (self.projectName() && self.parentObject() && self.object()) {
          return false;
        } else {
          return true;
        }
      })
      .bind(this);

    self.fbdiDisabled = ko
      .computed(function () {
        if (self.metaDataTableName()) {
          return false;
        } else {
          return true;
        }
      })
      .bind(this);

    self.downloadSourceTemplate = function () {
      self.TableCol("Column");
      let fileName;
      let environment;
      if (self.typelabel() == "Source") {
        fileName = "Rite_Source_MetaData";
        environment = "Source";
      } else {
        fileName = "Rite_Cloud_MetaData";
        environment = "Cloud";
      }
      $(".progress").show();
      let downcloud = {
        method: "GET",
        url:
          riteUTils.riteProps.downloadsourcetemplate +
          "?metaDataFileType=" +
          self.TableCol() +
          "&objectCode=" +
          self.objectCode() +
          "&environment=" +
          environment,
        responseType: "text/csv",
      };
      axios(downcloud)
        .then(function ({ data }) {
          $(".progress").hide();
          let downloadUrl = window.URL.createObjectURL(new Blob([data]));
          let link = document.createElement("a");
          link.href = downloadUrl;
          link.setAttribute("download", fileName + "_Template.csv");
          document.body.appendChild(link);
          link.click();
          link.remove();
        })
        .catch(function (error) {
          $(".progress").hide();
          console.log(error);
        });
    };

    function _checkValidationGroup() {
      const tracker = document.getElementById("tracker");
      if (tracker.valid === "valid") {
        return true;
      } else {
        tracker.showMessages();
        Context.getPageContext()
          .getBusyContext()
          .whenReady()
          .then(() => tracker.focusOn("@firstInvalidShown"));
        return false;
      }
    }

    self.fileUploadForSave = function (event) {
      const valid = _checkValidationGroup();
      if (valid) {
        $(".progress").show();
        var files = event.detail.files;
        var formdata = new FormData();
        formdata.append("file", event.detail.files[0]);
        formdata.append("type", "");
        var extRegEx = /(?:\.([^.]+))?$/;
        let fileExtn = extRegEx.exec(event.detail.files[0].name)[1];
        if (fileExtn == "csv" || fileExtn == "CSV") {
          var config = {
            method: "Post",
            url: riteUTils.riteProps.uploadFiles,
            headers: {
              "Content-Type": "text/csv",
              "X-TENANT-ID": sessionStorage.getItem("X-TENANT-ID"),
            },
            data: formdata,
          };
          axios(config)
            .then(function (response) {
              if (response) {
                $(".progress").hide();
                self.fileName(response.data.fileName);
                self.messages.push({
                  severity: "confirmation",
                  // detail: response.data.count + " Records",
                  summary: "File Upload Successfully",
                  autoTimeout: 0,
                });
                postCreateTable();
              } else {
                $(".progress").hide();
                self.messages.push({
                  severity: "error",
                  summary: response.data.message,
                  autoTimeout: 0,
                });
              }
            })
            .catch((err) => {
              console.log(err);

              $(".progress").hide();
            });
        } else {
          $(".progress").hide();
          self.messages.push({
            severity: "error",
            summary: "Upload Only CSV Files !",
            autoTimeout: 0,
          });
        }
      } else {
        $(".progress").hide();
        self.messages.push({
          severity: "error",
          summary: "Please Fill all the Required Fields ",
          autoTimeout: 0,
        });
      }
    };

    function postCreateTable() {
      let objctId;
      let environment;
      if (self.typelabel() == "Source") {
        environment = "SOURCE";
      } else {
        environment = "CLOUD";
      }
      self.objectArray().forEach((itm) => {
        if (itm.value == self.object()) {
          objctId = itm.id;
        }
      });
      if (self.fileName()) {
        let data = {
          environment: environment,
          fileName: self.fileName(),
          objectId: objctId,
        };
        let url =
          riteUTils.riteProps.loadSourceTemplateMetaData +
          "?environment=" +
          environment +
          "&fileName=" +
          self.fileName() +
          "&objectId=" +
          objctId;
        postDetails(url, data).then((res) => {
          if (res.result == "SUCCESS") {
            self.messages.push({
              severity: "confirmation",
              summary: res.message,
              autoTimeout: 0,
            });
            $(".progress").hide();
          } else {
            self.messages.push({
              severity: "error",
              summary: res.message,
              autoTimeout: 0,
            });
          }
        });
      }
    }

    self.fbdiCloudMetadata = function () {
      if (self.metaDataTableName() && self.projectName() && self.object()) {
        $(".progress").show();

        let obj = {
          intTableName: self.interfaceTableName(),
          metaDataTableName: self.metaDataTableName(),
          objectId: self.objId(),
          projectId: self.projectName(),
        };
        let url = riteUTils.riteProps.loadmetadatafromcloud;
        postDetails(url, obj).then((res) => {
          if (res) {
            self.messages.push({
              severity: "confirmation",
              summary: res.message,
              autoTimeout: 0,
            });
            $(".progress").hide();
          } else {
            self.messages.push({
              severity: "error",
              summary: res.message,
              autoTimeout: 0,
            });
            $(".progress").hide();
          }
        });
      }
    };

    self.hdlCloudMetadata = function () {
      document.querySelector("#hdlCloudMetaData").open();
    };
    self.closehdlCloudMetaDataDailog = function (event) {
      document.querySelector("#hdlCloudMetaData").close();
    };

    self.selectListenerUpload = function (event) {
      const valid = _checkValidationGroup();
      if (valid) {
        $(".progress").show();
        var files = event.detail.files;
        var formdata = new FormData();
        formdata.append("file", event.detail.files[0]);
        var extRegEx = /(?:\.([^.]+))?$/;
        let fileExtn = extRegEx.exec(event.detail.files[0].name)[1];
        if (
          self.metaDataTableName() &&
          self.objId() &&
          self.objectCode() &&
          (fileExtn == "dat" || fileExtn == "DAT")
        ) {
          var config = {
            method: "Post",
            url:
              riteUTils.riteProps.hdlCloudMetaData +
              "?objectId=" +
              self.objId() +
              "&objectCode=" +
              self.object() +
              "&metaDataTableName=" +
              self.metaDataTableName(),
            headers: {
              "Content-Type": "text/csv",
              "X-TENANT-ID": sessionStorage.getItem("X-TENANT-ID"),
            },
            data: formdata,
          };
          axios(config)
            .then(function (res) {
              if (res) {
                self.messages.push({
                  severity: "confirmation",
                  summary: res.data.message,
                  autoTimeout: 0,
                });
                document.querySelector('#hdlCloudMetaData').close();
                $(".progress").hide();
              } else {
                self.messages.push({
                  severity: "error",
                  summary: res.data.error,
                  autoTimeout: 0,
                });
                document.querySelector('#hdlCloudMetaData').close();
                $(".progress").hide();
              }
            })
            .catch((error) => {
              $(".progress").hide();
              if (error.response.status == 400) {
                self.messages.push({
                  severity: "error",
                  summary: error.response.data,
                  autoTimeout: 0,
                });
                document.querySelector('#hdlCloudMetaData').close();
              } else {
                $(".progress").hide();
                self.messages.push({
                  severity: "error",
                  summary: error.response.data.message,
                  autoTimeout: 0,
                });
                document.querySelector('#hdlCloudMetaData').close();
              }
            });
        } else {
          $(".progress").hide();
          self.messages.push({
            severity: "error",
            summary: "Upload Only DAT Files !",
            autoTimeout: 0,
          });
        }
      } else {
        $(".progress").hide();
        self.messages.push({
          severity: "error",
          summary: "Please Fill all the Required Fields ",
          autoTimeout: 0,
        });
      }
    };

    this.connected = () => {
      accUtils.announce("Load Metadata page loaded.", "assertive");
      if (self.typelabel() == "Source") {
        document.title = "Source MetaData";
      }
      if (self.typelabel() == "Cloud") {
        document.title = "Cloud MetaData";
      }

      getProjectData();
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
  return Load_MetadataViewModel;
});
