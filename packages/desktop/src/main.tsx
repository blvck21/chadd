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

  body {
    font-family: 'Courier New', 'Lucida Console', monospace;
    background: #1a1a1a;
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

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <GlobalStyle />
    <App />
  </React.StrictMode>
);
