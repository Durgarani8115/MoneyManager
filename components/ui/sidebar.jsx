"use client";

import * as React from "react";
import { PanelLeft } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";

const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_KEYBOARD_SHORTCUT = "b";

const SidebarContext = React.createContext(null);

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }
  return context;
}

export const SidebarProvider = React.forwardRef(
  (
    {
      defaultOpen = true,
      open: openProp,
      onOpenChange: setOpenProp,
      className,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const isMobile = useIsMobile();
    const [openMobile, setOpenMobile] = React.useState(false);
    const [_open, _setOpen] = React.useState(defaultOpen);

    const open = openProp ?? _open;
    const setOpen = React.useCallback(
      (value) => {
        const openState = typeof value === "function" ? value(open) : value;
        if (setOpenProp) {
          setOpenProp(openState);
        } else {
          _setOpen(openState);
        }
        document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
      },
      [setOpenProp, open]
    );

    const toggleSidebar = React.useCallback(() => {
      return isMobile
        ? setOpenMobile((prev) => !prev)
        : setOpen((prev) => !prev);
    }, [isMobile, setOpen, setOpenMobile]);

    // Keyboard shortcut (Cmd+B or Ctrl+B)
    React.useEffect(() => {
      const handleKeyDown = (event) => {
        if (
          event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
          (event.metaKey || event.ctrlKey)
        ) {
          event.preventDefault();
          toggleSidebar();
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [toggleSidebar]);

    const state = open ? "expanded" : "collapsed";

    const contextValue = React.useMemo(
      () => ({
        state,
        open,
        setOpen,
        isMobile,
        openMobile,
        setOpenMobile,
        toggleSidebar,
      }),
      [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
    );

    return (
      <SidebarContext.Provider value={contextValue}>
        <TooltipProvider delayDuration={0}>
          <div
            ref={ref}
            className={cn(
              "flex h-screen w-screen overflow-hidden bg-background text-foreground",
              className
            )}
            style={style}
            {...props}
          >
            {children}
          </div>
        </TooltipProvider>
      </SidebarContext.Provider>
    );
  }
);
SidebarProvider.displayName = "SidebarProvider";

export const Sidebar = React.forwardRef(
  (
    {
      side = "left",
      variant = "sidebar",
      collapsible = "offcanvas",
      className,
      children,
      ...props
    },
    ref
  ) => {
    const { isMobile, open, openMobile, setOpenMobile } = useSidebar();

    // Mobile Slide-over Drawer
    if (isMobile) {
      return (
        <>
          {openMobile && (
            <div className="fixed inset-0 z-50 flex md:hidden">
              <div
                className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
                onClick={() => setOpenMobile(false)}
              />
              <div className="relative flex-1 max-w-[280px] w-full bg-white dark:bg-zinc-950 z-50 shadow-2xl h-full flex flex-col border-r border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100">
                {children}
              </div>
            </div>
          )}
        </>
      );
    }

    // Desktop Side-by-Side Flex Sibling Sidebar
    return (
      <aside
        ref={ref}
        data-state={open ? "expanded" : "collapsed"}
        className={cn(
          "h-full shrink-0 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 transition-[width] duration-300 ease-in-out overflow-hidden flex flex-col z-30",
          open ? "w-64" : "w-0 border-r-0",
          className
        )}
        {...props}
      >
        <div className="w-64 h-full flex flex-col">
          {children}
        </div>
      </aside>
    );
  }
);
Sidebar.displayName = "Sidebar";

export const SidebarTrigger = React.forwardRef(({ className, onClick, ...props }, ref) => {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      ref={ref}
      data-sidebar="trigger"
      variant="outline"
      size="icon"
      className={cn(
        "h-9 w-9 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-all shadow-xs text-zinc-700 dark:text-zinc-300 shrink-0",
        className
      )}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      title="Toggle Sidebar (Cmd+B)"
      {...props}
    >
      <PanelLeft className="h-4 w-4" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
});
SidebarTrigger.displayName = "SidebarTrigger";

export const SidebarInset = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex-1 min-w-0 h-full flex flex-col overflow-hidden bg-background transition-all duration-300 ease-in-out",
        className
      )}
      {...props}
    />
  );
});
SidebarInset.displayName = "SidebarInset";

