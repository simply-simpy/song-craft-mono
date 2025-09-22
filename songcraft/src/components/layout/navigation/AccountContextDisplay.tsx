import { useState } from "react";
import { useAccountContext } from "../../../lib/useAccountContext";
import { useAuth } from "../../../lib/auth";

export function AccountContextDisplay() {
  const { user, isLoaded } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Debug logging
  console.log("AccountContextDisplay render:", {
    isLoaded,
    user: user?.id,
  });

  if (!isLoaded) {
    return <div className="text-xs text-gray-500">Loading auth...</div>;
  }

  if (!user) {
    return <div className="text-xs text-gray-500">No user</div>;
  }

  // Try to get account context, but handle errors gracefully
  let accountContextData: ReturnType<typeof useAccountContext>;
  try {
    console.log("Calling useAccountContext with user.id:", user.id);
    accountContextData = useAccountContext(user.id);
    console.log("useAccountContext result:", accountContextData);
  } catch (error) {
    console.error("Error in useAccountContext:", error);
    return <div className="text-xs text-red-500">Error loading context</div>;
  }

  const {
    currentContext,
    availableAccounts,
    switchContext,
    isSwitching,
    isLoading,
    error,
  } = accountContextData;

  const handleSwitch = (accountId: string) => {
    try {
      switchContext(
        { accountId, reason: "User switched context via navigation" },
        {
          onSuccess: () => {
            setIsOpen(false);
          },
        }
      );
    } catch (error) {
      console.error("Error switching context:", error);
    }
  };

  console.log("AccountContextDisplay state:", {
    currentContext,
    isLoading,
    error,
  });

  if (isLoading) {
    return <div className="text-xs text-gray-500">Loading context...</div>;
  }

  if (error) {
    return <div className="text-xs text-red-500">Error: {error.message}</div>;
  }

  if (!currentContext) {
    return <div className="text-xs text-gray-500">No context</div>;
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
        disabled={isSwitching}
      >
        <div className="text-left">
          <div className="font-medium truncate max-w-32">
            {currentContext.accountName}
          </div>
          <div className="text-xs text-gray-500">
            {currentContext.accountPlan}
          </div>
        </div>
        {isSwitching && <span className="loading loading-spinner loading-xs" />}
        <svg
          className={`w-3 h-3 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-label="Toggle account dropdown"
        >
          <title>Toggle account dropdown</title>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-2">
            <div className="text-xs font-medium text-gray-500 mb-2">
              Switch Account Context
            </div>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {availableAccounts?.map((account) => (
                <button
                  key={account.id}
                  type="button"
                  onClick={() => handleSwitch(account.id)}
                  className={`w-full text-left p-2 rounded hover:bg-gray-100 flex items-center justify-between ${
                    account.id === currentContext.currentAccountId
                      ? "bg-blue-50 border border-blue-200"
                      : ""
                  }`}
                  disabled={isSwitching}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {account.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {account.role} • {account.status}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <span
                      className={`badge badge-xs ${
                        account.plan === "Enterprise"
                          ? "badge-error"
                          : account.plan === "Team"
                          ? "badge-warning"
                          : account.plan === "Pro"
                          ? "badge-success"
                          : "badge-info"
                      }`}
                    >
                      {account.plan}
                    </span>
                    {account.id === currentContext.currentAccountId && (
                      <span className="text-blue-500 text-xs">✓</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
              Last switched:{" "}
              {new Date(currentContext.lastSwitchedAt).toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
