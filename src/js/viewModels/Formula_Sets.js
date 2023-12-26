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
  "ojs/ojinputnumber",
  "ojs/ojbutton",
  "ojs/ojtable",
  "ojs/ojselectsingle",
  "ojs/ojformlayout",
  "ojs/ojdialog",
  "ojs/ojmessages",
  "ojs/ojvalidationgroup",
  "ojs/ojdefer",
], function (accUtils, ko, ArrayDataProvider, ListDataProviderView) {
  function Formula_SetsViewModel() {
    var self = this;
    if (!sessionStorage.getItem("userId")) {
      window.location = "?ojr=Login";
    }
    this.groupValid = ko.observable();
    self.formulaSetId = ko.observable();
    self.formSetId = ko.observable("0");
    self.formulaSetName = ko.observable("");
    self.formulaSetCode = ko.observable("");
    self.description = ko.observable("");
    self.searchdataArray = ko.observableArray([]);
    self.messages = ko.observableArray();
    self.scrollPos = ko.observable({ rowIndex: 0 });
    self.btnLbl = ko.observable('Save');
    self.srchfilter = ko.observable("");
    this.searchfilter = ko.observable("");
    self.sqlQuery = ko.observable("");
    self.formulaType = ko.observable("");
    self.formulaText = ko.observable("");
    self.noofParams = ko.observable(1);
    self.deleteRid = ko.observable("");

    self.loadMore = function () {
      self.scrollPos({ rowIndex: self.scrollPos._latestValue.rowIndex + 5 });
    };
    self.messagesDataProvider = new ArrayDataProvider(self.messages);

    self.formulaTypeArray = ko.observableArray([
      { id: "SQL", value: "SQL", label: "SQL" },
    ]);
    this.formulaTypedata = new ArrayDataProvider(self.formulaTypeArray, {
      keyAttributes: "id",
    });

    self.openSqlDailog = function () {
      let popup = document.getElementById("popup1");
      popup.open("#sqlPopup");
    };

    this.eatNonNumbers = (event) => {
      let charCode = event.which ? event.which : event.keyCode;
      let char = String.fromCharCode(charCode);
      let replacedValue = char.replace(/[^0-9\.]/g, "");
      if (char !== replacedValue) {
        event.preventDefault();
      }
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
          { op: "$regex", value: { formulaSetId: filterRegEx } },
          { op: "$regex", value: { formulaSetName: filterRegEx } },
          { op: "$regex", value: { formulaetCode: filterRegEx } },
          { op: "$regex", value: { formulaSetType: filterRegEx } },
          { op: "$regex", value: { formulaText: filterRegEx } },
        ],
      };
      const arrayDataProvider = new ArrayDataProvider(self.searchdataArray, {
        keyAttributes: "formulaSetId",
      });
      return new ListDataProviderView(arrayDataProvider, {
        filterCriterion: filterCriterion,
      });
    }, this);

    function getLOVData() {
      $(".progress").show();
      let url = riteUTils.riteProps.getAllFormulaSets;
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
                formulaSetId: res[i].formulaSetId,
                formulaSetName: res[i].formulaSetName,
                formulaSetCode: res[i].formulaSetCode,
                description: res[i].description,
                formulaType: res[i].formulaType,
                formulaText: res[i].formulaText,
                noofParams: res[i].countOfParams,
              });
            }
          }
        })
        .catch((error) => {
          $(".progress").hide();
        });
    }

    self.selectionListener = function (event) {
      if (event.target.innerText) {
        self.formSetId("1");
        self.btnLbl('Update'); 
        if (self.searchdataArray()) {
          self.searchdataArray().forEach((item) => {
            if (event.target.innerText == item.formulaSetId) {
              self.formulaSetId(item.formulaSetId);
              self.formulaSetName(item.formulaSetName);
              self.formulaSetCode(item.formulaSetCode);
              self.formulaType(item.formulaType);
              self.formulaText(item.formulaText);
              self.noofParams(item.noofParams);
              self.description(item.description);
            }
          });
        }
      }
    };

    self.viewSqlQuery = function (event,current) {
      self.searchdataArray().forEach((item)=>{
        if(item.rowid== current.item.data.rowid ){
          self.sqlQuery(item.formulaText);
        }

      })

      let popup = document.getElementById("popup2");
      popup.open("#sqlPopup1");
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

    self.saveFormulaSets = function () {
      const valid = _checkValidationGroup();
      if(self.formulaText()=="" || self.formulaText() == null){
        self.messages.push({
          severity: "error",
          summary: "Please fill formulaText Field",
          autoTimeout: 0,
        });
      }
     else if (valid) {
        let url = riteUTils.riteProps.saveFormulaSetHeader;
        let obj = {
          formulaSetId: self.formulaSetId() ? self.formulaSetId() : null,
          formulaSetName: self.formulaSetName(),
          formulaSetCode: self.formulaSetCode(),
          formulaType: self.formulaType(),
          countOfParams: self.noofParams(),
          formulaText: self.formulaText(),
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
              summary: "Formula Sets Headers Saved/Updated Successfully",
              autoTimeout: 0,
            });
            resetFormulaSets();
            getLOVData();
            $(".progress").hide();
          })
          .catch((error) => {
            $(".progress").hide();
            if (error.response.status == 417) {
            self.messages.push({
              severity: "error",
              summary:  "Formula Set Name already Exists",
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

    self.resetFormulaSets = function () {
      resetFormulaSets();
    };

    function resetFormulaSets() {
      self.formSetId("0");
      self.formulaSetId("");
      self.formulaSetName("");
      self.formulaType("");
      self.formulaSetCode("");
      self.formulaText("");
      self.noofParams(1);
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
          if (itm.formulaSetId == self.deleteRid()) {
            if (itm.formulaSetId) {
              deleteFormulaSetValue(itm, itm.formulaSetId);
            } else {
              self.messages.push({
                severity: "error",
                summary: "No FormulaLine Found",
                autoTimeout: 0,
              });
            }
          }
        });
      }
    };

    function deleteFormulaSetValue(data, formulaSetId) {
      if (data && formulaSetId) {
        $(".progress").show();
        let url = riteUTils.riteProps.deleteFormulaSets + formulaSetId;
        data.insertOrDelete = "D";
        postDetails(url, [data])
          .then((res) => {
            console.log(res);
            $(".progress").hide();
            document.querySelector("#confirmDailog").close();
            self.messages.push({
              severity: "confirmation",
              summary: "Deleted Successfully",
              autoTimeout: 0,
            });
            resetFormulaSets();
            getLOVData();
          })
          .catch((error) => {
            $(".progress").hide();
            console.log(error);
          });
      }
    }

    this.connected = () => {
      accUtils.announce("Formula Sets page loaded.", "assertive");
      document.title = "Formula Sets";
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
  return Formula_SetsViewModel;
});
