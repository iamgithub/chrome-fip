"use strict";

/* globals chrome, LastfmAPI */

function ScrobblingController(process){
  this.previousBroadcast = null;

  this.setupClient();
  this.setupEvents(process);
}

ScrobblingController.init = function init(process){
  var instance = new ScrobblingController(process);

  return instance;
};

ScrobblingController.prototype.setupClient = function setupClient(){
  var self = this;

  this.client = new LastfmAPI(process.preferences.get("lastfm.token"));

  chrome.runtime.onMessage.addListener(function(request){
    if (request.data && request.data.key === "lastfm.token"){
      self.client.session_key = request.data.value;
    }
  });
};

ScrobblingController.prototype.setupEvents = function setupClient(process){
  var self = this;

  chrome.runtime.onMessage.addListener(function(request){
    if (request.channel === "broadcasts" && process.radio.state === "playing"){
      var current = Broadcast.getCurrent(request.data);

      self.processNowPlaying(current);
      self.processScrobbling(current);

      if (current && (!self.previousBroadcast || current.title !== self.previousBroadcast.title)){
        self.previousBroadcast = current;
      }
    }
  });
};

ScrobblingController.prototype.processNowPlaying = function processNowPlaying(current){
  if (!this.client.isConfigured() || !current instanceof Broadcast){
    return;
  }

  if (current && current.artist && current.title !== previous.title && current.artist !== previous.artist){
    this.client.nowPlaying({ artist: current.artist, track: current.title });
  }
};

ScrobblingController.prototype.processScrobbling = function processScrobbling(current){
  if (!this.client.isConfigured() || !current instanceof Broadcast){
    return;
  }

  if (previous && previous.artist && current.title !== previous.title && current.artist !== previous.artist){
    this.client.scrobble({
      artist: previous.artist,
      track: previous.title,
      when: Date.now() - 120*1000 // let's pretend we listened to it 2 minutes ago
    });
  }
};
