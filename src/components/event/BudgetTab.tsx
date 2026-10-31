'use client';

import { useState } from 'react';
import { Plus, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Dialog } from '@/components/ui/Dialog';
import { BudgetItem, BudgetSummary, EventPlan } from '@/types/event';
import { CATEGORY_LABELS } from '@/utils/budget';
import { formatINR } from '@/utils/formatters';
import { createId, toNonNegativeInteger } from '@/utils/ids';

interface ExpenseDraft {
  description: string;
  category: BudgetItem['category'];
  estimatedCost: number;
  actualCost?: number;
  basis: string;
}

const EMPTY_EXPENSE: ExpenseDraft = {
  description: '',
  category: 'other',
  estimatedCost: 1000,
  actualCost: undefined,
  basis: '',
};

interface BudgetTabProps {
  event: EventPlan;
  budgetSummary: BudgetSummary;
  onUpdateCost: (
    itemId: string,
    field: 'actualCost' | 'estimatedCost' | 'paidAmount',
    value: number
  ) => void;
  onDeleteExpense: (itemId: string) => void;
  onCreateExpense: (item: BudgetItem) => void;
}

export function BudgetTab({
  event,
  budgetSummary,
  onUpdateCost,
  onDeleteExpense,
  onCreateExpense,
}: BudgetTabProps) {
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [newExpense, setNewExpense] = useState<ExpenseDraft>(EMPTY_EXPENSE);

  const handleCreateExpense = () => {
    if (!newExpense.description.trim()) return;

    onCreateExpense({
      id: createId('custom-b'),
      description: newExpense.description.trim(),
      category: newExpense.category,
      estimatedCost: toNonNegativeInteger(newExpense.estimatedCost || 0),
      actualCost:
        newExpense.actualCost !== undefined
          ? toNonNegativeInteger(newExpense.actualCost)
          : undefined,
      basis: newExpense.basis.trim(),
      paidAmount: 0,
    });

    setShowAddExpenseModal(false);
    setNewExpense(EMPTY_EXPENSE);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-white border-[#D4C6B6] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#182620]">Deterministic Financial Summary</h2>
            <p className="text-xs text-[#5C6E64]">
              Integer INR calculations. All user edits persist locally and recalculate totals
              automatically.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowAddExpenseModal(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Custom Expense
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E5DDD3]">
            <span className="text-[10px] text-[#5C6E64] uppercase font-bold block">
              Target Budget
            </span>
            <span className="text-xl font-black text-[#182620]">
              {formatINR(budgetSummary.totalBudget)}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E5DDD3]">
            <span className="text-[10px] text-[#5C6E64] uppercase font-bold block">
              Committed Spend
            </span>
            <span
              className={`text-xl font-black ${
                budgetSummary.isOverBudget ? 'text-red-600' : 'text-[#2D5A43]'
              }`}
            >
              {formatINR(budgetSummary.effectiveTotal)}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E5DDD3]">
            <span className="text-[10px] text-[#5C6E64] uppercase font-bold block">
              Remaining Buffer
            </span>
            <span
              className={`text-xl font-black ${
                budgetSummary.isOverBudget ? 'text-red-600' : 'text-emerald-700'
              }`}
            >
              {formatINR(budgetSummary.remainingBudget)}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E5DDD3]">
            <span className="text-[10px] text-[#5C6E64] uppercase font-bold block">
              Total Paid Advance
            </span>
            <span className="text-xl font-black text-[#182620]">
              {formatINR(budgetSummary.totalPaid)}
            </span>
          </div>
        </div>

        {budgetSummary.isOverBudget && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-300 text-xs text-red-900 space-y-1">
            <div className="flex items-center gap-2 font-bold">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              Budget Limit Exceeded by {formatINR(budgetSummary.overspendingAmount)}
            </div>
            <p>
              Actual or estimated allocations exceed your target budget. Consider applying the
              cost-saving opportunities listed below.
            </p>
          </div>
        )}

        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#182620]">
            Category-wise Allocation & Spend
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {budgetSummary.categoryBreakdown.map((category) => (
              <div
                key={category.category}
                className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E5DDD3] space-y-1.5"
              >
                <div className="flex justify-between font-semibold">
                  <span className="text-[#182620]">{category.label}</span>
                  <span className="text-[#2D5A43]">{category.percentage}%</span>
                </div>
                <ProgressBar value={category.percentage} size="sm" color="sage" />
                <div className="flex justify-between text-[11px] text-[#5C6E64]">
                  <span>{formatINR(category.actual)}</span>
                  <span>{category.itemCount} item(s)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card className="bg-white border-[#E5DDD3] p-6 space-y-4 shadow-sm overflow-hidden">
        <h3 className="text-sm font-bold text-[#182620]">
          Itemized Expenses & Vendor Costs (Edit to update totals)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E5DDD3] text-[#5C6E64] uppercase font-bold text-[10px]">
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Item Description & Basis</th>
                <th className="py-2.5 px-3 w-32">Estimated (₹)</th>
                <th className="py-2.5 px-3 w-32">Actual / Quote (₹)</th>
                <th className="py-2.5 px-3 w-28">Paid (₹)</th>
                <th className="py-2.5 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DDD3]">
              {event.budgetItems.map((item) => (
                <tr key={item.id} className="hover:bg-[#FAF7F2] transition-colors">
                  <td className="py-3 px-3">
                    <Badge variant="neutral" size="sm">
                      {CATEGORY_LABELS[item.category] || item.category}
                    </Badge>
                  </td>
                  <td className="py-3 px-3">
                    <strong className="block text-[#182620]">{item.description}</strong>
                    {item.basis && (
                      <span className="text-[11px] text-[#5C6E64] block">{item.basis}</span>
                    )}
                    {item.assumptions && (
                      <span className="text-[10px] text-[#5C6E64] italic block">
                        Note: {item.assumptions}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <input
                      type="number"
                      step={100}
                      value={item.estimatedCost}
                      aria-label={`Estimated cost for ${item.description}`}
                      onChange={(changeEvent) =>
                        onUpdateCost(
                          item.id,
                          'estimatedCost',
                          parseInt(changeEvent.target.value, 10)
                        )
                      }
                      className="w-full px-2 py-1.5 rounded-lg border border-[#D4C6B6] bg-white text-[#182620] text-xs font-medium"
                    />
                  </td>
                  <td className="py-3 px-3">
                    <input
                      type="number"
                      step={100}
                      placeholder={item.estimatedCost.toString()}
                      value={item.actualCost ?? ''}
                      aria-label={`Actual cost for ${item.description}`}
                      onChange={(changeEvent) => {
                        const value =
                          changeEvent.target.value === ''
                            ? 0
                            : parseInt(changeEvent.target.value, 10);
                        onUpdateCost(item.id, 'actualCost', value);
                      }}
                      className="w-full px-2 py-1.5 rounded-lg border border-[#2D5A43] bg-white text-[#182620] text-xs font-bold"
                    />
                  </td>
                  <td className="py-3 px-3">
                    <input
                      type="number"
                      step={100}
                      value={item.paidAmount ?? 0}
                      aria-label={`Paid amount for ${item.description}`}
                      onChange={(changeEvent) =>
                        onUpdateCost(
                          item.id,
                          'paidAmount',
                          parseInt(changeEvent.target.value, 10)
                        )
                      }
                      className="w-full px-2 py-1.5 rounded-lg border border-[#D4C6B6] bg-white text-[#182620] text-xs"
                    />
                  </td>
                  <td className="py-3 px-2 text-right">
                    <button
                      onClick={() => onDeleteExpense(item.id)}
                      aria-label="Delete expense item"
                      className="p-1 rounded-md text-[#5C6E64] hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog
        isOpen={showAddExpenseModal}
        onClose={() => setShowAddExpenseModal(false)}
        title="Add Expense Item"
        confirmLabel="Add Expense"
        onConfirm={handleCreateExpense}
      >
        <div className="space-y-3 text-xs">
          <div>
            <label htmlFor="expense-description" className="font-semibold block mb-1">
              Item Description
            </label>
            <input
              id="expense-description"
              type="text"
              placeholder="e.g. Welcome Drinks Bar, Sound operator tip"
              value={newExpense.description}
              onChange={(changeEvent) =>
                setNewExpense((current) => ({
                  ...current,
                  description: changeEvent.target.value,
                }))
              }
              className="w-full px-3 py-2 rounded-lg border border-[#D4C6B6] bg-white text-[#182620]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="expense-category" className="font-semibold block mb-1">
                Category
              </label>
              <select
                id="expense-category"
                value={newExpense.category}
                onChange={(changeEvent) =>
                  setNewExpense((current) => ({
                    ...current,
                    category: changeEvent.target.value as BudgetItem['category'],
                  }))
                }
                className="w-full px-3 py-2 rounded-lg border border-[#D4C6B6] bg-white text-[#182620]"
              >
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="expense-estimated-cost" className="font-semibold block mb-1">
                Estimated Cost in INR (₹)
              </label>
              <input
                id="expense-estimated-cost"
                type="number"
                step={100}
                value={newExpense.estimatedCost}
                onChange={(changeEvent) =>
                  setNewExpense((current) => ({
                    ...current,
                    estimatedCost: parseInt(changeEvent.target.value, 10),
                  }))
                }
                className="w-full px-3 py-2 rounded-lg border border-[#D4C6B6] bg-white text-[#182620]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="expense-basis" className="font-semibold block mb-1">
              Basis / Assumption (Optional)
            </label>
            <input
              id="expense-basis"
              type="text"
              placeholder="e.g. ₹500/guest or fixed flat package"
              value={newExpense.basis}
              onChange={(changeEvent) =>
                setNewExpense((current) => ({ ...current, basis: changeEvent.target.value }))
              }
              className="w-full px-3 py-2 rounded-lg border border-[#D4C6B6] bg-white text-[#182620]"
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
