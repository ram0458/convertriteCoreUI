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
  "ojs/ojinputtext",
  "ojs/ojbutton",
  "ojs/ojtable",
  "ojs/ojselectsingle",
  "ojs/ojformlayout",
  "ojs/ojdialog",
  "ojs/ojmessages",
  "ojs/ojvalidationgroup",
  "ojs/ojdefer",
], function (accUtils, ko, ArrayDataProvider, ListDataProviderView) {
  function User_HooksViewModel() {
    var self = this;
    if (!sessionStorage.getItem("userId")) {
      window.location = "?ojr=Login";
    }
    this.groupValid = ko.observable();
    self.hookVal = ko.observable("0");
    self.hookId = ko.observable();
    self.hookName = ko.observable("");
    self.hookCode = ko.observable("");
    self.description = ko.observable("");
    self.searchdataArray = ko.observableArray([]);
    self.messages = ko.observableArray();
    self.scrollPos = ko.observable({ rowIndex: 0 });
    self.srchfilter = ko.observable("");
    this.searchfilter = ko.observable("");
    self.hookType = ko.observable("");
    self.hookText = ko.observable("");
    self.sqlQuery = ko.observable("");
    self.deleteRid = ko.observable("");
    self.btnLbl = ko.observable('Save');

    self.loadMore = function () {
      self.scrollPos({ rowIndex: self.scrollPos._latestValue.rowIndex + 5 });
    };
    self.messagesDataProvider = new ArrayDataProvider(self.messages);

    self.hookTypeArray = ko.observableArray([
      { id: "PL/SQL", value: "PL/SQL", label: "PL/SQL" },
    ]);
    this.hookTypeData = new ArrayDataProvider(self.hookTypeArray, {
      keyAttributes: "id",
    });

    self.openSqlDailog = function () {
      let popup = document.getElementById("popup1");
      popup.open("#sqlPopup");
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
          { op: "$regex", value: { hookId: filterRegEx } },
          { op: "$regex", value: { hookName: filterRegEx } },
          { op: "$regex", value: { hookCode: filterRegEx } },
          { op: "$regex", value: { hookType: filterRegEx } },
          { op: "$regex", value: { hookText: filterRegEx } },
        ],
      };
      const arrayDataProvider = new ArrayDataProvider(self.searchdataArray, {
        keyAttributes: "hookId",
      });
      return new ListDataProviderView(arrayDataProvider, {
        filterCriterion: filterCriterion,
      });
    }, this);

    function getLOVData() {
      $(".progress").show();
      let url = riteUTils.riteProps.getAllUserHooks;
      while (self.searchdataArray().length > 0) {
        self.searchdataArray.pop();
      }
      getDetails(url)
        .then((res) => {
          if (res) {
            $(".progress").hide();
            for (let i = 0; i < res.length; i++) {
              self.searchdataArray.push({
                rowid: i + 1,
                attribute1: res[i].attribute1,
                attribute2: res[i].attribute2,
                attribute3: res[i].attribute3,
                attribute4: res[i].attribute4,
                attribute5: res[i].attribute5,
                hookId: res[i].hookId,
                hookName: res[i].hookName,
                hookCode: res[i].hookCode,
                description: res[i].description,
                hookType: res[i].hookType,
                hookText: res[i].hookText
              });
            }
          }
        })
        .catch((error) => {
          $(".progress").hide();
        });
    }

    self.viewSqlQuery = function (event,current) {
      self.searchdataArray().forEach((item)=>{
        if(item.rowid== current.item.data.rowid ){
          self.sqlQuery(item.hookText);
        }

      })

      let popup = document.getElementById("popup2");
      popup.open("#sqlPopup1");
    };



    self.selectionListener = function (event) {
      if (event.target.innerText) {
        self.hookVal("1");
        self.btnLbl('Update');
        if (self.searchdataArray()) {
          self.searchdataArray().forEach((item) => {
            if (event.target.innerText == item.hookId) {
              self.hookId(item.hookId);
              self.hookName(item.hookName);
              self.hookCode(item.hookCode);
              self.hookType(item.hookType);
              self.hookText(item.hookText);
              self.description(item.description);
            }
          });
        }
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

    self.saveUserHooks = function () {
      const valid = _checkValidationGroup();
      if(self.hookText()=="" || self.hookText() == null){
        self.messages.push({
          severity: "error",
          summary: "Please fill hookText Field",
          autoTimeout: 0,
        });
      }
      else if (valid ) {
        let url = riteUTils.riteProps.saveUserHook;
        let obj = {
          hookId: self.hookId() ? self.hookId() : null,
          hookName: self.hookName(),
          hookCode: self.hookCode(),
          hookType: self.hookType(),
          hookText: self.hookText(),
          description: self.description(),
          attribute1: null,
          attribute2: null,
          attribute3: null,
          attribute4: null,
          attribute5: null,
        };

        postDetails(url, obj)
          .then((res) => {
            $(".progress").show();
            if (res) {
            }
            self.messages.push({
              severity: "confirmation",
              summary: "User Hooks Headers Saved/Updated Successfully",
              autoTimeout: 0,
            });
            resetUserHooks();
            getLOVData();
            $(".progress").hide();
          })
          .catch((error) => {
            $(".progress").hide();
            if (error.response.status == 417) {
            self.messages.push({
              severity: "error",
              summary:  "User Hook Name already Exists",
              autoTimeout: 0,
            });
          }
         
          })
      } else {
        self.messages.push({
          severity: "error",
          summary: "Please  fill all the Required Fields",
          autoTimeout: 0,
        });
      }
    };

    self.resetUserHooks = function () {
      resetUserHooks();
    };

    function resetUserHooks() {
      self.hookVal("0");
      self.hookId("");
      self.hookName("");
      self.hookType("");
      self.hookCode("");
      self.hookText("");
      self.description("");
      self.btnLbl('Save');
      getLOVData();
    }

    this.handleDelete = (event) => {
      if (event.target.innerText) {
        self.deleteRid(event.target.innerText);
        document.querySelector("#confirmDailog").open();
      }
    };

    self.cancelDelete = function () {
      document.querySelector("#confirmDailog").close();
    };

    self.okDeleteConformation = function () {
      if (self.searchdataArray()) {
        self.searchdataArray().forEach((itm) => {
          if (itm.hookId == self.deleteRid()) {
            if (itm.hookId) {
              deleteUserHooksValue(itm.hookId);
            } else {
              self.messages.push({
                severity: "error",
                summary: "No hookId Found",
                autoTimeout: 0,
              });
            }
          }
        });
      }
    };

    function deleteUserHooksValue(hookId) {
      if (hookId) {
        $(".progress").show();
        let url = riteUTils.riteProps.delteUserHookById + hookId;
        delDetails(url)
          .then((res) => {
            console.log(res);
            $(".progress").hide();
            document.querySelector("#confirmDailog").close();
            self.messages.push({
              severity: "confirmation",
              summary: "Deleted Successfully",
              autoTimeout: 0,
            });
            resetUserHooks();
            getLOVData();
          })
          .catch((error) => {
            $(".progress").hide();
            console.log(error);
          });
      }
    }

    this.connected = () => {
      accUtils.announce("User Hooks page loaded.", "assertive");
      document.title = "User Hooks";
      getLOVData();
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
  return User_HooksViewModel;
});
