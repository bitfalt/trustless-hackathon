"use client";

import { BrowserRouter } from "react-router";

import App from "./App";
import { OpenLabProjectsProvider } from "./openlab-projects";
import { WalletProvider } from "./wallet";

export default function ClientApp() {
  return (
    <BrowserRouter>
      <WalletProvider>
        <OpenLabProjectsProvider>
          <App />
        </OpenLabProjectsProvider>
      </WalletProvider>
    </BrowserRouter>
  );
}
