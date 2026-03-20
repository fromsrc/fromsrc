import type { ReactNode } from "react";

const css = `html[data-sidebar-collapsed] [data-sidebar-container]{visibility:hidden}`;
const code = `(function(){try{if(localStorage.getItem("sidebar-collapsed")==="true"){document.documentElement.setAttribute("data-sidebar-collapsed","")}}catch(e){}})()`;

export function SidebarScript(): ReactNode {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <script
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: code }}
      />
    </>
  );
}