export const SidebarHeader = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="header"
      className={cn("flex flex-col gap-2 p-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0", className)}
      {...props}
    />
  );
});
SidebarHeader.displayName = "SidebarHeader";

export const SidebarFooter = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="footer"
      className={cn("flex flex-col gap-2 p-3.5 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shrink-0", className)}
      {...props}
    />
  );
});
SidebarFooter.displayName = "SidebarFooter";

export const SidebarContent = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="content"
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
        className
      )}
      {...props}
    />
  );
});
SidebarContent.displayName = "SidebarContent";

export const SidebarGroup = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="group"
      className={cn("relative flex w-full min-w-0 flex-col", className)}
      {...props}
    />
  );
});
SidebarGroup.displayName = "SidebarGroup";

export const SidebarGroupLabel = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="group-label"
      className={cn(
        "flex h-7 shrink-0 items-center px-2 text-[11px] font-extrabold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase",
        className
      )}
      {...props}
    />
  );
});
SidebarGroupLabel.displayName = "SidebarGroupLabel";

export const SidebarGroupContent = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-sidebar="group-content"
    className={cn("w-full text-sm", className)}
    {...props}
  />
));
SidebarGroupContent.displayName = "SidebarGroupContent";

export const SidebarMenu = React.forwardRef(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    data-sidebar="menu"
    className={cn("flex w-full min-w-0 flex-col gap-0.5", className)}
    {...props}
  />
));
SidebarMenu.displayName = "SidebarMenu";

export const SidebarMenuItem = React.forwardRef(({ className, ...props }, ref) => (
  <li
    ref={ref}
    data-sidebar="menu-item"
    className={cn("group/menu-item relative", className)}
    {...props}
  />
));
SidebarMenuItem.displayName = "SidebarMenuItem";

export const SidebarMenuButton = React.forwardRef(
  (
    {
      asChild = false,
      isActive = false,
      variant = "default",
      size = "default",
      className,
      children,
      ...props
    },
    ref
  ) => {
    const buttonClass = cn(
      "flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-xs font-semibold outline-none transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-900 disabled:pointer-events-none disabled:opacity-50",
      isActive && "bg-zinc-100 text-zinc-900 font-bold dark:bg-zinc-900 dark:text-zinc-100",
      className
    );

    if (asChild) {
      return React.cloneElement(children, {
        ref,
        className: cn(buttonClass, children.props.className),
        ...props,
      });
    }

    return (
      <button ref={ref} className={buttonClass} {...props}>
        {children}
      </button>
    );
  }
);
SidebarMenuButton.displayName = "SidebarMenuButton";

export const SidebarMenuSub = React.forwardRef(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    data-sidebar="menu-sub"
    className={cn(
      "ml-6 flex min-w-0 flex-col gap-0.5 border-l border-zinc-200 dark:border-zinc-800 pl-2 py-1",
      className
    )}
    {...props}
  />
));
SidebarMenuSub.displayName = "SidebarMenuSub";

export const SidebarMenuSubItem = React.forwardRef(({ ...props }, ref) => (
  <li ref={ref} {...props} />
));
SidebarMenuSubItem.displayName = "SidebarMenuSubItem";

export const SidebarMenuSubButton = React.forwardRef(
  ({ asChild = false, isActive, className, children, ...props }, ref) => {
    const classNames = cn(
      "flex h-7 min-w-0 items-center gap-2 overflow-hidden rounded-md px-2 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 outline-none hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors",
      isActive && "font-semibold text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-900",
      className
    );

    if (asChild) {
      return React.cloneElement(children, {
        ref,
        className: cn(classNames, children.props.className),
        ...props,
      });
    }

    return (
      <a ref={ref} className={classNames} {...props}>
        {children}
      </a>
    );
  }
);
SidebarMenuSubButton.displayName = "SidebarMenuSubButton";
