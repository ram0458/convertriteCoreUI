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
  "axios",
  "knockout",
  "ojs/ojarraydataprovider",
  "ojs/ojcontext",
  "ojs/ojlistdataproviderview",
  "ojs/ojpopup",
  "ojs/ojselectsingle",
  "ojs/ojinputtext",
  "ojs/ojbutton",
  "ojs/ojtable",
  "ojs/ojformlayout",
  "ojs/ojmessages",
  "ojs/ojvalidationgroup",
  "ojs/ojdialog",
], function (
  accUtils,
  require,
  axios,
  ko,
  ArrayDataProvider,
  Context,
  ListDataProviderView
) {
  function ConversionsViewModel(params) {
    var self = this;
    if (!sessionStorage.getItem("userId")) {
      window.location = "?ojr=Login";
    }
    axios.defaults.headers.common["X-TENANT-ID"] =
      sessionStorage.getItem("X-TENANT-ID");
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
    self.messages = ko.observableArray([]);
    self.messagesDataProvider = new oj.ArrayDataProvider(self.messages);
    self.scrollPos = ko.observable({ rowIndex: 0 });
    self.srchfilter = ko.observable("");
    self.templateArray = ko.observableArray([]);
    self.fbdiConversionArray = ko.observableArray([]);
    self.selecttemp = ko.observable("");
    self.batchName = ko.observable("");
    self.objectName = ko.observable("");
    this.groupValid = ko.observable();
    self.typelabel = ko.observable(params.Type);
    self.tempId = ko.observable("");
    self.objectNameArray = ko.observableArray([]);
    self.parameterList = ko.observable("");
    self.batchNameArray = ko.observableArray([]);

    this.searchanyvalueChanged = function () {
      this.srchfilter(document.getElementById("topsrch").rawValue);
    }.bind(this);

    self.searchdataprovider = ko.computed(function () {
      const filterRegEx = new RegExp(this.srchfilter(), "i");
      const filterCriterion = {
        op: "$or",
        criteria: [
          { op: "$regex", value: { requestId: filterRegEx } },
          { op: "$regex", value: { templateName: filterRegEx } },
          { op: "$regex", value: { batchName: filterRegEx } },
          { op: "$regex", value: { status: filterRegEx } },
          { op: "$regex", value: { parentObjectCode: filterRegEx } },
          { op: "$regex", value: { errorMsg: filterRegEx } },
        ],
      };
      const arrayDataProvider = new ArrayDataProvider(
        self.fbdiConversionArray,
        {
          keyAttributes: "requestId",
        }
      );
      return new ListDataProviderView(arrayDataProvider, {
        filterCriterion: filterCriterion,
      });
    }, this);

    self.loadMore = function () {
      self.scrollPos({ rowIndex: self.scrollPos._latestValue.rowIndex + 5 });
    };

    self.templateChange = function (event) {
      if (event.detail.value) {
        self.templateArray().forEach((itm) => {
          if (itm.value == event.detail.value) {
            self.tempId(itm.srcTemplateId);
            self.objectName(itm.objectName);
          }
        });
        while (self.batchNameArray().length > 0) {
          self.batchNameArray.pop();
        }
        let url = riteUTils.riteProps.getAllBatchNames+"?cldTemplateId="+self.tempId();
        getDetails(url)
          .then((res) => {
            $(".progress").show();
            if (res) {
              for (let i = 0; i < res.length; i++) {
                self.batchNameArray.push({
                  value: res[i],
                  id: res[i],
                  label: res[i]
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

    // function getLOVData() {
    //   $(".progress").show();
    //   let url = riteUTils.riteProps.getallcloudtemplates;
    //   getDetails(url)
    //     .then((res) => {
    //       if (res) {
    //         self.templateArray([]);
    //         console.log(res);
    //         for (let i = 0; i < res.length; i++) {
    //           self.templateArray.push({
    //             id: res[i].templateId,
    //             label: res[i].templateName,
    //             value: res[i].templateName,
    //           });
    //         }
    //         $(".progress").hide();
    //       }
    //     })
    //     .catch((error) => {
    //       $(".progress").hide();
    //       console.log(error);
    //     });
    // }
    this.templateData = new ArrayDataProvider(self.templateArray, {
      keyAttributes: "value",
    });

    getTemplates();
    //this api needs to call for status
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
              self.templateArray.push({
                templateId: res[i].templateId,
                templateName: res[i].templateName,
                validation: res[i].validation,
                reprocess: res[i].reprocess,
                conversion: res[i].conversion,
                filegen: res[i].filegen,
                id: res[i].templateId,
                label: res[i].templateName,
                value: res[i].templateName,
                projectId: res[i].projectId,
                projectName: res[i].projectName,
                parentObjectId: res[i].parentObjectId,
                parentObjectName: res[i].parentObjectName,
                objectId: res[i].objectId,
                objectName: res[i].objectName,
                metadataTableId: res[i].metadataTableId,
                metadataTableName: res[i].metadataTableName,
                srcTemplateId: res[i].srcTemplateId,
                sourceTemplateName: res[i].sourceTemplateName,
                stagingTableName: res[i].stagingTableName,
              });
            }
            $(".progress").hide();
          }
        })
        .catch((error) => {
          $(".progress").hide();
          console.log(error);
        });
    }

    this.batchNameData = new ArrayDataProvider(self.batchNameArray, {
      keyAttributes: "value",
    });



    self.transofrm = function () {
      const valid = _checkValidationGroup();
      if (valid) {
        $(".progress").show();
        let obj = {};
        let url =
          riteUTils.riteProps.transformDataToCloud +
          "?cloudTemplateName=" +
          self.selecttemp() +
          "&pBatchName=" +
          self.batchName() +
          "&pReprocessFlag=N&pBatchFlag=N";
        postDetails(url, obj)
          .then((res) => {
            if (res) {
              self.messages.push({
                severity: "confirmation",
                summary: "Transform Successfully",
                autoTimeout: 0,
              });
              getProcessStatus();
            }
            $(".progress").hide();
          })
          .catch((err) => {
            console.log(err);
            $(".progress").hide();
          });
      }
    };

    self.refresh = function () {
      getProcessStatus();
    };

    self.downloadFbdi = function () {
      if (self.tempId() && self.batchName()) {
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
              link.setAttribute("download", "fbdi.csv"); //any other extension
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

    self.downloadHdl = function () {
      if (self.tempId() && self.batchName()) {
        $(".progress").show();
        let downfbdi = {
          method: "Get",
          url:
            riteUTils.riteProps.generatehdl +
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
              link.setAttribute("download", "fbdi.dat"); //any other extension
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

    function getProcessStatus() {
      $(".progress").show();

      while (self.fbdiConversionArray().length !== 0) {
        self.fbdiConversionArray.pop();
      }
      let url =
        riteUTils.riteProps.getprocessrequests +
        "?pageNo=0&pageSize=50&sortDirection=DESC&sortBy=requestId";
      getDetails(url)
        .then((res) => {
          if (res) {
            for (let i = 0; i < res.length; i++) {
              self.fbdiConversionArray.push({
                SNo: i + 1,
                requestId: res[i].requestId,
                requestType: res[i].requestType,
                templateId: res[i].templateId,
                templateName: res[i].templateName,
                batchName: res[i].batchName,
                status: res[i].status,
                totalRecords: res[i].totalRecords,
                percentage: res[i].percentage,
                startDate: res[i].startDate,
                endDate: res[i].endDate,
                errorMsg: res[i].errorMsg,
                userId: res[i].userId,
                parentObjectCode: res[i].parentObjectCode,
                successRec: res[i].successRec,
                failRec: res[i].failRec,
              });
            }
            $(".progress").hide();
          }
        })
        .catch((error) => {
          $(".progress").hide();
          console.log(error);
        });
    }

    self.exportCloudDisabled = ko
      .computed(function () {
        if (self.tempId() && self.batchName() && self.objectName()) {
          return false;
        } else {
          return true;
        }
      })
      .bind(this);

    self.exportCloud = function () {
      if (self.tempId() && self.batchName() && self.objectName()) {
        $(".progress").show();
        let url = riteUTils.riteProps.loadandimportdatav1;
        let obj = {
          cloudTemplateId: self.tempId(),
          parameterList: self.parameterList(),
          batchName: self.batchName(),
          objectName: self.objectName(),
          clientId: parseInt(sessionStorage.getItem("clientId")),
          podId: parseInt(sessionStorage.getItem("X-TENANT-ID")),
        };
        postDetails(url, obj)
          .then((res) => {
            if (res) {
              if (!res.resultId == null || !res.resultId == "0") {
                self.messages.push({
                  severity: "confirmation",
                  summary: res.message,
                  detail: "Result Id : " + res.resultId,
                  autoTimeout: 0,
                });
                $(".progress").hide();
              } else {
                self.messages.push({
                  severity: "error",
                  summary: res.error,
                  autoTimeout: 0,
                });
                $(".progress").hide();
              }
            }
          })
          .catch(function (error) {
            $(".progress").hide();
            console.log(error);
          });
      }
    };

    function _checkValidationGroup() {
      const tracker = document.getElementById("tracker");
      if (tracker.valid === "valid") {
        return true;
      } else {
        // show messages on all the components that are invalidHiddden, i.e., the
        // required fields that the user has yet to fill out.
        tracker.showMessages();
        Context.getPageContext()
          .getBusyContext()
          .whenReady()
          .then(() => tracker.focusOn("@firstInvalidShown"));
        return false;
      }
    }

    self.resetConversions = function () {
      resetConversions();
    };

    function resetConversions() {
      self.selecttemp("");
      self.batchName("");
      self.parameterList("");
      self.objectName("");
    }

    this.connected = () => {
      accUtils.announce("FBDI Conversions page loaded.", "assertive");
      if (self.typelabel() == "FBDI") {
        document.title = "FBDI Conversions";
      }
      if (self.typelabel() == "HDL") {
        document.title = "HDL Conversions";
      }

      getProcessStatus();
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
  return ConversionsViewModel;
});
