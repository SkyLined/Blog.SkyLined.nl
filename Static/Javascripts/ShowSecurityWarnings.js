function fAddContentsToElement(oElement, xContents) {
  if (typeof xContents == "string") {
    // String? => add a text node
    oElement.appendChild(document.createTextNode(xContents));
  } else if (xContents instanceof Array) {
    // Array? => add individual elements sequentially
    for (var uIndex = 0; uIndex < xContents.length; uIndex++) {
      fAddContentsToElement(oElement, xContents[uIndex]);
    };
  } else if (xContents instanceof Node) {
    // Assume this is a DOM Node:
    oElement.appendChild(xContents);
  } else {
    console.log("Unknown content type", xContents);
    throw new Error("Unknown content type: " + xContents);
  };
};
  
function foCreateLinkElementWithContent(sURL, xContents) {
  // Create a link element with specified contents:
  var oLinkElement = foCreateElementWithContents("a", xContents);
  oLinkElement.href = sURL;
  return oLinkElement;
};
function foCreateElementWithContents(sTagName, xContents) {
  var oHeaderElement = document.createElement(sTagName);
  fAddContentsToElement(oHeaderElement, xContents);
  return oHeaderElement;
};
// Warnings are queued until the page is loaded. When the page is loaded, all queued warnings are shown and removed.
// from the queue. Any subsequent warnings are queued, immediately shown and removed from the queue.
var bPageLoaded = false,
    axQueuedWarnings = [];
function fShowOrQueueWarning(xWarning) {
  axQueuedWarnings.push(xWarning);
  if (bPageLoaded) fShowQueuedWarnings();
};
function fShowQueuedWarnings() {
  oSecurityWarningsElement.style.setProperty("display", "block");
  fAddContentsToElement(oSecurityWarningsElement, axQueuedWarnings);
  axQueuedWarnings = [];
};
addEventListener("load", function () {
  bPageLoaded = true;
  if (axQueuedWarnings.length > 0) fShowQueuedWarnings();
});
// Test referrer information leak:
if (document.referrer && !/^https?:\/\/\w+\.skylined.nl(\/.*)$/.exec(document.referrer)) {
  console.log("Detected referrer: showing warning");
  fShowOrQueueWarning([
    foCreateElementWithContents("h2", "Privacy warning: document.referrer leak detected!"), document.createElement("br"),
    "This is a friendly warning that your webbrowser appears to be leaking the address of the page from which ",
    "you arrived on this website. You may want to reconfigure your webbrowser to prevent this, install and ",
    "use an add-on that hides referers, or switch to a different webbrowser if none of these options are possible.",
    document.createElement("br"),
    document.createElement("br"),
    
    "You came here from this website: ",
    foCreateElementWithContents("strong", document.referrer), ".", document.createElement("br"),
    document.createElement("br"),
    
    "For more information see the Mozilla Developer Network page for ",
    foCreateLinkElementWithContent("https://developer.mozilla.org/en-US/docs/Web/API/Document/referrer", "Document.referrer"), " ",
    "and/or the Wikipedia page for ",
    foCreateLinkElementWithContent("https://en.wikipedia.org/wiki/HTTP_referer#Referer_hiding", "Referer hiding"),
    ".", document.createElement("br"),
    document.createElement("br"),
  ]);
};
// Test cookies by saving the time in a cookie continuously when the page is open and checking if one is present at
// page load that has a time very far in the past:
var SECONDS = 1000, MINUTES = 60 *SECONDS, HOURS = 60 *MINUTES, DAYS = 24 *HOURS, YEARS = 365 *DAYS;
setInterval(function () {
  document.cookie = "LastCookieSetTime=" + new Date().valueOf() + "; expires=" + new Date(new Date().getTime() + 10 *YEARS).toGMTString();
}, 1000);
var asCookies = document.cookie.split('; ');
    dsCookies = {};
for (var uIndex = 0; uIndex < asCookies.length; uIndex++){
  var asCookie = asCookies[uIndex].split("="),
      sName = asCookie.shift(),
      sValue = asCookie.join("=");
  if (sName == "LastCookieSetTime") {
    uLastCookieSetTime = parseInt(sValue);
    var uTimeSinceLastCookieWasSet  = new Date().getTime() - uLastCookieSetTime;
    console.log("uTimeSinceLastCookieWasSet", uTimeSinceLastCookieWasSet);
    // Allow for cookie managers that keep cookies around for some time after closing the last page of this
    // website, in case you want to reopen it without needing to log back in. This should not last more than
    // 30 minutes:
    if (uTimeSinceLastCookieWasSet > 30 *MINUTES) {
      console.log("Detected cookies: showing warning");
      fShowOrQueueWarning([
        foCreateElementWithContents("h2", "Privacy warning: persistent cookies detected!"), document.createElement("br"),
        "This is a friendly warning that your webbrowser does not appear to have deleted cookies for this website ",
        "since the last time you visited it. There is no need for your browser to save cookies for this website, but ",
        "cookies can be abused by malicious websites to track you. You may want to reconfigure your webbrowser to ",
        "only store cookies for sites that you need them on (e.g. site that you want to remain logged-in to even ",
        "after you've restarted your webbrowser), install and use a cookie-management add-on, or switch to a ",
        "different webbrowser if none of these options are possible.", document.createElement("br"),
        document.createElement("br"),
        
        "The last time you visited this website was: ",
        foCreateElementWithContents("strong", new Date(uLastCookieSetTime).toString()), ".", document.createElement("br"),
        document.createElement("br"),
        
        "For more information see the Wikipedia page for ",
        foCreateLinkElementWithContent("https://en.wikipedia.org/wiki/HTTP_cookie", "HTTP cookies"), ".", document.createElement("br"),
        document.createElement("br"),
      ]);
    };
  };
};
// Test ad-blocker by trying to load a file from a URL that matches ".com/ads.js", as this is commonly blocked:
var bAdBlockerDetected = undefined,
    oXHR = new XMLHttpRequest(),
    bAdBlockerCheckCompleted = false;
