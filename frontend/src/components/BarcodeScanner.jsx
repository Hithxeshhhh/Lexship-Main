import { useZxing } from 'react-zxing';
import { useEffect, useRef } from 'react';
import './BarcodeScanner.css'; // Import CSS file for styling

const BarcodeScanner = ({ onClose, tags, setTags }) => {
  const { ref } = useZxing({
    onDecodeResult(result) {
      if (!tags.includes(result.getText())) {
        setTags([...tags, result.getText()]); 
        // console.log(tags);
      }
    },
  });

  const scanningLineRef = useRef(null);

  useEffect(() => {
    const scanningLine = scanningLineRef.current;
    const scanningLineHeight = scanningLine.offsetHeight;

    let position = 0;
    const moveScanningLine = () => {
      position += 1;
      if (position >= scanningLineHeight) {
        position = 0;
      }
      scanningLine.style.transform = `translateY(${position}px)`;
      requestAnimationFrame(moveScanningLine);
    };
    moveScanningLine();

    return () => {
      cancelAnimationFrame(moveScanningLine);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="barcode-scanner-container">
      <video ref={ref} className="barcode-scanner-video"></video>
      {<div ref={scanningLineRef} className="barcode-scanner-line"></div>}
    </div>
  );
};

export default BarcodeScanner;
