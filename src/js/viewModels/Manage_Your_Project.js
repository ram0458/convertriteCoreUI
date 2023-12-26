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
  "ojs/ojbufferingdataprovider",
  "ojs/ojarraydataprovider",
  "ojs/ojlistdataproviderview",
  "ojs/ojconverterutils-i18n",
  "ojs/ojconverter-datetime",
  "ojs/ojconverter-number",
  "ojs/ojcontext",
  "ojs/ojinputtext",
  "ojs/ojcheckboxset",
  "ojs/ojbutton",
  "ojs/ojtable",
  "ojs/ojinputsearch",
  "ojs/ojdatetimepicker",
  "ojs/ojselectsingle",
  "ojs/ojformlayout",
  "ojs/ojdialog",
  "ojs/ojmessages",
  "ojs/ojvalidationgroup",
  "ojs/ojdefer",
], function (
  accUtils,
  ko,
  axios,
  BufferingDataProvider,
  ArrayDataProvider,
  ListDataProviderView,
  ConverterUtilsI18n,
  DateTimeConverter,
  NumberConverter,
  Context
) {
  function Manage_Your_ProjectViewModel() {
    var self = this;

    self.projectId = ko.observable("0");
    self.projectName = ko.observable("");
    self.description = ko.observable("");
    self.projectManager = ko.observable("");
    self.projectsNameArray = ko.observableArray([]);
    self.searchdataArray = ko.observableArray();
    self.srchfilter = ko.observable();
    this.searchfilter = ko.observable("");
    self.messages = ko.observableArray();
    self.minDate = ko.observable();
    self.maxDate = ko.observable();
    this.groupValid = ko.observable();
    self.taskNameArray = ko.observableArray([]);
    self.taskTypeArray = ko.observableArray([]);
    self.taskStatusArray = ko.observableArray([]);
    self.objectCodeArray = ko.observableArray([]);
    self.projectNameArray = ko.observableArray([]);
    self.projectManagerArray = ko.observableArray([]);
    self.ColsObservableArray = ko.observableArray([]);
    self.projTempId = ko.observable("");
    this.editRow = ko.observable();
    self.projId = ko.observable();
    self.moduleCode = ko.observable();
    self.projectNameDisabled = ko.observable(true);
    self.importBtnDisabled = ko.observable(true);
    self.btnLbl = ko.observable('Save');


    self.startdate = ko.observable(
      ConverterUtilsI18n.IntlConverterUtils.dateToLocalIso(new Date())
    );
    self.enddate = ko.observable(
      ConverterUtilsI18n.IntlConverterUtils.dateToLocalIso(
        new Date(2024, 11, 31)
      )
    );
    if (!sessionStorage.getItem("user_role")) {
      window.location = "?ojr=Login";
    }
    this.dateConverter = new DateTimeConverter.IntlDateTimeConverter({
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
    });

    this.numberConverter = new NumberConverter.IntlNumberConverter();

    self.scrollPos = ko.observable({ rowIndex: 0 });

    self.loadMore = function () {
      self.scrollPos({ rowIndex: self.scrollPos._latestValue.rowIndex + 10 });
    };

    self.messagesDataProvider = new oj.ArrayDataProvider(self.messages);

    self.saveImportProjects = function () {
      const valid = _checkValidationGroup();
      if (valid) {
        self.projectNameArray().forEach((itm) => {
          if (self.projectName() == itm.value) {
            self.projId(itm.id);
          }
        });
        var editItems = self.dataprovider.getSubmittableItems();
        let data = {
          projectCode: self.projectName(),
          lastUpdatedBy: sessionStorage.getItem("userName"),
          lastUpdateDate: new Date().toISOString(),
          accessLevel: null,
          clientManager: null,
          clientProjectNum: null,
          completionDate: null,
          description: self.description(),
          kpiAggLevel: null,
          programNumber: null,
          projectId: self.projId(),
          projecManager: self.projectManager(),
          projectName: self.projectName(),
          projectStatus: null,
          startDate: new Date(self.startdate()).toISOString(),
          endDate: new Date(self.enddate()).toISOString()?new Date(self.enddate()).toISOString():null,
        };
        let url = riteUTils.riteProps.saveprojectheaders;
        postDetails(url, data).then((res) => {
          if (res) {
            self.messages.push({
              severity: "confirmation",
              summary: res.message,
              autoTimeout: 0,
            });
            self.btnLbl('Update');
            if (editItems.length!=0) {
              saveLines();
            }
          }
          else{
            self.messages.push({
              severity: "error",
              summary: res.message,
              autoTimeout: 0,
            });

          }
        }).catch((err) => {
          $(".progress").hide();
          if (err.response.status == 401) {
            self.messages.push({
              severity: "error",
              summary: err.response.data.message,
              autoTimeout: 0,
            });
            setTimeout(() => {
              sessionStorage.clear();
              window.location = "?ojr=Login";
            }, 300);
          }
          else{
            self.messages.push({
              severity: "error",
              summary: err.response.data.message,
              autoTimeout: 0,
            });
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

    this.searchanyvalueChanged = function () {
      this.searchfilter(document.getElementById("filter").rawValue);
    }.bind(this);

    this.searchdataprovider = ko.computed(function () {
      const filterRegEx = new RegExp(this.searchfilter(), "i");
      const filterCriterion = {
        op: "$or",
        criteria: [
          { op: "$regex", value: { projectName: filterRegEx } },
          { op: "$regex", value: { projectManager: filterRegEx } },
          { op: "$regex", value: { clientManager: filterRegEx } },
          { op: "$regex", value: { description: filterRegEx } },
        ],
      };
      const arrayDataProvider = new ArrayDataProvider(self.searchdataArray, {
        keyAttributes: "projectId",
      });
      return new ListDataProviderView(arrayDataProvider, {
        filterCriterion: filterCriterion,
      });
    }, this);

    self.showSrchDailog = function () {
      self.srchfilter('');
      document.querySelector("#srchDailog").open();
      getLOVData();
    };

    self.closeSrchDailog = function () {
      document.querySelector("#srchDailog").close();
    };

    self.resetProjects = function (event) {
      getProjectData();
      self.projectId("0");
      self.projectName("");
      self.projectManager("");
      self.projectNameDisabled(false);
      self.importBtnDisabled(false);
      self.description("");
      self.btnLbl('Save');
      self.startdate(
        ConverterUtilsI18n.IntlConverterUtils.dateToLocalIso(new Date())
      );
      self.projId();
      self.enddate(
        ConverterUtilsI18n.IntlConverterUtils.dateToLocalIso(
          new Date(2024, 11, 31)
        )
      );
      while (self.ColsObservableArray().length > 0) {
        self.ColsObservableArray.pop();
      }
    };

    function getLOVData() {
      let url = riteUTils.riteProps.getAllProjectHeaders;
      while(self.searchdataArray().length>0){
        self.searchdataArray.pop();
      }
      getDetails(url)
        .then((res) => {
          if (res) {
            for (let i = 0; i < res.length; i++) {
              self.searchdataArray.push({
                projectId: res[i].projectId,
                projectName: res[i].projectName,
                projectCode: res[i].projectCode,
                description: res[i].description,
                projecManager: res[i].projecManager,
                clientManager: res[i].clientManager,
                kpiAggLevel: res[i].kpiAggLevel,
                startDate: res[i].startDate,
                endDate: res[i].endDate,
                projectStatus: res[i].projectStatus,
                accessLevel: res[i].accessLevel,
                clientProjectNumber: res[i].clientProjectNumber,
                programNumber: res[i].programNumber,
                lastUpdatedBy: res[i].lastUpdatedBy,
                lastUpdateDate: res[i].lastUpdateDate,
              });
            }
          }
          $(".progress").hide();
        })
        .catch((err) => {
          $(".progress").hide();
          if (err.response.status == 401) {
            self.messages.push({
              severity: "error",
              summary: err.response.data.message,
              autoTimeout: 0,
            });
            setTimeout(() => {
              sessionStorage.clear();
              window.location = "?ojr=Login";
            }, 300);
          }
          else{
            self.messages.push({
              severity: "error",
              summary: err.response.data.message,
              autoTimeout: 0,
            });
          }
        });
    }

    self.selectionListener = function (event) {
      var data = event.detail;
      if (event.type == "selectionChanged") {
        var eventTxt = "Triggered selectionChanged event: \n";
        var selectionObj = data["value"];
        if (selectionObj.length > 0) {
          var range = selectionObj[0];
          var startIndex = range.startIndex;
          if (startIndex != null && startIndex.row != null) {
            var workpackid = selectionObj[0].startKey.row;
            var selrow = ko.utils.arrayFirst(
              self.searchdataArray(),
              function (item) {
                return workpackid === item.projectId;
              }
            );
            self.btnLbl('Update');
            self.description(selrow.description);
            self.projectName(selrow.projectName);
            self.projId(selrow.projectId);
             self.projectManager(selrow.projecManager);
            self.projectId("1");
            self.startdate(selrow.startDate);
            self.enddate(selrow.endDate);
            ActivityLinesTable(selrow.projectId);
            document.querySelector("#srchDailog").close();
          }
        }
      }
    };


    function ActivityLinesTable(proid) {
      if (proid) {
        $(".progress").show();
        while (self.ColsObservableArray().length > 0) {
          self.ColsObservableArray.pop();
        }
        let url = riteUTils.riteProps.getprojectlinesbyid + "?projectId="+ proid + "&pageNo=0&pageSize=1000&sortDirection=ASC&sortBy=seq";
        getDetails(url)
          .then((response) => {
            if (response) {
              for (let i = 0; i < response.length; i++) {
                self.ColsObservableArray.push({
                  rowId: i + 1,
                  taskName: response[i].taskName,
                  objectId: response[i].objectId,
                  taskType: response[i].taskType,
                  startDate:  self.startdate(),
                  preReqTask: response[i].preReqTask,
                  endDate:  ConverterUtilsI18n.IntlConverterUtils.dateToLocalIso(new Date(2024, 11, 31)),
                  weightage: response[i].weightage,
                  taskStatus: 'Open',
                  completionFlag: [
                    response[i].completionFlag == "Y" ? "checked" : "",
                  ],

                  destinationResourceId: response[i].destinationResourceId,
                  completePercentage: response[i].completePercentage,
                  taskOwnerId: response[i].taskOwnerId,
                  clientResourceId: response[i].clientResourceId,
                  integratorResourceId: response[i].integratorResourceId,
                  legacyResourceId: response[i].legacyResourceId,
                  attribute1: response[i].attribute1,
                  attribute2: response[i].attribute2,
                  seq: response[i].seq,
                  taskId: response[i].taskId,
                  taskNum: response[i].taskNum,
                });
              }
              $(".progress").hide();
            }
          })
          .catch((err) => {
            $(".progress").hide();
            if (err.response.status == 401) {
              self.messages.push({
                severity: "error",
                summary: err.response.data.message,
                autoTimeout: 0,
              });
              setTimeout(() => {
                sessionStorage.clear();
                window.location = "?ojr=Login";
              }, 300);
            }
            else{
              self.messages.push({
                severity: "error",
                summary: err.response.data.message,
                autoTimeout: 0,
              });
            }
          });
      }
    }

    function templinesTable(projectId) {
      if (projectId) {
        $(".progress").show();
        while (self.ColsObservableArray().length > 0) {
          self.ColsObservableArray.pop();
        }
        let url = riteUTils.riteProps.getProjectLines + "?projectId=" + projectId;
        getDetails(url)
          .then((response) => {
            if (response) {
              for (let i = 0; i < response.length; i++) {
                self.ColsObservableArray.push({
                  rowId: i + 1,
                  taskName: response[i].taskName,
                  objectId: response[i].objectId,
                  taskType: response[i].taskType,
                  startDate: response[i].startDate,
                  preReqTask: response[i].preReqTask,
                  endDate: response[i].endDate,
                  weightage: response[i].weightage,
                  taskStatus: response[i].taskStatus,
                  completionFlag: [
                    response[i].completionFlag == "Y" ? "checked" : "",
                  ],

                  destinationResourceId: response[i].destinationResourceId,
                  completePercentage: response[i].completePercentage,
                  taskOwnerId: response[i].taskOwnerId,
                  clientResourceId: response[i].clientResourceId,
                  integratorResourceId: response[i].integratorResourceId,
                  legacyResourceId: response[i].legacyResourceId,
                  attribute1: response[i].attribute1,
                  attribute2: response[i].attribute2,
                  seq: response[i].seq,
                  taskId: response[i].taskId,
                  taskNum: response[i].taskNum,
                });
              }
              $(".progress").hide();
              self.importBtnDisabled(true);

            }
          })
          .catch((err) => {
            $(".progress").hide();
            if (err.response.status == 401) {
              self.messages.push({
                severity: "error",
                summary: err.response.data.message,
                autoTimeout: 0,
              });
              setTimeout(() => {
                sessionStorage.clear();
                window.location = "?ojr=Login";
              }, 300);
            }
            else{
              self.messages.push({
                severity: "error",
                summary: err.response.data.message,
                autoTimeout: 0,
              });
            }
          });
      }
    }

    this.dataprovider = new BufferingDataProvider(
      new ArrayDataProvider(self.ColsObservableArray, {
        keyAttributes: "rowId",
      })
    );

    this.dataprovider.addEventListener(
      "submittableChange",
      function (event) {
        var submittable = event.detail;
        this.showSubmittableItems(submittable);
      }.bind(this)
    );

    function saveLines() {
      var editItems = self.dataprovider.getSubmittableItems();
      let url = riteUTils.riteProps.upsertprojectactivities;
      let data = [];
      let objdata;
      editItems.forEach((editItem) => {
         objdata = {
          "taskId":editItem.item.data.taskId,
          "attribute1": "",
          "attribute2": "",
          "attribute3": "",
          "attribute4": "",
          "attribute5": "",
          "clientResourceId": editItem.item.data.clientResourceId?editItem.item.data.clientResourceId:0,
          "cloudResourceId": editItem.item.data.cloudResourceId?editItem.item.data.cloudResourceId:0,
          "completePercentage": editItem.item.data.completePercentage?editItem.item.data.completePercentage:0,
          "completionFlag": editItem.item.data.completionFlag[0] === "checked" ? "Y" : "N",
          "destinationResourceId": editItem.item.data.destinationResourceId?editItem.item.data.destinationResourceId:0,
          "endDate":  editItem.item.data.endDate === null
          ? null
          : new Date(editItem.item.data.endDate).toISOString(),
          "integratorResourceId": 0,
          "legacyResourceId": 0,
          "objectId": editItem.item.data.objectId,
          "parentObjectId": 0,
          "preReqTask": editItem.item.data.preReqTask?editItem.item.data.preReqTask:'',
          "projectId": self.projId(),
          "seq": editItem.item.data.seq?editItem.item.data.seq:0,
          "startDate": editItem.item.data.startDate === null
          ? null
          : new Date(editItem.item.data.startDate).toISOString(),   
          "taskName": editItem.item.data.taskName?editItem.item.data.taskName:"",
          "taskNum": editItem.item.data.taskNum?editItem.item.data.taskNum:'',
          "taskOwnerId": editItem.item.data.taskOwnerId?editItem.item.data.taskOwnerId:0,
          "taskStatus": editItem.item.data.taskStatus?editItem.item.data.taskStatus:'',
          "taskType": editItem.item.data.taskType?editItem.item.data.taskType:'',
          "wbsId": editItem.item.data.weightage?editItem.item.data.weightage:0,
          "weightage": editItem.item.data.weightage?editItem.item.data.weightage:0,
          "lastUpdatedBy":sessionStorage.getItem("userName"),
          "lastUpdateDate":new Date().toISOString()    
        };
        data.push(objdata);
      });
      $(".progress").show();

      postDetails(url, data)
        .then((res) => {
          if(res){
          $(".progress").hide();
          self.messages.push({
            severity: "confirmation",
            summary: "Project Lines Saved/Updated Successfully",
            autoTimeout: 0,
          });
        }
        })
        .catch((err) => {
          $(".progress").hide();
          if (err.response.status == 401) {
            self.messages.push({
              severity: "error",
              summary: err.response.data.message,
              autoTimeout: 0,
            });
            setTimeout(() => {
              sessionStorage.clear();
              window.location = "?ojr=Login";
            }, 300);
          }
          else{
            self.messages.push({
              severity: "error",
              summary: err.response.data.message,
              autoTimeout: 0,
            });
          }
        });
    }

    function getProjectData() {
      let projNameurl =
        riteUTils.riteProps.getProjectsAndObjects +
        "?clientId=" +
        sessionStorage.getItem("clientId") +
        " &podId=" +
        sessionStorage.getItem("X-TENANT-ID");
      getDetails(projNameurl)
        .then((res) => {
          if (res) {
           while(self.projectNameArray().length>0){
            self.projectNameArray.pop();
           }
            for (let i = 0; i < res.payload.length; i++) {
              self.projectNameArray.push({
                value:  res.payload[i].projectCode,
                id:  res.payload[i].projectId,
                label:  res.payload[i].projectCode,
              });
            
            }

            }
        }).catch((err) => {
          $(".progress").hide();
          if (err.response.status == 401) {
            self.messages.push({
              severity: "error",
              summary: err.response.data.message,
              autoTimeout: 0,
            });
            setTimeout(() => {
              sessionStorage.clear();
              window.location = "?ojr=Login";
            }, 300);
          }
          else{
            self.messages.push({
              severity: "error",
              summary: err.response.data.message,
              autoTimeout: 0,
            });
          }
        });
    }
    this.projectNamedata = new ArrayDataProvider(self.projectNameArray, {
      keyAttributes: "value",
    });

    self.projectNameValueChange = function (event) {
      if (event.detail.value) {
        self.projectManagerArray([]);
        self.projectManagerArray.push({
          value: "Balamurali V",
          id: 1,
          label: "Balamurali V",
        },
        {
          value: "Krishna B",
          id: 2,
          label: "Krishna B",
        },
        {
          value: "Kris Rangaraju",
          id: 3,
          label: "Kris Rangaraju",
        },
        {
          value: "Rajkamal M",
          id: 4,
          label: "Rajkamal M",
        });
      } 
    };

    self.importProjects = function () {
      let projNameurl =
        riteUTils.riteProps.getImportProjectsAndObjects +
        "?clientId=" +
        sessionStorage.getItem("clientId") +
        " &podId=" +
        sessionStorage.getItem("X-TENANT-ID") +
        "&projectCode=" +
        self.projectName();
      getDetails(projNameurl)
        .then((res) => {
          if (res) {
              self.projectNameDisabled(true);
                  templinesTable(res[0].projectId);
                }
          
        })
        .catch((err) => {
          $(".progress").hide();
          if (err.response.status == 401) {
            self.messages.push({
              severity: "error",
              summary: err.response.data.message,
              autoTimeout: 0,
            });
            setTimeout(() => {
              sessionStorage.clear();
              window.location = "?ojr=Login";
            }, 300);
          }
          else{
            self.messages.push({
              severity: "error",
              summary: err.response.data.message,
              autoTimeout: 0,
            });
          }
        });
    };

    self.objectDtlsArray = ko.observableArray([]);

    this.objectsdataprovider = new ArrayDataProvider(self.objectDtlsArray, {
      keyAttributes: "objectId",
    });


    self.projectManagerArray.push({
      value: "Balamurali V",
      id: 1,
      label: "Balamurali V",
    },
    {
      value: "Krishna B",
      id: 2,
      label: "Krishna B",
    },
    {
      value: "Kris Rangaraju",
      id: 3,
      label: "Kris Rangaraju",
    },
    {
      value: "Rajkamal M",
      id: 4,
      label: "Rajkamal M",
    });
    this.projectmanagerdata = new ArrayDataProvider(self.projectManagerArray, {
      keyAttributes: "value",
    });

     getTaskName();
    function getTaskName() {
      let url =
        riteUTils.riteProps.getlovbylookupsetname + "?lookupSetName= Task Name";
      getDetails(url)
        .then((res) => {
          if (res) {
            while (self.taskNameArray().length > 0) {
              self.taskNameArray.pop();
            }
            for (let i = 0; i < res.length; i++) {
              let obj = {
                value: res[i].value,
                id: res[i].id,
                label: res[i].value,
              };
              self.taskNameArray.push(obj);
            }
          }
        })
        .catch((err) => {
          $(".progress").hide();
          if (err.response.status == 401) {
            self.messages.push({
              severity: "error",
              summary: err.response.data.message,
              autoTimeout: 0,
            });
            setTimeout(() => {
              sessionStorage.clear();
              window.location = "?ojr=Login";
            }, 300);
          }
          else{
            self.messages.push({
              severity: "error",
              summary: err.response.data.message,
              autoTimeout: 0,
            });
          }
        });
    }

    this.taskNamedata = new ArrayDataProvider(self.taskNameArray, {
      keyAttributes: "value",
    });

    getTasktype();
    function getTasktype() {
      let taskTypeurl =
        riteUTils.riteProps.getlovbylookupsetname + "?lookupSetName=Task Type";
      getDetails(taskTypeurl)
        .then((res) => {
          if (res) {
            while (self.taskTypeArray().length > 0) {
              self.taskTypeArray.pop();
            }
            for (let i = 0; i < res.length; i++) {
              let obj = {
                value: res[i].value,
                id: res[i].id,
                label: res[i].value,
              };
              self.taskTypeArray.push(obj);
            }
          }
        })
        .catch((err) => {
          $(".progress").hide();
          if (err.response.status == 401) {
            self.messages.push({
              severity: "error",
              summary: err.response.data.message,
              autoTimeout: 0,
            });
            setTimeout(() => {
              sessionStorage.clear();
              window.location = "?ojr=Login";
            }, 300);
          }
          else{
            self.messages.push({
              severity: "error",
              summary: err.response.data.message,
              autoTimeout: 0,
            });
          }
        });
    }

    this.tskTypeData = new ArrayDataProvider(self.taskTypeArray, {
      keyAttributes: "value",
    });

    this.objectCodeData= new ArrayDataProvider(self.objectCodeArray, {
      keyAttributes: "value",
    });

      // getTaskStatus();
    function getTaskStatus() {
      let taskStatusurl =
        riteUTils.riteProps.getlovbylookupsetname +
        "?lookupSetName=Task Status";
      getDetails(taskStatusurl)
        .then((res) => {
          if (res) {
            while (self.taskStatusArray().length > 0) {
              self.taskStatusArray.pop();
            }
            for (let i = 0; i < res.length; i++) {
              let obj = {
                value: res[i].value,
                id: res[i].id,
                label: res[i].value,
              };
              self.taskStatusArray.push(obj);
            }
          }
        })
        .catch((err) => {
          $(".progress").hide();
          if (err.response.status == 401) {
            self.messages.push({
              severity: "error",
              summary: err.response.data.message,
              autoTimeout: 0,
            });
            setTimeout(() => {
              sessionStorage.clear();
              window.location = "?ojr=Login";
            }, 300);
          }
          else{
            self.messages.push({
              severity: "error",
              summary: err.response.data.message,
              autoTimeout: 0,
            });
          }
        });
    }

    self.taskStatusArray.push({
      value: "Open",
      id: "Open",
      label: "Open",
    },
    {
      value: "Inprogress",
      id: "Inprogress",
      label: "Inprogress",
    },
    {
      value: "Completed",
      id: "Completed",
      label: "Completed",
    });
    

    this.taskstatusData = new ArrayDataProvider(self.taskStatusArray, {
      keyAttributes: "value",
    });



    self.close= function(event){
      document.getElementById('objectsDailog').close();

    }


    this.beforeRowEditListener = function (event) {
      var rowContext = event.detail.rowContext;
      var dataObj = rowContext.componentElement.getDataForVisibleRow(
        rowContext.status.rowIndex
      );
      this.originalData = Object.assign({}, dataObj.data);
      this.rowData = Object.assign({}, dataObj.data);
      currtemplinesrow = this.rowData;
    }.bind(this);

    this.beforeRowEditEndListener = function (event) {
      var detail = event.detail;
      if (!detail.cancelEdit) {
        if (hasValidationErrorInRow(event.target)) {
          event.preventDefault();
        } else {
          if (isRowDataUpdated()) {
            var key = detail.rowContext.status.rowKey;
            this.dataprovider.updateItem({
              metadata: { key: key },
              data: this.rowData,
            });
          }
        }
      }
    }.bind(this);
    var hasValidationErrorInRow = function (table) {
      var editables = table.querySelectorAll(".editable");
      for (i = 0; i < editables.length; i++) {
        var editable = editables.item(i);
        editable.validate();
        if (editable.valid !== "valid") {
          return true;
        }
      }
      return false;
    };

    var isRowDataUpdated = function () {
      var propNames = Object.getOwnPropertyNames(this.rowData);
      for (var i = 0; i < propNames.length; i++) {
        if (this.rowData[propNames[i]] !== this.originalData[propNames[i]]) {
          return true;
        }
      }
      return false;
    }.bind(this);

    this.showSubmittableItems = function (submittable) {
      var textValue = "";
      submittable.forEach(function (editItem) {
        textValue += editItem.operation + " ";
        textValue += editItem.item.metadata.key + ": ";
        textValue += JSON.stringify(editItem.item.data);
        // if (editItem.item.data.metadata.message) {
        //   textValue +=
        //     " error: " + JSON.stringify(editItem.item.data.metadata.message);
        // }
        textValue += "\n";
      });
    };

    this.handleUpdate = (event, context) => {
      this.editRow({ rowKey: context.item.data.rowId });
    };
    this.handleDone = () => {
      this.editRow({ rowKey: null });
    };
    this.handleCancel = () => {
      this.cancelEdit = true;
      this.editRow({ rowKey: null });
    };
    this.handleDelete = (event) => {
      if (event.target.innerText) {
        self.deleteRid(event.target.innerText);
        document.querySelector("#confirmDailog").open();
      }
    };

    self.checkboxselect = function (event) {
      var x3 = document.getElementById("clt3");
      if (x3.value[0] === "checked") {
        x3.value = ["unchecked"];
      } else if (x3.value[0] === "unchecked") {
        x3.value = ["checked"];
      }
    };

    this.connected = () => {
      accUtils.announce("Manage Your Project", "assertive");
      document.title = "Manage Your Project";
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
  return Manage_Your_ProjectViewModel;
});
