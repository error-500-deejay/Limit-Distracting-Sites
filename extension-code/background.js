var datajson;

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  //this is for message passing , the liist of website to limit usage is stored in the chrome storage local,
  //but it cant be direct accessed form the front end ie. context sites ,s o we use message passing wherein this background worker
  //reads the dat form locla storeage and send =s it to the contect
  if (request.datarequest == "timerData") {
    //console.log(" BAckground Send To client", datajson);
    getDatFromLocalStorage(request, sender, sendResponse);
    return true;
    // sendResponse({ webListData: datajson });
  }
  // else if (request.datarequest == "updateTimerData") {
  //   datajson = request.content;
  //   console.log((" BAckground Update datajson ", datajson));
  //   sendResponse({ status: "success" });
  // }
});

//read the data of bloacked webllist and send it to the frontemd or context pages
function getDatFromLocalStorage(request, sender, sendResponse) {
  chrome.storage.local.get(["LIMIT_USER_USAGE_ON_WEBSITE"], function (data) {
    let datajsonin = data["LIMIT_USER_USAGE_ON_WEBSITE"];
    if (
      datajsonin == null ||
      datajsonin == "" ||
      datajsonin == undefined ||
      datajsonin == "undefined"
    ) {
      datajsonin = {
        blockurlarr: [],
        message: "",
        displayclockInterval: 5,
        isLimitAllowed: true,
      };
    }
    datajson = datajsonin;
    sendResponse({ webListData: datajson });
  });
}
