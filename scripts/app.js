
(function(document) {
  'use strict';

    
  // Grab a reference to our auto-binding template
  // and give it some initial binding values
  // Learn more about auto-binding templates at http://goo.gl/Dx1u2g
  var app = document.querySelector('#app');
    
  app.STORE_KEY = "dress-designer-"; 

  app.currentFileName = "";
    
  // Storage for app    
  app.dataStore = {
      
      // The model Object
      model: {
          users: [],
          lastOutfits: {}
      },     
      
      // Load the data model
      load: function() {
          var key = app.STORE_KEY+"data";
          var data = localStorage.getItem(key);
          if(data) {
              this.model = JSON.parse(data);
          }          
          console.log(this.model);
          return this.model;
      },
      
      addLastOutfit: function(item) {
          console.log("addOutfit: " + item);
          this.model.lastOutfits = item;
          this.save();
      },
      
      // Add data to model
      addUser: function(item) {
          console.log("addUser: " + item);
          this.model.users.push(item);
          this.save();
      },
      
      // Save data model
      save: function() {
          var key = app.STORE_KEY+"data";
          var data = JSON.stringify(this.model);
          if(data) {
              localStorage.setItem(key, data); 
          }
      }      
  }    
  
  // Listen for template bound event to know when bindings
  // have resolved and content has been stamped to the page
  app.addEventListener('dom-change', function() {
      console.log('Our app is ready to rock!');      
  });

  // See https://github.com/Polymer/polymer/issues/1381
  window.addEventListener('WebComponentsReady', function() {
    // imports are loaded and elements have been registered  
      page('/design');
  });

  // Close drawer after menu item is selected if drawerPanel is narrow
  app.onDataRouteClick = function() {      
  };
  
  // import a dressing    
  app.onImportDressing = function(event) {
      console.log(event);
      var dressingView = document.querySelector('#dressingView');
      if(event.detail) {
          dressingView.changeDressing(event.detail);
          page('/design');
      }      
  } 
  
  app.onSelectClothe = function(event) {
      console.log(event);
      var outfitDesigner = document.querySelector('#outfitDesigner');
      if(event.detail) {
          delete event.detail.selected;
          outfitDesigner.addClothe(event.detail);
      }
  }
  
  app.onOutfitSaved = function(event) {
      console.log(event);
      var outfitList = document.querySelector('#outfitList');
      if(event.detail) {
          outfitList.addOutfit(event.detail);
      }       
  }

  // Scroll page to top and expand header
  app.scrollPageToTop = function() {
    //document.getElementById('mainContainer').scrollTop = 0;
  };
    
  window.onbeforeunload = function(e) {
    var message = "If you exit, you loose all your current works.",
    e = e || window.event;
    // For IE and Firefox
    if (e) {
        e.returnValue = message;
    }
    // For Safari
    return message;
  };    

})(document);
