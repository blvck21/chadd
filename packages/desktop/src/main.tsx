import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body, #root {
    width: 100%;
    height: 100%;
    font-family: 'Courier New', 'Lucida Console', monospace;
    background: #1a1a1a !important;
    color: #e0e0e0;
    overflow: hidden;
    user-select: none;
  }

  ::-webkit-scrollbar {
    width: 12px;
  }

  ::-webkit-scrollbar-track {
    background: #2a2a2a;
    border: 1px solid #404040;
  }

  ::-webkit-scrollbar-thumb {
    background: #505050;
    border: 1px solid #606060;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #606060;
  }
`;

console.log("Starting CHADD application...");

// Error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("CHADD Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            background: "#1a1a1a",
            color: "#00ff00",
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "Courier New, monospace",
            padding: "20px",
          }}
        >
          <h1 style={{ color: "#ff0000", marginBottom: "20px" }}>
            CHADD ERROR
          </h1>
          <pre
            style={{
              background: "#000",
              padding: "20px",
              borderRadius: "4px",
              fontSize: "12px",
            }}
          >
            {this.state.error?.toString()}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              background: "#00ff00",
              color: "#000",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontFamily: "Courier New, monospace",
            }}
          >
            RESTART CHADD
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("Root element not found!");
  document.body.innerHTML = `
    <div style="
      background: #1a1a1a; 
      color: #ff0000; 
      height: 100vh; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      font-family: 'Courier New', monospace;
      font-size: 18px;
    ">
      ERROR: Root element not found!
    </div>
  `;
} else {
  console.log("Root element found, rendering app...");
  try {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <ErrorBoundary>
          <GlobalStyle />
          <App />
        </ErrorBoundary>
      </React.StrictMode>
    );
    console.log("App rendered successfully!");
  } catch (error) {
    console.error("Failed to render app:", error);
    rootElement.innerHTML = `
      <div style="
        background: #1a1a1a; 
        color: #ff0000; 
        height: 100vh; 
        display: flex; 
        flex-direction: column;
        align-items: center; 
        justify-content: center; 
        font-family: 'Courier New', monospace;
        padding: 20px;
      ">
        <h1>CHADD INITIALIZATION FAILED</h1>
        <pre style="background: #000; padding: 20px; border-radius: 4px; margin: 20px 0; font-size: 12px;">
${error}
        </pre>
        <button onclick="window.location.reload()" style="
          padding: 10px 20px;
          background: #00ff00;
          color: #000;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-family: 'Courier New', monospace;
        ">
          RESTART CHADD
        </button>
      </div>
    `;
  }
}
