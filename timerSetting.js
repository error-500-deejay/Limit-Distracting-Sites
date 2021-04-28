let datajson = {
  blockurlarr: [{ url: "localhost", time: 8, displayclock: true }],
  message: "",
  displayclockInterval: 5,
};

//chrome.storage.local.set({ isPaused: false });

//get the website list json store in the storage .local['LIMIT_USER_USAGE_ON_WEBSITE']
//if not found make a template json
function getWebBlockJSon() {
  let datajson;
  // if (typeof Storage !== "undefined") {
  // Store
  // datajson = localStorage.getItem("");
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(["LIMIT_USER_USAGE_ON_WEBSITE"], function (data) {
      datajson = data["LIMIT_USER_USAGE_ON_WEBSITE"];
      if (
        datajson == null ||
        datajson == "" ||
        datajson == undefined ||
        datajson == "undefined"
      ) {
        datajson = {
          blockurlarr: [],
          message: "",
          displayclockInterval: 5,
        };
      } else {
        datajson = JSON.parse(datajson);
      }
      resolve(datajson);
    });
  });

  // } else {
  // alert(
  //   "Your browser doesnot support some of our services. Please temporary disabled or remove the extension. We are working on solving this issue. Appologies for inconvenience"
  // );
  // }
}

//save the update weblist json to the chrome .storage
function setWebBlockJSon(datajson) {
  // if (typeof Storage !== "undefined") {
  // Store
  chrome.storage.local.set({
    LIMIT_USER_USAGE_ON_WEBSITE: JSON.stringify(datajson),
  });
  // console.log("IN Extension timer context SEnd Req to bg to update json");
  // chrome.runtime.sendMessage(
  //   { datarequest: "updateTimerData", content: JSON.stringify(datajson) },
  //   function (response) {
  //     // console.log(
  //     //   " Update Data Success in Exntnsion timer from BG ",
  //     //   new Date(),
  //     //   response
  //     // );
  //   }
  // );
  //localStorage.setItem("LIMIT_USER_USAGE_ON_WEBSITE", JSON.stringify(datajson));
  return true;
  // } else {
  //   alert(
  //     "Your browser doesnot support some of our services. Please temporary disabled or remove the extension. We are working on solving this issue. Appologies for inconvenience"
  //   );
  // }
}
//check if url id avalid
function checkvalidURL(str) {
  var pattern = new RegExp(
    "^(https?:\\/\\/)?" + // protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$",
    "i"
  ); // fragment locator
  return !!pattern.test(str);
}
//this basically adds the website name to the set limit website list
async function setTimerLimit() {
  let weburl = document.getElementById("website-url").value;
  let hrs = document.getElementById("website-time-hrs").value;
  let min = document.getElementById("website-time-min").value;
  let sec = document.getElementById("website-time-sec").value;
  if (
    !(
      checkvalidURL(weburl) ||
      hrs == "" ||
      isNaN(hrs) ||
      min == "" ||
      isNaN(min) ||
      sec == "" ||
      isNaN(sec)
    )
  ) {
    let msg =
      checkvalidURL(weburl) == false
        ? "Please enter a correct website URL ex. www.sitename.com"
        : "Please enter Correct values";
    return alert(msg);
  }
  let displayClock = document.getElementById("website-displayClockY").checked
    ? true
    : false;
  let timeTotal = parseInt(hrs) * 3600 + parseInt(min) * 60 + parseInt(sec);
  weburl = new URL(weburl).hostname;
  //get the variabls url,time.display timer from the user entered fields and then save in chrome storage
  let urlblockjson = {
    url: weburl,
    time: timeTotal,
    displayclock: displayClock,
  };
  //get latest website list json add the new user entered website data and save it agin to storage.local
  let datajson = await getWebBlockJSon();

  datajson.blockurlarr.push(urlblockjson);

  setWebBlockJSon(datajson);
  alert("Website usage limited Successfully!!");
  //update the list of website on user screen
  displayBlockSites();
  document.getElementById("website-url").value = "";
  document.getElementById("website-time-hrs").value = 0;
  document.getElementById("website-time-min").value = 0;
  document.getElementById("website-time-sec").value = 0;
  document.getElementById("website-displayClockY").checked = true;
}
//call function to add webste to list on submit button
document.getElementById("setTimerLimit").addEventListener("click", () => {
  setTimerLimit();
});
//handle the operation to enable/disable the limit on website based on the select value (YES?NO)
//herein a ket isLimitAllowed is stored as true and false and on the contextf file, first it is check if it true or noe not, if yes, it starts limit, else it doesnot operate limit
document
  .getElementById("website-enable-button")
  .addEventListener("change", async () => {
    let toggleVal = document.getElementById("website-enable-button").value;
    toggleVal = toggleVal == "true" ? true : false;
    let datajson = await getWebBlockJSon();
    datajson.isLimitAllowed = toggleVal;
    //save the json with updated allowK key to chrome.local
    setWebBlockJSon(datajson);
  });

