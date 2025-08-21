import {useEffect, useState} from 'react';
import { Button, Input, Label } from '@/shared/ui';
import { UserRecord } from '@/pages/onboarding/ui/Onboarding';

interface RecordEditModalProps {
  record?: UserRecord;
  isOpen: boolean;
  onSave: (data: { name: string; value: number }) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function RecordEditModal({ record, isOpen, onSave, onCancel, loading }: RecordEditModalProps) {
  const [name, setName] = useState(record?.name || '');
  const [value, setValue] = useState(record?.value || 0);

  // Reset state when record changes
  useEffect(() => {
    setName(record?.name || '');
    setValue(record?.value || 0);
  }, [record, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-lg">
        <h3 className="text-lg font-semibold mb-4">{record ? 'Редактировать рекорд' : 'Добавить рекорд'}</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="record-name">Название упражнения</Label>
            <Input
              id="record-name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Например: жим, становая тяга и т.д."
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="record-value">Вес (кг)</Label>
            <Input
              id="record-value"
              type="number"
              value={value}
              onChange={e => setValue(Number(e.target.value))}
              placeholder="Вес"
              disabled={loading}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button size="sm" variant="outline" onClick={onCancel} disabled={loading}>Отмена</Button>
          <Button size="sm" onClick={() => onSave({ name, value })} disabled={loading || !name.trim() || value <= 0}>
            {record ? 'Сохранить' : 'Добавить'}
          </Button>
        </div>
      </div>
    </div>
  );
}

