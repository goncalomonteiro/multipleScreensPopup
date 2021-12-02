const WINDOW_CHROME_X = 1;
const WINDOW_CHROME_Y = 51;
const openWindowBtn = document.querySelector('.open');
const revokeBtn = document.querySelector('.revoke');

let popups = [];
let cachedScreens = null;

let granted = false;
const isSupported = "getScreens" in window || "getScreenDetails";

openWindowBtn.onclick = function() {

}
//TODO


revokeBtn.onclick = function() {
  revokePermission();
}

function revokePermission() {
  navigator.permissions.revoke({name:'window-placement'}).then(function(result) {
    report(result.state);
  });
}
  
if (!'getScreenDetails' in navigator) {
  console.log('The Multi-Screen Window Placement API is not supported.');
}else{
  console.log('Multi-Screen Window Placement API supported.');
}

if(window.screen.isExtended)
  console.log('more than one screen is connected to your device');
else
  console.log('only one screen is connected to your device');

const init = async () => {

  navigator.permissions.query({name:'window-placement'}).then(function(result) {
    if (result.state == 'granted') {
      report(result.state);
    } else if (result.state == 'prompt') {
      report(result.state);
      //TODO
      //navigator.geolocation.getCurrentPosition(revealPosition,positionDenied,geoSettings);
    } else if (result.state == 'denied') {
      report(result.state);
    }
    granted = result.state;
    result.onchange = function() {
      report(result.state);
      granted = result.state;
    }
  });

  await elmerify();

}

function report(state) {
  console.log('Permission: ' + state);
}

const elmerify = async () => {
  // For now, don't run in an iframe, but pop out to a new window.
  // TODO(crbug.com/1182855): Run full demo from iframe once it's supported.
  if (window.self !== window.top) {
    window.open(location.href)//, "", "noopener,noreferrer");
    console.log('window.self !== window.top');
    return;
  }
  
  const screens = await getScreensInfo();

  console.log(screens);

  popups = [];
  screens.forEach((screen, numScreen) => {
    let width = Math.floor(screen.availWidth * WINDOW_CHROME_X);
    let height = Math.floor(screen.availHeight * WINDOW_CHROME_Y);
    let screenX = width + screen.availLeft * WINDOW_CHROME_X;
    let screenY = height + screen.availTop * WINDOW_CHROME_Y;
    console.log(screenX,screenY,width,height);
    /*const popup = createPopup(screenX, screenY, width, height);
    if (!popup) {
      popups.forEach(popup => popup.close());
      alert(
        "It looks like you are blocking popup windows. Please allow them as outlined at https://goo.gle/allow-popups."
      );
    }*/
  });

};


const getScreensInfo = async () => {
  if (isSupported) {
    if (cachedScreens) {
      return cachedScreens.screens;
    } else {
      cachedScreens = "getScreens" in window ? await window.getScreens() : await window.getScreenDetails();
      cachedScreens.addEventListener("screenschange", async e => {
        console.log("screenschange", e);
        //closeAllPopups();
        await elmerify();
      });
      cachedScreens.addEventListener("currentscreenchange", async e => {
        console.log("currentscreenchange", e);
      });
      return cachedScreens.screens;
    }
  }else{
    console.log('!isSupported');
  }
  return [window.screen];
};

init();