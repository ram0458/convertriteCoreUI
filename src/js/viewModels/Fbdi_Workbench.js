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
  "ojs/ojcontext",
  "ojs/ojarraydataprovider",
  "ojs/ojlistdataproviderview",
  "ojs/ojinputtext",
  "ojs/ojinputnumber",
  "ojs/ojbutton",
  "ojs/ojtable",
  "ojs/ojselectsingle",
  "ojs/ojformlayout",
  "ojs/ojdialog",
  "ojs/ojmessages",
  "ojs/ojvalidationgroup",
  "ojs/ojdefer",
], function (accUtils, ko, Context,ArrayDataProvider, ListDataProviderView) {
  function Fbdi_WorkbenchViewModel() {
    var self = this;
    if (!sessionStorage.getItem("userId")) {
      window.location = "?ojr=Login";
    }
    this.groupValid = ko.observable();
    self.projectNameArray = ko.observableArray([]);
    self.projectId = ko.observable("");
    self.projectName = ko.observable("");
    self.projectVal = ko.observable("");
    self.parentObjectName = ko.observable("");
    self.objectName = ko.observable("");
    self.parentObject = ko.observable("");
    self.parentObjArray = ko.observableArray([]);
    self.object = ko.observable("");
    self.objectCode = ko.observable("");
    self.objectArray = ko.observableArray([]);
    self.messages = ko.observableArray();
    self.messagesDataProvider = new oj.ArrayDataProvider(self.messages);
    self.srchfilter = ko.observable("");
    self.searchdataArray = ko.observableArray([]);
    self.ColsObservableArray = ko.observableArray([]);
    self.fbdiControl = ko.observable("");
    self.fbdiTemplateVal = ko.observable("0");
    self.fbdiTemplateId = ko.observable("");
    this.searchfilter = ko.observable("");
    self.version = ko.observable("");
    self.versionDataArray = ko.observableArray([]);
    self.sheetName = ko.observable("");
    self.scrollPos = ko.observable({ rowIndex: 0 });
    self.btnLbl = ko.observable('Save');


    getVersion();
    function getVersion() {
      let version = JSON.parse(sessionStorage.getItem("version"));
      for (let i = 0; i < version.length; i++) {
        self.versionDataArray.push({
          "id ": version[i].id,
          value: version[i].value,
          label: version[i].label,
        });
      }
    }

    this.versiondata = new ArrayDataProvider(self.versionDataArray, {
      keyAttributes: "value",
    });

    self.versionValueChange = function () {};

    self.loadMore = function () {
      self.scrollPos({ rowIndex: self.scrollPos._latestValue.rowIndex + 5 });
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
          riteUTils.riteProps.getParentObjectsByProjectId +"/" + self.projectName();
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
        self.parentObjArray().forEach((item)=>{
          if(event.detail.value==item.id){
          self.objectCode(item.objectCode);
          }
        })

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
      keyAttributes: "id",
    });
    self.objectName = ko.observable("");
    self.objectValueChange = function (event) {
      if (event.detail.value) {
        $(".progress").show();
        self.objectName(event.detail.value);
        let url =
        riteUTils.riteProps.getobjects+event.detail.value
      getDetails(url)
        .then((res) => {
          if (res) {
              self.sheetName(res.payload.fbdiSheet);
              self.fbdiControl(res.payload.ctlFileName);
              
            $(".progress").hide();
          }
        })
        .catch(function (error) {
          $(".progress").hide();
        });


      }
    };

    self.showSrchDailog = function () {
      self.srchfilter('');
      document.querySelector("#srchDailog").open();
      getLOVData();
    };

    self.closeSrchDailog = function () {
      document.querySelector("#srchDailog").close();
    };

    self.closeConfirmDailog = function () {
      document.querySelector("#confirmDailog").close();
    };

    this.searchanyvalueChanged = function () {
      this.searchfilter(document.getElementById("filter").rawValue);
    }.bind(this);

    this.searchdataprovider = ko.computed(function () {
      const filterRegEx = new RegExp(this.searchfilter(), "i");
      const filterCriterion = {
        op: "$or",
        criteria: [
          { op: "$regex", value: { fbdiTemplateName: filterRegEx } },
          { op: "$regex", value: { version: filterRegEx } },
          { op: "$regex", value: { sheetName: filterRegEx } },
        ],
      };
      const arrayDataProvider = new ArrayDataProvider(self.searchdataArray, {
        keyAttributes: "fbdiTemplateId",
      });
      return new ListDataProviderView(arrayDataProvider, {
        filterCriterion: filterCriterion,
      });
    }, this);

    function getLOVData() {
      $(".progress").show();
      let url = riteUTils.riteProps.getfbditemplates;
      while (self.searchdataArray().length > 0) {
        self.searchdataArray.pop();
      }
      getDetails(url)
        .then((res) => {
          if (res) {
            console.log(res);
            for (let i = 0; i < res.length; i++) {
              self.searchdataArray.push({
                rowId: i + 1,
                fbdiTemplateId: res[i].fbdiTemplateId,
                fbdiTemplateName: res[i].fbdiTemplateName,
                projectId: res[i].projectId,
                projectName : res[i].projectName,
                parentObjectId: res[i].parentObjectId,
                parentObjectName : res[i].parentObjName,
                objectId: res[i].objectId,
                objectName :res[i].objectName,
                version: res[i].version,
                sheetName: res[i].sheetName,
                api: res[i].api,
                attribute1: res[i].attribute1,
                attribute2: res[i].attribute2,
                attribute3: res[i].attribute3,
                attribute4: res[i].attribute4,
                attribute5: res[i].attribute5,
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

    self.resetFBDI = function () {
      resetFBDI();
    };

    function resetFBDI() {
      self.fbdiTemplateId('');
      self.fbdiTemplateVal("0");
      self.projectName("");
      self.projectVal("");
      self.parentObjectName("");
      self.objectName("");
      self.projectId("");
      self.parentObject("");
      self.fbdiControl("");
      self.object("");
      self.version("");
      self.btnLbl('Save');
      while (self.ColsObservableArray().length > 0) {
        self.ColsObservableArray.pop();
      }
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
                return workpackid === item.fbdiTemplateId;
              }
            );
            self.btnLbl('Update');
            self.fbdiTemplateVal("1");
            self.fbdiTemplateId(selrow.fbdiTemplateId);
            self.fbdiControl(selrow.fbdiTemplateName);
            self.sheetName(selrow.sheetName);
            self.version(selrow.version);
            self.projectName(selrow.projectId);
            self.parentObject(selrow.parentObjectId);
            self.object(selrow.objectId);

            self.projectVal(selrow.projectName);
            self.parentObjectName(selrow.parentObjectName);
            self.objectName(selrow.objectName);

            getfbditempcols();
            setTimeout(() => {
              document.querySelector("#srchDailog").close();
            }, 500);
          }
        }
      }
    };

    function getfbditempcols() {
      if (self.fbdiTemplateId()) {
        $(".progress").show();
        let url =
          riteUTils.riteProps.getfbditempcols +
          "?fbdiTemplateId=" +
          self.fbdiTemplateId();
        while (self.ColsObservableArray().length !== 0) {
          self.ColsObservableArray.pop();
        }
        getDetails(url)
          .then((res) => {
            if (res) {
              for (let i = 0; i < res.length; i++) {
                self.ColsObservableArray.push({
                  rowId: i + 1,
                  fbdiColumnId: res[i].fbdiColumnId,
                  fbdiTemplateId: res[i].fbdiTemplateId,
                  fbdiColumnName: res[i].fbdiColumnName,
                  required: res[i].required,
                  databaseTable: res[i].databaseTable,
                  databaseColumn: res[i].databaseColumn,
                  sequence: res[i].sequence,
                });
              }
              self.messages.push({
                severity: "confirmation",
                summary: " Get Fbdi Sequence Columns Succesfully",
                autoTimeout: 0,
              });
              $(".progress").hide();    
            }
            else{
              self.messages.push({
                severity: "error",
                summary: res.error,
                autoTimeout: 0,
              });
              $(".progress").hide();
            }
          })
          .catch((error) => {
            $(".progress").hide();
            console.log(error);
          });
      }
    }

    this.dataprovider = new ArrayDataProvider(self.ColsObservableArray, {
      keyAttributes: "rowId",
    });

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

    self.saveFbdi = function () {
      const valid = _checkValidationGroup();
      if (valid) {
      let obj = {
        'fbdiTemplateId': self.fbdiTemplateId() ? self.fbdiTemplateId() : null,
        "api": "https://www.oracle.com/webfolder/technetwork/docs/fbdi-",
        "attribute1": null,
        "attribute2": null,
        "attribute3": null,
        "attribute4": null,
        "attribute5": null,
        "createdBy": sessionStorage.getItem("userName"),
        "fbdiTemplateName": self.fbdiControl(),
        "objectId": self.object(),
        "parentObjectId": self.parentObject(),
        "projectId": self.projectName(),
        "sheetName": self.sheetName(),
        "updatedBy": sessionStorage.getItem("userName"),
        "version": self.version()
        };
      let url = riteUTils.riteProps.savefbditemphdrs;
      postDetails(url, obj).then((res) => {
        if (res.crFbdiHdrs!==null) {
          self.fbdiTemplateId(res.crFbdiHdrs.fbdiTemplateId);
          self.messages.push({
            severity: "confirmation",
            summary: res.message,
            autoTimeout: 0,
          });
          $(".progress").hide();
          if(self.fbdiTemplateVal()=="0"){
            getfbdicolsequence();
          }
          else{
            saveFbdiColumns();
          }
          
        } else {
          $(".progress").hide();
          self.messages.push({
            severity: "error",
            summary: res.error,
            autoTimeout: 0,
          });
          $(".progress").hide();
        }
      })
      .catch((error) => {
        $(".progress").hide();
        self.messages.push({
          severity: "error",
          summary:  error.response.data.error,
          autoTimeout: 0,
        });
     
      });
    }
    else{
      self.messages.push({
        severity: "error",
        summary: "Please Fill all the required Fields",
        autoTimeout: 0,
      });
      $(".progress").hide();
    }
    };

    function getfbdicolsequence() {
      if (self.fbdiControl() && self.version()) {
        $(".progress").show();
        let url =
          riteUTils.riteProps.getfbdicolsequence +
          "?fileName=" +
          self.fbdiControl()  +".ctl"+
          "&version=" +
          self.version();
        while (self.ColsObservableArray().length !== 0) {
          self.ColsObservableArray.pop();
        }
        getDetails(url)
          .then((res) => {
            if (res) {
              for (let i = 0; i < res.length; i++) {
                self.ColsObservableArray.push({
                  rowId: i + 1,
                  fbdiColumnName: res[i].fbdiColumnName,
                  required: res[i].required,
                  databaseColumn: res[i].databaseColumn,
                  sequence: res[i].sequence,
                });
              }
              self.messages.push({
                severity: "confirmation",
                summary: "Got Fbdi Column Sequence Successfully",
                autoTimeout: 0,
              });
              $(".progress").hide();
              saveFbdiColumns();

            } else {
              self.messages.push({
                severity: "error",
                summary: res.message,
                autoTimeout: 0,
              });
              $(".progress").hide();

            }
          })
          .catch((error) => {
           
            $(".progress").hide();
            console.log( error.response.status);
          });
      }
    }

    function saveFbdiColumns() {
      let url = riteUTils.riteProps.savefbditempcols;
      let data = [];
      self.ColsObservableArray().forEach((editItem) => {
        let obj = {
          fbdiColumnId: editItem.fbdiColumnId,
          fbdiTemplateId: self.fbdiTemplateId() ? self.fbdiTemplateId() : null,
          fbdiColumnName: editItem.databaseColumn,
          required: editItem.required,
          databaseTable: null,
          databaseColumn: editItem.databaseColumn,
          sequence: editItem.sequence,
          lastUpdatedDate: new Date().toISOString(),
          lastUpdatedBy: sessionStorage.getItem("userName"),
          creationDate: new Date().toISOString(),
          createdBy: sessionStorage.getItem("userName"),
        };
        data.push(obj);
      });

      $(".progress").show();
      postDetails(url, data)
        .then((res) => {
          if (res) {
            while (self.ColsObservableArray().length !== 0) {
              self.ColsObservableArray.pop();
            }
            for (let i = 0; i < res.fbdiTemplateColumns.length; i++) {
              self.ColsObservableArray.push({
                rowId: i + 1,
                fbdiColumnId: res.fbdiTemplateColumns[i].fbdiColumnId,
                fbdiTemplateId: res.fbdiTemplateColumns[i].fbdiTemplateId,
                fbdiColumnName: res.fbdiTemplateColumns[i].fbdiColumnName,
                required: res.fbdiTemplateColumns[i].required,
                databaseTable: res.fbdiTemplateColumns[i].databaseTable,
                databaseColumn: res.fbdiTemplateColumns[i].databaseColumn,
                sequence: res.fbdiTemplateColumns[i].sequence,
              });
            }
            $(".progress").hide();
            self.messages.push({
              severity: "confirmation",
              summary: res.message,
              autoTimeout: 0,
            });
            self.btnLbl('Update');

          } else {
            self.messages.push({
              severity: "error",
              summary: res.error,
              autoTimeout: 0,
            });
            $(".progress").hide();
          }
        })
        .catch((error) => {
          $(".progress").hide();
          console.log(error);
        });
    }

    self.okDeleteConformation = function () {};

    self.cancelDelete = function () {};

    this.connected = () => {
      accUtils.announce("FBDI Workbench page loaded.", "assertive");
      document.title = "FBDI Workbench";
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
  return Fbdi_WorkbenchViewModel;
});
