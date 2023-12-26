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
  "ojs/ojarraydataprovider",
  "ojs/ojlistdataproviderview",
  "ojs/ojvalidationgroup",
  "ojs/ojinputtext",
  "ojs/ojbutton",
  "ojs/ojtable",
  "ojs/ojselectsingle",
  "ojs/ojcheckboxset",
  "ojs/ojformlayout",
  "ojs/ojmessages",
  "ojs/ojdialog",
  "ojs/ojdefer",
], function (accUtils, ko, ArrayDataProvider, ListDataProviderView) {
  function Cloud_Query_ToolViewModel() {
    var self = this;
    if (!sessionStorage.getItem("user_role")) {
      window.location = "?ojr=Login";
    }
    self.destinationType = ko.observable("Table Sync");
    self.tableName = ko.observable("");
    self.metaData = ko.observable("");
    self.sqlQuery = ko.observable("");
    self.statusId = ko.observable("");
    self.flag = ko.observable("0");
    self.srchfilter = ko.observable("");
    self.searchdataArray = ko.observableArray([]);
    self.ColsObservableArray = ko.observableArray([]);
    self.isExtraction = ko.observable("");
    this.searchfilter = ko.observable("");
    this.groupValid = ko.observable();
    self.deleteRid = ko.observable("");
    self.scrollPos = ko.observable({ rowIndex: 0 });
    self.maxPageNo = ko.observable();
    self.pageNo = ko.observable(1);
    self.pages = ko.observable("");
    self.isPagination = ko.observable(false);
    self.totalPages = ko.observableArray([]);
    self.id = ko.observable("");
    self.messages = ko.observableArray();
    self.messagesDataProvider = new oj.ArrayDataProvider(self.messages);
    self.tableDestTypeDisabled = ko.observable(false);
    self.btnLbl = ko.observable("Save");
    self.batchSize = ko.observable(0);
    self.ismetaData = ko.observableArray([]);
    self.isVisible = ko.observable(false);
    self.destDataArray = ko.observableArray([
      {
        id: 1,
        label: "Table Sync",
        value: "Table Sync",
      },
      {
        id: 2,
        label: "Lookups",
        value: "Lookups",
      },
    ]);
    this.destNamedata = new ArrayDataProvider(self.destDataArray, {
      keyAttributes: "value",
    });

    this.eatNonNumbers = (event) => {
      let charCode = event.which ? event.which : event.keyCode;
      let char = String.fromCharCode(charCode);
      let replacedValue = char.replace(/[^0-9\.]/g, "");
      if (char !== replacedValue) {
        event.preventDefault();
      }
    };

    self.ismetaDatChecked = function (event) {
      var x = document.getElementById("ismetaData");
      if (x.value[0] === "checked") {
        x.value = ["unchecked"];
        self.ismetaData()[0] = "N";
      } else if (x.value[0] === "unchecked") {
        x.value = ["checked"];
        self.ismetaData()[0] = "Y";
      }
      self.isVisible(!self.isVisible());
    };

    self.destnameValueChange = function (event) {
      if (event.detail.value) {
        self.sqlQuery("");
        self.destinationType(event.detail.value);
      }
    };

    self.loadMore = function () {
      self.scrollPos({ rowIndex: self.scrollPos._latestValue.rowIndex + 10 });
    };

    self.showSrchDailog = function () {
      self.srchfilter("");
      document.querySelector("#srchDailog").open();
      self.pageNo(1);
      getCloudData();
    };

    self.closeSrchDailog = function () {
      document.querySelector("#srchDailog").close();
    };

    this.srchvalueChanged = function () {
      this.searchfilter(document.getElementById("filter").rawValue);
      console.log("inside searchdataprovider");
    }.bind(this);

    this.searchdataprovider = ko.computed(function () {
      const filterRegEx = new RegExp(this.searchfilter(), "i");
      const filterCriterion = {
        op: "$or",
        criteria: [
          { op: "$regex", value: { sqlQuery: filterRegEx } },
          { op: "$regex", value: { tableName: filterRegEx } },
          { op: "$regex", value: { metaData: filterRegEx } },
          { op: "$regex", value: { destinationType: filterRegEx } },
        ],
      };
      const arrayDataProvider = new ArrayDataProvider(self.searchdataArray, {
        keyAttributes: "statusId",
      });
      return new ListDataProviderView(arrayDataProvider, {
        filterCriterion: filterCriterion,
      });
    }, this);

    self.openSqlDailog = function () {
      let popup = document.getElementById("popup1");
      popup.open("#sqlPopup");
    };

    function getCloudData() {
      // let pageNumber;
      // if (self.pageNo() == 1) {
      //   pageNumber = 0;
      // }
      // else if (self.pageNo() == 0) {
      //   pageNumber = 0;
      // }
      // else {
      //   pageNumber = self.pageNo() - 1;
      // }

      $(".progress").show();
      let extractionFlag = "Table Sync";
      let url;
      if (self.isExtraction() == "Y") {
        url =
          riteUTils.riteProps.getclouddatarequest +
          "?pageNo=0" +
          "&extractionFlag=" +
          extractionFlag +
          "&pageSize=150&sortDirection=DESC&sortBy=creationDate" +
          "&podId=" +
          sessionStorage.getItem("X-TENANT-ID");
      } else {
        url =
          riteUTils.riteProps.getallclouddatarequest +
          "?pageNo=0&pageSize=50&sortDirection=DESC&sortBy=creationDate" +
          "&podId=" +
          sessionStorage.getItem("X-TENANT-ID");
      }
      while (self.searchdataArray().length > 0) {
        self.searchdataArray.pop();
      }
      getDetails(url)
        .then((res) => {
          if (res) {
            $(".progress").hide();
            // self.pages(res.headers.pagecount);
            // let serialno;
            // if (self.pageNo() == 1) {
            //   serialno = 0;
            // }
            // else {
            //   serialno = 100;
            // }
            // self.maxPageNo(parseInt(res.headers.pagecount));
            // if(res.headers.pagecount==0){
            //   self.totalPages([]);
            // }
            // if(!self.isPagination()){
            //   self.totalPages([]);
            //   let pageCnt = parseInt(res.headers.pagecount);
            //   let obj={
            //     'page':'<<'
            //   }
            //   self.totalPages.push(obj);
            //   if(pageCnt>5){
            //     pageCnt=5;
            //   }
            //   for(let p=0;p<pageCnt;p++){
            //     let obj={
            //       'page':p+1
            //     }
            //     self.totalPages.push(obj);
            //   }
            //     let rtobj={
            //       'page':'>>'
            //     }
            //     self.totalPages.push(rtobj);

            //   self.isPagination(true);
            // }

            for (let i = 0; i < res.length; i++) {
              self.searchdataArray.push({
                rowid: i + 1,
                id: res[i].id,
                sqlQuery: res[i].sqlQuery,
                destinationType: res[i].destinationType,
                tableName: res[i].tableName,
                metaData: res[i].metaData,
                statusId: res[i].statusId,
                lookUpFlag: res[i].lookupFlag,
                status: res[i].status,
                batchSize: res[i].batchSize,
              });
            }
          }
        })
        .catch((error) => {
          $(".progress").hide();
          console.log(error);
        });
    }

    // self.showPageNo = function(event,current){
    //   if(event.target.innerText==">>" &&  self.maxPageNo()!==self.totalPages()[self.totalPages().length-2].page){
    //     let obj={
    //       'page':self.totalPages()[self.totalPages().length-2].page+1
    //     }
    //     self.pageNo(self.totalPages()[self.totalPages().length-2].page+1);
    //     getCloudData();
    //     self.totalPages.splice(self.totalPages().length-1,0,obj);
    //     self.totalPages.splice(1,1);
    //     addRemoveColor(self.pageNo());
    //   }
    //   else  if(event.target.innerText==">>" &&  self.maxPageNo()==self.totalPages()[self.totalPages().length-2].page){
    //     self.messages.push({
    //       severity: 'info',
    //       summary: 'Reached end of the page...',
    //       autoTimeout: 0
    //     });
    //   }

    //   else if(event.target.innerText=="<<" &&  self.totalPages()[1].page==1){
    //     self.messages.push({
    //       severity: 'info',
    //       summary: 'Reached First page...',
    //       autoTimeout: 0
    //     });
    //   }
    //   else if(event.target.innerText=="<<" && self.totalPages()[1].page!==1){
    //     let obj={
    //       'page':self.totalPages()[1].page-1
    //     }
    //     self.pageNo(self.totalPages()[1].page-1);
    //     getCloudData();
    //     self.totalPages.splice(5,1);
    //     self.totalPages.splice(1,0,obj);
    //     addRemoveColor(self.pageNo());

    //   }
    //   else {
    //     addRemoveColor(event.target.innerText);
    //     self.pageNo(parseInt(event.target.innerText));
    //     getCloudData();
    //   }

    // }
    // function addRemoveColor(pge){
    //   if(pge){
    //     document.getElementById("p"+ pge).style.color='blue';
    //     self.totalPages().forEach((itm)=>{
    //       if(itm.page!=pge){
    //         document.getElementById("p"+ itm.page).style.color='black';
    //       }
    //     })
    //   }
    // }

    self.refreshDataSync = function () {
      self.ColsObservableArray().forEach((item) => {
        getCloudQueryValues(item.id);
      });
    };

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
                return workpackid === item.rowid;
              }
            );
            self.btnLbl("Update");
            self.tableDestTypeDisabled(true);
            // self.statusId(selrow.statusId);
            self.sqlQuery(selrow.sqlQuery);
            self.tableName(selrow.tableName);
            self.destinationType(selrow.destinationType);
            self.metaData(selrow.metaData);
            self.id(selrow.id);
            self.batchSize(selrow.batchSize);
            if (self.sqlQuery() !== null) {
              self.ismetaData(["checked"]);
              self.isVisible(true);
            }
            getCloudQueryValues(selrow.id);
            // self.ColsObservableArray.push({
            //   rowid: 1,
            //   id: selrow.id,
            //   sqlQuery: selrow.sqlQuery,
            //   destinationType: selrow.destinationType,
            //   tableName: selrow.tableName,
            //   statusId: selrow.statusId,
            //   status: selrow.status,
            // });
            document.querySelector("#srchDailog").close();
          }
        }
      }
    };

    self.srchExtraction = function () {
      self.isExtraction("Y");
      // self.pageNo(1);
      getCloudData();
    };
    self.clearCloudQuery = function () {
      self.srchfilter("");
      self.isExtraction("");
      self.isPagination(false);
      self.pageNo(1);
      getCloudData();
    };

    self.viewSqlQuery = function () {
      let popup = document.getElementById("popup2");
      popup.open("#sqlPopup1");
    };

    self.resetDataSync = function () {
      resetDataSync();
    };

    function resetDataSync() {
      self.destinationType("Table Sync");
      self.tableName("");
      self.metaData("");
      self.sqlQuery("");
      self.id("");
      self.ismetaData(["unchecked"]);
      self.isVisible(false);
      self.batchSize(0);
      self.tableDestTypeDisabled(false);
      self.btnLbl("Save");
      while (self.ColsObservableArray().length !== 0) {
        self.ColsObservableArray.pop();
      }
    }

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

    self.saveCloudQuery = function () {
      const valid = _checkValidationGroup();
      if (
        (self.destinationType() == "Lookups" && self.sqlQuery() == "") ||
        self.sqlQuery() == null ||
        (self.ismetaData()[0] == "checked" && self.sqlQuery() == "")
      ) {
        self.messages.push({
          severity: "error",
          summary: "Please fill all required fields",
          autoTimeout: 0,
        });
      } else if (valid) {
        let lookupFlag = "",
          tableName = null,
          metaData = null;
        sqlquery = null;
        if (self.destinationType() == "Table Sync") {
          tableName = self.tableName();
        } else {
          tableName = null;
        }
        if (
          self.destinationType() == "Table Sync" &&
          (self.ismetaData()[0] == "Y" || self.ismetaData()[0] == "checked")
        ) {
          lookupFlag = "N";
          sqlquery = self.sqlQuery();
          metaData = self.metaData();
        } else {
          lookupFlag = "Y";
          sqlquery = null;
          metaData = null;
        }
        if (self.destinationType() == "Lookups") {
          sqlquery = self.sqlQuery();
        }

        let url = riteUTils.riteProps.dataprocessing;

        let obj = {
          batchSize: self.batchSize(),
          createdBy: sessionStorage.getItem("userName"),
          destinationType: self.destinationType(),
          id: self.id() ? self.id() : null,
          lookUpFlag: lookupFlag,
          metaData: metaData,
          podId: parseInt(sessionStorage.getItem("X-TENANT-ID")),
          scheduledJobCall: "N",
          sqlQuery: sqlquery,
          tableName: tableName,
          updatedBy: sessionStorage.getItem("userName"),
        };

        postDetails(url, obj)
          .then((res) => {
            $(".progress").show();
            while (self.ColsObservableArray().length > 0) {
              self.ColsObservableArray.pop();
            }
            if (res) {
              self.ColsObservableArray.push({
                rowId: 1,
                id: res.cloudDataProcess.id,
                sqlQuery: res.cloudDataProcess.sqlQuery,
                destinationType: res.cloudDataProcess.destinationType,
                tableName: res.cloudDataProcesstableName,
                metaData: res.cloudDataProcessmetaData,
                statusId: res.crCloudStatusInformation.statusId,
                requestId: res.crCloudStatusInformation.requestId,
                status: res.crCloudStatusInformation.status,
              });
              $(".progress").hide();
              self.messages.push({
                severity: "confirmation",
                summary: res.message,
                autoTimeout: 0,
              });
              self.btnLbl("Update");
            } else {
              $(".progress").hide();
              self.messages.push({
                severity: "confirmation",
                summary: res.error,
                autoTimeout: 0,
              });
            }
            self.ColsObservableArray().forEach((item) => {
              getCloudQueryValues(item.id);
            });
          })
          .catch((error) => {
            $(".progress").hide();
            if (error.response.status == 400) {
              self.messages.push({
                severity: "error",
                summary: error.response.data,
                autoTimeout: 0,
              });
            } else {
              self.messages.push({
                severity: "error",
                summary: error.response.data.error,
                autoTimeout: 0,
              });
            }
          });
      }
    };

    this.dataprovider = new ArrayDataProvider(self.ColsObservableArray, {
      keyAttributes: "rowid",
    });

    function getCloudQueryValues(id) {
      if (id) {
        $(".progress").show();
        while (self.ColsObservableArray().length > 0) {
          self.ColsObservableArray.pop();
        }

        let url = riteUTils.riteProps.getallstatus + "?id=" + id;
        getDetails(url)
          .then((res) => {
            if (res) {
              $(".progress").hide();
              for (let i = 0; i < res.length; i++) {
                self.ColsObservableArray.push({
                  rowid: i + 1,
                  id: res[i].id,
                  sqlQuery: res[i].sqlQuery,
                  destinationType: res[i].destinationType,
                  tableName: res[i].tableName,
                  metaData: res[i].metaData,
                  statusId: res[i].statusId,
                  lookUpFlag: res[i].lookUpFlag,
                  status: res[i].status,
                });
              }
            }
          })
          .catch((error) => {
            $(".progress").hide();
          });
      }
    }

    this.handleDelete = (event) => {
      if (event.target.innerText) {
        self.deleteRid(parseInt(event.target.innerText));
        document.querySelector("#confirmDailog").open();
      }
    };

    self.okDeleteConformation = function () {
      if (self.ColsObservableArray()) {
        self.ColsObservableArray().forEach((itm) => {
          if (itm.id == self.deleteRid()) {
            if (itm.id) {
              deleteClouData(itm.id);
            } else {
              self.messages.push({
                severity: "error",
                summary: "No id Found",
                autoTimeout: 0,
              });
            }
          }
        });
      }
    };

    function deleteClouData(id) {
      if (id) {
        $(".progress").show();
        let url = riteUTils.riteProps.deleteadhocdata + id;
        delDetails(url)
          .then((res) => {
            if (res) {
              $(".progress").hide();
              document.querySelector("#confirmDailog").close();
              self.messages.push({
                severity: "confirmation",
                summary: res.message,
                autoTimeout: 0,
              });
            } else {
              self.messages.push({
                severity: "error",
                summary: res.error,
                autoTimeout: 0,
              });
            }
            resetDataSync();
          })
          .catch((error) => {
            $(".progress").hide();
            console.log(error);
          });
      }
    }

    self.sqlQueryChange = function (event) {};

    self.cancelDelete = function () {
      document.querySelector("#confirmDailog").close();
    };

    this.connected = () => {
      accUtils.announce("Cloud Query Tool", "assertive");
      document.title = "Cloud Query Tool";

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
  return Cloud_Query_ToolViewModel;
});
