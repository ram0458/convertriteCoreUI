/**
 * @license
 * Copyright (c) 2014, 2023, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 * @ignore
 */
/*
 * Your application specific code will go here
 */
define(['knockout', 'ojs/ojcontext', 'ojs/ojmodule-element-utils', 'ojs/ojknockouttemplateutils', 'ojs/ojarraytreedataprovider', 'ojs/ojcorerouter', 'ojs/ojmodulerouter-adapter', 'ojs/ojknockoutrouteradapter', 'ojs/ojurlparamadapter', 'ojs/ojresponsiveutils', 'ojs/ojresponsiveknockoututils', 'ojs/ojarraydataprovider',
'ojs/ojdrawerpopup', 'ojs/ojdrawerlayout', 'ojs/ojmodule-element', 'ojs/ojknockout','ojs/ojinputsearch'],
  function (ko, Context, moduleUtils, KnockoutTemplateUtils, ArrayTreeDataProvider, CoreRouter, ModuleRouterAdapter, KnockoutRouterAdapter, UrlParamAdapter, ResponsiveUtils, ResponsiveKnockoutUtils, ArrayDataProvider) {

    function ControllerViewModel() {
      var self=this;
      this.KnockoutTemplateUtils = KnockoutTemplateUtils;
      // Handle announcements sent when pages change, for Accessibility.
      this.manner = ko.observable('polite');
      this.message = ko.observable();
      self.globlsrch = ko.observable('');
      self.isLogin= ko.observable(false);
      self.userName = ko.observable(sessionStorage.getItem('userName'));
      self.userId = ko.observable(sessionStorage.getItem('userId'));
      self.userRole = ko.observable(sessionStorage.getItem('user_role'));
      self.roleDtls = ko.observableArray([]);
      self.img=ko.observable('css/images/RiteLogoNew.png');
      self.userInstance= ko.observable('');
      if(sessionStorage.getItem('user_role')){
        self.isLogin(true);
      }
      if(sessionStorage.getItem('roles')){        
          self.roleDtls(JSON.parse(sessionStorage.getItem('roles')));            
      }
      if(sessionStorage.getItem('clientId')){
        let url=riteUTils.riteProps.getClientdetails + "clientdetails";
        getDetails(url).then((res)=>{        
          if(sessionStorage.getItem('clientId')){          
              let downloadUrl = 'data:image/png;base64,'+res.payload[0].logo;          
              self.img(downloadUrl); 
          }
        })     
      }
      if(sessionStorage.getItem('podName')){        
        self.userInstance(sessionStorage.getItem('podName'));            
    }
      announcementHandler = (event) => {
        this.message(event.detail.message);
        this.manner(event.detail.manner);
      };
      this.startOpened = ko.observable(false);
      let menuHeader = ['Navigation List', 'Convertrite',
        'Data Transformation', 'Configuration',
        'Sequence/Grouping', 'Master Data', 'Automation', 'Dash Boards', 'Admin'];
      this.startToggle = (event) => {
        let isMenuHeader = false;
        if (event.target.innerText) {
          for (let i = 0; i < menuHeader.length; i++) {
            if (menuHeader[i] == event.target.innerText) {
              isMenuHeader = true;
              break;
            }
          }
        }
        if (!isMenuHeader && event.target.innerText) {
          this.startOpened(!this.startOpened());
        }
      }
      document.getElementById('globalBody').addEventListener('announce', announcementHandler, false);


      // Media queries for repsonsive layouts
      const smQuery = ResponsiveUtils.getFrameworkQuery(ResponsiveUtils.FRAMEWORK_QUERY_KEY.SM_ONLY);
      this.smScreen = ResponsiveKnockoutUtils.createMediaQueryObservable(smQuery);
      const mdQuery = ResponsiveUtils.getFrameworkQuery(ResponsiveUtils.FRAMEWORK_QUERY_KEY.MD_UP);
      this.mdScreen = ResponsiveKnockoutUtils.createMediaQueryObservable(mdQuery);
      let navData=[
        { path: '', redirect: 'Login', detail: { label: 'Login', iconClass: 'padrt fas fa-tv fa-lg iconrigt'} },
        { path: 'Login', detail: { label: 'Login', iconClass: 'padrt fas fa-tv fa-lg iconrigt'}},
        { path: 'Dashboard', detail: { label: 'Dashboard', iconClass: 'padrt fa fa-tachometer iconrigt'}},
        { path: 'unauthorized', detail: { label: 'Unauthorized', iconClass: 'padrt fa fa-tachometer iconrigt'}}
      ];
      if(sessionStorage.getItem('user_role')=="SuperUser"){
        navData = [
          { path: '', redirect: 'Login' },
          { path: 'Dashboard', detail: { label: 'Dashboard', iconClass: 'padrt fa fa-tachometer iconrigt ' }},
          { path: 'Source_Template', detail: { label: 'Source Template', iconClass: 'padrt fad fa-yin-yang' } },
          { path: 'Cloud_Template', detail: { code: 'LCP', label: 'Cloud Template WorkBench', iconClass: 'padrt oj-ux-ico-bar-chart' } },
          { path: 'Mapping_Sets', detail: { code: 'LCP', label: 'Mapping Sets', iconClass: 'padrt oj-ux-ico-bar-chart' } },
          { path: 'Login', detail: { label: 'Login', iconClass: 'padrt fas fa-tv fa-lg iconrigt ' } },
          { path: 'Manage_Your_Project', detail: { code: 'MYP', label: 'Manage Your Project', iconClass: 'padrt oj-ux-ico-bar-chart' } },
          { path: 'Source_MetaData', detail: { code:'DMS', label: 'Source MetaData', iconClass: 'padrt fa fa-newspaper-o' } },
          { path: 'Cloud_MetaData', detail: { code:'DFS', label: 'Cloud MetaData', iconClass: 'padrt fa fa-cloud' } },               
          { path: 'Cloud_Query_Tool', detail: { code:'CQP', label: 'Cloud Query Tool', iconClass: 'padrt query' } },               
          { path: 'Formula_Sets', detail: { code: 'DCN', label: 'Formula Sets', iconClass: 'padrt fa fa-quora' } },
          { path: 'Lookup_Sets', detail: { code: 'DCN', label: 'Lookup Sets', iconClass: 'padrt fa fa-quora' } },
          { path: 'Fbdi_Workbench', detail: { code: 'DCN', label: 'FBDI Workbench', iconClass: 'padrt fa fa-wordpress' } },
          { path: 'User_Hooks', detail: { code: 'DCN', label: 'User Hooks', iconClass: 'padrt fa fa-anchor' } },
          { path: 'Object_Details', detail: { code: 'FBC', label: 'Object Details', iconClass: 'padrt1 fa fa-eercast' } },
          { path: 'POD_Details', detail: { code: 'FBX', label: 'POD Details', iconClass: 'padrt1 fa fa-superpowers' } },
          { path: 'FBDI_Conversions', detail: { code: 'FBX', label: 'FBDI Conversions', iconClass: 'padrt1 fa fa-superpowers' } },
          { path: 'HDL_Conversions', detail: { code: 'FBX', label: 'HDL Conversions', iconClass: 'padrt1 fa fa-superpowers' } },
          { path: 'Object_Grouping', detail: { code: 'DCN', label: 'Object Grouping', iconClass: 'padrt fa fa-object-group' } },
          { path: 'Reconciliation', detail: { code:'CLI', label: 'Reconciliation', iconClass: 'padrt fa fa-wrench' } },       
          { path: 'Load_Cockpit', detail: { code:'lcpt', label: 'Load Cockpit', iconClass: 'padrt fa fa-cog' } },       

          { path: 'Conversion Workbench', detail: { code:'CR', label: 'Conversion Workbench', iconClass: 'padrt converwb' },               
          "children":[
            { path: 'Cloud_Template', detail: { code:'CTW', label: 'Cloud Template', iconClass: 'padrt fa fa-cloud' } },
            { path: 'Source_Template', detail: { code:'STW', label: 'Source Template', iconClass: 'padrt fa fa-cogs' } },
            { path: 'FBDI_Conversions', detail: { code:'SCW', label: 'FBDI Conversions', iconClass: 'padrt fa fa-refresh' } },
            { path: 'HDL_Conversions', detail: { code:'CCW', label: 'HDL Conversions', iconClass: 'padrt fa fa-crosshairs' } },
            { path: 'Load_Cockpit', detail: { code:'lcpt', label: 'Load Cockpit', iconClass: 'padrt fa fa-cog' } } ,     
            { path: 'Reconciliation', detail: { code:'CLI', label: 'Reconciliation', iconClass: 'padrt fa fa-wrench' } },       

           
          ]
          },
          { path: 'MetaData Configuration', detail: { code:'DT', label: 'MetaData Configuration', iconClass: 'padrt metadata' },
          "children":[
            { path: 'Source_MetaData', detail: { code:'DMS', label: 'Source MetaData', iconClass: 'padrt fa fa-newspaper-o' } },
            { path: 'Cloud_MetaData', detail: { code:'DFS', label: 'Cloud MetaData', iconClass: 'padrt fa fa-cloud' } },               

          ]
          },
         
        
          {
            path: 'Setup', detail: { code: 'CGN', label: 'Setup', iconClass: 'padrt setupIcon' },
            "children": [
              {
                path: 'Data_Transformation', detail: { code: 'DCN', label: 'Data Transformation', iconClass: 'padrt fa fa-table' },
                "children": [
                  { path: 'Mapping_Sets', detail: { code: 'DCN', label: 'Mapping Sets', iconClass: 'padrt fa fa-compass' } },
                  { path: 'Formula_Sets', detail: { code: 'DCN', label: 'Formula Sets', iconClass: 'padrt fa fa-quora' } },
                  { path: 'User_Hooks', detail: { code: 'DCN', label: 'User Hooks', iconClass: 'padrt fa fa-anchor' } },
                ]
              },
              {
                path: 'Master_Data', detail: { code: 'DCN', label: 'Master Data', iconClass: 'padrt fa fa-dot-circle-o' },
                "children": [
                  { path: 'Lookup_Sets', detail: { code: 'DCN', label: 'Lookup Sets', iconClass: 'padrt fa fa-tripadvisor' } },
                ]
              },
              {
                path: 'FBID_HDL', detail: { code: 'DCN', label: 'FBDI/HDL', iconClass: 'padrt fa fa-eercast' },
                "children": [
                  { path: 'Fbdi_Workbench', detail: { code: 'DCN', label: 'FBDI Workbench', iconClass: 'padrt fa fa-wordpress' } },
                  { path: 'Object_Grouping', detail: { code: 'DCN', label: 'Object Grouping', iconClass: 'padrt fa fa-object-group' } }
                ]
              }
            ]
          },
          {
            path: 'Cloud_Configuration', detail: { code: 'SGG', label: 'Cloud Configuration', iconClass: 'padrt cloudconfig' },
            "children": [
              { path: 'Object_Details', detail: { code: 'FBC', label: 'Object Details', iconClass: 'padrt1 fa fa-eercast' } },
              { path: 'POD_Details', detail: { code: 'FBX', label: 'POD Details', iconClass: 'padrt1 fa fa-superpowers' } }

            ]
          },
          {
            path: 'Source_Configuration', detail: { code: 'MDD', label: 'Source Configuration', iconClass: 'padrt sourcewb' },
            "children": [
              { path: 'Ebs_Adapter', detail: { code: 'LWB', label: 'EBS Adapter', iconClass: 'padrt1 fa fa-code-fork' } },
            ]
          },
  
          { path: 'Cloud_Query_Tool', detail: { code:'CQP', label: 'Cloud Query Tool', iconClass: 'padrt query' } },               

          { path: 'Manage_Your_Project', detail: { code: 'MYP', label: 'Manage Your Project', iconClass: 'padrt sourcewb' }},
          { path: 'Dashboard', detail: { label: 'Dashboard', iconClass: 'padrt metadata ' }},

           
  
  
  
        ];
      }
      if(sessionStorage.getItem('user_role')=="Admin"){
        navData = [
          { path: '', redirect: 'Login' },
          { path: 'Dashboard', detail: { label: 'Dashboard', iconClass: 'padrt fa fa-tachometer iconrigt ' }},
          { path: 'Source_Template', detail: { label: 'Source Template', iconClass: 'padrt fad fa-yin-yang' } },
          { path: 'Cloud_Template', detail: { code: 'LCP', label: 'Cloud Template', iconClass: 'padrt oj-ux-ico-bar-chart' } },
          { path: 'Mapping_Sets', detail: { code: 'LCP', label: 'Mapping Sets', iconClass: 'padrt oj-ux-ico-bar-chart' } },
          { path: 'Login', detail: { label: 'Login', iconClass: 'padrt fas fa-tv fa-lg iconrigt ' } },
          { path: 'Manage_Your_Project', detail: { code: 'MYP', label: 'Manage Your Project', iconClass: 'padrt oj-ux-ico-bar-chart' } },
          { path: 'Load_Metadata', detail: { code: 'MYP', label: 'Load Metadata', iconClass: 'padrt oj-ux-ico-bar-chart' } },
          { path: 'Source_MetaData', detail: { code:'DMS', label: 'Source MetaData', iconClass: 'padrt fa fa-newspaper-o' } },
          { path: 'Cloud_MetaData', detail: { code:'DFS', label: 'Cloud MetaData', iconClass: 'padrt fa fa-cloud' } },               
          { path: 'Cloud_Query_Tool', detail: { code:'CQP', label: 'Cloud Query Tool', iconClass: 'padrt query' } },               
          { path: 'Reconciliation', detail: { code:'CLI', label: 'Reconciliation', iconClass: 'padrt fa fa-wrench' } },       
          { path: 'Load_Cockpit', detail: { code:'lcpt', label: 'Load Cockpit', iconClass: 'padrt fa fa-cog' } },       
          { path: 'Conversion Workbench', detail: { code:'CR', label: 'Conversion Workbench', iconClass: 'padrt converwb' },               
          "children":[
            { path: 'Cloud_Template', detail: { code:'CTW', label: 'Cloud Template', iconClass: 'padrt fa fa-cloud' } },
            { path: 'Source_Template', detail: { code:'STW', label: 'Source Template', iconClass: 'padrt fa fa-cogs' } },
            { path: 'Source_Conversion_Status', detail: { code:'SCW', label: 'FBDI Conversions', iconClass: 'padrt fa fa-refresh' } },
            { path: 'Conversion_Status', detail: { code:'CCW', label: 'HDL Conversions', iconClass: 'padrt fa fa-crosshairs' } },
            { path: 'Load_Cockpit', detail: { code:'lcpt', label: 'Load Cockpit', iconClass: 'padrt fa fa-cog' } },      
            { path: 'Reconciliation', detail: { code:'CLI', label: 'Reconciliation', iconClass: 'padrt fa fa-wrench' } },       

           
          ]
          }
                
        
        
  
  
        ];
      }
     

      // Router setup
      let router = new CoreRouter(navData, {
        urlAdapter: new UrlParamAdapter()
      });
      router.sync();

      this.moduleAdapter = new ModuleRouterAdapter(router);

      this.selection = new KnockoutRouterAdapter(router);

      // Setup the navDataProvider with the routes, excluding the first redirected
      // route.
      this.navDataProvider = new ArrayTreeDataProvider(navData.slice(21), { keyAttributes: "path" });
    
      // Drawer
      self.sideDrawerOn = ko.observable(false);

      // Close drawer on medium and larger screens
      this.mdScreen.subscribe(() => { self.sideDrawerOn(false) });

      // Called by navigation drawer toggle button and after selection of nav drawer item
      this.toggleDrawer = () => {
        self.sideDrawerOn(!self.sideDrawerOn());
      }

      self.menuData = ko.observableArray([
        { value: "Manage_Your_Project", label: "Manage Your Project" },
        { value: "Lookup_Sets", label: "Lookup Sets" },  
        { value: "Mapping_Sets", label: "Mapping Sets" },
        { value: "Formula_Sets", label: "Formula Sets" },
        { value: "Cloud_Query_Tool", label: "Cloud Query Tool" },
        { value: "POD_Details", label: "POD Details" },
        { value: "Object_Details", label: "Object Details" },
        { value: "User_Hooks", label: "User Hooks" },
        { value: "Cloud_MetaData", label: "Cloud MetaData" },
        { value: "Source_MetaData", label: "Source MetaData" },
        { value: "Fbdi_Workbench", label: "FBDI Workbench" }, 
        { value: "Object_Grouping", label: "Object Grouping" },
        { value: "Cloud_Template", label: "Cloud Template" },
        { value: "Source_Template", label: "Source Template" },      
        { value: "FBDI_Conversions", label: "FBDI Conversions" }, 
        { value: "HDL_Conversions", label: "HDL Conversions" },  
         { value: "Load_Cockpit", label: "Load Cockpit" },
        { value: "Reconciliation", label: "Reconciliation" }
        

      ]);
      this.suggestionsDP = ko.pureComputed(() => {
        return new ArrayDataProvider(self.menuData, { keyAttributes: 'value' });
      });
      self.gotoMappingPage=function(event){
        if(event.detail.value=="Cloud MetaData"){
          self.goToPage("Cloud_MetaData");
        }
        else if(event.detail.value=="Manage Your Project"){
          self.goToPage("Manage_Your_Project");
        }
        else if(event.detail.value=="Cloud Query Tool"){
          self.goToPage("Cloud_Query_Tool");
        }
        else if(event.detail.value=="FBDI Workbench"){
          self.goToPage("Fbdi_Workbench");
        }
        else if(event.detail.value=="Object Details"){
          self.goToPage("Object_Details");
        }
        else if(event.detail.value=="POD Details"){
          self.goToPage("POD_Details");
        }
        else if(event.detail.value=="Object Grouping"){
          self.goToPage("Object_Grouping");
        }
        else if(event.detail.value=="User Hooks"){
          self.goToPage("User_Hooks");
        }
        else if(event.detail.value=="Source MetaData"){
          self.goToPage("Source_MetaData");
        }
        else if(event.detail.value=="Lookup Sets"){
          self.goToPage("Lookup_Sets");
        }
        else if(event.detail.value=="Mapping Sets"){
          self.goToPage("Mapping_Sets");
        }
        else if(event.detail.value=="Formula Sets"){
          self.goToPage("Formula_Sets");
        }
        else if(event.detail.value=="Cloud Template"){
          self.goToPage("Cloud_Template");
        }
        else if(event.detail.value=="Source Template"){
          self.goToPage("Source_Template");
        }
        else if(event.detail.value=="FBDI Conversions"){
          self.goToPage("FBDI_Conversions");
        }
        else if(event.detail.value=="Load Cockpit"){
          self.goToPage("Load_Cockpit");
        }
        else if(event.detail.value=="Reconciliation"){
          self.goToPage("Reconciliation");
        }
        
      }

      self.goToPage=function(page) {
        router.go({ path: page }).then(function () { this.navigated = true; });
      }

      this.showRolePopup=function(){
        const popup1= document.getElementById('123');
        popup1.open("#go1");
      }
      self.changeRole = function (event) {
        if (event.target.innerText) {
          let usrRole = event.target.innerText.trim();
          if (self.userRole() !== usrRole) {
            if (self.roleDtls()) {
              self.roleDtls().forEach((role) => {
                if (role.value == usrRole) {
                  sessionStorage.setItem('roleid', role.id);
                }
              })
            }
            sessionStorage.setItem('user_role', usrRole);
            location.reload();
          }
        }
      }
      // Header
      // Application Name used in Branding Area
      this.appName = ko.observable("App Name");
      // User Info used in Global Navigation area
      this.userLogin = ko.observable("john.hancock@oracle.com");
      
      // Footer
      this.footerLinks = [
        { name: 'About Oracle', linkId: 'aboutOracle', linkTarget: 'http://www.oracle.com/us/corporate/index.html#menu-about' },
        { name: "Contact Us", id: "contactUs", linkTarget: "http://www.oracle.com/us/corporate/contact/index.html" },
        { name: "Legal Notices", id: "legalNotices", linkTarget: "http://www.oracle.com/us/legal/index.html" },
        { name: "Terms Of Use", id: "termsOfUse", linkTarget: "http://www.oracle.com/us/legal/terms/index.html" },
        { name: "Your Privacy Rights", id: "yourPrivacyRights", linkTarget: "http://www.oracle.com/us/legal/privacy/index.html" },
      ];
    }

    // release the application bootstrap busy state
    Context.getPageContext().getBusyContext().applicationBootstrapComplete();

    return new ControllerViewModel();
  }
);
