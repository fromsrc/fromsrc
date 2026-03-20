import type { ReactNode } from "react";

const code = `(function(){try{if(localStorage.getItem("sidebar-collapsed")==="true"){document.documentElement.dataset.sidebarCollapsed=""}}catch(e){}})()`;

export function SidebarScript(): ReactNode {
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
