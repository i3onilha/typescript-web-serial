// Import stylesheets
import './style.css';
import EscPosEncoder from 'esc-pos-encoder';
import { vendorsList } from './vendors';
import { vendorSpecificEscPos, VendorSpecific } from './encoding';

const appDiv = document.getElementById('app');
const selectBtn = document.getElementById('select');
const printBtn = document.getElementById('just-print');
let selectedPort: SerialPort;
let connected = false;

setup();

async function setup() {
  try {
    navigator.serial.addEventListener('connect', event => {
      console.log('a serial port with permission were connected', event);
      if(!connected) {
        getConfiguredPrinter();
      }
    });

    navigator.serial.addEventListener('disconnect', event => {
      console.log('a serial port with permission were disconnected', event);
      if(selectedPort === (event.target as any)) {
        closePrinter(selectedPort);
        getConfiguredPrinter();
      }
    });

    await getConfiguredPrinter();

    selectBtn.onclick = selectPrinter;
    printBtn.onclick = writePort;
  } catch (error) {
    appDiv.innerHTML =
      `<h2>Your browser doesn't support Web Serial</h2>` + error;
    console.error(error);
  }
}

async function getConfiguredPrinter() {
  try {
    const ports = await navigator.serial.getPorts();
    const usbVendorId = parseInt(localStorage.getItem('usbVendorId'));
    const usbProductId = parseInt(localStorage.getItem('usbProductId'));

    if(!usbVendorId || !usbProductId) {
      appDiv.innerHTML = `<h2>Click on "Config Printer" to select a printer!</h2>`;
      return;
    }

    console.log('all ports with permission:', ports);

    const port = ports.find(p => {
      const info = p.getInfo();
      return info.usbVendorId === usbVendorId && info.usbProductId === usbProductId
    });

    if (!port) {
      appDiv.innerHTML = `<h2>Could not connect to selected printer, configure the printer again</h2>`;
      return;
    }

    await openPrinter(port);
  } catch (error) {
    appDiv.innerHTML =
      `<h2>There was some error trying to get the ports:</h2>` +
      error +
      '<h3>Important:</h3> If you are at the StackBlitz interface, you must open this URL above on another tab to teste it out.';
    console.error(error);
  }
}

async function selectPrinter() {
  appDiv.innerHTML = `<h1>Requesting access...</h1>`;

  try {
    if(selectedPort && connected) {
      await closePrinter(selectedPort);
    }
    const port = await navigator.serial.requestPort();
    await openPrinter(port);
  } catch (error) {
    appDiv.innerHTML =
      `<h2>There was some error trying to request the port:</h2>` + error;
    console.error(error);
  }
}

async function closePrinter(port: SerialPort) {
  try {
    appDiv.innerHTML += 'Clossing port... ';
    await port.close();
    appDiv.innerHTML += 'OK<br>';
    connected = false;
  }
  catch(e) {
    console.log('Error clossing port', port, e)
  }
}

async function openPrinter(port: SerialPort) {
  try {
    connected = true;

    appDiv.innerHTML = `<h2>Connected to ${formatPortInfo(port.getInfo())}</h2>`;
    console.log('oppening printer:', port)

    selectedPort = window['selectedPort'] = port;

    appDiv.innerHTML += 'Openning port... ';
    await selectedPort.open({
      baudRate: 115200
    });
    appDiv.innerHTML += 'OK<br>';

    const portInfo = port.getInfo();
    localStorage.setItem('usbVendorId', portInfo.usbVendorId + '')
    localStorage.setItem('usbProductId', portInfo.usbProductId + '')

  } catch(e) {
    appDiv.innerHTML =
      `<h2>There was some error openning port:</h2>` + e;
    connected = false;
  }
}

async function writePort() {
  if(!selectedPort || !connected) {
    await selectPrinter();
  }

  const message = document.getElementById('text')['value'];
  
  appDiv.innerHTML += 'Getting writable pipe... ';
  const writer = selectedPort.writable.getWriter();
  appDiv.innerHTML += 'OK<br>';

  appDiv.innerHTML += 'Printing... ';
  const vendor = vendorSpecificEscPos.find(v => v.vid === selectedPort.getInfo()?.usbVendorId);
  await writer.write(encodeText(message, vendor));
  appDiv.innerHTML += 'OK<br>';

  // appDiv.innerHTML += '<br><br>Releasing writer lock... ';
  // writer.releaseLock();
  // appDiv.innerHTML += 'OK<br>';

  appDiv.innerHTML += '<br><br>Clossing writer... ';
  await writer.close();
  appDiv.innerHTML += 'OK<br>';
}

function encodeText(text, vendor?: VendorSpecific) {
  const encoder = new EscPosEncoder();
  encoder
    .initialize()
    .codepage('cp858')
    .text(text)
    .newline()
    .newline()
    .newline();
  if(vendor?.cut) {
    encoder.raw(vendor.cut)
  }
  else {
    encoder.cut();
  }
  return encoder.encode();
}

function formatPortInfo(info: SerialPortInfo) {
  if (!info || !info.usbVendorId) {
    return 'Port with no info';
  }
  const vendorName = vendorsList.find(
    d => parseInt(d.field_vid) === info.usbVendorId
  )?.name ?? 'Unknown Vendor';
  return vendorName + ' - Product ID: ' + info.usbProductId;
}
