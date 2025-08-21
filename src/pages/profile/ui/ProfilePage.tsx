import { useState, useEffect } from 'react';
import { userApi } from '@/entities/user/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/ui/card';
import { Badge } from '@/shared/ui/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/ui/avatar';
import { MapPin, Trophy } from 'lucide-react';
import { UserRecord } from "@/pages/onboarding/ui/Onboarding.tsx";
import { RecordEditModal } from '@/shared/ui/RecordEditModal';
import { Button, Input } from '@/shared/ui';
import { observer } from 'mobx-react-lite';
import { userStore } from '@/entities/user';


interface UserProfile {
  fullName: string;
  birthDate: string | null;
  weight: number;
  city: string;
  primaryGym: string;
  records: Record<string, number>;
}


export const ProfilePage = observer(() => {
  const currentUser = userStore.user;
  if (!currentUser) return <div>Загрузка профиля...</div>;

  // Функция для форматирования даты рождения из VK API
  const formatBirthDate = (bdate: string | null): string => {
    if (!bdate) return 'Не указана';

    // VK может возвращать формат DD.MM.YYYY или DD.MM
    const parts = bdate.split('.');
    if (parts.length === 3) {
      // Полная дата DD.MM.YYYY
      return `${parts[0]}.${parts[1]}.${parts[2]}`;
    } else if (parts.length === 2) {
      // Только день и месяц DD.MM
      return `${parts[0]}.${parts[1]}`;
    }

    return bdate;
  };

  const [profile, setProfile] = useState<UserProfile>({
    fullName: currentUser.name,
    birthDate: currentUser.birthDate || null,
    weight: currentUser.weight,
    city: currentUser.city || "не указан",
    primaryGym: currentUser.primaryGym || "не указан",
    records: {}
  });

  const [userRecords, setUserRecords] = useState<UserRecord[]>([]);
  const [editingWeight, setEditingWeight] = useState(false);
  const [editingGym, setEditingGym] = useState(false);
  const [weightInput, setWeightInput] = useState(currentUser.weight);
  const [gymInput, setGymInput] = useState(currentUser.primaryGym || "");
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [addingRecord, setAddingRecord] = useState(false);
  const [loading, setLoading] = useState(false);
  const editingRecord = userRecords.find(r => r.id === editingRecordId);

  useEffect(() => {
    if (!currentUser) return;
    async function fetchUserRecords() {
      if (!currentUser?.records || currentUser.records.length === 0) {
        setUserRecords([]);
        return;
      }
      const records = await userApi.getUserRecords(currentUser.records);
      setUserRecords(records);
    }
    fetchUserRecords();
  }, [currentUser]);

  // Edit weight
  const handleSaveWeight = async () => {
    setLoading(true);
    await userApi.updateUser(currentUser.id, { weight: Number(weightInput) });
    // Fetch updated user and update MobX store
    const updatedUser = await userApi.getUser(currentUser.id);
    if (updatedUser) userStore.user = updatedUser;
    setEditingWeight(false);
    setLoading(false);
  };

  // Edit gym
  const handleSaveGym = async () => {
    setLoading(true);
    await userApi.updateUser(currentUser.id, { primaryGym: gymInput });
    // Fetch updated user and update MobX store
    const updatedUser = await userApi.getUser(currentUser.id);
    if (updatedUser) userStore.user = updatedUser;
    setEditingGym(false);
    setLoading(false);
  };

  // Edit record
  const handleSaveRecord = async (data: { name: string; value: number }) => {
    if (!editingRecordId) return;
    setLoading(true);
    await userApi.updateRecord(editingRecordId, data);
    setEditingRecordId(null);
    setLoading(false);
    // Refetch records
    const records = await userApi.getUserRecords(currentUser.records);
    setUserRecords(records);
  };
  const handleCancelEditRecord = () => {
    setEditingRecordId(null);
  };

  // Delete record
  const handleDeleteRecord = async (recordId: string) => {
    setLoading(true);
    await userApi.deleteRecord(recordId);
    // Get the current user's records array (fresh)
    const currentRecords = Array.isArray(currentUser.records) ? currentUser.records : [];
    // Remove the deleted record and filter out any invalid IDs
    const updatedRecords = currentRecords.filter((id: string) => id !== recordId && id.length > 0);
    // Fetch only valid record IDs from the database
    const validRecordsObjs = updatedRecords.length > 0 ? await userApi.getUserRecords(updatedRecords) : [];
    const validRecordIds = validRecordsObjs.map(r => r.id);
    await userApi.updateUser(currentUser.id, { records: validRecordIds });
    setLoading(false);
    // Refetch records
    setUserRecords(validRecordsObjs);
  };

  // Add record
  const handleAddRecord = async (data: { name: string; value: number }) => {
    setLoading(true);
    const created = await userApi.createRecord(currentUser.id, [data]);
    const newRecordIds = Array.isArray(created.records) ? created.records.filter(id => id.length > 0) : [];
    const currentRecords = Array.isArray(currentUser.records) ? currentUser.records : [];
    const validRecordsObjs = currentRecords.length > 0 ? await userApi.getUserRecords(currentRecords) : [];
    const validPreviousIds = validRecordsObjs.map(r => r.id);
    const updatedRecords = [...validPreviousIds, ...newRecordIds];
    await userApi.updateUser(currentUser.id, { records: updatedRecords });
    setAddingRecord(false);
    setLoading(false);
    const records = updatedRecords.length > 0 ? await userApi.getUserRecords(updatedRecords) : [];
    setUserRecords(records);
  };
  useEffect(() => {
    setProfile(prev => ({
      ...prev,
      fullName: currentUser.name,
      birthDate: currentUser.birthDate || null,
      city: currentUser.city || prev.city,
    }));
  }, [currentUser]);


  return (
    <div className="space-y-4 p-4">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              {currentUser.avatar && (
                <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
              )}
              <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                {profile.fullName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1 flex-1">
              <CardTitle className="text-lg">{profile.fullName}</CardTitle>
              <CardDescription>Дата рождения: {formatBirthDate(profile.birthDate)}</CardDescription>
              <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-3 w-3" />
                  <span>{profile.city}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Trophy className="h-3 w-3" />
                  <span>Уровень {currentUser.level}</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Вес</p>
              {editingWeight ? (
                <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center w-full">
                  <Input
                    type="number"
                    value={weightInput}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWeightInput(Number(e.target.value))}
                    className="w-20"
                  />
                  <Button size="sm" onClick={handleSaveWeight} disabled={loading} className="w-full sm:w-auto">Сохранить</Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingWeight(false)} className="w-full sm:w-auto">Отмена</Button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center w-full">
                  <span>{currentUser.weight} кг</span>
                  <Button size="sm" variant="outline" onClick={() => setEditingWeight(true)} disabled={loading} className="w-full sm:w-auto">Редактировать</Button>
                </div>
              )}
            </div>
            <div>
              <p className="text-muted-foreground">Основной зал</p>
              {editingGym ? (
                <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center w-full">
                  <Input
                    value={gymInput}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGymInput(e.target.value)}
                    className="w-32"
                  />
                  <Button size="sm" onClick={handleSaveGym} disabled={loading} className="w-full sm:w-auto">Сохранить</Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingGym(false)} className="w-full sm:w-auto">Отмена</Button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center w-full">
                  <span className="truncate">{currentUser.primaryGym}</span>
                  <Button size="sm" variant="outline" onClick={() => setEditingGym(true)} disabled={loading} className="w-full sm:w-auto">Редактировать</Button>
                </div>
              )}
            </div>
            <div>
              <p className="text-muted-foreground">Баллы</p>
              {/*<p>{currentUser.points}</p>*/}
            </div>
          </div>
        </CardContent>
      </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Личные рекорды</CardTitle>
            <CardDescription>Ваши лучшие результаты</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userRecords.length === 0 ? (
                <p className="text-muted-foreground text-sm">Нет рекордов</p>
              ) : (
                userRecords.map((record) => (
                  <div key={record.id} className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-3 border rounded-lg gap-2">
                    <div>
                      <p className="text-sm font-medium">{record.name}</p>
                      <p className="text-xs text-muted-foreground">Максимальный вес</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center w-full sm:w-auto text-right">
                      <p className="font-semibold">{record.value} кг</p>
                      <Badge variant="secondary" className="text-xs">ПР</Badge>
                      <Button size="sm" variant="outline" onClick={() => setEditingRecordId(record.id)} disabled={loading} className="w-full sm:w-auto">Редактировать</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteRecord(record.id)} disabled={loading} className="w-full sm:w-auto">Удалить</Button>
                    </div>
                  </div>
                ))
              )}
              <Button size="sm" className="mt-2" onClick={() => setAddingRecord(true)} disabled={loading}>Добавить рекорд</Button>
            </div>
            <RecordEditModal
              record={editingRecord}
              isOpen={!!editingRecordId}
              onSave={handleSaveRecord}
              onCancel={handleCancelEditRecord}
              loading={loading}
            />
            <RecordEditModal
              isOpen={addingRecord}
              onSave={handleAddRecord}
              onCancel={() => setAddingRecord(false)}
              loading={loading}
            />
          </CardContent>
        </Card>
    </div>
  );
});
