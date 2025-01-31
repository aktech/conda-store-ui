import * as React from "react";
import { AppExample } from "./App";
import { createRoot } from "react-dom/client";

const container = document.createElement("div");
const body = document.querySelector("body");

container.setAttribute("id", "app");
body?.appendChild(container);

const root = createRoot(container);

root.render(<AppExample />);
