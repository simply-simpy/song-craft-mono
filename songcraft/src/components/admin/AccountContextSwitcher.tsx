import { useState } from "react";
import { useAccountContext } from "../../lib/useAccountContext";

interface AccountContextSwitcherProps {
  userId: string;
  onContextChange?: (accountId: string) => void;
}

export function AccountContextSwitcher({
  userId,
  onContextChange,
}: AccountContextSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const {
    currentContext,
    availableAccounts,
    switchContext,
    isSwitching,
  } = useAccountContext(userId);

  const handleSwitch = (accountId: string) => {
    switchContext(
      { accountId, reason: "User switched context via admin panel" },
      {
        onSuccess: () => {
          setIsOpen(false);
          onContextChange?.(accountId);
        },
      }
    );
  };

  if (!currentContext) {
    return <div className="text-sm text-gray-500">No context available</div>;
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-sm btn-outline flex items-center gap-2"
        disabled={isSwitching}
      >
        <span className="truncate max-w-32">{currentContext.accountName}</span>
        <span
          className={`badge badge-xs ${
            currentContext.accountPlan === "Enterprise"
              ? "badge-error"
              : currentContext.accountPlan === "Team"
              ? "badge-warning"
              : currentContext.accountPlan === "Pro"
              ? "badge-success"
              : "badge-info"
          }`}
        >
          {currentContext.accountPlan}
        </span>
        {isSwitching && <span className="loading loading-spinner loading-xs" />}
        <svg
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-label="Toggle dropdown"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-2">
            <div className="text-xs font-medium text-gray-500 mb-2">
              Switch Account Context
            </div>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {availableAccounts.map((account) => (
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
