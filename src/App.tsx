// src/App.tsx
import React, { useState } from "react";

import "./styles.css"; // Assuming you have some global styles here
import SelectPage from "./SelectPage";

const App: React.FC = () => {
  const [params, setParams] = useState<Record<string, string>>(
    sessionStorage.getItem("config")
      ? JSON.parse(sessionStorage.getItem("config")!)
      : {}
  );

  const configure = () => {
    const config = prompt("Enter json config (bucket, prefix, key, secret)");
    if (config) {
      sessionStorage.setItem("config", config);
      setParams(JSON.parse(config));
    }
  };

  return (
    <div className="app-container">
      <SelectPage params={params} />
      <div className="footer">
        <ul>
          <li>
            <a href="" onClick={() => configure()}>
              Configure
            </a>
          </li>
          <li>Shift + Z: Home</li>
          <li>Shift + R: Reset game</li>
          <li>Shift + X: Sample tiles</li>
          <li>Shift + C: Clear all but top</li>
          <li>Tab: Toggle background focus</li>
        </ul>
      </div>
    </div>
  );
};

export default App;
