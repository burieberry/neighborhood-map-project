'use strict';

// Locations array for bars around Bushwick, Brooklyn
var locations = [
  {title: 'Heavy Woods', position: {lat: 40.705606, lng: -73.921648}},
  {title: 'Pearl\'s Social & Billy Club', position: {lat: 40.707065, lng: -73.921355}},
  {title: 'Sally Roots', position: {lat: 40.702754, lng: -73.916373}},
  {title: 'The Rookery Bar', position: {lat: 40.707404, lng: -73.922462}},
  {title: 'Boobie Trap', position: {lat: 40.70015, lng: -73.91604}},
  {title: 'Bootleg Bar', position: {lat: 40.698762, lng: -73.917186}},
  {title: 'The Keep', position: {lat: 40.708278, lng: -73.919621}},
  {title: 'The Three Diamond Door', position: {lat: 40.703515, lng: -73.926153}},
  {title: 'Birdy\'s', position: {lat: 40.697557, lng: -73.931502}},
  {title: 'Happyfun Hideaway', position: {lat: 40.697556, lng: -73.931654}},
  {title: 'Talon', position: {lat: 40.701115, lng: -73.914339}},
  {title: 'Dromedary Urban Tiki Bar', position: {lat: 40.699617, lng: -73.915813}},
  {title: 'Left Hand Path', position: {lat: 40.705176, lng: -73.920148}},
  {title: 'The Johnson\'s', position: {lat: 40.705867, lng: -73.923855}},
  {title: 'Gotham City Lounge', position: {lat: 40.69809, lng: -73.92661}},
  {title: 'Bossa Nova Civic Club', position: {lat: 40.697974, lng: -73.927965}},
  {title: 'The Sampler Bushwick', position: {lat: 40.705545, lng: -73.922317}},
  {title: 'Yours Sincerely', position: {lat: 40.702864, lng: -73.92915}},
  {title: 'Jupiter Disco', position: {lat: 40.70813, lng: -73.923523}},
  {title: 'The Cobra Club', position: {lat: 40.706685, lng: -73.923494}},
  {title: 'Pine Box Rock Shop', position: {lat: 40.705274, lng: -73.932676}},
  {title: 'Alphaville', position: {lat: 40.700546, lng: -73.925798}},
  {title: 'Starr Bar', position: {lat: 40.704985, lng: -73.922905}},
  {title: 'Punch Bowl Social', position: {lat: 40.704887, lng: -73.923669}}
];

var Location = function(data) {
  this.title = data.title;
  this.location = data.position;
};

var ViewModel = function() {
  var self = this;

  // initial location array
  this.locationList = ko.observableArray([]);
  // filtered location array
  this.filteredArray = ko.observableArray([]);

  // push locations to locationList array
  locations.forEach(function(locItem) {
    self.locationList.push(new Location(locItem));
  });

  // set initial display location to blank
  this.displayLoc = ko.observable(' ');

  // set clicked location as display location
  this.setLoc = function(loc) {
    self.displayLoc(loc);
    // loadFoursquare(loc.title, loc.location);
    queryLocation(loc.title, loc.location);
  };

  // takes in an array, sets location to list item
  this.refreshList = function(list) {
    largeInfoWindow.close();
    markers.forEach(function(marker) {
      // hide all markers
      marker.setVisible(false);
      list.forEach(function (item) {
        // if there's a match, display marker
        if (item.title === marker.title) {
          marker.setVisible(true);
          // display item on the locations list sidebar
          self.displayLoc(item);
        };
      });
    });
  };

  // filter functionality
  this.enteredValue = ko.observable();
  this.errorValue = ko.observable();
  this.searchValue = ko.pureComputed({
    read: this.enteredValue,
    write: function(value) {
      value = this.enteredValue();
      this.checkList = function(item) {
        return item.title.toLowerCase().replace("\'", "").includes(value);
      };

      if (this.enteredValue() !== undefined) {
        value = this.enteredValue().toLowerCase().replace("\'", "");
        this.filteredArray = this.locationList().filter(this.checkList);
        if (this.filteredArray.length === 0) {
          self.errorValue('Location not listed.');
        } else {
          self.errorValue('');
          self.refreshList(this.filteredArray);
        };
      };
    },
    owner: this
  });

  // hamburger menu slider
  this.menu = ko.observable();
  this.slide = ko.pureComputed({
    read: this.menu,
    write: function() {
      var drawer = document.getElementById('drawer');
      drawer.classList.toggle('open');
    },
    owner: this
  });
};

function loadFoursquare(locationName, marker) {
  locationName = locationName.replace(' ', '%20');
  var foursquareUrl = 'https://api.foursquare.com/v2/venues/search?oauth_token=FRUVP33R43UFC1Q0TQACD5WBOIWSI5M42XSLOI00BZ55TEYF&v=20171013&intent=checkin&ll=40.703811%2C%20-73.918425&query=' + locationName;

  $.ajax({
    url: foursquareUrl,
    dataType: 'jsonp'
  }).done(function(result) {
    if (result.response.venues) {
      var venueID = result.response.venues[0].id;
      getFoursquarePhoto(venueID, marker);
    } else {
      populateInfowindow(marker, largeInfoWindow, '');
    }
  }).fail(function(e) {
    console.log('Foursquare API error: Cannot get venueID.');
    populateInfowindow(marker, largeInfoWindow, '');
  });
}