oXHR.addEventListener("readystatechange", function() {
  if (oXHR.readyState == 4 && oXHR.status == 200) { // Loaded successfully: assume no ad-blocker installed.
    console.log("Detected no ad-blocker: showing warning");
    fShowOrQueueWarning([
      foCreateElementWithContents("h2", "Security warning: No ad-blocker detected!"), document.createElement("br"),
      "This is a friendly warning that you do not appear to have an ad-blocker installed. Malicious advertisements ",
      "are regularly abused as an attack vector to compromise machines when a user visits a website that shows these ",
      "advertisements. You may want to install and use an ad-blocker add-on, or switch to a different webbrowser if ",
      "none of these options are possible.",
      document.createElement("br"),
      document.createElement("br"),
      
      "For more information see the Wikipedia page for ",
      foCreateLinkElementWithContent("https://en.wikipedia.org/wiki/Malvertising", "Malvertising"),
      ".", document.createElement("br"),
      document.createElement("br"),
    ]);
  };
});
oXHR.open("GET", "/x.com/ads.js", true);
oXHR.send();
// Test WebRTC local IP address leak
RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
if (RTCPeerConnection) {
  var oRTCPeerConnection = new RTCPeerConnection({"iceServers": [{"urls": "stun:stun.services.mozilla.com"}]}),
      dsLocalIPAddresses = {};
  oRTCPeerConnection.addEventListener("icecandidate",function (oRTCPeerConnectionIceEvent) {
    var oRTCIceCandidate = oRTCPeerConnectionIceEvent.candidate;
    if (oRTCIceCandidate) {
      console.log("oRTCIceCandidate:", oRTCIceCandidate);
      var asCandidate = oRTCIceCandidate.candidate.split(" ");
      if (asCandidate[7] == "host") {
        var sLocalIPAddress = asCandidate[4];
        if (/[0-9]{1,3}(?:\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(?::[a-f0-9]{1,4}){7}/.exec(sIPAddress)) {
          dsLocalIPAddresses[sLocalIPAddress] = 1;
        };
      };
    } else {
      var asLocalIPAddresses = Object.keys(dsLocalIPAddresses);
      console.log("asLocalIPAddresses:", asLocalIPAddresses);
      if (asLocalIPAddresses.length > 0) {
        console.log("Detected local IP address: showing warning");
        fShowOrQueueWarning([
          foCreateElementWithContents("h2", "Security warning: WebRTC local IP address leak detected!"), document.createElement("br"),
          "This is a friendly warning that your webbrowser appears to be leaking the local IP address of your ", 
          "device through the WebRTC feature. This information is useful if a malicious websites wants to scan your ",
          "local network and/or attack this and other devices on your local network. You may want to reconfigure your ",
          "webbrowser, install and use an add-on that hides local IP addresses in WebRTC , or switch to a different ",
          "webbrowser if none of these options are possible.", document.createElement("br"),
          document.createElement("br"),
          
          "The leaked local IP address", asLocalIPAddresses.length == 1 ? " is" : "es are", ": ",
          asLocalIPAddresses.join(", "), ".", document.createElement("br"),
          document.createElement("br"),
        ]);
      };
    };
  });
  oRTCPeerConnection.createDataChannel("");
  oRTCPeerConnection.createOffer(function (oRTCSessionDescription){
    console.log("oRTCSessionDescription:", oRTCSessionDescription);
    oRTCPeerConnection.setLocalDescription(oRTCSessionDescription, function() {
      console.log("RTCPeerConnection setup completed");
    }, function(sErrorMessage) {
      console.log("RTCPeerConnection.setLocalDescription error:", sErrorMessage);
    });
  }, function (sErrorMessage) {
    console.log("RTCPeerConnection.createOffer error:", sErrorMessage);
  });
};
// Test if Adobe Flash is installed
var oFlashElement = document.createElement("object");
oFlashElement.setAttribute("type", "application/x-shockwave-flash");
oFlashElement.setAttribute("data", "/Flash/HelloWorld.swf");
oFlashElement.addEventListener("readystatechange", function() {
  if (oFlashElement.readyState == 4) {
    console.log("Detected Adobe Flash: showing warning");
    fShowOrQueueWarning([
      foCreateElementWithContents("h2", "Security warning: Adobe Flash detected!"), document.createElement("br"),
      "This is a friendly warning that your webbrowser appears to have Adobe Flash installed and enabled for use on ",
      "this website. There is no need for your browser to allow Adobe Flash on this website, but it is regularly ",
      "abused as an attack vector to compromise machines. You may want to un-install Flash, reconfigure your ",
      "webbrowser to block Flash on all websites unless you specifically enable it, use a plugin-management add-on, ",
      "or switch to a different webbrowser if none of these options are possible.", document.createElement("br"),
      document.createElement("br"),
    ]);
  };
});
