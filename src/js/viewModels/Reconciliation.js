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
  "require",
  "knockout",
  "axios",
  "ojs/ojcontext",
  "ojs/ojarraydataprovider",
  "ojs/ojlistdataproviderview",
  "ojs/ojvalidationgroup",
  "ojs/ojpopup",
  "ojs/ojinputtext",
  "ojs/ojbutton",
  "ojs/ojchart",
  "ojs/ojgauge",
  "ojs/ojlabel",
  "ojs/ojfilepicker",
  "ojs/ojtable",
  "ojs/ojcheckboxset",
  "ojs/ojinputsearch",
  "ojs/ojselectsingle",
  "ojs/ojformlayout",
  "ojs/ojmessages",
  "ojs/ojdialog",
  "ojs/ojdefer",
], function (
  accUtils,
  require,
  ko,
  axios,
  Context,
  ArrayDataProvider,
  ListDataProviderView
) {
  function ReconciliationViewModel() {
    var self = this;
    if (!sessionStorage.getItem("userId")) {
      window.location = "?ojr=Login";
    }
    self.projectId = ko.observable("");
    this.groupValid = ko.observable();
    self.batchName = ko.observable("");
    self.selecttemp = ko.observable("");
    self.projectsNameArray = ko.observableArray([]);
    self.templateArray = ko.observableArray([]);
    self.SuccFailChartData = ko.observableArray([]);
    self.succFailDataArray = ko.observableArray([]);
    self.batchNameArray = ko.observableArray([]);
    self.barChartDataArray = ko.observableArray([]);
    this.centerLabel = ko.observable("Reconciliation");
    this.labelStyle = ko.observable({ fontSize: "14px", color: "#999999" });
    this.innerRadius = ko.observable(0.65);
    self.selectionValue = ko.observable("single");
    self.isDashboarDetails = ko.observable(true);
    self.piechartDetails = ko.observableArray([]);
    self.pieChartArray = ko.observableArray([]);
    this.threeDValue = ko.observable("on");
    self.templateFilterArray = ko.observableArray([]);
    self.messages = ko.observableArray();
    self.messagesDataProvider = new oj.ArrayDataProvider(self.messages);
    self.selectionVariantListener = function (event) {}.bind(this);
    self.label = { text: "Source Records" };
    self.srcrecords = ko.observable();
    self.swichBtnViews = function () {
      if (!self.isDashboarDetails()) {
        self.isDashboarDetails(true);
      } else {
        self.isDashboarDetails(false);
      }
    };
    self.validPercentage = ko.observable("");
    self.validSuccess = ko.observable("");
    self.validFailed = ko.observable("");
    self.extPercentage = ko.observable("");
    self.extSuccess = ko.observable("");
    self.extFailed = ko.observable("");
    self.cludPercentage = ko.observable("");
    self.cludSuccess = ko.observable("");
    self.cludFailed = ko.observable("");
    // axios.defaults.headers.common['X-TENANT-ID'] = '77';
    //axios.defaults.headers.common['userId'] = '1234';
    axios.defaults.headers.common["X-TENANT-ID"] =
      sessionStorage.getItem("X-TENANT-ID");
    axios.defaults.headers.common["userId"] = sessionStorage.getItem("userId");

    function getProjectData() {
      while (self.projectsNameArray().length > 0) {
        self.projectsNameArray.pop();
        ``;
      }
      let url = riteUTils.riteProps.getAllProjectHeaders;
      getDetails(url)
        .then((res) => {
          $(".progress").show();
          if (res) {
            for (let i = 0; i < res.length; i++) {
              self.projectsNameArray.push({
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
        });
    }
    this.projectNamedata = new ArrayDataProvider(self.projectsNameArray, {
      keyAttributes: "id",
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
                projectId: res[i].projectId,
                projectName: res[i].projectName,
                validation: res[i].validation,
                srcTemplateId: res[i].srcTemplateId,
                reprocess: res[i].reprocess,
                conversion: res[i].conversion,
                filegen: res[i].filegen,
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

    self.projValueChange = function (event) {
      if (event.detail.value) {
        self.templateFilterArray([]);
        if (self.templateArray()) {
          self.templateArray().forEach((itm) => {
            if (itm.projectId == event.detail.value) {
              let obj = {
                id: itm.templateId,
                label: itm.templateName,
                value: itm.templateName,
                srcTemplateId: itm.srcTemplateId,              };
              self.templateFilterArray.push(obj);
            }
          });
        }
      }
    };

    this.templateData = new ArrayDataProvider(self.templateFilterArray, {
      keyAttributes: "value",
    });

    self.tempValueChanged = function(event){
      if (event.detail.value) {
        let tempId;
        self.templateFilterArray().forEach((itm) => {
          if (itm.value == event.detail.value) {
            tempId=itm.srcTemplateId;
          }
        });
      while (self.batchNameArray().length > 0) {
        self.batchNameArray.pop();
      }
      let url = riteUTils.riteProps.getAllBatchNames+"?cldTemplateId="+tempId;
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
    }

    this.batchNameData = new ArrayDataProvider(self.batchNameArray, {
      keyAttributes: "value",
    });



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

    this.seriesComparator = (seriesContext1, seriesContext2) => {
      if (seriesContext1.id > seriesContext2.id) return 1;
      else return -1;
    };

    this.groupComparator = (groupContext1, groupContext2) => {
      if (groupContext1.ids[0] < groupContext2.ids[0]) return -1;
      else return 1;
    };

    this.colors = ["#03991c", "#FF0000", "#f2e33d"];
    this.getColor = (indx) => {
      return this.colors[indx];
    };
    var colorMap = {
      Success: "rgb(53, 190, 116)",
      Failure: "rgb(255, 0, 0)",
    };

    getChartStatic();
    function getChartStatic() {
      let url = riteUTils.riteProps.gettemplatestatistics;
      while (self.barChartDataArray().length !== 0) {
        self.barChartDataArray.pop();
      }
      while (self.SuccFailChartData().length !== 0) {
        self.SuccFailChartData.pop();
      }
      getDetails(url).then((res) => {
        if (res) {
          if (self.selecttemp()) {
            for (let i = 0; i < res.length; i++) {
              if (res[i].criteriaName == self.selecttemp()) {
                let obj = {
                  id: i,
                  series: "Success",
                  group: res[i].criteriaName,
                  value: res[i].success,
                  label: res[i].criteriaName,
                };
                let obj1 = {
                  id: i + 1,
                  series: "Failed",
                  group: res[i].criteriaName,
                  value: res[i].failed,
                  label: res[i].criteriaName,
                };
                let obj2 = {
                  id: i + 2,
                  series: "Unverified",
                  group: res[i].criteriaName,
                  value: res[i].unverified,
                  label: res[i].criteriaName,
                };
                self.SuccFailChartData.push(obj);
                self.SuccFailChartData.push(obj1);
                self.SuccFailChartData.push(obj2);
                //  self.barChartDataArray.push(obj);
                //   self.barChartDataArray.push(obj1);
                //  self.barChartDataArray.push(obj2);
              }
            }
          } else {
            for (let i = 0; i < res.length; i++) {
              let obj = {
                id: i,
                series: "Success",
                group: res[i].criteriaName,
                value: res[i].success,
                label: res[i].criteriaName,
              };
              let obj1 = {
                id: i + 1,
                series: "Failed",
                group: res[i].criteriaName,
                value: res[i].failed,
                label: res[i].criteriaName,
              };
              let obj2 = {
                id: i + 2,
                series: "Unverified",
                group: res[i].criteriaName,
                value: res[i].unverified,
                label: res[i].criteriaName,
              };
              self.SuccFailChartData.push(obj);
              self.SuccFailChartData.push(obj1);
              self.SuccFailChartData.push(obj2);
              // self.barChartDataArray.push(obj);
              // self.barChartDataArray.push(obj1);
              // self.barChartDataArray.push(obj2);
            }
          }
        }
      });
    }

    this.dataprovider = new ArrayDataProvider(self.succFailDataArray, {
      keyAttributes: "value",
    });

    this.getSeriesColor = function (seriesId) {
      return colorMap[seriesId];
    };

    function getPieChartDetails() {
      let url = riteUTils.riteProps.getCrTransformStats;
      getDetails(url)
        .then((res) => {
          if (res) {
            for (let i = 0; i < res.length; i++) {
              let obj = {
                projectId: res[i].projectId,
                cloudTemplateName: res[i].cloudTemplateName,
                projectName: res[i].projectName,
                vsTransRec: res[i].vsTransRec,
                vsTranFailed: res[i].vfUntransRec + res[i].vfTransRec,
                cloudFaildedRecords:
                  res[i].totalUnTransRec + res[i].cloudIntRejRec,
                cloudSuccessRec: res[i].cloudSuccessRec,
                sourceUnverified: res[i].sourceUnverified,
                vfTransRec: res[i].vfTransRec,
                vfUntransRec:res[i].vfUntransRec,
                validationPassed: res[i].validationPassed,
                totalSourceRecords: res[i].totalSourceRecords
                  ? res[i].totalSourceRecords
                  : 0,
                cloudSuccessRec: res[i].cloudSuccessRec
                  ? res[i].cloudSuccessRec
                  : 0,
                cloudIntRejRec: res[i].cloudIntRejRec
                  ? res[i].cloudIntRejRec
                  : 0,
                validationFailed: res[i].validationFailed
                  ? res[i].validationFailed
                  : 0,
              };
              self.piechartDetails.push(obj);
            }
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
    self.viewReconDetails = function () {
      if (self.piechartDetails().length !== 0) {
        getChartStatic();
        while (self.pieChartArray().length !== 0) {
          self.pieChartArray.pop();
        }
        self.type("Cloud Success");
        self.piechartDetails().forEach((itm, i) => {
          if (self.selecttemp() == itm.cloudTemplateName) {
            self.type("Cloud Success");

            self.srcrecords("Total Source Records : " + itm.totalSourceRecords);
            self.validFailed(itm.vfUntransRec);
            self.validSuccess(itm.vsTransRec);
            self.validPercentage(
              (
                (itm.vsTransRec / (itm.vfUntransRec + itm.vsTransRec)) *
                100
              ).toFixed(2)
            );
            self.extFailed(itm.sourceUnverified);
            self.extSuccess(itm.totalSourceRecords - itm.sourceUnverified);
            self.extPercentage(
              (
                ((itm.totalSourceRecords + itm.sourceUnverified) /
                  itm.totalSourceRecords) *
                100
              ).toFixed(2)
            );

            self.cludFailed(itm.cloudIntRejRec);
            self.cludSuccess(itm.cloudSuccessRec);
            self.cludPercentage(
              (
                (itm.cloudSuccessRec /
                  (itm.cloudSuccessRec + itm.cloudIntRejRec)) *
                100
              ).toFixed(2)
            );
            self.barChartDataArray.push(
              {
                id: i,
                result: "Success",
                status: "Extracted",
                value: parseInt(self.extSuccess() ? self.extSuccess() : 0),
              },
              {
                id: i + 1,
                result: "Failure",
                status: "Extracted",
                value: parseInt(self.extFailed() ? self.extFailed() : 0),
              },
              {
                id: i + 2,
                result: "Success",
                status: "Validated",
                value: parseInt(itm.vsTransRec ? itm.vsTransRec : 0),
              },
              {
                id: i + 3,
                result: "Failure",
                status: "Validated",
                value: parseInt(itm.vfUntransRec ? itm.vfUntransRec : 0),
              },
              {
                id: i + 4,
                result: "Success",
                status: "Cloud Migrated",
                value: parseInt(itm.cloudSuccessRec ? itm.cloudSuccessRec : 0),
              },
              {
                id: i + 5,
                result: "Failure",
                status: "Cloud Migrated",
                value: parseInt(itm.cloudIntRejRec ? itm.cloudIntRejRec : 0),
              }
            );

            self.pieChartArray([
              {
                id: 1,
                series: "Total Cloud Success",
                group: "Group A",
                value: itm.cloudSuccessRec,
              },
              {
                id: 2,
                series: "Cloud Int Reject",
                group: "Group A",
                value: itm.cloudIntRejRec,
              },
              {
                id: 3,
                series: "Validation Failed",
                group: "Group A",
                value: itm.validationFailed,
              },
            ]);
          }
        });
      } else {
        self.messages.push({
          severity: "error",
          summary: "No Records Found",
          autoTimeout: 0,
        });
      }

      //console.log(chartData);
    };
    this.barChartDataProvider = new ArrayDataProvider(self.barChartDataArray, {
      keyAttributes: "id",
    });
    this.SuccFailDataProvider = new ArrayDataProvider(self.pieChartArray, {
      keyAttributes: "id",
    });
    self.type = ko.observable("");
    self.dwnSuccRecords = function () {
      self.type("Cloud Success");
      downloadFailRejeRecords();
    };
    self.dwnRejectionRecords = function () {
      self.type("Cloud Rejection");
      downloadFailRejeRecords();
    };
    self.dwnFailRecords = function () {
      self.type("Validation Failed");
      downloadFailRejeRecords();
    };
    function downloadFailRejeRecords() {
      // if(self.templateFilterArray()){
      let tempId;
      self.templateFilterArray().forEach((itm) => {
        if (itm.value == self.selecttemp()) {
          tempId = itm.id;
        }
      });

      $(".progress").show();
      let downfbdi = "";
      if (self.type() == "Cloud Rejection") {
        downfbdi = {
          method: "Get",
          url:
            riteUTils.riteProps.downloadCloudImportRejRec +
            "?cloudTemplateId=" +
            tempId +
            "&batchName=" +
            self.batchName(),
          responseType: "text/csv",
        };
      } else if (self.type() == "Cloud Success") {
        downfbdi = {
          method: "Get",
          url:
            riteUTils.riteProps.downloadCloudImportSuccessRec +
            "?cloudTemplateId=" +
            tempId +
            "&batchName=" +
            self.batchName(),
          responseType: "text/csv",
        };
      } else if (self.type() == "Validation Failed") {
        downfbdi = {
          method: "Get",
          url:
            riteUTils.riteProps.downloadValFailRec +
            "?cloudTemplateId=" +
            tempId +
            "&batchName=" +
            self.batchName(),
          responseType: "text/csv",
        };
      }
      axios(downfbdi)
        .then(function (response) {
          if (response) {
            $(".progress").hide();
            let downloadUrl = window.URL.createObjectURL(
              new Blob([response.data])
            );
            let link = document.createElement("a");
            link.href = downloadUrl;
            link.setAttribute("download", self.selecttemp() +"_" +self.type() + ".csv"); //any other extension
            document.body.appendChild(link);
            link.click();
            link.remove();
          }
        })
        .catch(function (error) {
          $(".progress").hide();
          console.log(error);
        });
      //  }
    }

    this.connected = () => {
      accUtils.announce("Reconciliation page loaded.", "assertive");
      document.title = "Reconciliation";
      getProjectData();
      getPieChartDetails();
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
  return ReconciliationViewModel;
});
