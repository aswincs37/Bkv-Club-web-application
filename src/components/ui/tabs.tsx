import * as React from "react";

type TabsProps = React.HTMLAttributes<HTMLDivElement> & {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
};

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ className, defaultValue, value, onValueChange, ...props }, ref) => {
    // If it's a controlled component (with value), use that, otherwise use internal state
    const [tabValue, setTabValue] = React.useState(defaultValue || "");

    // Handle tab selection
    React.useEffect(() => {
      if (value !== undefined) {
        setTabValue(value);
      }
    }, [value]);

    // Create context to share the value and setter
    const contextValue = React.useMemo(
      () => ({
        value: value !== undefined ? value : tabValue,
        onValueChange: (newValue: string) => {
          if (value === undefined) {
            setTabValue(newValue);
          }
          onValueChange?.(newValue);
        },
      }),
      [value, tabValue, onValueChange]
    );

    return (
      <TabsContext.Provider value={contextValue}>
        <div ref={ref} className="w-full" {...props} />
      </TabsContext.Provider>
    );
  }
);
Tabs.displayName = "Tabs";

// Create context for tabs
type TabsContextValue = {
  value: string;
  onValueChange: (value: string) => void;
};

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined);

function useTabsContext() {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs components must be used within a Tabs provider");
  }
  return context;
}

const TabsList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className="inline-flex items-center justify-center rounded-md bg-gray-100 p-1"
    {...props}
  />
));
TabsList.displayName = "TabsList";

const TabsTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    value: string;
  }
>(({ className, value, ...props }, ref) => {
  const { value: selectedValue, onValueChange } = useTabsContext();
  const isActive = selectedValue === value;

  return (
    <button
      ref={ref}
      data-state={isActive ? "active" : "inactive"}
      data-value={value}
      className="inline-flex items-center justify-center rounded-sm px-3 py-1.5 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm hover:bg-gray-50"
      onClick={() => onValueChange(value)}
      {...props}
    />
  );
});
TabsTrigger.displayName = "TabsTrigger";

const TabsContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value: string;
  }
>(({ className, value, ...props }, ref) => {
  const { value: selectedValue } = useTabsContext();
  const isSelected = selectedValue === value;

  if (!isSelected) return null;

  return (
    <div
      ref={ref}
      data-state={isSelected ? "active" : "inactive"}
      data-value={value}
      className="mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2"
      {...props}
    />
  );
});
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };