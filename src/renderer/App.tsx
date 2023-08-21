import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, createRef, useState } from 'react';
import './App.css';

const MIN_DATA_DISPLAY_SIZE = 10;

interface IPCIQPayload {
  fileName?: string;
  data?: number[];
  filteredData?: number[];
  binaryLevels?: number[];
  size?: number;
  visibleSize?: number;
  binSequence?: string;
  hexSequence?: string;
  avgLevel?: number;
  sampleSpeed?: number;
  minPulseWidth?: number;
  frequency?: number;
  fileChanged?: boolean;
}

function MainApp() {
  const canvasRef = createRef<HTMLCanvasElement>();
  const [hasZoomed, setHasZoomed] = useState(false);
  const [originalZoomLevel, setOriginalZoomLevel] = useState({
    userMin: 0,
    userMax: 0,
  });

  const [zoomCanvasSize, setZoomCanvasSize] = useState({
    from: 0,
    width: 0,
  });

  const [mouseWasDown, setMouseWasDown] = useState(false);

  const [rfData, setRfData] = useState<IPCIQPayload | null>(null);
  const [rfLogs, setRfLogs] = useState([
    'No data loaded - Use ⌘ + O or File > Open',
  ]);
  const [displayTrueData, setDisplayTrueData] = useState(true);

  const dataLoaded = (rfData?.data?.length || 0) > 1;

  const resetZoom = () => {
    setHasZoomed(false);
    setOriginalZoomLevel({
      userMin: 0,
      userMax: 0,
    });
  };

  const resetZoomAction = () => {
    return window.electron.ipcRenderer.sendMessage('front-event', {
      eventType: 'zoom-level-changed',
      payload: {
        userMin: undefined,
        userMax: undefined,
      },
    });
  };

  useEffect(() => {
    return window.electron.ipcRenderer.on('iq-data', (IPCiqData) => {
      const iqData = IPCiqData as IPCIQPayload;
      if (iqData.fileChanged) {
        resetZoom();
      }
      if (iqData.visibleSize && iqData.visibleSize > MIN_DATA_DISPLAY_SIZE) {
        setRfData(iqData);
        setRfLogs([
          `Loaded file ${iqData.fileName}`,
          `IQ bytes data size = ${iqData.size}`,
          `Recorded frequency = ${iqData.frequency} MHz`,
          `Recorded speed = ${iqData.sampleSpeed} samples/s`,
          `Average level = ${iqData.avgLevel}`,
          `Detected min pulse width = ${iqData.minPulseWidth}`,
          'Guessed hex sequence:',
          iqData.hexSequence || '',
          'Guessed binary sequence:',
          iqData.binSequence || '',
        ]);
      }
    });
  });

  // DEBUG! prefetch data if available
  useEffect(() => {
    if (!hasZoomed) {
      return resetZoomAction();
    }
    return () => {};
  }, [hasZoomed]);

  useEffect(() => {
    const canvas = canvasRef.current as unknown as HTMLCanvasElement | null;
    if (canvas) {
      const context = canvas.getContext('2d');
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * devicePixelRatio;
      canvas.height = rect.height * devicePixelRatio;
      // context.scale(devicePixelRatio, devicePixelRatio);
      // canvas.style.width = rect.width + 'px';
      // canvas.style.height = rect.height + 'px';

      const { x } = rect;

      canvas.onmousedown = (e) => {
        setMouseWasDown(true);
        setZoomCanvasSize({ from: e.x - x, width: 0 });
      };

      canvas.onmouseup = () => {
        if (mouseWasDown) {
          setMouseWasDown(false);

          let { from, width } = zoomCanvasSize;
          if (width < 0) {
            width = -width;
            from -= width;
          }

          if (width > 2) {
            const sizeDataFrom = originalZoomLevel.userMin || 0;
            const sizeDataWidth =
              (originalZoomLevel.userMax || rfData?.size || 0) - sizeDataFrom;

            const min =
              Math.ceil((from / rect.width) * sizeDataWidth) + sizeDataFrom;
            const max =
              Math.ceil(((from + width) / rect.width) * sizeDataWidth) +
              sizeDataFrom;

            const newBounds = {
              userMin: min,
              userMax: max,
            };

            if (max - min > MIN_DATA_DISPLAY_SIZE) {
              window.electron.ipcRenderer.sendMessage('front-event', {
                eventType: 'zoom-level-changed',
                payload: newBounds,
              });

              setOriginalZoomLevel(newBounds);
              setHasZoomed(true);
            }
          }

          setZoomCanvasSize({ from: 0, width: 0 });
        }
      };

      canvas.onmousemove = (e) => {
        if (mouseWasDown) {
          setZoomCanvasSize({
            from: zoomCanvasSize?.from || 0,
            width: e.x - (zoomCanvasSize?.from || 0) - x,
          });
        }
      };

      if (context) {
        context.globalAlpha = 0;
        context.fillStyle = '#FFFFFF';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.globalAlpha = 1;

        const selData =
          (displayTrueData ? rfData?.data : rfData?.filteredData) || [];

        if (selData?.length > 0) {
          // display rf data graph
          const maxLevel = Math.max(...selData);
          const levelize = (n: number) =>
            Math.floor(canvas.height - (n / maxLevel) * canvas.height);
          const scaleX = (n: number) =>
            Math.ceil((n / selData.length) * canvas.width);

          context.beginPath();
          context.strokeStyle = 'black';
          context.lineWidth = 2;

          for (let i = 0; i < selData.length; i++) {
            const y2Level = levelize(selData[i]);
            context.lineTo(scaleX(i), y2Level);
          }

          context.stroke();

          // display average level
          context.beginPath();
          context.setLineDash([5, 5]);
          context.strokeStyle = 'red';
          context.lineWidth = 1;
          context.moveTo(0, levelize(rfData?.avgLevel || 0));
          context.lineTo(canvas.width, levelize(rfData?.avgLevel || 0));
          context.stroke();

          // zoom selection
          if (zoomCanvasSize) {
            context.globalAlpha = 0.2;
            context.fillStyle = '#d50124';
            context.fillRect(
              zoomCanvasSize.from * devicePixelRatio,
              0,
              zoomCanvasSize.width * devicePixelRatio,
              canvas.height
            );
            context.globalAlpha = 1;
          }
        }
      }
    }
  }, [
    canvasRef,
    displayTrueData,
    mouseWasDown,
    originalZoomLevel.userMax,
    originalZoomLevel.userMin,
    rfData,
    zoomCanvasSize,
  ]);

  return (
    <div className="prevent-select">
      <div className="header">ERH - Electron Radio Hacker</div>
      <div className="main">
        {dataLoaded && (
          <>
            <div className="rf-chart">
              <div className="control-chart-buttons">
                <button
                  type="button"
                  className="button button-control-chart"
                  onClick={() => setDisplayTrueData(!displayTrueData)}
                >
                  {displayTrueData ? 'Show filtered' : 'Show RAW'}
                </button>
                {hasZoomed && (
                  <button
                    type="button"
                    className="button button-control-chart"
                    onClick={() => resetZoom()}
                  >
                    Reset zoom
                  </button>
                )}
              </div>
              <canvas ref={canvasRef} width="100%" height="200px" />
            </div>
            {false && (
              <div className="rf-chart debug-area">
                {JSON.stringify(zoomCanvasSize)}
                <br />
                {JSON.stringify(originalZoomLevel)}
                <br />
                {(originalZoomLevel.userMax || rfData?.size || 0) -
                  originalZoomLevel.userMin}
              </div>
            )}
          </>
        )}
        <div className="console">
          {rfLogs.map((log) => (
            <div key={log}>{log}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainApp />} />
      </Routes>
    </Router>
  );
}