/* FourSquare API */
function getFoursquarePhoto(venueID, marker) {
  var photoURL;
  var foursquarePhotoUrl = 'https://api.foursquare.com/v2/venues/' + venueID + '/photos?oauth_token=FRUVP33R43UFC1Q0TQACD5WBOIWSI5M42XSLOI00BZ55TEYF&v=20171013&group=venue&limit=5';

  $.ajax({
      url: foursquarePhotoUrl,
      dataType: 'jsonp'
  }).done(function(result) {
      if (result.response.photos) {
        var prefix = result.response.photos.items[0].prefix;
        var suffix = result.response.photos.items[0].suffix;
        var size = 'height150'
        photoURL = prefix + size + suffix;
        populateInfowindow(marker, largeInfoWindow, photoURL);
      }
      else {
        populateInfowindow(marker, largeInfoWindow);
      }
  }).fail(function(e) {
      console.log('Foursquare API error: Cannot get photo URL.');
      populateInfowindow(marker, largeInfoWindow);
  });
}


/* Google Maps */

var map; // global map object
var markers = []; // initialize global locations empty array
var position,
    title,
    service,
    largeInfoWindow;
var defaultIcon,
    highlightedIcon;

/* Initiate map */

// success callback for Google Maps API request
function initMap() {
  // constructor to create a new map
  map = new google.maps.Map(document.getElementById('map'), {
    // center is Bushwick, Brooklyn
    center: { lat: 40.703811, lng: -73.918425 },
    zoom: 15,
    mapTypeControl: false
  });

  var bounds = new google.maps.LatLngBounds();
  largeInfoWindow = new google.maps.InfoWindow();
  largeInfoWindow.setContent('');
  highlightedIcon = makeMarkerIcon('42adf4');

  // use the locations array to call for marker creation and set bounds
  for (var i = 0; i < locations.length; i++) {
    // Get the position from markers array
    var name = locations[i].title;
    var location = locations[i].position;
    bounds.extend(locations[i].position);
    createMarker(name, location);
  };
  map.fitBounds(bounds);

  // fit bounds when window is resized
  google.maps.event.addDomListener(window, 'resize', function() {
    map.fitBounds(bounds); // `bounds` is a `LatLngBounds` object
  });
}

// error callback for Google Maps API request
function mapError() {
  window.alert('Please make sure your API request is accurate.');
}

// create new marker on the given name and location
function createMarker(name, location) {
  var marker = new google.maps.Marker({
    position: location,
    title: name,
    map: map,
    photo: '',
    icon: defaultIcon
  });

  // Push the marker into array of markers.
  markers.push(marker);

  // Set default listing marker icon
  defaultIcon = marker.icon;

  // Create onclick event to open an infowindow for each marker
  marker.addListener('click', function() {

    // loadFoursquare(marker.title, marker);
    queryLocation(marker.title, marker.position);
  });

  return marker;
}

// create new icon for the marker with given color
function makeMarkerIcon(markerColor) {
  var markerImage = new google.maps.MarkerImage(
    'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
    '|40|_|%E2%80%A2',
    new google.maps.Size(24, 40),
    new google.maps.Point(0, 0),
    new google.maps.Point(12, 40),
    new google.maps.Size(24, 40));
  return markerImage;
}

// use Places Library to find location
function queryLocation(locName, locLocation) {
  var request = {
    name: locName,
    location: locLocation,
    radius: 100
  };

  service = new google.maps.places.PlacesService(map);
  service.nearbySearch(request, callback);
}

// return results of the location query with additional location details
function callback(results, status) {
  var count = 0;
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    markers.forEach(function(marker) {
      // compare queried place title with current markers' titles
      if (results[0].name === marker.title) {
        results[0].rating ? marker.rating = results[0].rating
              : marker.rating = 'N/A';

        results[0].vicinity ? marker.address = results[0].vicinity
                : marker.address = 'Address not available.';

        results[0].opening_hours !== undefined
                ? marker.hours = results[0].opening_hours.open_now
                : marker.hours = '';
        loadFoursquare(marker.title, marker);
        // populateInfowindow(marker, largeInfoWindow, marker.photo);
      } else {
        count++;
        if (count === markers.length) {
          window.alert('Venue with that name cannot be found.');
        };
      };
    });
  } else {
      window.alert('Request failed due to ' + status);
  };
}

// populate infowindow
function populateInfowindow(marker, infoWindow, photoURL) {
  // check to make sure the infowindow is not already opened on this marker
  if (infoWindow.marker != marker) {

    // clear the infowindow content
    infoWindow.setContent('');
    infoWindow.marker = marker;

    // Make sure the marker property is cleared if the infowindow is closed
    infoWindow.addListener('closeclick', function() {
      infoWindow.setMarker = null;
    });

    // set default icon to all markers
    for (var i = 0; i < markers.length; i++) {
      markers[i].setIcon(defaultIcon);
    }
    // set highlighted icon to selected marker
    marker.setIcon(highlightedIcon);

    // if marker has place open/close info, set the below
    var markerHours;
    if (marker.hours === true) {
      markerHours = '<em class="loc-open">Open Now!</em>';
    } else if (marker.hours === '') {
      markerHours = 'Hours not available.';
    } else {
      markerHours = '<em class="loc-closed">Closed now.</em>';
    }

    var rating;
    if (marker.rating === 'N/A') {
      rating = 'Rating not available.';
    } else {
      rating = 'Rating: ' + marker.rating + '/5.0';
    }

    var photo;
    photo = photoURL ? '<img src="' + photoURL + '" height="100"><br>'
                + '<small><em>Photo by Foursquare API.</em></small> ' : '';

    infoWindow.setContent('<div><strong>' + marker.title + '</strong><br>'
                          + rating + '<br>'
                          + marker.address + '<br>'
                          + markerHours + '<br>'
                          + photo
                          + '<small><em>Map powered by Google Maps API.</em></small>'
                          + '</div>');
    infoWindow.open(map, marker);
  }
}

// global error handler
window.onerror = function(err) {
  window.alert(err);
};

// activate knockout
ko.applyBindings(new ViewModel());
