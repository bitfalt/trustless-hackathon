"use client";

import { BrowserRouter } from "react-router";

import App from "./App";
import { OpenLabProjectsProvider } from "./openlab-projects";

export default function ClientApp() {
  return (
    <BrowserRouter>
      <OpenLabProjectsProvider>
        <App />
      </OpenLabProjectsProvider>
    </BrowserRouter>
  );
}