//basically updates the data for an edited website entry in the display coloum
async function updateTimerLimit(setno) {
  let weburl = document.querySelectorAll(`.website-url.set-${setno}`)[0].value;
  let hrs = document.querySelectorAll(`.website-time-hrs.set-${setno}`)[0]
    .value;
  let min = document.querySelectorAll(`.website-time-min.set-${setno}`)[0]
    .value;
  let sec = document.querySelectorAll(`.website-time-sec.set-${setno}`)[0]
    .value;
  let displayClock = document.querySelectorAll(
    `.website-displayClockY.set-${setno}`
  )[0].checked
    ? true
    : false;
  let timeTotal = parseInt(hrs) * 3600 + parseInt(min) * 60 + parseInt(sec);
  let urlblockjson = {
    url: weburl,
    time: timeTotal,
    displayclock: displayClock,
  };

  let datajson = await getWebBlockJSon();
  datajson.blockurlarr[setno] = urlblockjson;
  //save to chrome.local.storage
  setWebBlockJSon(datajson);
}

//delete a given website name from list and save to locakl.storage
async function deleteTimerLimit(setno) {
  let datajson = await getWebBlockJSon(),
    webblockarr;
  webblockarr = datajson.blockurlarr;
  webblockarr.splice(setno, 1);
  datajson.blockurlarr = webblockarr;

  setWebBlockJSon(datajson);
  document.getElementsByClassName(`displayWebList-set-${setno}`)[0].remove();
  if (document.querySelectorAll("#displayWebListFrame tr").length == 1) {
    document.querySelectorAll("#displayWebListFrame")[0].remove();
  }
}
//cnvert sec to hrs, min,sec
function secondsToHmsConv(sthD) {
  sthD = Number(sthD);
  let sthH = Math.floor(sthD / 3600);
  let sthM = Math.floor((sthD % 3600) / 60);
  let sthS = Math.floor((sthD % 3600) % 60);
  return { sthH, sthM, sthS };
}
//display the list of  limited sites in form of table on the user end, also provide option to edit or delete thw website frok m list
async function displayBlockSites() {
  let datajson = await getWebBlockJSon();

  document.getElementById("website-enable-button").value =
    datajson.isLimitAllowed == true ? "true" : "false";

  let blocksitearr = datajson.blockurlarr;
  let tableTemplate;
  if (blocksitearr != undefined && blocksitearr.length != 0) {
    tableTemplate = `<table id="displayWebListFrame" style="width:94%;margin-bottom:3%">
          <tr>
              <th><span style="font-size: 20px;"> &#128279;</span> Website URL</th>
              <th><span style="font-size: 20px;"> &#9201;</span> Time Limit </th>
              <th><span style="font-size: 20px;">  &#9201;</span>Display Clock</th>
              <th> <span style="font-size: 20px;"> &#10060;</span>Remove </th>
          </tr>
          
          `;
    blocksitearr.forEach((ele, ind) => {
      let secondsToHms = secondsToHmsConv(ele.time),
        yselect = "",
        nselect = "checked";
      if (ele.displayclock) {
        yselect = "checked";
        nselect = "";
      }

      tableTemplate += `<tr class="displayWebList-set-${ind} displayWebList-set" urlid="${ind}"> <td><input type="text"  class="website-list-input website-url set-${ind}" value="${ele.url}" /></td>`;
      tableTemplate += `<td>    <input type="number"  value="${secondsToHms.sthH}"class="website-list-input website-time-list-input website-time-hrs set-${ind}" />
                          <label for="cars">Hrs</label>
                          <input type="number"  value="${secondsToHms.sthM}" class="website-list-input website-time-list-input website-time-min set-${ind}" />
                          <label for="cars">Min</label>
                          <input type="number"   value="${secondsToHms.sthS}" class="website-list-input website-time-list-input website-time-sec set-${ind}" />
                          <label for="cars">Sec</label>
                          </td>`;
      tableTemplate += `<td> <label for="cars">Display Clock</label>
                          <input
                          type="radio"
                          
                          class="website-list-input website-displayClockY set-${ind}"
                          name="website-displayClock${ind}"
                          value="true"
                          ${yselect}
                          />
                          <label for="website-displayClockY">Yes</label><br />
                          <input
                          type="radio"
                         
                          class="  website-list-input website-displayClockN set-${ind}"
                          name="website-displayClock${ind}"
                          value="false"
                          ${nselect}
                          />
                          <label for="website-displayClockN">No</label><br />`;
      tableTemplate += `</td><td><input type="submit" class="website-deleteButton" value="X" id="deleteSetTimer-set-${ind}" setvalue="${ind}" "></td></tr>`;
    });
    tableTemplate += `</table>`;
    document.getElementById("displayBlockSites").innerHTML = tableTemplate;
    //add event listener for the edit and delete inputs and button
    blocksitearr.forEach((ele, ind) => {
      document
        .getElementById(`deleteSetTimer-set-${ind}`)
        .addEventListener("click", (event) => {
          deleteTimerLimit(ind);
        });

      document.querySelectorAll(".website-list-input").forEach((ele, index) => {
        ele.addEventListener("change", () => {
          updateTimerLimit(ind);
        });
      });
    });
  }
}
//onload display the limited sites on screen
window.onload = async function () {
  displayBlockSites();

  let datajson = await getWebBlockJSon();
  setWebBlockJSon(datajson);
};
