'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { BudgetItem, EventPlan, VendorItem, VendorStatus } from '@/types/event';
import { CATEGORY_LABELS } from '@/utils/budget';
import { formatINR, formatDate } from '@/utils/formatters';
import { createId, toNonNegativeInteger } from '@/utils/ids';

interface VendorDraft {
  service: string;
  category: BudgetItem['category'];
  targetBudget: number;
  bookingDeadlineDays: number;
  vendorName: string;
}

const EMPTY_VENDOR: VendorDraft = {
  service: '',
  category: 'other',
  targetBudget: 5000,
  bookingDeadlineDays: 10,
  vendorName: '',
};

interface VendorsTabProps {
  event: EventPlan;
  onUpdateStatus: (vendorId: string, status: VendorStatus) => void;
  onUpdateField: (
    vendorId: string,
    field: 'vendorName' | 'contactNotes' | 'quotationNotes',
    value: string
  ) => void;
  onCreateVendor: (vendor: VendorItem) => void;
}

export function VendorsTab({
  event,
  onUpdateStatus,
  onUpdateField,
  onCreateVendor,
}: VendorsTabProps) {
  const [showAddVendorModal, setShowAddVendorModal] = useState(false);
  const [newVendor, setNewVendor] = useState<VendorDraft>(EMPTY_VENDOR);

  const handleCreateVendor = () => {
    if (!newVendor.service.trim()) return;

    const deadline = new Date(Date.now() + newVendor.bookingDeadlineDays * 86400000)
      .toISOString()
      .slice(0, 10);

    onCreateVendor({
      id: createId('custom-v'),
      service: newVendor.service.trim(),
      category: newVendor.category,
      targetBudget: toNonNegativeInteger(newVendor.targetBudget || 0),
      bookingDeadlineDays: newVendor.bookingDeadlineDays,
      bookingDeadline: deadline,
      status: 'not_contacted',
      vendorName: newVendor.vendorName.trim() || undefined,
      questionsToAsk: [
        'What is your cancellation and date reschedule policy?',
        'Do you provide an itemized formal invoice for all costs?',
      ],
    });

    setShowAddVendorModal(false);
    setNewVendor(EMPTY_VENDOR);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-white border-[#D4C6B6] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#182620]">Vendor Management</h2>
            <p className="text-xs text-[#5C6E64]">
              Track quotations, contact notes, and key interview questions for every service
              provider.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowAddVendorModal(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Custom Vendor
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {event.vendors.map((vendor) => (
          <Card
            key={vendor.id}
            className="p-5 bg-white border-[#E5DDD3] space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Badge variant="sage" size="sm" className="mb-1">
                    {CATEGORY_LABELS[vendor.category] || vendor.category}
                  </Badge>
                  <h3 className="text-base font-bold text-[#182620]">{vendor.service}</h3>
                  <span className="text-xs text-[#5C6E64] block">
                    Target Budget: {formatINR(vendor.targetBudget)} • Due by{' '}
                    {formatDate(vendor.bookingDeadline)}
                  </span>
                </div>

                <select
                  value={vendor.status}
                  aria-label={`Booking status for ${vendor.service}`}
                  onChange={(changeEvent) =>
                    onUpdateStatus(vendor.id, changeEvent.target.value as VendorStatus)
                  }
                  className="text-xs px-2.5 py-1.5 rounded-lg border border-[#D4C6B6] bg-[#FAF7F2] text-[#182620] font-bold"
                >
                  <option value="not_contacted">Not Contacted</option>
                  <option value="contacted">Contacted</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="booked">Booked</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>

              <div className="space-y-2 pt-1 text-xs">
                <div>
                  <label
                    htmlFor={`vendor-name-${vendor.id}`}
                    className="text-[10px] font-bold text-[#5C6E64] uppercase block"
                  >
                    Vendor Provider Name
                  </label>
                  <input
                    id={`vendor-name-${vendor.id}`}
                    type="text"
                    placeholder="e.g. Royal Caterers / Lakeview Terrace"
                    value={vendor.vendorName || ''}
                    onChange={(changeEvent) =>
                      onUpdateField(vendor.id, 'vendorName', changeEvent.target.value)
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#D4C6B6] bg-white text-[#182620] text-xs"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`vendor-notes-${vendor.id}`}
                    className="text-[10px] font-bold text-[#5C6E64] uppercase block"
                  >
                    Contact & Quotation Notes
                  </label>
                  <textarea
                    id={`vendor-notes-${vendor.id}`}
                    rows={2}
                    placeholder="Phone, agreed inclusions, payment terms..."
                    value={vendor.quotationNotes || ''}
                    onChange={(changeEvent) =>
                      onUpdateField(vendor.id, 'quotationNotes', changeEvent.target.value)
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[#D4C6B6] bg-white text-[#182620] text-xs"
                  />
                </div>
              </div>

              {vendor.questionsToAsk && vendor.questionsToAsk.length > 0 && (
                <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E5DDD3] space-y-1.5 text-xs">
                  <span className="text-[10px] font-bold text-[#2D5A43] uppercase tracking-wider block">
                    Recommended Questions to Ask Before Booking:
                  </span>
                  <ul className="space-y-1 text-[#5C6E64]">
                    {vendor.questionsToAsk.map((question, index) => (
                      <li key={`${vendor.id}-question-${index}`} className="flex items-start gap-1.5">
                        <span className="text-[#C85A32]">•</span>
                        <span>{question}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      <Dialog
        isOpen={showAddVendorModal}
        onClose={() => setShowAddVendorModal(false)}
        title="Add Vendor Partner"
        confirmLabel="Add Vendor"
        onConfirm={handleCreateVendor}
      >
        <div className="space-y-3 text-xs">
          <div>
            <label htmlFor="vendor-service" className="font-semibold block mb-1">
              Service Required
            </label>
            <input
              id="vendor-service"
              type="text"
              placeholder="e.g. Acoustic Duo Guitarist, Jute Decorator"
              value={newVendor.service}
              onChange={(changeEvent) =>
                setNewVendor((current) => ({ ...current, service: changeEvent.target.value }))
              }
              className="w-full px-3 py-2 rounded-lg border border-[#D4C6B6] bg-white text-[#182620]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="vendor-provider-name" className="font-semibold block mb-1">
                Vendor Provider Name (Optional)
              </label>
              <input
                id="vendor-provider-name"
                type="text"
                placeholder="Business or contact name"
                value={newVendor.vendorName}
                onChange={(changeEvent) =>
                  setNewVendor((current) => ({
                    ...current,
                    vendorName: changeEvent.target.value,
                  }))
                }
                className="w-full px-3 py-2 rounded-lg border border-[#D4C6B6] bg-white text-[#182620]"
              />
            </div>

            <div>
              <label htmlFor="vendor-target-budget" className="font-semibold block mb-1">
                Target Budget in INR (₹)
              </label>
              <input
                id="vendor-target-budget"
                type="number"
                step={500}
                value={newVendor.targetBudget}
                onChange={(changeEvent) =>
                  setNewVendor((current) => ({
                    ...current,
                    targetBudget: parseInt(changeEvent.target.value, 10),
                  }))
                }
                className="w-full px-3 py-2 rounded-lg border border-[#D4C6B6] bg-white text-[#182620]"
              />
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
