import React from 'react';
import { QRCodeCanvas } from 'qrcode.react'; // Use Canvas for better performance/customization
import PropTypes from 'prop-types';

function QRCodeDisplay({ uniqueSecureId, size = 128, level = 'M' }) {
  if (!uniqueSecureId) {
    return <p className="text-sm text-red-500">Error: Unique ID missing for QR Code generation.</p>;
  }

  // Construct the URL the QR code should point to.
  // Use window.location.origin to get the base URL of the frontend.
  const scanUrl = `${window.location.origin}/scan/${uniqueSecureId}`;

  return (
    <div className="p-2 inline-block border border-gray-300 rounded">
      <QRCodeCanvas
        value={scanUrl} // The URL to encode
        size={size}     // Size of the QR code in pixels
        bgColor={"#ffffff"} // Background color
        fgColor={"#000000"} // Foreground color
        level={level}       // Error correction level: 'L', 'M', 'Q', 'H'
        includeMargin={true} // Include a quiet zone margin
      />
      <p className="text-xs text-center text-gray-500 mt-1">Scan for public info</p>
      {/* Optional: Add a button to download the QR code */}
      {/* <button onClick={() => downloadQR(scanUrl)}>Download QR</button> */}
    </div>
  );
}

// Helper function for download (optional)
// const downloadQR = (url) => {
//   const canvas = document.querySelector('canvas'); // Adjust selector if needed
//   if (canvas) {
//      const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
//      let downloadLink = document.createElement('a');
//      downloadLink.href = pngUrl;
//      downloadLink.download = `dog-qr-${url.split('/').pop()}.png`; // Use secureId in filename
//      document.body.appendChild(downloadLink);
//      downloadLink.click();
//      document.body.removeChild(downloadLink);
//   }
// }

QRCodeDisplay.propTypes = {
  uniqueSecureId: PropTypes.string.isRequired,
  size: PropTypes.number,
  level: PropTypes.oneOf(['L', 'M', 'Q', 'H']),
};

export default QRCodeDisplay;