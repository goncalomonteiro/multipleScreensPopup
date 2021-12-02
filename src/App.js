import './App.css';

const WINDOW_CHROME_X = 1;
const WINDOW_CHROME_Y = 51;
const isSupported = "getScreens" in window || "getScreenDetails";

let cachedScreens = null;

if (!isSupported) {
  console.log('Warning: The Multi-Screen Window Placement API is not supported.');
}
if(!window.screen.isExtended)
  console.log('Warning: Only one screen is currently connected to your device');

const openPopupScreen = (screenX, screenY, width, height) => {
  const features = [
    `left=${screenX}`,
    `top=${screenY}`,
    `width=${width}`,
    `height=${height}`,
    `menubar=no`,
    `toolbar=no`,
    `location=no`,
    `status=no`,
    `resizable=yes`
  ].join(",");
  return window.open("https://www.google.com", '_blank', features);
};

const getScreensInfo = async () => {
  if (isSupported) {
    if (cachedScreens) {
      console.log('Already cashed');
      return cachedScreens;
    } else {
      cachedScreens = "getScreens" in window ? await window.getScreens() : await window.getScreenDetails();
      cachedScreens.addEventListener("screenschange", async e => {
        console.log("screenschange", e);
        await placePopup(false);
      });
      cachedScreens.addEventListener("currentscreenchange", async e => {
        console.log("currentscreenchange", e);
      });
      console.log(cachedScreens);
      return cachedScreens;
    }
  }
  return [window.screen];
};

const placePopup = async (openPopup) => {
  if (window.self !== window.top) {
    console.log('...');
    // eslint-disable-next-line no-restricted-globals
    window.open(location.href)//, "", "noopener,noreferrer");
    return;
  }

  cachedScreens = await getScreensInfo();
  
  const currentScreen = cachedScreens.screens.filter(
    screen => screen !== cachedScreens.currentScreen
  )[0];

  console.log(cachedScreens.screens);
  console.log(currentScreen);

  if(!openPopup){
    return;
  }

  //when there are only one screen, current screen is undefined.
  if(!window.screen.isExtended){
    console.log('only one screen is currently connected to your device');
      let width = Math.floor(cachedScreens.screens[0].availWidth - WINDOW_CHROME_X);
      let height = Math.floor(cachedScreens.screens[0].availHeight - WINDOW_CHROME_Y);
      let screenX = cachedScreens.screens[0].availLeft;
      let screenY = cachedScreens.screens[0].availTop;
      const popup = openPopupScreen(screenX, screenY, width, height);
      if (!popup) {
        alert(
          "It looks like you are blocking popup windows. Please allow them as outlined at https://goo.gle/allow-popups."
        );
      }
  }else{
    cachedScreens.screens.filter(screen =>
      screen.availHeight === currentScreen.availHeight &&
      screen.availLeft === currentScreen.availLeft &&
      screen.availTop === currentScreen.availTop &&
      screen.availWidth === currentScreen.availWidth).forEach((screen, numScreen) => {
      let width = Math.floor(screen.availWidth - WINDOW_CHROME_X);
      let height = Math.floor(screen.availHeight - WINDOW_CHROME_Y);
      let screenX = screen.availLeft;
      let screenY = screen.availTop;
      const popup = openPopupScreen(screenX, screenY, width, height);
      if (!popup) {
        alert(
          "It looks like you are blocking popup windows. Please allow them as outlined at https://goo.gle/allow-popups."
        );
      }
    });
  }
};

async function getPermission() {
  try {
    const { state } = await navigator.permissions.query({ name: 'window-placement' });
    return state === 'granted';
  } catch {
    return false;
  }
}

const createPopup = async () => {
  const granted = getPermission();
  if(granted){
    await placePopup(true);
  }else{
    console.log('You dont have permissions to use Multi-Screen Window Placement API, to enable go to chrome > settings > privacy & security > allow window placement in this website.\n After that you can just reload the page.\n you also need to enable popups in this website and to have chrome v96+');
  }
}

/*function revokePermission() {
  navigator.permissions.revoke({name:'window-placement'}).then(function(result) {
    granted = false;
  });
}*/

function App() {
  return (
    <div className="App">
      <h1>Cast Window in 2nd screen</h1>
      {window.screen.isExtended && <h2>Multiple screens detected</h2>}
      {isSupported && <button onClick={createPopup}>Open Window</button>}
    </div>
  );
}
export default App;