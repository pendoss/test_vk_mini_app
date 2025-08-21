import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage, Button, Dialog, DialogContent, Input, Label } from "@/shared/ui";
import {User, userStore} from "@/entities/user";
import {userApi} from "@/entities/user/api";

export interface UserRecord {
    id: string;
    name: string;
    value: number;
}

interface OnboardingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
    const userInfo = userStore.user;
    const [primaryGym, setPrimaryGym] = useState(userInfo?.primaryGym || '');
    const [weight, setWeight] = useState(userInfo?.weight ? String(userInfo.weight) : '');
    const [records, setRecords] = useState<UserRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [userInfoVisible, setUserInfoVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
            setShowForm(false);
            setUserInfoVisible(false);
            setTimeout(() => {
                setIsLoading(false);
                setUserInfoVisible(true);
                setTimeout(() => {
                    setShowForm(true);
                }, 1800);
            }, 1000);
        }
    }, [isOpen]);

    const addRecord = () => {
        setRecords([...records, { id: Date.now().toString(), name: '', value: 0 }]);
    };

    const removeRecord = (id: string) => {
        if (records.length > 1) {
            setRecords(records.filter(record => record.id !== id));
        }
    };

    const updateRecord = (id: string, field: 'name' | 'value', value: string | number) => {
        setRecords(records.map(record =>
            record.id === id ? { ...record, [field]: field === 'value' ? Number(value) : value } : record
        ));
    };

    const handleFinish = async () => {
        if (!userInfo) return;
        try {
            // Преобразуем записи для бэкенда: только name, value
            const backendRecords = records
                .filter(r => r.name.trim() && r.value > 0)
                .map(r => ({
                    name: r.name.trim(),
                    value: r.value
                }));
            console.log('Payload for createRecord:', backendRecords);
            if (backendRecords.length === 0) {
                alert('Добавьте хотя бы один валидный рекорд');
                return;
            }
            // 1. Создать рекорды и получить пользователя с обновлённым полем records
            const userWithRecords = await userApi.createRecord(userInfo.id, backendRecords);
            // 2. Обновить остальные поля пользователя, передав актуальные records
            const updatedUser = await userApi.updateUser(userInfo.id, {
                primaryGym,
                weight: Number(weight),
                records: userWithRecords.records // обязательно передать новые рекорды
            }) as User;
            userStore.setUser(updatedUser);
            onClose();
        } catch (error) {
            // Можно добавить отображение ошибки пользователю
            console.error('Ошибка при обновлении профиля:', error);
            alert('Ошибка при сохранении рекордов. Проверьте заполнение всех полей и попробуйте снова.');
        }
    };

    const canProceed = () => {
        return primaryGym.trim() && weight.trim() && records.some(r => r.name.trim() && r.value);
    };

    if (!isOpen || !userInfo) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0">
                <div className="relative h-[700px] overflow-hidden">
                    <div
                        className={`absolute top-6 left-6 right-6 text-center z-10 transition-all duration-1500 ease-in-out ${
                            showForm ? 'opacity-0 transform -translate-y-4' : 'opacity-100 transform translate-y-0'
                        }`}
                    >
                        <h2 className="text-2xl">TrainSync</h2>
                    </div>
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center space-y-4">
                                <h3>Загрузка профиля...</h3>
                                <div className="animate-pulse space-y-2">
                                    <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
                                    <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* User Info Section - Transforms smoothly */}
                    {!isLoading && (
                        <div
                            className={`absolute inset-0 flex items-center justify-center transition-all duration-1500 ease-in-out ${
                                userInfoVisible ? 'opacity-100' : 'opacity-0'
                            } ${
                                showForm
                                    ? 'transform -translate-y-48 scale-75'
                                    : 'transform translate-y-0 scale-100'
                            }`}
                        >
                            <div className="text-center space-y-6">
                                <Avatar className="w-24 h-24 mx-auto">
                                    <AvatarImage src={userInfo.avatar} alt="User avatar" />
                                    <AvatarFallback>
                                        {userInfo.name.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="space-y-2">
                                    <h3 className="text-xl">{userInfo.firstName} {userInfo.lastName}</h3>
                                    <p className="text-muted-foreground">
                                        Необходимо заполнить профиль
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                    {!isLoading && (
                        <div
                            className={`absolute inset-0 transition-all duration-1500 ease-in-out ${
                                showForm
                                    ? 'opacity-100 transform translate-y-0'
                                    : 'opacity-0 transform translate-y-full pointer-events-none'
                            }`}
                        >
                            <div className="h-full overflow-y-auto">
                                <div className="h-64"></div>

                                <div className="px-6 pb-6 space-y-6">
                                    <div className="space-y-4">
                                        <h4>Необходимая информация</h4>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="gym">Основной зал</Label>
                                                <Input
                                                    id="gym"
                                                    placeholder="Ваш зал"
                                                    value={primaryGym}
                                                    onChange={(e) => setPrimaryGym(e.target.value)}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="weight">Текущий вес в кг</Label>
                                                <Input
                                                    id="weight"
                                                    type="number"
                                                    placeholder="Ваш вес в килограммах"
                                                    value={weight}
                                                    onChange={(e) => setWeight(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Records Section */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h4>Personal Records</h4>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={addRecord}
                                            >
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add Record
                                            </Button>
                                        </div>

                                        <div className="space-y-3">
                                            {records.map((record, index) => (
                                                <div key={record.id} className="flex gap-3 items-end">
                                                    <div className="flex-1 space-y-2">
                                                        <Label htmlFor={`exercise-${record.id}`}>
                                                            Рекорд {index + 1}
                                                        </Label>
                                                        <Input
                                                            id={`exercise-${record.id}`}
                                                            placeholder="Например: жим, становая тяга и т.д."
                                                            value={record.name}
                                                            onChange={(e) => updateRecord(record.id, 'name', e.target.value)}
                                                        />
                                                    </div>

                                                    <div className="flex-1 space-y-2">
                                                        <Label htmlFor={`weight-${record.id}`}>
                                                            Вес (кг)
                                                        </Label>
                                                        <Input
                                                            id={`weight-${record.id}`}
                                                            type="number"
                                                            placeholder="Вес"
                                                            value={record.value}
                                                            onChange={(e) => updateRecord(record.id, 'value', e.target.value)}
                                                        />
                                                    </div>

                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => removeRecord(record.id)}
                                                        disabled={records.length === 1}
                                                        className="mb-0"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <div className="pt-4">
                                        <Button
                                            onClick={handleFinish}
                                            className="w-full"
                                            disabled={!canProceed()}
                                        >
                                            Продолжить
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}