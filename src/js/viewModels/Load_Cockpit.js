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
  "oj-c/select-multiple",
  "ojs/ojtrain",
  "ojs/ojtable",
  "ojs/ojbutton",
  "ojs/ojfilepicker",
  "ojs/ojradioset",
  "ojs/ojformlayout",
  "ojs/ojmessages",
  "ojs/ojvalidationgroup",
], function (accUtils, ko, axios, Context, ArrayDataProvider) {
  function Load_CockpitViewModel() {
    var self = this;
    if (!sessionStorage.getItem("userVal")) {
      window.location = "?ojr=Login";
    }

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
    self.messages = ko.observableArray();
    self.messagesDataProvider = new oj.ArrayDataProvider(self.messages);
    self.batchName = ko.observable("");
    self.templateName = ko.observable(new Set([]));
    self.templateArray = ko.observableArray([]);
    self.currentStepValue = ko.observable("stp1");
    self.stepArray = ko.observableArray([]);
    self.loadSourceArray = ko.observableArray([]);
    self.validationArray = ko.observableArray([]);
    self.conversionArray = ko.observableArray([]);
    self.radiosetVal = ko.observable("Auto");
    self.fileName = ko.observable("");
    self.loadSourceDataCompleted = ko.observable(false);
    self.validationCompleted = ko.observable(false);
    self.cloudLoadImportCompleted = ko.observable(false);
    self.parameterList = ko.observable("");
    self.template = ko.observable("");
    self.tempId = ko.observable("");
    self.statgingTableName = ko.observable("");
    self.metaDataTableId = ko.observable();
    self.srcTemplateId = ko.observable();
    self.srcTemplates = ko.observableArray([]);
    self.filterTemplates = ko.observableArray([]);
    self.cloudImportArray = ko.observableArray([]);
    axios.defaults.headers.common["X-TENANT-ID"] =
      sessionStorage.getItem("X-TENANT-ID");
    let stpArray = [
      { label: "Load Source Data ", id: "stp1", messageType: "info" },
      {
        label: "Transform ",
        id: "stp2",
        messageType: "error",
      },
      {
        label: "Cloud Load Import ",
        id: "stp3",
        messageType: "warning",
      },
    ];

    self.stepArray(stpArray);

    self.loadSourceDialog = function (event) {
      document.querySelector("#loadDialog").open();
      self.filterTemplates([]);
      if (self.templateName() && self.templateArray().length !== 0) {
        self.templateName().forEach((key) => {
          self.templateArray().forEach((itm) => {
            if (itm.value == key) {
              self.filterTemplates.push(itm);
            }
          });
        });
      }
    };
    self.templateNameProvider = new ArrayDataProvider(self.filterTemplates, {
      keyAttributes: "value",
    });

    self.closeLoadDailog = function () {
      document.querySelector("#loadDialog").close();
    };

    self.openListener = function () {
      let popup = document.getElementById("popup1");
      popup.open("#btnGo");
    }.bind(this);

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
      if (event.detail.value) {
        getTemplates();
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

    self.resetAll = function () {
      self.projectName("");
      self.object("");
      self.objectName("");
      self.parentObject("");
      self.batchName("");
      self.templateName(new Set([]));
      self.template("");
      self.statgingTableName("");
      self.metaDataTableId("");
      self.srcTemplateId("");
    };

    self.templateChange = function (event) {
      if (event.detail.value) {
        self.templateArray().forEach((itm) => {
          if (itm.value == event.detail.value) {
            self.tempId(itm.id);
            self.objectName(itm.objectName);
          }
        });
      }
    };
    self.templateNameChange = function (event) {
      if (event.detail.value) {
        self.templateArray().forEach((itm) => {
          if (itm.value == event.detail.value) {
            self.tempId(itm.id);

            self.srcTemplateId(itm.srctempid);
            if (self.srcTemplates()) {
              self.srcTemplates().forEach((sitm) => {
                if (sitm.templateId == itm.srctempid) {
                  self.statgingTableName(sitm.stagingTableName);
                  self.metaDataTableId(sitm.metadataTableId);
                }
              });
            }
          }
        });
      }
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

    self.UploadForLoaddata = function (event) {
      const valid = _checkValidationGroup();
    };

    self.templateChange = function (event) {
      if (event.detail.value) {
        self.templateArray().forEach((itm) => {
          if (itm.value == event.detail.value) {
            self.tempId(itm.id);
            self.objectName(itm.objectName);
          }
        });
      }
    };

    function getTemplates() {
      $(".progress").show();
      let url = riteUTils.riteProps.gettemplatestate;
      while (self.templateArray().length !== 0) {
        self.templateArray.pop();
      }
      getDetails(url)
        .then((res) => {
          if (res) {
            console.log(res);
            for (let i = 0; i < res.length; i++) {
              if (self.objId() == res[i].objectId) {
                self.templateArray.push({
                  id: res[i].templateId,
                  label: res[i].templateName,
                  value: res[i].templateName,
                  srctempname: res[i].sourceTemplateName,
                  srctempid: res[i].srcTemplateId,
                  statginTable: res[i].stagingTableName,
                  metadataTableId: res[i].metadataTableId,
                });
              }
            }
            $(".progress").hide();
          }
        })
        .catch((error) => {
          $(".progress").hide();
          console.log(error);
        });
    }

    self.templateDataProvider = new ArrayDataProvider(self.templateArray, {
      keyAttributes: "value",
    });

    function getSourceTemplates() {
      let url = riteUTils.riteProps.getsourcetemplates;
      while (self.srcTemplates().length !== 0) {
        self.srcTemplates.pop();
      }
      getDetails(url)
        .then((res) => {
          if (res) {
            for (let i = 0; i < res.length; i++) {
              self.srcTemplates.push({
                templateId: res[i].templateId,
                stagingTableName: res[i].stagingTableName,
                metadataTableId: res[i].metaDataTableId,
              });
            }
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    }

    self.fileUploadForSave = function (event) {
      const valid = _checkValidationGroup();
      if (valid) {
        $(".progress").show();
        var files = event.detail.files;
        var formdata = new FormData();
        formdata.append("file", event.detail.files[0]);
        var extRegEx = /(?:\.([^.]+))?$/;
        let fileExtn = extRegEx.exec(event.detail.files[0].name)[1];
        if (fileExtn == "csv" || fileExtn == "CSV") {
          var config = {
            method: "Post",
            url: riteUTils.riteProps.uploadfiletoftp,
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
      self.objectArray().forEach((itm) => {
        if (itm.value == self.object()) {
          objctId = itm.id;
        }
      });
      if (self.fileName()) {
        let data = {
          metaDataTableId: parseInt(self.metaDataTableId()),
          srcStgTableName: self.statgingTableName(),
          srcTemplateId: parseInt(self.srcTemplateId()),
          fileName: self.fileName(),
          batchName: self.batchName(),
        };
        let url = riteUTils.riteProps.loadSourceDataToExternalTable;
        postDetails(url, data)
          .then((res) => {
            if (res.result == "SUCCESS") {
              let obj = {
                SNo: self.loadSourceArray().length + 1,
                templateName: self.template(),
                stagingtable: self.statgingTableName(),
                loadedrecrods: res.loadedRecords,
                failedRecords: res.failedRecords,
                message: res.message,
                error: res.error,
              };
              self.loadSourceArray.push(obj);
              $(".progress").hide();
            } else {
              let obj = {
                SNo: self.loadSourceArray().length + 1,
                templateName: self.template(),
                stagingtable: self.statgingTableName(),
                loadedrecrods: res.loadedRecords,
                failedRecords: res.failedRecords,
                message: res.message,
                error: res.error,
              };  
              self.loadSourceArray.push(obj);
              $(".progress").hide();
            }
          })
          .catch((error) => {
            let obj = {
              SNo: self.loadSourceArray().length + 1,
              templateName: self.template(),
              stagingtable: self.statgingTableName(),
              loadedrecrods: error.response.data.loadedRecords,
              failedRecords: error.response.data.failedRecords,
              message: "",
              error: error.response.data.error,
            };
                self.messages.push({
                  severity: "error",
                  summary: error.response.data.error,
                  autoTimeout: 0,
                });

            self.loadSourceArray.push(obj);
            $(".progress").hide();
          });
      }
    }

    this.dataProviders = new ArrayDataProvider(self.loadSourceArray, {
      keyAttributes: "id",
    });

    self.ValidationData = async function () {
      if (self.templateName()) {
        $(".progress").show();
        self.templateName().forEach(async (tmp) => {
          await transofrm(tmp);
        });
        $(".progress").hide();
      }
    };

    function transofrm(tempName) {
      return new Promise((reslove, reject) => {
        self.currentStepValue("stp2");
        let obj = {};
        let url =
          riteUTils.riteProps.transformDataToCloud +
          "?cloudTemplateName=" +
          tempName +
          "&pBatchName=" +
          self.batchName() +
          "&pReprocessFlag=N&pBatchFlag=N";
        postDetails(url, obj)
          .then((res) => {
            if (res) {
              reslove("success");
              getProcessStatus();
            }
          })
          .catch((err) => {
            console.log(err);
          });
      });
    }

    function getProcessStatus() {
      $(".progress").show();
      let url =
        riteUTils.riteProps.getprocessrequests +
        "?pageNo=0&pageSize=50&sortDirection=DESC&sortBy=requestId";
      getDetails(url)
        .then((res) => {
          if (res) {
            self.validationArray([]);
            for (let i = 0; i < self.templateName().size; i++) {
              if (self.templateName()) {
                self.templateName().forEach((tem) => {
                  if (
                    tem == res[i].templateName &&
                    res[i].batchName == self.batchName()
                  ) {
                    self.validationArray.push({
                      SNo: i + 1,
                      requestId: res[i].requestId,
                      requestType: res[i].requestType,
                      templateId: res[i].templateId,
                      templateName: res[i].templateName,
                      batchName: res[i].batchName,
                      status: res[i].status,
                      totalRecords: res[i].totalRecords,
                      percentage: res[i].percentage,
                      startDate: res[i].startDate
                        ? convertDateFormate(res[i].startDate)
                        : "",
                      endDate: res[i].endDate
                        ? convertDateFormate(res[i].endDate)
                        : "",
                      errorMsg: res[i].errorMsg,
                      userId: res[i].userId,
                      parentObjectCode: res[i].parentObjectCode,
                      successRec: res[i].successRec,
                      failRec: res[i].failRec,
                    });
                  }
                });
              }
            }
            $(".progress").hide();
          }
        })
        .catch((error) => {
          $(".progress").hide();
          console.log(error);
        });
    }

    this.ValidationdataProviders = new ArrayDataProvider(self.validationArray, {
      keyAttributes: "requestId",
    });

    self.refresh = function () {
      getProcessStatus();
    };

    self.downloadFbdi = function () {
      if (self.batchName()) {
        $(".progress").show();
        let downfbdi = {
          method: "Get",
          url:
            riteUTils.riteProps.downloadfbdi +
            "?cloudTemplateId=" +
            self.tempId() +
            "&batchName=" +
            self.batchName(),
          responseType: "text/csv",
        };
        axios(downfbdi)
          .then(function (response) {
            if (response) {
              $(".progress").hide();
              let downloadUrl = window.URL.createObjectURL(
                new Blob([response.data])
              );
              let link = document.createElement("a");
              link.href = downloadUrl;
              link.setAttribute("download", self.template() + "_fbdi.csv"); //any other extension
              document.body.appendChild(link);
              link.click();
              link.remove();
            }
          })
          .catch(function (error) {
            $(".progress").hide();
            console.log(error);
          });
      } else {
        self.messages.push({
          severity: "error",
          summary: "Pleae Select Template and Batch Name",
          autoTimeout: 0,
        });
      }
    };

    self.loadImportActionData = async function () {
      if (self.templateName()) {
        $(".progress").show();
        while (self.cloudImportArray().length !== 0) {
          self.cloudImportArray.pop();
        }
        self.templateName().forEach(async (tmp) => {
          if (self.templateArray()) {
            self.templateArray().forEach(async (tempsup) => {
              if (tmp == tempsup.value) {
                await loadImportAction(tempsup.id);
              }
            });
          }
        });
      }
    };

    function loadImportAction(tempId) {
      return new Promise((resolve, reject) => {
        if (tempId && self.batchName() && self.object()) {
          $(".progress").show();
          self.currentStepValue("stp3");
          let url = riteUTils.riteProps.loadandimportdatav1;
          let obj = {
            cloudTemplateId: tempId,
            parameterList: self.parameterList(),
            batchName: self.batchName(),
            objectName: self.object(),
            clientId: parseInt(sessionStorage.getItem("clientId")),
            podId: parseInt(sessionStorage.getItem("X-TENANT-ID")),
          };
          postDetails(url, obj)
            .then((res) => {
              if (res) {
                if (!res.resultId == null || !res.resultId == "0") {
                  resolve("success");
                  let obj = {
                    SNo: self.cloudImportArray().length + 1,
                    templateName: self.template(),
                    message: res.message,
                    error: res.error,
                    resultId: res.resultId,
                    reconcile: "",
                  };
                  self.cloudImportArray.push(obj);
                  $(".progress").hide();
                } else {
                  let obj = {
                    SNo: self.cloudImportArray().length + 1,
                    templateName: self.template(),
                    message: res.message,
                    error: res.error,
                    resultId: res.resultId,
                    reconcile: "",
                  };
                  self.cloudImportArray.push(obj);
                  $(".progress").hide();
                }
              }
            })
            .catch(function (error) {
              $(".progress").hide();
              let obj = {
                SNo: self.cloudImportArray().length + 1,
                templateName: self.template(),
                message: res.message,
                error: res.error,
                resultId: res.resultId,
                reconcile: "",
              };
              self.cloudImportArray.push(obj);
            });
        }
      });
    }

    this.loadImportDataDtlsProviders = new ArrayDataProvider(
      self.cloudImportArray,
      {
        keyAttributes: "SNo",
      }
    );

    this.connected = () => {
      accUtils.announce("Load Cockpit page loaded.", "assertive");
      document.title = "Load Cockpit";
      getProjectData();
      getSourceTemplates();
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
  return Load_CockpitViewModel;
});
